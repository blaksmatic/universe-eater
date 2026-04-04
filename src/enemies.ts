import { wrappedAngle, wrappedDistance, randomRange, wrapPosition, drawSphereShading, TWO_PI, tracePoly, easeOutBack } from './utils';
import { Camera } from './camera';

const CHARGE_SPEED = 500;
const SPAWN_DURATION = 0.3;
const HIT_FLASH_DURATION = 0.08;

interface EnemyTypeConfig {
  baseRadius: number;
  radiusVariation: number;
  speed: number;
  baseHp: number;
  color: [number, number, number];
  outlineColor: string;
  xpDrop: number;
  damageMultiplier: number;
}

const ENEMY_TYPES: Record<string, EnemyTypeConfig> = {
  swarmer: {
    baseRadius: 10, radiusVariation: 4, speed: 150, baseHp: 38,
    color: [255, 60, 60], outlineColor: '#ff3c3c', xpDrop: 1, damageMultiplier: 1.0,
  },
  drifter: {
    baseRadius: 20, radiusVariation: 6, speed: 80, baseHp: 100,
    color: [255, 160, 40], outlineColor: '#ffa028', xpDrop: 3, damageMultiplier: 1.5,
  },
  titan: {
    baseRadius: 40, radiusVariation: 10, speed: 40, baseHp: 300,
    color: [160, 60, 255], outlineColor: '#a03cff', xpDrop: 8, damageMultiplier: 2.0,
  },
  overlord: {
    baseRadius: 55, radiusVariation: 10, speed: 60, baseHp: 800,
    color: [200, 20, 40], outlineColor: '#c81428', xpDrop: 15, damageMultiplier: 2.5,
  },
};

export type EnemyType = 'swarmer' | 'drifter' | 'titan' | 'overlord';

export interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifetime: number;
  radius: number;
}

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
  type: EnemyType;
  private rotation = 0;
  private summonTimer = 0;
  canSummon = false;
  private shootTimer = 0;
  projectiles: BossProjectile[] = [];
  private chargeTimer = 0;
  private isCharging = false;
  private chargeVx = 0;
  private chargeVy = 0;
  private chargeDuration = 0;

  // Visual state
  private spawnAge = 0;
  private hitFlash = 0;
  private innerRotation = 0;
  private spikeCount: number;
  private wobblePhase: number;

  constructor(type: EnemyType, x: number, y: number, stage = 1) {
    const config = ENEMY_TYPES[type];
    const difficulty = Math.max(0, stage - 1);
    const hpScale = 1 + difficulty * 0.42;
    const speedScale = 1 + difficulty * 0.07;
    const damageScale = 1 + difficulty * 0.1;
    const xpScale = 1 + difficulty * 0.18;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = config.baseRadius + randomRange(-config.radiusVariation / 2, config.radiusVariation / 2);
    const sizeRatio = this.radius / config.baseRadius;
    this.maxHp = config.baseHp * sizeRatio * hpScale;
    this.hp = this.maxHp;
    this.speed = config.speed * speedScale;
    this.color = config.color;
    this.outlineColor = config.outlineColor;
    this.xpDrop = Math.max(1, Math.round(config.xpDrop * xpScale));
    this.damageMultiplier = config.damageMultiplier * damageScale;
    this.spikeCount = type === 'swarmer' ? Math.floor(randomRange(5, 8)) : 6;
    this.wobblePhase = Math.random() * TWO_PI;

    if (type === 'overlord') {
      this.summonTimer = Math.max(1.6, 3 - difficulty * 0.16);
      this.shootTimer = Math.max(1.1, 2 - difficulty * 0.12);
    }
    if (type === 'drifter') {
      this.chargeTimer = randomRange(
        Math.max(1.8, 3 - difficulty * 0.2),
        Math.max(3.8, 6 - difficulty * 0.25),
      );
    }
  }

  update(dt: number, playerX: number, playerY: number): void {
    this.spawnAge += dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.innerRotation += dt * (this.type === 'titan' ? 0.4 : 1.2);

    const angle = wrappedAngle(this.x, this.y, playerX, playerY);

    if (this.type === 'drifter') {
      if (this.isCharging) {
        this.chargeDuration -= dt;
        this.x += this.chargeVx * dt;
        this.y += this.chargeVy * dt;
        if (this.chargeDuration <= 0) {
          this.isCharging = false;
          this.chargeTimer = randomRange(3, 6);
        }
      } else {
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0 && wrappedDistance(this.x, this.y, playerX, playerY) < 600) {
          this.isCharging = true;
          this.chargeDuration = 0.6;
          this.chargeVx = Math.cos(angle) * CHARGE_SPEED;
          this.chargeVy = Math.sin(angle) * CHARGE_SPEED;
        } else {
          this.x += Math.cos(angle) * this.speed * dt;
          this.y += Math.sin(angle) * this.speed * dt;
        }
      }
    } else {
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;
    }

    const wrapped = wrapPosition(this.x, this.y);
    this.x = wrapped.x;
    this.y = wrapped.y;

    if (this.type === 'overlord') {
      this.rotation += 0.5 * dt;
      this.summonTimer -= dt;
      if (this.summonTimer <= 0) {
        this.summonTimer = 3;
        this.canSummon = true;
      }
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1.5;
        const projSpeed = 250;
        const spread = 0.15;
        for (let i = -1; i <= 1; i++) {
          const a = angle + i * spread;
          this.projectiles.push({
            x: this.x, y: this.y,
            vx: Math.cos(a) * projSpeed,
            vy: Math.sin(a) * projSpeed,
            lifetime: 3,
            radius: 4,
          });
        }
      }
    }

    if (this.projectiles.length > 0) {
      for (const p of this.projectiles) {
        const wrappedProjectile = wrapPosition(p.x + p.vx * dt, p.y + p.vy * dt);
        p.x = wrappedProjectile.x;
        p.y = wrappedProjectile.y;
        p.lifetime -= dt;
      }
      this.projectiles = this.projectiles.filter(p => p.lifetime > 0);
    }
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

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    const screen = camera.worldToScreen(this.x, this.y);

    // Spawn-in scale
    const spawnT = Math.min(1, this.spawnAge / SPAWN_DURATION);
    const scale = easeOutBack(spawnT);
    const drawRadius = this.radius * scale;
    if (drawRadius < 0.5) return;

    // Draw boss projectiles (unscaled)
    this.drawProjectiles(ctx, camera);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(scale, scale);

    // Drifter charge trail
    if (this.type === 'drifter' && this.isCharging) {
      this.drawChargeTrail(ctx);
    }

    // Type-specific body
    switch (this.type) {
      case 'swarmer': this.drawSwarmer(ctx, time); break;
      case 'drifter': this.drawDrifter(ctx, time); break;
      case 'titan': this.drawTitan(ctx, time); break;
      case 'overlord': this.drawOverlord(ctx, time); break;
    }

    // Hit flash — simple white circle over the enemy shape
    if (this.hitFlash > 0) {
      const flashAlpha = 0.35 * (this.hitFlash / HIT_FLASH_DURATION);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.9, 0, TWO_PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fill();
    }

    // Spawn flash ring
    if (spawnT < 1) {
      const ringAlpha = 0.25 * (1 - spawnT);
      const ringR = this.radius * (1 + spawnT * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, TWO_PI);
      ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── Swarmer: jagged spiky star with pulsing core ──────────────

  private drawSwarmer(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [cr, cg, cb] = this.color;
    const wobble = Math.sin(time * 2.5 + this.wobblePhase) * 0.08;
    const rot = time * 1.5 + this.wobblePhase;

    // Subtle core glow
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.8 + this.wobblePhase);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5 * (0.9 + pulse * 0.2), 0, TWO_PI);
    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.1 + pulse * 0.06})`;
    ctx.fill();

    // Spiky star outline
    ctx.beginPath();
    for (let i = 0; i < this.spikeCount * 2; i++) {
      const angle = rot + (i / (this.spikeCount * 2)) * TWO_PI;
      const isOuter = i % 2 === 0;
      const spikeR = isOuter ? r * (1 + wobble) : r * 0.55;
      const px = Math.cos(angle) * spikeR;
      const py = Math.sin(angle) * spikeR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // HP fill clipped to star
    this.drawHpFill(ctx, r, cr, cg, cb);
  }

  // ── Drifter: hexagon with inner rotating ring ─────────────────

  private drawDrifter(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [cr, cg, cb] = this.color;

    // Charge buildup glow
    if (!this.isCharging && this.chargeTimer < 1) {
      const urgency = 1 - this.chargeTimer;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.3, 0, TWO_PI);
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${urgency * 0.15})`;
      ctx.fill();
    }

    // Outer hexagon
    tracePoly(ctx, 0, 0, r, 6, 0);
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // HP fill clipped to hexagon
    this.drawHpFill(ctx, r, cr, cg, cb);

    // Inner rotating hexagon
    const innerR = r * 0.5;
    const innerPulse = 0.8 + 0.2 * Math.sin(time * 2);
    tracePoly(ctx, 0, 0, innerR * innerPulse, 6, this.innerRotation);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    drawSphereShading(ctx, 0, 0, r, cr, cg, cb);
  }

  // ── Titan: concentric rotating rings ──────────────────────────

  private drawTitan(ctx: CanvasRenderingContext2D, time: number): void {
    const r = this.radius;
    const [cr, cg, cb] = this.color;

    // Gravitational distortion lines
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 8; i++) {
      const angle = this.innerRotation * 0.3 + (i / 8) * TWO_PI;
      const lineR = r * 2.2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r * 1.1, Math.sin(angle) * r * 1.1);
      ctx.lineTo(Math.cos(angle) * lineR, Math.sin(angle) * lineR);
      ctx.strokeStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Outer ring 3
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.25, 0, TWO_PI);
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.12)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Outer ring 2
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, TWO_PI);
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.2)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Main body circle
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TWO_PI);
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // HP fill (trace a clip circle for the titan's round body)
    ctx.beginPath();
    ctx.arc(0, 0, r - 1, 0, TWO_PI);
    this.drawHpFill(ctx, r, cr, cg, cb);

    // Inner rotating ring with segments
    const innerR = r * 0.55;
    const segments = 5;
    const segGap = 0.2;
    const segArc = (TWO_PI / segments) - segGap;
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(255, 255, 255, 0.25)`;
    for (let i = 0; i < segments; i++) {
      const startAngle = this.innerRotation + (i / segments) * TWO_PI;
      ctx.beginPath();
      ctx.arc(0, 0, innerR, startAngle, startAngle + segArc);
      ctx.stroke();
    }

    // Central pulsing eye
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
  }

  // ── Overlord: rotating square with glow (mostly preserved) ────

  private drawOverlord(ctx: CanvasRenderingContext2D, time: number): void {
    const side = this.radius * 2;
    const [cr, cg, cb] = this.color;

    // Pulsing glow
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.5);
    const glowSize = this.radius + 10 + pulse * 8;
    ctx.save();
    ctx.rotate(this.rotation);
    const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, glowSize * 1.4);
    gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.25 + pulse * 0.15})`);
    gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(-glowSize * 1.4, -glowSize * 1.4, glowSize * 2.8, glowSize * 2.8);

    // Outline
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(-side / 2, -side / 2, side, side);

    // HP fill
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

    // Inner diamond
    const innerSize = this.radius * 0.5;
    const innerPulse = 0.8 + 0.2 * Math.sin(time * 3);
    ctx.beginPath();
    ctx.moveTo(0, -innerSize * innerPulse);
    ctx.lineTo(innerSize * innerPulse, 0);
    ctx.lineTo(0, innerSize * innerPulse);
    ctx.lineTo(-innerSize * innerPulse, 0);
    ctx.closePath();
    ctx.strokeStyle = `rgba(255, 200, 200, 0.25)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // ── Shared helpers ────────────────────────────────────────────

  drawProjectiles(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const p of this.projectiles) {
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

  private drawChargeTrail(ctx: CanvasRenderingContext2D): void {
    const trailLen = 20;
    const nx = -this.chargeVx / CHARGE_SPEED;
    const ny = -this.chargeVy / CHARGE_SPEED;
    for (let i = 1; i <= 4; i++) {
      const tx = nx * trailLen * i;
      const ty = ny * trailLen * i;
      ctx.beginPath();
      ctx.arc(tx, ty, this.radius * (1 - i * 0.15), 0, TWO_PI);
      ctx.fillStyle = `rgba(255, 160, 40, ${0.15 - i * 0.03})`;
      ctx.fill();
    }
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
}

interface SpawnWeight {
  type: EnemyType;
  weight: number;
}

export class EnemySpawner {
  enemies: Enemy[] = [];
  private spawnTimer = -2.2;
  private stage = 1;

  setStage(stage: number): void {
    this.stage = Math.max(1, stage);
  }

  clear(): void {
    this.enemies = [];
    this.spawnTimer = -Math.max(1.1, 2.2 - (this.stage - 1) * 0.18);
  }

  private getSpawnConfig(elapsed: number): { spawnInterval: number; types: SpawnWeight[] } {
    const difficulty = this.stage - 1;
    const effectiveElapsed = elapsed + difficulty * 75;
    let spawnInterval: number;
    let types: SpawnWeight[];

    if (effectiveElapsed < 20) {
      spawnInterval = 1.4;
      types = [{ type: 'swarmer', weight: 1 }];
    } else if (effectiveElapsed < 45) {
      spawnInterval = 1.0;
      types = [{ type: 'swarmer', weight: 1 }];
    } else if (effectiveElapsed < 90) {
      spawnInterval = 0.8;
      types = [{ type: 'swarmer', weight: 3 }, { type: 'drifter', weight: 1 }];
    } else {
      const minute = effectiveElapsed / 60;
      if (minute < 2) {
        spawnInterval = 0.7;
        types = [{ type: 'swarmer', weight: 3 }, { type: 'drifter', weight: 1.25 }];
      } else if (minute < 2.5) {
        spawnInterval = 0.65;
        types = [{ type: 'swarmer', weight: 3 }, { type: 'drifter', weight: 2 }, { type: 'titan', weight: 0.35 }];
      } else if (minute < 3) {
        spawnInterval = 0.45;
        types = [{ type: 'swarmer', weight: 3 }, { type: 'drifter', weight: 2 }, { type: 'titan', weight: 0.5 }, { type: 'overlord', weight: 0.3 }];
      } else {
        spawnInterval = 0.3;
        types = [{ type: 'swarmer', weight: 2 }, { type: 'drifter', weight: 2 }, { type: 'titan', weight: 1.5 }, { type: 'overlord', weight: 0.8 }];
      }
    }

    const paceScale = 1 + difficulty * 0.12;
    const scaledTypes = types.map(({ type, weight }) => ({
      type,
      weight: this.scaleSpawnWeight(type, weight),
    }));
    return {
      spawnInterval: Math.max(0.18, spawnInterval / paceScale),
      types: scaledTypes,
    };
  }

  private scaleSpawnWeight(type: EnemyType, baseWeight: number): number {
    const difficulty = this.stage - 1;
    switch (type) {
      case 'swarmer':
        return baseWeight * (1 + difficulty * 0.06);
      case 'drifter':
        return baseWeight * (1 + difficulty * 0.14);
      case 'titan':
        return baseWeight * (1 + difficulty * 0.22);
      case 'overlord':
        return baseWeight * (1 + difficulty * 0.28);
    }
  }

  private pickType(types: SpawnWeight[]): EnemyType {
    const total = types.reduce((s, t) => s + t.weight, 0);
    let roll = Math.random() * total;
    for (const t of types) {
      roll -= t.weight;
      if (roll <= 0) return t.type;
    }
    return types[0].type;
  }

  private getSwarmerCount(elapsed: number): number {
    const effectiveElapsed = elapsed + (this.stage - 1) * 50;
    const extra = Math.floor((this.stage - 1) / 2);
    if (effectiveElapsed < 20) return Math.floor(randomRange(1, 3)) + extra;
    if (effectiveElapsed < 45) return Math.floor(randomRange(2, 4)) + extra;
    if (effectiveElapsed < 120) return Math.floor(randomRange(2, 5)) + extra;
    return Math.floor(randomRange(3, 6)) + extra;
  }

  private spawnEnemy(type: EnemyType, camera: Camera, elapsed: number): void {
    const margin = elapsed < 45 ? 140 : 100;
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (side) {
      case 0: x = camera.x + Math.random() * camera.width; y = camera.y - margin - Math.random() * 100; break;
      case 1: x = camera.x + Math.random() * camera.width; y = camera.y + camera.height + margin + Math.random() * 100; break;
      case 2: x = camera.x - margin - Math.random() * 100; y = camera.y + Math.random() * camera.height; break;
      default: x = camera.x + camera.width + margin + Math.random() * 100; y = camera.y + Math.random() * camera.height; break;
    }

    const pos = wrapPosition(x, y);

    if (type === 'swarmer') {
      const count = this.getSwarmerCount(elapsed);
      for (let i = 0; i < count; i++) {
        const gp = wrapPosition(pos.x + randomRange(-40, 40), pos.y + randomRange(-40, 40));
        this.enemies.push(new Enemy('swarmer', gp.x, gp.y, this.stage));
      }
    } else if (type === 'drifter' && elapsed > 75 && Math.random() < Math.min(0.7, 0.35 + (this.stage - 1) * 0.06)) {
      this.enemies.push(new Enemy('drifter', pos.x, pos.y, this.stage));
      const dp = wrapPosition(pos.x + randomRange(-30, 30), pos.y + randomRange(-30, 30));
      this.enemies.push(new Enemy('drifter', dp.x, dp.y, this.stage));
    } else {
      this.enemies.push(new Enemy(type, pos.x, pos.y, this.stage));
    }
  }

  update(dt: number, elapsed: number, playerX: number, playerY: number, camera: Camera): void {
    const config = this.getSpawnConfig(elapsed);
    this.spawnTimer += dt;
    if (this.spawnTimer >= config.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy(this.pickType(config.types), camera, elapsed);
    }
    for (const enemy of this.enemies) {
      enemy.update(dt, playerX, playerY);
    }

    for (const overlord of this.enemies) {
      if (!overlord.consumeSummon()) continue;
      const count = Math.floor(randomRange(2, 4));
      for (let i = 0; i < count; i++) {
        const sp = wrapPosition(
          overlord.x + randomRange(-80, 80),
          overlord.y + randomRange(-80, 80),
        );
        this.enemies.push(new Enemy('swarmer', sp.x, sp.y, this.stage));
      }
    }
  }

  removeDead(): void {
    this.enemies = this.enemies.filter(e => !e.dead);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    for (const enemy of this.enemies) {
      if (camera.isVisible(enemy.x, enemy.y, enemy.radius + 50)) {
        enemy.draw(ctx, camera, time);
      }
    }
  }

  drawProjectiles(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const enemy of this.enemies) {
      if (camera.isVisible(enemy.x, enemy.y, enemy.radius + 80)) {
        enemy.drawProjectiles(ctx, camera);
      }
    }
  }
}
