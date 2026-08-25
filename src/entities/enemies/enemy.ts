import { wrappedAngle, wrappedDistance, randomRange, wrapPosition, drawSphereShading, TWO_PI, tracePoly, easeOutBack } from '../../utils';
import { Camera } from '../../camera';
import {
  BOSS_BASE_HP,
  BOSS_CHARGE_SPEED,
  BOSS_SPAWN_DURATION,
  CHARGE_SPEED,
  ENEMY_HP_SCALE,
  ENEMY_TYPES,
  HIT_FLASH_DURATION,
  SPAWN_DURATION,
  type BossProjectile,
  type EnemySpawnOptions,
  type EnemyType,
} from './types';

export type { BossProjectile, EnemySpawnOptions, EnemyType } from './types';

export class Enemy {
  x: number;
  y: number;
  radius: number;
  maxHp: number;
  hp: number;
  speed: number;
  color: [number, number, number];
  outlineColor: string;
  xpDrop: number;
  damageMultiplier: number;
  dead = false;
  /** Set when an enemy dies without rewarding XP (bomber self-detonation). */
  noXp = false;
  type: EnemyType;
  readonly isBoss: boolean;
  stage = 1;
  isElite = false;
  bossPhase: 1 | 2 | 3 = 1;
  canSummon = false;
  projectiles: BossProjectile[] = [];
  /** Blinking fuse indicator for bombers / boss charge windups. */
  fuseRatio = 0;
  private bulletSpeedMul = 1;
  private bulletLifeMul = 1;
  private rotation = 0;
  private summonTimer = 0;
  private shootTimer = 0;
  private strafeSign = Math.random() < 0.5 ? -1 : 1;
  private strafePhase = Math.random() * TWO_PI;
  private fuseArmed = false;
  private fuseTimer = 0;
  private spiralActive = false;
  private spiralWindow = 0;
  private spiralGap = 0;
  private spiralAngle = 0;
  private chargeTimer = 0;
  private isCharging = false;
  private chargeWindup = 0;
  private chargeVx = 0;
  private chargeVy = 0;
  private chargeDuration = 0;
  private lastPhase: 1 | 2 | 3 = 1;
  private phaseNotificationPending = false;

  // Visual state
  readonly spawnDuration: number;
  private spawnAge = 0;
  private hitFlash = 0;
  private innerRotation = 0;
  private spikeCount: number;
  private wobblePhase: number;

  constructor(type: EnemyType, x: number, y: number, stage = 1, options: EnemySpawnOptions = {}) {
    const config = ENEMY_TYPES[type];
    const difficulty = Math.max(0, stage - 1 + (options.stageOffset ?? 0));
    const hpScale = 1 + difficulty * 0.42;
    const speedScale = 1 + difficulty * 0.07;
    const damageScale = 1 + difficulty * 0.1;
    const xpScale = 1 + difficulty * 0.18;

    this.type = type;
    this.isBoss = type === 'boss';
    this.isElite = options.elite ?? false;
    this.stage = stage;
    this.x = x;
    this.y = y;

    const eliteScale = this.isElite ? 1.55 : 1;
    this.radius = (config.baseRadius + randomRange(-config.radiusVariation / 2, config.radiusVariation / 2))
      * (options.scale ?? 1) * (options.radiusMul ?? 1) * eliteScale;
    const sizeRatio = this.radius / config.baseRadius;
    const eliteHp = this.isElite ? 3.2 : 1;
    this.maxHp = config.baseHp * sizeRatio * hpScale * ENEMY_HP_SCALE
      * (options.hpScale ?? 1) * (options.hpMul ?? 1) * eliteHp;
    this.hp = this.maxHp;
    this.speed = config.speed * speedScale * (options.speedMul ?? 1) * (this.isElite ? 0.92 : 1);
    this.color = config.color;
    this.outlineColor = config.outlineColor;
    this.xpDrop = Math.max(1, Math.round(
      config.xpDrop * xpScale * (options.xpScale ?? 1) * (this.isElite ? 3 * (options.eliteXpMul ?? 1) : 1),
    ));
    this.damageMultiplier = config.damageMultiplier * damageScale * (this.isElite ? 1.45 : 1);
    this.bulletSpeedMul = options.bulletSpeedMul ?? 1;
    this.bulletLifeMul = options.bulletLifeMul ?? 1;
    this.spikeCount = type === 'swarmer' ? Math.floor(randomRange(5, 8)) : 6;
    this.wobblePhase = Math.random() * TWO_PI;
    this.spawnDuration = this.isBoss ? BOSS_SPAWN_DURATION : SPAWN_DURATION;

    if (type === 'overlord') {
      this.summonTimer = Math.max(1.6, 3 - difficulty * 0.16);
      this.shootTimer = Math.max(1.1, 2 - difficulty * 0.12);
    }
    if (type === 'spitter') {
      this.shootTimer = randomRange(Math.max(1.2, 2.4 - difficulty * 0.1), Math.max(1.8, 3.0 - difficulty * 0.12));
    }
    if (type === 'drifter') {
      this.chargeTimer = randomRange(
        Math.max(1.8, 3 - difficulty * 0.2),
        Math.max(3.8, 6 - difficulty * 0.25),
      );
    }
    if (this.isBoss) {
      this.summonTimer = 7;
      this.spiralGap = 4;
      this.applyBossStageSkin(stage);
    }
  }

