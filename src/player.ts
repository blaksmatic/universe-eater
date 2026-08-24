import { isKeyDown, touch, consumeDashRequest, triggerHaptic } from './input';
import { MAP_WIDTH, MAP_HEIGHT, wrapPosition, drawSphereShading, TWO_PI } from './utils';
import { Camera } from './camera';
import { audio } from './audio';

interface Ripple {
  angle: number;
  age: number;
  duration: number;
}

interface DashGhost {
  x: number;
  y: number;
  age: number;
}

const LEVEL_XP_SCALE = 0.7;
const DASH_COOLDOWN = 2.4;
const DASH_DURATION = 0.16;
const DASH_DISTANCE = 250;
const DASH_IFRAME_EXTRA = 0.06;

export class Player {
  x = MAP_WIDTH / 2;
  y = MAP_HEIGHT / 2;
  radius = 15;
  speed = 200;
  maxHp = 100;
  hp = 100;
  regenRate = 0.01;
  damageTakenMultiplier = 1;
  critChance = 0;
  critMultiplier = 2;
  healOnKill = 0;
  xpGainMultiplier = 1;
  xp = 0;
  level = 1;
  kills = 0;
  ripples: Ripple[] = [];
  ghosts: DashGhost[] = [];

  // Dash state
  private dashCooldownTimer = 0;
  private dashActiveTimer = 0;
  private dashVx = 0;
  private dashVy = 0;
  private lastMoveX = 1;
  private lastMoveY = 0;
  private invulnTimer = 0;

  private hurtTimer = 0;
  private contactCooldown = 0;
  private readonly hurtDuration = 0.22;
  /** Brief window after any hit that blocks further damage (prevents bullet-wall melts). */
  private postHitInvuln = 0;
  private shimmerPhase = 0;
  contactGraceDuration = 0.35;

  getXpForNextLevel(): number {
    return Math.max(1, Math.floor(8 * Math.pow(1.35, this.level - 1) * LEVEL_XP_SCALE));
  }

  addXp(amount: number): boolean {
    this.xp += amount * this.xpGainMultiplier;
    if (this.xp >= this.getXpForNextLevel()) {
      this.xp -= this.getXpForNextLevel();
      this.level++;
      return true;
    }
    return false;
  }

  takeDamage(amount: number): boolean {
    if (this.invulnTimer > 0 || this.postHitInvuln > 0) return false;
    const adjustedAmount = amount * this.damageTakenMultiplier;
    if (adjustedAmount <= 0) return false;
    this.hp = Math.max(0, this.hp - adjustedAmount);
    this.hurtTimer = Math.max(this.hurtTimer, this.hurtDuration);
    this.postHitInvuln = 0.25;
    return true;
  }

