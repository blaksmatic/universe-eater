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

    ctx.beginPath();
    ctx.arc(x, y, this.radius - 1, 0, TWO_PI);
    ctx.fillStyle = `rgba(20, 50, 100, ${0.3 + hpRatio * 0.4})`;
    ctx.fill();

    drawSphereShading(ctx, x, y, this.radius, 60, 120, 255);
  }
}