  /** Per-stage boss identity: color shifts each Mk level. */
  private applyBossStageSkin(stage: number): void {
    const skins: { color: [number, number, number]; outline: string }[] = [
      { color: [255, 40, 90], outline: '#ff285a' },     // Mk.1 crimson
      { color: [190, 80, 255], outline: '#be50ff' },    // Mk.2 violet
      { color: [255, 190, 40], outline: '#ffbe28' },    // Mk.3 gold
      { color: [140, 255, 60], outline: '#8cff3c' },    // Mk.4 acid
      { color: [80, 220, 255], outline: '#50dcff' },    // Mk.5 ice
    ];
    const skin = skins[(Math.max(1, stage) - 1) % skins.length];
    this.color = skin.color;
    this.outlineColor = skin.outline;
  }

  get spawnProgress(): number {
    return Math.min(1, this.spawnAge / this.spawnDuration);
  }

  private fireProjectile(angle: number, speed: number, damage: number, radius = 4, lifetime = 3): void {
    this.projectiles.push({
      x: this.x, y: this.y,
      vx: Math.cos(angle) * speed * this.bulletSpeedMul,
      vy: Math.sin(angle) * speed * this.bulletSpeedMul,
      lifetime: lifetime * this.bulletLifeMul,
      radius,
      damage,
    });
  }

  private updateDrifterCharge(dt: number, angle: number, playerX: number, playerY: number, chargeSpeed: number): void {
    if (this.isCharging) {
      this.chargeDuration -= dt;
      this.x += this.chargeVx * dt;
      this.y += this.chargeVy * dt;
      if (this.chargeDuration <= 0) {
        this.isCharging = false;
        this.chargeTimer = randomRange(3, 6);
      }
      return;
    }

    if (this.chargeWindup > 0) {
      this.chargeWindup -= dt;
      this.fuseRatio = 1 - Math.max(0, this.chargeWindup) / 0.55;
      if (this.chargeWindup <= 0) {
        this.isCharging = true;
        this.chargeDuration = 0.65;
        const targetAngle = wrappedAngle(this.x, this.y, playerX, playerY);
        this.chargeVx = Math.cos(targetAngle) * chargeSpeed;
        this.chargeVy = Math.sin(targetAngle) * chargeSpeed;
        this.fuseRatio = 0;
      }
      return;
    }

    this.chargeTimer -= dt;
    if (this.chargeTimer <= 0 && wrappedDistance(this.x, this.y, playerX, playerY) < 620) {
      this.chargeWindup = 0.55;
      this.fuseRatio = 0;
      void angle;
    } else {
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;
    }
  }

