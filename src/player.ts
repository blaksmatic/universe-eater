import { isKeyDown } from './input';
import { MAP_WIDTH, MAP_HEIGHT, wrapPosition } from './utils';
import { Camera } from './camera';

export class Player {
  x = MAP_WIDTH / 2;
  y = MAP_HEIGHT / 2;
  radius = 15;
  speed = 200;
  maxHp = 100;
  hp = 100;
  xp = 0;
  level = 1;
  kills = 0;

  getXpForNextLevel(): number {
    return Math.floor(10 * Math.pow(1.4, this.level - 1));
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

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  update(dt: number): void {
    let dx = 0;
    let dy = 0;

    if (isKeyDown('w') || isKeyDown('arrowup')) dy -= 1;
    if (isKeyDown('s') || isKeyDown('arrowdown')) dy += 1;
    if (isKeyDown('a') || isKeyDown('arrowleft')) dx -= 1;
    if (isKeyDown('d') || isKeyDown('arrowright')) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    const wrapped = wrapPosition(this.x, this.y);
    this.x = wrapped.x;
    this.y = wrapped.y;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screen = camera.worldToScreen(this.x, this.y);
    const hpRatio = this.hp / this.maxHp;

    // Outer ring
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner fill — HP as liquid level
    if (hpRatio > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, this.radius - 1, 0, Math.PI * 2);
      ctx.clip();

      const fillTop = screen.y + this.radius - (this.radius * 2 * hpRatio);
      ctx.fillStyle = '#1a3a6e';
      ctx.fillRect(screen.x - this.radius, fillTop, this.radius * 2, this.radius * 2);
      ctx.restore();
    }

    // Glow
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(68, 136, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}
