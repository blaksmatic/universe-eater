import { Camera } from './camera';
import { parseHexColor } from './utils';

class DeathParticle {
  private elapsed = 0;
  private vy: number;
  private wobbleSpeed: number;
  private wobbleAmp: number;
  private wobbleOffset: number;
  private r: number;
  private g: number;
  private b: number;
  done = false;

  constructor(
    private x: number,
    private y: number,
    private radius: number,
    outlineColor: string,
    private lifetime = 1.0,
  ) {
    this.vy = -40 - Math.random() * 30;
    this.wobbleSpeed = 2 + Math.random() * 3;
    this.wobbleAmp = 5 + Math.random() * 10;
    this.wobbleOffset = Math.random() * Math.PI * 2;

    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
      return;
    }
    this.y += this.vy * dt;
    this.x += Math.sin(this.elapsed * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmp * dt;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const alpha = 1 - this.elapsed / this.lifetime;
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

class ExplosionParticle {
  private elapsed = 0;
  private vx: number;
  private vy: number;
  private r: number;
  private g: number;
  private b: number;
  private particleRadius: number;
  private lifetime: number;
  private gravity = 60;
  done = false;

  constructor(
    private x: number,
    private y: number,
    outlineColor: string,
  ) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 150;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.particleRadius = 1 + Math.random() * 2;
    this.lifetime = 0.5 + Math.random() * 0.3;

    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt; // slight gravity
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const alpha = 1 - this.elapsed / this.lifetime;
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.particleRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    ctx.fill();
  }
}

class FlashParticle {
  private elapsed = 0;
  private lifetime = 0.2;
  done = false;

  constructor(
    private x: number,
    private y: number,
    private maxRadius: number,
  ) {}

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const t = this.elapsed / this.lifetime; // 0..1
    const currentRadius = this.maxRadius * 2 * t;
    const alpha = 0.4 * (1 - t);
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
}

export class ParticleSystem {
  private particles: (DeathParticle | ExplosionParticle | FlashParticle)[] = [];

  spawnDeath(x: number, y: number, radius: number, outlineColor: string): void {
    this.particles.push(new DeathParticle(x, y, radius, outlineColor));
    this.spawnExplosion(x, y, outlineColor);
    if (radius > 25) {
      this.spawnFlash(x, y, radius);
    }
  }

  private spawnExplosion(x: number, y: number, outlineColor: string): void {
    const count = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
      this.particles.push(new ExplosionParticle(x, y, outlineColor));
    }
  }

  spawnFlash(x: number, y: number, radius: number): void {
    this.particles.push(new FlashParticle(x, y, radius));
  }

  update(dt: number): void {
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter(p => !p.done);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const p of this.particles) p.draw(ctx, camera);
  }
}