  update(dt: number, playerX: number, playerY: number): void {
    this.spawnAge += dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.innerRotation += dt * (this.type === 'titan' || this.isBoss ? 0.4 : 1.2);

    const angle = wrappedAngle(this.x, this.y, playerX, playerY);
    const distToPlayer = wrappedDistance(this.x, this.y, playerX, playerY);

    switch (this.type) {
      case 'drifter':
        this.updateDrifterCharge(dt, angle, playerX, playerY, CHARGE_SPEED);
        break;

      case 'spitter': {
        this.strafePhase += dt;
        let vx: number;
        let vy: number;
        if (distToPlayer > 360) {
          vx = Math.cos(angle) * this.speed;
          vy = Math.sin(angle) * this.speed;
        } else if (distToPlayer < 210) {
          vx = -Math.cos(angle) * this.speed * 0.9;
          vy = -Math.sin(angle) * this.speed * 0.9;
        } else {
          const strafe = angle + Math.PI / 2 * this.strafeSign;
          vx = Math.cos(strafe) * this.speed * 0.55;
          vy = Math.sin(strafe) * this.speed * 0.55;
        }
        this.x += vx * dt;
        this.y += vy * dt;
        break;
      }

      case 'splitter':
        this.x += Math.cos(angle + Math.sin(this.strafePhase * 1.7 + this.wobblePhase) * 0.6) * this.speed * dt;
        this.y += Math.sin(angle + Math.sin(this.strafePhase * 1.7 + this.wobblePhase) * 0.6) * this.speed * dt;
        break;

      case 'bomber': {
        if (this.fuseArmed) {
          this.fuseTimer -= dt;
          this.fuseRatio = 1 - Math.max(0, this.fuseTimer) / 0.75;
          this.x += Math.cos(angle) * this.speed * 1.4 * dt;
          this.y += Math.sin(angle) * this.speed * 1.4 * dt;
          if (this.fuseTimer <= 0) {
            this.detonate();
          }
        } else {
          this.x += Math.cos(angle) * this.speed * dt;
          this.y += Math.sin(angle) * this.speed * dt;
          if (distToPlayer < 150) {
            this.fuseArmed = true;
            this.fuseTimer = 0.75;
          }
        }
        break;
      }

      case 'boss':
        this.updateBoss(dt, angle, playerX, playerY, distToPlayer);
        break;

      default:
        this.x += Math.cos(angle) * this.speed * dt;
        this.y += Math.sin(angle) * this.speed * dt;
        break;
    }

    const wrapped = wrapPosition(this.x, this.y);
    this.x = wrapped.x;
    this.y = wrapped.y;

    this.updateProjectiles(dt);
  }