  takeContactHit(amount: number): boolean {
    if (this.contactCooldown > 0 || this.invulnTimer > 0) return false;
    const tookDamage = this.takeDamage(amount);
    if (tookDamage) {
      this.contactCooldown = this.contactGraceDuration;
    }
    return tookDamage;
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  get hurtRatio(): number {
    return Math.min(1, this.hurtTimer / this.hurtDuration);
  }

  get isDashing(): boolean {
    return this.dashActiveTimer > 0;
  }

  get isInvulnerable(): boolean {
    return this.invulnTimer > 0;
  }

  /** 0 = ready, 1 = just used. */
  get dashCooldownRatio(): number {
    return Math.max(0, Math.min(1, this.dashCooldownTimer / DASH_COOLDOWN));
  }

  addRipple(angle: number): void {
    this.ripples.push({ angle, age: 0, duration: 0.4 });
  }

  updateRipples(dt: number): void {
    this.shimmerPhase += dt * 40;
    for (const r of this.ripples) r.age += dt;
    this.ripples = this.ripples.filter(r => r.age < r.duration);
    for (const g of this.ghosts) g.age += dt;
    this.ghosts = this.ghosts.filter(g => g.age < 0.3);
  }

  regenerate(dt: number): void {
    if (this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * this.regenRate * dt);
    }
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addMaxHull(amount: number, repairAmount = amount): void {
    this.maxHp += amount;
    this.hp = Math.min(this.maxHp, this.hp + repairAmount);
  }

  addSpeed(amount: number): void {
    this.speed += amount;
  }

  multiplyRegen(multiplier: number, repairAmount = 0): void {
    this.regenRate *= multiplier;
    if (repairAmount > 0) {
      this.hp = Math.min(this.maxHp, this.hp + repairAmount);
    }
  }

  multiplyDamageTaken(multiplier: number): void {
    this.damageTakenMultiplier *= multiplier;
  }

  increaseContactGrace(amount: number): void {
    this.contactGraceDuration += amount;
  }

  addCritChance(amount: number): void {
    this.critChance = Math.min(0.75, this.critChance + amount);
  }

  upgradeHull(): void {
    this.addMaxHull(25, 25);
  }

  upgradeThrusters(): void {
    this.addSpeed(18);
  }

  upgradeNanoforge(): void {
    this.multiplyRegen(1.4, 12);
  }

  upgradePlating(): void {
    this.multiplyDamageTaken(0.88);
  }

  upgradeTargeting(): void {
    this.addCritChance(0.08);
  }

  upgradeOverclock(): void {
    // Cooldown handled by WeaponManager via doctrine-style application.
  }

  upgradeVampiric(): void {
    this.healOnKill += 0.8;
  }

  upgradeAmplifier(): void {
    this.xpGainMultiplier *= 1.12;
  }

  update(dt: number): void {
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.contactCooldown = Math.max(0, this.contactCooldown - dt);
    this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    this.postHitInvuln = Math.max(0, this.postHitInvuln - dt);

    let dx = 0;
    let dy = 0;

    if (touch.active) {
      dx = touch.dx;
      dy = touch.dy;
    } else {
      if (isKeyDown('w') || isKeyDown('arrowup')) dy -= 1;
      if (isKeyDown('s') || isKeyDown('arrowdown')) dy += 1;
      if (isKeyDown('a') || isKeyDown('arrowleft')) dx -= 1;
      if (isKeyDown('d') || isKeyDown('arrowright')) dx += 1;

      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }
    }

    // Dash trigger
    if (consumeDashRequest() && this.dashCooldownTimer <= 0 && !this.isDashing) {
      let ddx = dx;
      let ddy = dy;
      if (ddx === 0 && ddy === 0) {
        ddx = this.lastMoveX;
        ddy = this.lastMoveY;
      }
      const len = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
      this.dashVx = (ddx / len) * (DASH_DISTANCE / DASH_DURATION);
      this.dashVy = (ddy / len) * (DASH_DISTANCE / DASH_DURATION);
      this.dashActiveTimer = DASH_DURATION;
      this.dashCooldownTimer = DASH_COOLDOWN;
      this.invulnTimer = DASH_DURATION + DASH_IFRAME_EXTRA;
      audio.playDash();
      triggerHaptic(10);
    }

    if (this.dxNonZero(dx, dy)) {
      this.lastMoveX = dx;
      this.lastMoveY = dy;
    }

    if (this.dashActiveTimer > 0) {
      this.dashActiveTimer -= dt;
      this.x += this.dashVx * dt;
      this.y += this.dashVy * dt;
      if (this.ghosts.length < 12) {
        this.ghosts.push({ x: this.x, y: this.y, age: 0 });
      }
    } else {
      this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - dt);
      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;
    }

