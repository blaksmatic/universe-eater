import { isKeyDown, touch, consumeDashRequest, triggerHaptic } from './input';
import { MAP_WIDTH, MAP_HEIGHT, TWO_PI } from './utils';
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

    if (this.x < 0) this.x += MAP_WIDTH;
    else if (this.x >= MAP_WIDTH) this.x -= MAP_WIDTH;
    if (this.y < 0) this.y += MAP_HEIGHT;
    else if (this.y >= MAP_HEIGHT) this.y -= MAP_HEIGHT;
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

    // Matte, illustrated hull — less bloom, more craft
    const hullBase: [number, number, number] = hpRatio > 0.5
      ? [198, 202, 210] // warm light grey, hand-painted
      : hpRatio > 0.25 ? [205, 180, 140] : [200, 110, 105];
    const stripe: [number, number, number] = hpRatio > 0.5 ? [210, 75, 65] : [200, 90, 55];

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(facing + bank);

    const r = this.radius;

    // — Exhaust — muted, smoky, not additive white
    {
      const exhaustLen = (r * 0.72 + (this.isDashing ? 6 : 0)) * (0.82 + 0.18 * flameFlicker);
      const exhaustW = r * 0.42;
      // soot puff
      ctx.fillStyle = `rgba(35, 35, 38, ${0.18 + hurt * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(-r * 0.92 - exhaustLen * 0.35, 0, exhaustLen * 0.38, exhaustW * 0.55, 0, 0, TWO_PI);
      ctx.fill();
      // flame — dirty amber, no lighter composite
      ctx.beginPath();
      ctx.moveTo(-r * 0.84, 0);
      ctx.lineTo(-r * 0.84 - exhaustLen, -exhaustW);
      ctx.lineTo(-r * 0.84 - exhaustLen * 0.68, 0);
      ctx.lineTo(-r * 0.84 - exhaustLen, exhaustW);
      ctx.closePath();
      const flameGrad = ctx.createLinearGradient(-r * 0.84, 0, -r * 0.84 - exhaustLen, 0);
      flameGrad.addColorStop(0, `rgba(210, 170, 120, 0.55)`);
      flameGrad.addColorStop(0.35, `rgba(180, 140, 110, 0.28)`);
      flameGrad.addColorStop(1, 'rgba(80, 60, 50, 0)');
      ctx.fillStyle = flameGrad;
      ctx.fill();
      // inner ember — small, warm
      ctx.beginPath();
      ctx.moveTo(-r * 0.83, 0);
      ctx.lineTo(-r * 0.83 - exhaustLen * 0.42, -exhaustW * 0.28);
      ctx.lineTo(-r * 0.83 - exhaustLen * 0.32, 0);
      ctx.lineTo(-r * 0.83 - exhaustLen * 0.42, exhaustW * 0.28);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 220, 165, ${0.38 * flameFlicker})`;
      ctx.fill();
      // nozzle
      ctx.fillStyle = `rgba(58, 62, 70, 1)`;
      ctx.beginPath();
      ctx.ellipse(-r * 0.80, 0, 2.0, 3.8, 0, 0, TWO_PI);
      ctx.fill();
      ctx.strokeStyle = `rgba(165, 175, 185, 0.35)`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    // — Soft drop shadow — not bloom
    ctx.fillStyle = `rgba(10, 12, 18, 0.22)`;
    ctx.beginPath();
    ctx.ellipse(1.2, 1.8, r * 1.02, r * 0.78, 0, 0, TWO_PI);
    ctx.fill();

    // — Hull silhouette —
    ctx.beginPath();
    ctx.moveTo(r * 1.02, 0);
    ctx.lineTo(r * 0.18, -r * 0.60);
    ctx.lineTo(-r * 0.48, -r * 0.74);
    ctx.lineTo(-r * 0.33, -r * 0.30);
    ctx.lineTo(-r * 0.86, -r * 0.20);
    ctx.lineTo(-r * 0.86, r * 0.20);
    ctx.lineTo(-r * 0.33, r * 0.30);
    ctx.lineTo(-r * 0.48, r * 0.74);
    ctx.lineTo(r * 0.18, r * 0.60);
    ctx.closePath();

    // Flat matte fill with subtle paper grain
    ctx.fillStyle = `rgb(${hullBase[0]}, ${hullBase[1]}, ${hullBase[2]})`;
    ctx.fill();
    // Top-light wash — very subtle, not glossy
    const wash = ctx.createLinearGradient(0, -r * 0.8, 0, r * 0.7);
    wash.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
    wash.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
    wash.addColorStop(1, 'rgba(0, 0, 0, 0.10)');
    ctx.fillStyle = wash;
    ctx.fill();

    // Ink outline — hand-pressed, not neon
    ctx.strokeStyle = `rgba(28, 32, 44, 0.92)`;
    ctx.lineWidth = 1.25;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // — Illustrated paneling — faint, irregular
    ctx.strokeStyle = `rgba(28, 32, 44, 0.22)`;
    ctx.lineWidth = 0.7;
    ctx.setLineDash([3.5, 3]);
    ctx.beginPath();
    // centre spine
    ctx.moveTo(r * 0.78, 0); ctx.lineTo(-r * 0.78, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(28, 32, 44, 0.18)`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(r * 0.10, -r * 0.38); ctx.lineTo(-r * 0.42, -r * 0.52);
    ctx.moveTo(r * 0.10, r * 0.38); ctx.lineTo(-r * 0.42, r * 0.52);
    ctx.moveTo(-r * 0.18, -r * 0.28); ctx.lineTo(-r * 0.18, r * 0.28);
    ctx.stroke();

    // — Artistic stripe — hand-painted, slightly wobbly
    ctx.strokeStyle = `rgba(${stripe[0]}, ${stripe[1]}, ${stripe[2]}, 0.92)`;
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.62, -r * 0.12);
    ctx.quadraticCurveTo(r * 0.10, -r * 0.14, -r * 0.62, -r * 0.10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.62, r * 0.12);
    ctx.quadraticCurveTo(r * 0.10, r * 0.14, -r * 0.62, r * 0.10);
    ctx.stroke();
    // stripe chips
    ctx.fillStyle = `rgba(28, 32, 44, 0.28)`;
    ctx.fillRect(-r * 0.05, -r * 0.12 - 0.9, 2.2, 1.8);
    ctx.fillRect(r * 0.32, r * 0.12 - 0.9, 1.6, 1.8);

    // — Cockpit — deep, not glowing
    ctx.beginPath();
    ctx.ellipse(r * 0.16, 0, r * 0.29, r * 0.20, 0, 0, TWO_PI);
    ctx.fillStyle = `rgba(48, 58, 74, 0.96)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(28, 32, 44, 0.85)`;
    ctx.lineWidth = 1.0;
    ctx.stroke();
    // canopy glass — small catch-light, not full gradient
    ctx.fillStyle = `rgba(205, 220, 235, 0.55)`;
    ctx.beginPath();
    ctx.ellipse(r * 0.20, -r * 0.07, r * 0.11, r * 0.05, -0.35, 0, TWO_PI);
    ctx.fill();
    ctx.fillStyle = `rgba(205, 220, 235, 0.22)`;
    ctx.beginPath();
    ctx.ellipse(r * 0.08, r * 0.06, r * 0.07, r * 0.03, 0.4, 0, TWO_PI);
    ctx.fill();

    // — Rivets — muted, not shiny
    ctx.fillStyle = `rgba(28, 32, 44, 0.55)`;
    for (const [wx, wy] of [[-0.30, -0.34], [-0.30, 0.34], [0.42, -0.22], [0.42, 0.22], [-0.62, -0.08], [-0.62, 0.08]] as const) {
      ctx.beginPath(); ctx.arc(r * wx, r * wy, 0.85, 0, TWO_PI); ctx.fill();
      ctx.fillStyle = `rgba(255, 255, 255, 0.18)`; ctx.beginPath(); ctx.arc(r * wx - 0.25, r * wy - 0.25, 0.35, 0, TWO_PI); ctx.fill(); ctx.fillStyle = `rgba(28, 32, 44, 0.55)`;
    }

    // — Weathering — edge scuffs, stipple
    ctx.strokeStyle = `rgba(28, 32, 44, 0.14)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(r * 0.82, -r * 0.18); ctx.lineTo(r * 0.86, -r * 0.12);
    ctx.moveTo(-r * 0.44, -r * 0.70); ctx.lineTo(-r * 0.40, -r * 0.66);
    ctx.moveTo(-r * 0.82, r * 0.14); ctx.lineTo(-r * 0.78, r * 0.18);
    ctx.stroke();
    ctx.fillStyle = `rgba(28, 32, 44, 0.09)`;
    for (let i = 0; i < 7; i++) {
      const px = (Math.sin(i * 1.7) * 0.5 + 0.5) * r * 0.9 - r * 0.45;
      const py = (Math.cos(i * 2.3) * 0.5 + 0.5) * r * 0.5 - r * 0.25;
      ctx.beginPath(); ctx.arc(px, py, 0.6 + (i % 2) * 0.4, 0, TWO_PI); ctx.fill();
    }

    // — Nose — dark steel, not neon dot
    ctx.fillStyle = `rgba(58, 62, 70, 1)`;
    ctx.beginPath(); ctx.arc(r * 1.00, 0, 1.8, 0, TWO_PI); ctx.fill();
    ctx.strokeStyle = `rgba(28, 32, 44, 0.9)`; ctx.lineWidth = 0.8; ctx.stroke();
    // tiny pitot tube
    ctx.strokeStyle = `rgba(58, 62, 70, 1)`; ctx.lineWidth = 1.0; ctx.beginPath(); ctx.moveTo(r * 1.00, 0); ctx.lineTo(r * 1.14, 0); ctx.stroke();

    // Hurt — desaturated wash, not white flash
    if (hurt > 0.01) {
      ctx.globalAlpha = hurt * 0.18;
      ctx.fillStyle = `rgba(${stripe[0]}, ${stripe[1]}, ${stripe[2]}, 1)`;
      ctx.beginPath();
      ctx.moveTo(r * 1.02, 0); ctx.lineTo(r * 0.18, -r * 0.60); ctx.lineTo(-r * 0.86, -r * 0.20); ctx.lineTo(-r * 0.86, r * 0.20); ctx.lineTo(r * 0.18, r * 0.60); ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // No sphere shading — matte paper, keep just a faint AO
    ctx.fillStyle = `rgba(10, 12, 18, 0.06)`;
    ctx.beginPath();
    ctx.ellipse(x + 0.8, y + 1.2, this.radius * 0.85, this.radius * 0.72, 0, 0, TWO_PI);
    ctx.fill();
  }
}