  private updateBoss(dt: number, angle: number, playerX: number, playerY: number, distToPlayer: number): void {
    const hpRatio = this.hp / this.maxHp;
    const newPhase: 1 | 2 | 3 = hpRatio > 0.66 ? 1 : hpRatio > 0.33 ? 2 : 3;
    if (newPhase !== this.lastPhase) {
      this.lastPhase = newPhase;
      this.bossPhase = newPhase;
      this.phaseNotificationPending = true;
    } else {
      this.bossPhase = this.lastPhase;
    }

    if (this.isCharging || this.chargeWindup > 0) {
      this.updateDrifterCharge(dt, angle, playerX, playerY, BOSS_CHARGE_SPEED);
      this.chargeTimer = 4.2;
    } else if (this.bossPhase === 3) {
      this.chargeTimer -= dt;
      if (this.chargeTimer <= 0 && distToPlayer < 700) {
        this.chargeWindup = 0.55;
        this.chargeTimer = 4.2;
      } else {
        this.x += Math.cos(angle) * this.speed * 1.25 * dt;
        this.y += Math.sin(angle) * this.speed * 1.25 * dt;
      }
    } else {
      const speedMul = this.bossPhase === 1 ? 1 : 1.22;
      this.x += Math.cos(angle) * this.speed * speedMul * dt;
      this.y += Math.sin(angle) * this.speed * speedMul * dt;
    }

    this.rotation += 0.5 * dt;

    this.shootTimer -= dt;
    if (this.shootTimer <= 0) {
      const ringCount = this.bossPhase === 1 ? 14 : this.bossPhase === 2 ? 18 : 22;
      const interval = this.bossPhase === 1 ? 2.6 : this.bossPhase === 2 ? 2.2 : 3.4;
      this.shootTimer = interval;
      for (let i = 0; i < ringCount; i++) {
        this.fireProjectile((i / ringCount) * TWO_PI, 175, 10, 5, 4);
      }
    }

    if (this.bossPhase >= 2) {
      this.spiralGap -= dt;
      if (this.spiralGap <= 0 && !this.spiralActive) {
        this.spiralActive = true;
        this.spiralWindow = this.bossPhase === 3 ? 1.7 : 1.3;
      }
      if (this.spiralActive) {
        this.spiralWindow -= dt;
        this.spiralAngle += dt * 2.6;
        const arms = this.bossPhase === 3 ? 4 : 3;
        for (let i = 0; i < arms; i++) {
          this.fireProjectile(this.spiralAngle + (i / arms) * TWO_PI, 205, 8, 4, 3.4);
        }
        if (this.spiralWindow <= 0) {
          this.spiralActive = false;
          this.spiralGap = this.bossPhase === 3 ? 3.4 : 4.2;
        }
      }
    }

    if (this.bossPhase >= 2) {
      this.summonTimer -= dt;
      if (this.summonTimer <= 0) {
        this.summonTimer = 7;
        this.canSummon = true;
      }
    }
  }

  private detonate(): void {
    const ringCount = 10;
    for (let i = 0; i < ringCount; i++) {
      this.fireProjectile((i / ringCount) * TWO_PI + Math.random() * 0.3, 235, 9, 4, 2.2);
    }
    this.noXp = true;
    this.dead = true;
  }

  private updateProjectiles(dt: number): void {
    if (this.projectiles.length === 0) return;
    for (const p of this.projectiles) {
      const wrappedProjectile = wrapPosition(p.x + p.vx * dt, p.y + p.vy * dt);
      p.x = wrappedProjectile.x;
      p.y = wrappedProjectile.y;
      p.lifetime -= dt;
    }
    this.projectiles = this.projectiles.filter(p => p.lifetime > 0);
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    this.hitFlash = HIT_FLASH_DURATION;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
  }

  consumeSummon(): boolean {
    if (this.canSummon) {
      this.canSummon = false;
      return true;
    }
    return false;
  }

