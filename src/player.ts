import { isKeyDown, touch } from './input';
import { MAP_WIDTH, MAP_HEIGHT, wrapPosition, drawSphereShading, TWO_PI } from './utils';
import { Camera } from './camera';

interface Ripple {
  angle: number;
  age: number;
  duration: number;
}

export class Player {
  x = MAP_WIDTH / 2;
  y = MAP_HEIGHT / 2;
  radius = 15;
  speed = 200;
  maxHp = 100;
  hp = 100;
  regenRate = 0.01;
  damageTakenMultiplier = 1;
  xp = 0;
  level = 1;
  kills = 0;
  ripples: Ripple[] = [];
  private hurtTimer = 0;
  private contactCooldown = 0;
  private readonly hurtDuration = 0.22;
  contactGraceDuration = 0.35;

  getXpForNextLevel(): number {
    return Math.floor(8 * Math.pow(1.35, this.level - 1));
  }

  addXp(amount: number): boolean {
    this.xp += amount;
    if (this.xp >= this.getXpForNextLevel()) {
      this.xp -= this.getXpForNextLevel();
      this.level++;
      return true;
    }
    return false;
  }

  takeDamage(amount: number): boolean {
    const adjustedAmount = amount * this.damageTakenMultiplier;
    if (adjustedAmount <= 0) return false;
    this.hp = Math.max(0, this.hp - adjustedAmount);
    this.hurtTimer = Math.max(this.hurtTimer, this.hurtDuration);
    return true;
  }

  takeContactHit(amount: number): boolean {
    if (this.contactCooldown > 0) return false;
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

  addRipple(angle: number): void {
    this.ripples.push({ angle, age: 0, duration: 0.4 });
  }

  updateRipples(dt: number): void {
    for (const r of this.ripples) r.age += dt;
    this.ripples = this.ripples.filter(r => r.age < r.duration);
  }

  regenerate(dt: number): void {
    if (this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * this.regenRate * dt);
    }
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

  update(dt: number): void {
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.contactCooldown = Math.max(0, this.contactCooldown - dt);

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

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    const wrapped = wrapPosition(this.x, this.y);
    this.x = wrapped.x;
    this.y = wrapped.y;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screen = camera.worldToScreen(this.x, this.y);
    this.drawBody(ctx, screen.x, screen.y);
    this.drawEffects(ctx, camera);
  }

  drawEffects(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screen = camera.worldToScreen(this.x, this.y);
    const hpRatio = this.hp / this.maxHp;

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

    // HP arc — glowing ring that sweeps proportionally to health
    if (hpRatio > 0) {
      const arcRadius = this.radius + 5;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + TWO_PI * hpRatio;

      // Glow layer
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, arcRadius, startAngle, endAngle);
      const r = Math.round(60 + (1 - hpRatio) * 195); // blue -> red as HP drops
      const g = Math.round(180 * hpRatio);
      const b = Math.round(255 * hpRatio);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Bright core
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
