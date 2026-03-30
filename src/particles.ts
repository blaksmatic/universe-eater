import { Camera } from './camera';

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

    // Parse hex color
    this.r = parseInt(outlineColor.slice(1, 3), 16);
    this.g = parseInt(outlineColor.slice(3, 5), 16);
    this.b = parseInt(outlineColor.slice(5, 7), 16);
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

export class ParticleSystem {
  private particles: DeathParticle[] = [];

  spawnDeath(x: number, y: number, radius: number, outlineColor: string): void {
    this.particles.push(new DeathParticle(x, y, radius, outlineColor));
  }

  update(dt: number): void {
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter(p => !p.done);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const p of this.particles) p.draw(ctx, camera);
  }
}