  consumePhaseNotification(): boolean {
    if (this.phaseNotificationPending) {
      this.phaseNotificationPending = false;
      return true;
    }
    return false;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    const screen = camera.worldToScreen(this.x, this.y);

    const spawnT = easeOutBack(this.spawnProgress);
    const scale = spawnT;
    const drawRadius = this.radius * scale;
    if (drawRadius < 0.5) return;

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(scale, scale);

    if (this.type === 'drifter' && this.isCharging) {
      this.drawChargeTrail(ctx);
    }
    if (this.isBoss && (this.isCharging || this.chargeWindup > 0)) {
      this.drawChargeTrail(ctx, true);
    }

    switch (this.type) {
      case 'swarmer': this.drawSwarmer(ctx, time); break;
      case 'drifter': this.drawDrifter(ctx, time); break;
      case 'titan': this.drawTitan(ctx, time); break;
      case 'overlord': this.drawOverlord(ctx, time); break;
      case 'spitter': this.drawSpitter(ctx, time); break;
      case 'splitter': this.drawSplitter(ctx, time); break;
      case 'bomber': this.drawBomber(ctx, time); break;
      case 'boss': this.drawBoss(ctx, time); break;
    }

    if (this.hitFlash > 0) {
      const flashAlpha = 0.35 * (this.hitFlash / HIT_FLASH_DURATION);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.9, 0, TWO_PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fill();
    }

    if (this.spawnProgress < 1) {
      const ringAlpha = 0.25 * (1 - this.spawnProgress);
      const ringR = this.radius * (1 + this.spawnProgress * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, TWO_PI);
      ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawSwarmer(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [cr, cg, cb] = this.color;
    const wobble = Math.sin(time * 2.5 + this.wobblePhase) * 0.08;
    const rot = time * 1.5 + this.wobblePhase;

    const pulse = 0.5 + 0.5 * Math.sin(time * 1.8 + this.wobblePhase);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5 * (0.9 + pulse * 0.2), 0, TWO_PI);
    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.1 + pulse * 0.06})`;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < this.spikeCount * 2; i++) {
      const spikeAngle = rot + (i / (this.spikeCount * 2)) * TWO_PI;
      const isOuter = i % 2 === 0;
      const spikeR = isOuter ? r * (1 + wobble) : r * 0.55;
      const px = Math.cos(spikeAngle) * spikeR;
      const py = Math.sin(spikeAngle) * spikeR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    this.drawHpFill(ctx, r, cr, cg, cb);
    if (this.isElite) this.drawEliteAura(ctx, r);
  }

  private drawDrifter(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [cr, cg, cb] = this.color;

    if (!this.isCharging && this.chargeWindup > 0) {
      const urgency = this.fuseRatio;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.4, 0, TWO_PI);
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${urgency * 0.2})`;
      ctx.fill();
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(this.aimAngle()) * 620, Math.sin(this.aimAngle()) * 620);
      ctx.strokeStyle = `rgba(255, 160, 40, ${0.25 + urgency * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (!this.isCharging && this.chargeTimer < 1) {
      const urgency = 1 - this.chargeTimer;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.3, 0, TWO_PI);
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${urgency * 0.15})`;
      ctx.fill();
    }

    tracePoly(ctx, 0, 0, r, 6, 0);
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    this.drawHpFill(ctx, r, cr, cg, cb);

    const innerR = r * 0.5;
    const innerPulse = 0.8 + 0.2 * Math.sin(time * 2);
    tracePoly(ctx, 0, 0, innerR * innerPulse, 6, this.innerRotation);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    drawSphereShading(ctx, 0, 0, r, cr, cg, cb);
    if (this.isElite) this.drawEliteAura(ctx, r);
  }

  private aimAngle(): number {
    return Math.atan2(this.chargeVy, this.chargeVx);
  }

  private drawTitan(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [cr, cg, cb] = this.color;

    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 8; i++) {
      const rayAngle = this.innerRotation * 0.3 + (i / 8) * TWO_PI;
      const lineR = r * 2.2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(rayAngle) * r * 1.1, Math.sin(rayAngle) * r * 1.1);
      ctx.lineTo(Math.cos(rayAngle) * lineR, Math.sin(rayAngle) * lineR);
      ctx.strokeStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.arc(0, 0, r * 1.25, 0, TWO_PI);
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.12)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, TWO_PI);
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.2)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TWO_PI);
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r - 1, 0, TWO_PI);
    this.drawHpFill(ctx, r, cr, cg, cb);

    const innerR = r * 0.55;
    const segments = 5;
    const segArc = (TWO_PI / segments) - 0.2;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < segments; i++) {
      const startAngle = this.innerRotation + (i / segments) * TWO_PI;
      ctx.beginPath();
      ctx.arc(0, 0, innerR, startAngle, startAngle + segArc);
      ctx.stroke();
    }

    const eyePulse = 0.6 + 0.4 * Math.sin(time * 1.5);
    const eyeR = r * 0.15 * eyePulse;
    const eyeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, eyeR * 3);
    eyeGrad.addColorStop(0, `rgba(255, 255, 255, ${0.4 * eyePulse})`);
    eyeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(0, 0, eyeR * 3, 0, TWO_PI);
    ctx.fill();

    drawSphereShading(ctx, 0, 0, r, cr, cg, cb);
    if (this.isElite) this.drawEliteAura(ctx, r);
  }

  private drawOverlord(ctx: CanvasRenderingContext2D, time: number): void {
    const side = this.radius * 2;
    const [cr, cg, cb] = this.color;

    const pulse = 0.5 + 0.5 * Math.sin(time * 2.5);
    const glowSize = this.radius + 10 + pulse * 8;
    ctx.save();
    ctx.rotate(this.rotation);
    const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, glowSize * 1.4);
    gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.25 + pulse * 0.15})`);
    gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(-glowSize * 1.4, -glowSize * 1.4, glowSize * 2.8, glowSize * 2.8);

    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(-side / 2, -side / 2, side, side);

    const hpRatio = this.hp / this.maxHp;
    if (hpRatio > 0) {
      const innerSide = side - 2;
      ctx.beginPath();
      ctx.rect(-innerSide / 2, -innerSide / 2, innerSide, innerSide);
      ctx.save();
      ctx.clip();
      const fillTop = -this.radius + 1 + (innerSide * (1 - hpRatio));
      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(-innerSide / 2, fillTop, innerSide, innerSide);
      ctx.restore();
    }

    const innerSize = this.radius * 0.5;
    const innerPulse = 0.8 + 0.2 * Math.sin(time * 3);
    ctx.beginPath();
    ctx.moveTo(0, -innerSize * innerPulse);
    ctx.lineTo(innerSize * innerPulse, 0);
    ctx.lineTo(0, innerSize * innerPulse);
    ctx.lineTo(-innerSize * innerPulse, 0);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 200, 200, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
    if (this.isElite) this.drawEliteAura(ctx, this.radius);
  }

  private drawSpitter(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [cr, cg, cb] = this.color;

    if (this.shootTimer < 0.5) {
      const urgency = 1 - this.shootTimer / 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * (1.2 + urgency * 0.25), 0, TWO_PI);
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${urgency * 0.22})`;
      ctx.fill();
    }

    ctx.beginPath();
    const lobes = 7;
    for (let i = 0; i <= lobes; i++) {
      const lobeAngle = this.innerRotation * 0.5 + (i / lobes) * TWO_PI;
      const lobeR = r * (0.92 + Math.sin(lobeAngle * 3 + time * 2) * 0.08);
      const px = Math.cos(lobeAngle) * lobeR;
      const py = Math.sin(lobeAngle) * lobeR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    this.drawHpFill(ctx, r, cr, cg, cb);

    const mouthPulse = 0.5 + 0.5 * Math.sin(time * 6);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28 * (0.85 + mouthPulse * 0.3), 0, TWO_PI);
    ctx.fillStyle = `rgba(${Math.min(255, cr)}, ${cg}, ${cb}, 0.75)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.12, 0, TWO_PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const dotAngle = this.innerRotation + (i / 3) * TWO_PI;
      ctx.beginPath();
      ctx.arc(Math.cos(dotAngle) * r * 0.62, Math.sin(dotAngle) * r * 0.62, r * 0.09, 0, TWO_PI);
      ctx.fillStyle = `rgba(220, 255, 230, 0.5)`;
      ctx.fill();
    }

    drawSphereShading(ctx, 0, 0, r, cr, cg, cb);
    if (this.isElite) this.drawEliteAura(ctx, r);
  }

  private drawSplitter(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [cr, cg, cb] = this.color;
    const hpRatio = this.hp / this.maxHp;

    ctx.beginPath();
    const nodes = 9;
    for (let i = 0; i <= nodes; i++) {
      const nodeAngle = (i / nodes) * TWO_PI;
      const squish = 1 + Math.sin(nodeAngle * 2 + time * 1.6 + this.wobblePhase) * 0.09;
      const px = Math.cos(nodeAngle) * r * squish;
      const py = Math.sin(nodeAngle) * r * squish;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    this.drawHpFill(ctx, r, cr, cg, cb);

    const spread = (1 - hpRatio) * r * 0.42;
    for (let i = 0; i < 3; i++) {
      const nucleusAngle = this.innerRotation * 0.8 + (i / 3) * TWO_PI;
      const nx = Math.cos(nucleusAngle) * spread;
      const ny = Math.sin(nucleusAngle) * spread;
      const nucleusR = r * (0.26 + Math.sin(time * 3 + i * 2) * 0.04);
      ctx.beginPath();
      ctx.arc(nx, ny, nucleusR, 0, TWO_PI);
      ctx.fillStyle = `rgba(255, 190, 240, 0.55)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(nx, ny, nucleusR * 0.4, 0, TWO_PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }

    drawSphereShading(ctx, 0, 0, r, cr, cg, cb);
    if (this.isElite) this.drawEliteAura(ctx, r);
  }

  private drawBomber(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [cr, cg, cb] = this.color;

    if (this.fuseArmed) {
      const blink = Math.sin(time * (14 + this.fuseRatio * 26)) > 0;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, TWO_PI);
      ctx.setLineDash([6, 8]);
      ctx.strokeStyle = `rgba(255, 120, 80, ${0.25 + this.fuseRatio * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      tracePoly(ctx, 0, 0, r, 4, Math.PI / 4);
      ctx.fillStyle = blink ? 'rgba(255, 255, 255, 0.9)' : `rgba(${cr}, ${cg}, ${cb}, 0.9)`;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      tracePoly(ctx, 0, 0, r, 4, Math.PI / 4 + Math.sin(time * 4 + this.wobblePhase) * 0.2);
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.28)`;
      ctx.fill();
      ctx.strokeStyle = this.outlineColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3 * (0.8 + 0.2 * Math.sin(time * 8)), 0, TWO_PI);
      ctx.fillStyle = 'rgba(255, 255, 210, 0.85)';
      ctx.fill();
    }

    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * r * 0.7, -r * 0.7);
      ctx.lineTo(side * r * 1.25, -r * 1.05);
      ctx.lineTo(side * r * 1.05, -r * 0.45);
      ctx.closePath();
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.55)`;
      ctx.fill();
    }

    this.drawHpFill(ctx, r, cr, cg, cb);
    if (this.isElite) this.drawEliteAura(ctx, r);
  }

  private drawBoss(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [baseCr, baseCg, baseCb] = this.color;
    const phaseMix = this.bossPhase === 1 ? 0 : this.bossPhase === 2 ? 0.5 : 1;
    const cr = Math.round(baseCr);
    const cg = Math.round(baseCg + phaseMix * 60);
    const cb = Math.round(baseCb - phaseMix * 40);

    const segCount = 6;
    const segRotate = this.rotation * 0.6;
    for (let i = 0; i < segCount; i++) {
      const segStart = segRotate + (i / segCount) * TWO_PI + 0.08;
      const segEnd = segRotate + ((i + 0.72) / segCount) * TWO_PI - 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.32, segStart, segEnd);
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.55)`;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.32, segStart, segEnd);
      ctx.strokeStyle = `rgba(255, 230, 235, 0.5)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    tracePoly(ctx, 0, 0, r * 1.02, 3, -this.rotation * 0.8 + Math.PI / 6);
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    tracePoly(ctx, 0, 0, r * 0.88, 3, -this.rotation * 0.8 + Math.PI / 6 + Math.PI);
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.4)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, TWO_PI);
    ctx.save();
    ctx.clip();
    const hpRatio = this.hp / this.maxHp;
    const fillTop = r * 0.78 - (r * 1.56 * hpRatio);
    const fillGrad = ctx.createLinearGradient(0, fillTop, 0, r * 0.78);
    fillGrad.addColorStop(0, `rgb(${Math.min(255, cr + 60)}, ${cg}, ${Math.max(0, cb)})`);
    fillGrad.addColorStop(1, `rgb(${cr}, ${cg}, ${cb})`);
    ctx.fillStyle = fillGrad;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(-r, fillTop, r * 2, r * 2);
    ctx.restore();

    const eyePulse = 0.6 + 0.4 * Math.sin(time * (this.bossPhase === 3 ? 6 : 2.2));
    const eyeR = r * 0.2 * eyePulse;
    const eyeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, eyeR * 2.6);
    eyeGrad.addColorStop(0, `rgba(255, 255, 255, ${0.5 + phaseMix * 0.4})`);
    eyeGrad.addColorStop(0.45, `rgba(${255 - phaseMix * 40}, ${230 - phaseMix * 160}, ${240 - phaseMix * 180}, 0.55)`);
    eyeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(0, 0, eyeR * 2.6, 0, TWO_PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, eyeR * 0.5, 0, TWO_PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.85})`;
    ctx.fill();

    if (this.bossPhase >= 2) {
      const sats = this.bossPhase === 3 ? 5 : 4;
      for (let i = 0; i < sats; i++) {
        const satAngle = time * 1.4 + (i / sats) * TWO_PI;
        const sx = Math.cos(satAngle) * r * 1.18;
        const sy = Math.sin(satAngle) * r * 1.18;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(satAngle * 2);
        tracePoly(ctx, 0, 0, r * 0.09, 4, 0);
        ctx.fillStyle = `rgba(255, 220, 230, 0.8)`;
        ctx.fill();
        ctx.restore();
      }
    }

    if (this.bossPhase === 3) {
      ctx.strokeStyle = `rgba(255, 240, 240, ${0.3 + 0.2 * Math.sin(time * 9)})`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const crackAngle = this.innerRotation * 2 + (i / 5) * TWO_PI;
        ctx.beginPath();
        ctx.moveTo(Math.cos(crackAngle) * r * 0.3, Math.sin(crackAngle) * r * 0.3);
        ctx.lineTo(Math.cos(crackAngle + 0.3) * r * 0.68, Math.sin(crackAngle + 0.3) * r * 0.68);
        ctx.lineTo(Math.cos(crackAngle + 0.1) * r * 0.95, Math.sin(crackAngle + 0.1) * r * 0.95);
        ctx.stroke();
      }
    }

    drawSphereShading(ctx, 0, 0, r * 0.78, cr, cg, cb);
  }

  drawProjectiles(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const p of this.projectiles) {
      if (!camera.isVisible(p.x, p.y, p.radius * 4)) continue;
      const ps = camera.worldToScreen(p.x, p.y);
      const glow = ctx.createRadialGradient(ps.x, ps.y, 0, ps.x, ps.y, p.radius * 3);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glow.addColorStop(0.4, 'rgba(255, 200, 200, 0.3)');
      glow.addColorStop(1, 'rgba(255, 100, 100, 0)');
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, p.radius * 3, 0, TWO_PI);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, p.radius, 0, TWO_PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
    }
  }

  private drawChargeTrail(ctx: CanvasRenderingContext2D, bossStyle = false): void {
    const trailLen = bossStyle ? 30 : 20;
    const speed = Math.sqrt(this.chargeVx * this.chargeVx + this.chargeVy * this.chargeVy) || 1;
    const nx = -this.chargeVx / speed;
    const ny = -this.chargeVy / speed;
    for (let i = 1; i <= 4; i++) {
      const tx = nx * trailLen * i;
      const ty = ny * trailLen * i;
      ctx.beginPath();
      ctx.arc(tx, ty, this.radius * (1 - i * 0.15), 0, TWO_PI);
      ctx.fillStyle = bossStyle
        ? `rgba(255, 60, 90, ${0.18 - i * 0.035})`
        : `rgba(255, 160, 40, ${0.15 - i * 0.03})`;
      ctx.fill();
    }
  }

  private drawEliteAura(ctx: CanvasRenderingContext2D, r: number): void {
    const auraR = r * 1.35;
    ctx.beginPath();
    ctx.arc(0, 0, auraR, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(220, 160, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, auraR * 1.12, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(220, 160, 255, 0.14)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  private drawHpFill(ctx: CanvasRenderingContext2D, r: number, cr: number, cg: number, cb: number): void {
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio > 0) {
      ctx.save();
      ctx.clip();
      const fillTop = r - (r * 2 * hpRatio);
      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(-r * 1.2, fillTop, r * 2.4, r * 2.4);
      ctx.restore();
    }
  }

  // Used by enemy.test to avoid unused constant warning.
  static readonly BOSS_BASE_HP = BOSS_BASE_HP;
}