    const wrapped = wrapPosition(this.x, this.y);
    this.x = wrapped.x;
    this.y = wrapped.y;
  }

  private dxNonZero(dx: number, dy: number): boolean {
    return dx !== 0 || dy !== 0;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screen = camera.worldToScreen(this.x, this.y);
    this.drawBody(ctx, screen.x, screen.y);
    this.drawEffects(ctx, camera);
  }

  drawEffects(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screen = camera.worldToScreen(this.x, this.y);
    const hpRatio = this.hp / this.maxHp;

    // Dash afterimages
    for (const ghost of this.ghosts) {
      const t = ghost.age / 0.3;
      const gs = camera.worldToScreen(ghost.x, ghost.y);
      ctx.beginPath();
      ctx.arc(gs.x, gs.y, this.radius * (1 - t * 0.4), 0, TWO_PI);
      ctx.strokeStyle = `rgba(120, 200, 255, ${(1 - t) * 0.45})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Dash cooldown recharge arc
    if (this.dashCooldownRatio > 0) {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, this.radius + 11, -Math.PI / 2, -Math.PI / 2 + TWO_PI * (1 - this.dashCooldownRatio));
      ctx.strokeStyle = 'rgba(140, 220, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Outer ring
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.radius, 0, TWO_PI);
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (this.hurtTimer > 0) {
      const hurtAlpha = this.hurtRatio;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, this.radius + 10, 0, TWO_PI);
      ctx.strokeStyle = `rgba(255, 90, 90, ${0.18 + hurtAlpha * 0.2})`;
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(screen.x, screen.y, this.radius + 3, 0, TWO_PI);
      ctx.strokeStyle = `rgba(255, 240, 240, ${0.25 + hurtAlpha * 0.35})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Invulnerability shimmer while dashing
    if (this.invulnTimer > 0) {
      const shimmer = 0.5 + 0.5 * Math.sin(this.shimmerPhase);
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, this.radius + 6 + shimmer * 2, 0, TWO_PI);
      ctx.strokeStyle = `rgba(180, 230, 255, ${0.3 + shimmer * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // HP arc — glowing ring that sweeps proportionally to health
    if (hpRatio > 0) {
      const arcRadius = this.radius + 5;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + TWO_PI * hpRatio;

      ctx.beginPath();
      ctx.arc(screen.x, screen.y, arcRadius, startAngle, endAngle);
      const r = Math.round(60 + (1 - hpRatio) * 195); // blue -> red as HP drops
      const g = Math.round(180 * hpRatio);
      const b = Math.round(255 * hpRatio);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(screen.x, screen.y, arcRadius, startAngle, endAngle);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Ambient glow — dims with HP
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.radius + 4, 0, TWO_PI);
    ctx.strokeStyle = `rgba(68, 136, 255, ${0.1 + hpRatio * 0.2})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Water ripple effect when laser fires
    for (const ripple of this.ripples) {
      const t = ripple.age / ripple.duration;
      const alpha = 0.6 * (1 - t);
      const spread = Math.PI * 0.4 * (1 + t * 0.5);
      const rippleR = this.radius + 2 + t * 12;

      ctx.beginPath();
      ctx.arc(screen.x, screen.y, rippleR, ripple.angle - spread / 2, ripple.angle + spread / 2);
      ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
      ctx.lineWidth = 2.5 * (1 - t);
      ctx.stroke();

      // Second thinner ring slightly ahead
      const rippleR2 = this.radius + 2 + t * 18;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, rippleR2, ripple.angle - spread * 0.3, ripple.angle + spread * 0.3);
      ctx.strokeStyle = `rgba(150, 210, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 1.5 * (1 - t);
      ctx.stroke();
    }
  }

  private drawBody(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const hpRatio = this.hp / this.maxHp;
    const facing = Math.atan2(this.lastMoveY, this.lastMoveX);
    const isMoving = Math.hypot(this.lastMoveX, this.lastMoveY) > 0.01;
    const bank = isMoving ? Math.sin(this.shimmerPhase * 0.02) * 0.08 : 0;
    const flameFlicker = 0.75 + 0.25 * Math.sin(this.shimmerPhase * 0.3);
    const hurt = this.hurtRatio;

    // Hull palette shifts with HP: healthy cyan -> amber -> red
    const hullBase: [number, number, number] = hpRatio > 0.5
      ? [210, 235, 255]
      : hpRatio > 0.25 ? [255, 210, 120] : [255, 95, 95];
    const hullDark: [number, number, number] = hpRatio > 0.5
      ? [30, 70, 160]
      : hpRatio > 0.25 ? [90, 55, 20] : [90, 20, 30];
    const accent: [number, number, number] = hpRatio > 0.5 ? [90, 200, 255] : [255, 170, 80];

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(facing + bank);

    const r = this.radius;

    // — Engine exhaust — (behind hull, additive)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const exhaustLen = (r * 0.95 + (this.isDashing ? 8 : 0)) * flameFlicker;
    const exhaustW = r * 0.55;
    // outer flame
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, 0);
    ctx.lineTo(-r * 0.85 - exhaustLen, -exhaustW);
    ctx.lineTo(-r * 0.85 - exhaustLen * 0.72, 0);
    ctx.lineTo(-r * 0.85 - exhaustLen, exhaustW);
    ctx.closePath();
    const flameGrad = ctx.createLinearGradient(-r * 0.85, 0, -r * 0.85 - exhaustLen, 0);
    flameGrad.addColorStop(0, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.95)`);
    flameGrad.addColorStop(0.45, `rgba(255, 240, 200, 0.55)`);
    flameGrad.addColorStop(1, 'rgba(255, 200, 80, 0)');
    ctx.fillStyle = flameGrad;
    ctx.fill();
    // inner hot core
    ctx.beginPath();
    ctx.moveTo(-r * 0.82, 0);
    ctx.lineTo(-r * 0.82 - exhaustLen * 0.62, -exhaustW * 0.42);
    ctx.lineTo(-r * 0.82 - exhaustLen * 0.48, 0);
    ctx.lineTo(-r * 0.82 - exhaustLen * 0.62, exhaustW * 0.42);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * flameFlicker})`;
    ctx.fill();
    // side nozzle glow
    ctx.beginPath();
    ctx.ellipse(-r * 0.78, 0, 2.2, 4.5, 0, 0, TWO_PI);
    ctx.fillStyle = `rgba(255, 220, 160, ${0.7 + hurt * 0.3})`;
    ctx.fill();
    ctx.restore();

    // — CRT phosphor bloom behind hull —
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.18, r * 0.92, 0, 0, TWO_PI);
    ctx.fillStyle = `rgba(${hullDark[0]}, ${hullDark[1]}, ${hullDark[2]}, 0.14)`;
    ctx.fill();

    // — Main hull — pointed vector shape
    // Shadow / deep stroke first (glow)
    ctx.beginPath();
    ctx.moveTo(r * 1.05, 0); // nose
    ctx.lineTo(r * 0.15, -r * 0.62); // starboard bow
    ctx.lineTo(-r * 0.55, -r * 0.78); // starboard wing tip
    ctx.lineTo(-r * 0.35, -r * 0.32); // wing root
    ctx.lineTo(-r * 0.88, -r * 0.22); // engine starboard
    ctx.lineTo(-r * 0.88, r * 0.22);  // engine port
    ctx.lineTo(-r * 0.35, r * 0.32);
    ctx.lineTo(-r * 0.55, r * 0.78);
    ctx.lineTo(r * 0.15, r * 0.62);
    ctx.closePath();
    ctx.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.22)`;
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Hull fill — faceted gradient
    const hullGrad = ctx.createLinearGradient(-r * 0.9, -r * 0.6, r * 0.9, r * 0.4);
    hullGrad.addColorStop(0, `rgba(${hullDark[0]}, ${hullDark[1]}, ${hullDark[2]}, 0.96)`);
    hullGrad.addColorStop(0.5, `rgba(${hullBase[0]}, ${hullBase[1]}, ${hullBase[2]}, 0.96)`);
    hullGrad.addColorStop(1, `rgba(${Math.min(255, hullBase[0] + 20)}, ${Math.min(255, hullBase[1] + 20)}, 255, 0.96)`);
    ctx.fillStyle = hullGrad;
    ctx.fill();

    // Hull hard outline — crisp vector
    ctx.strokeStyle = `rgba(235, 245, 255, 0.96)`;
    ctx.lineWidth = 1.7;
    ctx.stroke();
    // inner bevel
    ctx.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.55)`;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // — Cockpit canopy —
    ctx.beginPath();
    ctx.ellipse(r * 0.18, 0, r * 0.32, r * 0.22, 0, 0, TWO_PI);
    const canopyGrad = ctx.createLinearGradient(r * 0.05, -r * 0.2, r * 0.35, r * 0.2);
    canopyGrad.addColorStop(0, 'rgba(90, 200, 255, 0.95)');
    canopyGrad.addColorStop(0.5, 'rgba(180, 230, 255, 0.85)');
    canopyGrad.addColorStop(1, 'rgba(90, 160, 255, 0.35)');
    ctx.fillStyle = canopyGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    // canopy highlight
    ctx.beginPath();
    ctx.ellipse(r * 0.14, -r * 0.08, r * 0.13, r * 0.07, -0.3, 0, TWO_PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    // — Wing panel lines —
    ctx.strokeStyle = `rgba(${hullDark[0]}, ${hullDark[1]}, ${hullDark[2]}, 0.55)`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, -r * 0.42); ctx.lineTo(-r * 0.48, -r * 0.58);
    ctx.moveTo(-r * 0.1, r * 0.42); ctx.lineTo(-r * 0.48, r * 0.58);
    ctx.stroke();
    // rivets
    ctx.fillStyle = `rgba(255, 255, 255, 0.55)`;
    for (const [wx, wy] of [[-0.22, -0.38], [-0.22, 0.38], [0.08, -0.28], [0.08, 0.28]] as const) {
      ctx.beginPath(); ctx.arc(r * wx, r * wy, 0.9, 0, TWO_PI); ctx.fill();
    }

    // — Nose probe / laser emitter —
    ctx.beginPath();
    ctx.arc(r * 1.02, 0, 2.6, 0, TWO_PI);
    ctx.fillStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 1)`;
    ctx.fill();
    ctx.beginPath(); ctx.arc(r * 1.02, 0, 4.8, 0, TWO_PI);
    ctx.fillStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.22)`;
    ctx.fill();

    // Hurt flash — additive white on low HP hit
    if (hurt > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = hurt * 0.42;
      ctx.beginPath();
      ctx.moveTo(r * 1.05, 0);
      ctx.lineTo(r * 0.15, -r * 0.62);
      ctx.lineTo(-r * 0.88, -r * 0.22);
      ctx.lineTo(-r * 0.88, r * 0.22);
      ctx.lineTo(r * 0.15, r * 0.62);
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();

    // keep subtle sphere shading for depth on top of vector hull
    drawSphereShading(ctx, x, y, this.radius * 0.72, hullDark[0], hullDark[1], hullDark[2]);
  }
}
