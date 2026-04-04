import { Camera } from './camera';
import { parseHexColor, TWO_PI, wrappedAngle } from './utils';

const MAX_PARTICLES = 500;

interface Particle {
  done: boolean;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D, camera: Camera): void;
}

// ── Hollow bubble-up rings ──────────────────────────────────────

class DeathParticle implements Particle {
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
    this.wobbleOffset = Math.random() * TWO_PI;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) { this.done = true; return; }
    this.y += this.vy * dt;
    this.x += Math.sin(this.elapsed * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmp * dt;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const alpha = 1 - this.elapsed / this.lifetime;
    const screen = camera.worldToScreen(this.x, this.y);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.radius, 0, TWO_PI);
    ctx.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ── Spark trail particles (new) ─────────────────────────────────

class SparkParticle implements Particle {
  private elapsed = 0;
  private lifetime: number;
  private vx: number;
  private vy: number;
  private r: number;
  private g: number;
  private b: number;
  private size: number;
  private prevX: number;
  private prevY: number;
  done = false;

  constructor(
    private x: number,
    private y: number,
    outlineColor: string,
    speed: number,
  ) {
    const angle = Math.random() * TWO_PI;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.size = 1 + Math.random() * 2;
    this.lifetime = 0.4 + Math.random() * 0.5;
    this.prevX = x;
    this.prevY = y;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) { this.done = true; return; }
    this.prevX = this.x;
    this.prevY = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.96;
    this.vy *= 0.96;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const t = this.elapsed / this.lifetime;
    const alpha = 1 - t;
    const s1 = camera.worldToScreen(this.prevX, this.prevY);
    const s2 = camera.worldToScreen(this.x, this.y);

    // Trail line
    ctx.beginPath();
    ctx.moveTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    ctx.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha * 0.6})`;
    ctx.lineWidth = this.size;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Bright head
    ctx.beginPath();
    ctx.arc(s2.x, s2.y, this.size * 0.8, 0, TWO_PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.fill();
  }
}

// ── Rotating debris chunks (new) ────────────────────────────────

class DebrisParticle implements Particle {
  private elapsed = 0;
  private lifetime: number;
  private vx: number;
  private vy: number;
  private r: number;
  private g: number;
  private b: number;
  private size: number;
  private rotation: number;
  private rotSpeed: number;
  private sides: number;
  done = false;

  constructor(
    private x: number,
    private y: number,
    outlineColor: string,
    enemyRadius: number,
  ) {
    const angle = Math.random() * TWO_PI;
    const speed = 60 + Math.random() * 120;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.size = 2 + Math.random() * (enemyRadius * 0.15);
    this.lifetime = 0.6 + Math.random() * 0.6;
    this.rotation = Math.random() * TWO_PI;
    this.rotSpeed = (Math.random() - 0.5) * 12;
    this.sides = Math.random() < 0.5 ? 3 : 4;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) { this.done = true; return; }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotSpeed * dt;
    this.vx *= 0.97;
    this.vy *= 0.97;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const t = this.elapsed / this.lifetime;
    const alpha = 1 - t * t;
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    for (let i = 0; i <= this.sides; i++) {
      const a = (i / this.sides) * TWO_PI;
      const px = Math.cos(a) * this.size;
      const py = Math.sin(a) * this.size;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha * 0.7})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

// ── Glow pool on ground (new) ───────────────────────────────────

class GlowPool implements Particle {
  private elapsed = 0;
  private lifetime: number;
  private r: number;
  private g: number;
  private b: number;
  private maxRadius: number;
  done = false;

  constructor(
    private x: number,
    private y: number,
    outlineColor: string,
    enemyRadius: number,
  ) {
    this.maxRadius = enemyRadius * 1.5;
    this.lifetime = 0.8 + Math.random() * 0.4;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) { this.done = true; }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const t = this.elapsed / this.lifetime;
    const r = this.maxRadius * Math.min(1, t * 3);
    const alpha = 0.15 * (1 - t);
    const screen = camera.worldToScreen(this.x, this.y);

    const grad = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, r);
    grad.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, r, 0, TWO_PI);
    ctx.fill();
  }
}

// ── XP orb flying to player (new) ───────────────────────────────

class XpOrb implements Particle {
  private elapsed = 0;
  private lifetime = 0.6;
  private vx: number;
  private vy: number;
  private size: number;
  done = false;

  constructor(
    private x: number,
    private y: number,
    private targetX: number,
    private targetY: number,
  ) {
    // Initial random burst, then home toward player
    const angle = Math.random() * TWO_PI;
    this.vx = Math.cos(angle) * 80;
    this.vy = Math.sin(angle) * 80;
    this.size = 2 + Math.random() * 2;
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) { this.done = true; return; }

    // Homing: lerp toward target with increasing strength
    const t = this.elapsed / this.lifetime;
    const homingStrength = t * t * 800;
    const toTargetAngle = wrappedAngle(this.x, this.y, this.targetX, this.targetY);
    this.vx += Math.cos(toTargetAngle) * homingStrength * dt;
    this.vy += Math.sin(toTargetAngle) * homingStrength * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const t = this.elapsed / this.lifetime;
    const alpha = t < 0.8 ? 1 : (1 - t) * 5;
    const screen = camera.worldToScreen(this.x, this.y);

    // Glow
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.size * 3, 0, TWO_PI);
    ctx.fillStyle = `rgba(255, 220, 80, ${alpha * 0.2})`;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.size, 0, TWO_PI);
    ctx.fillStyle = `rgba(255, 240, 150, ${alpha * 0.9})`;
    ctx.fill();

    // Bright center
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.size * 0.4, 0, TWO_PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
}

// ── Explosion burst (improved) ──────────────────────────────────

class ExplosionParticle implements Particle {
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
    const angle = Math.random() * TWO_PI;
    const speed = 100 + Math.random() * 150;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.particleRadius = 1 + Math.random() * 2;
    this.lifetime = 0.5 + Math.random() * 0.3;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) { this.done = true; return; }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const alpha = 1 - this.elapsed / this.lifetime;
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.particleRadius, 0, TWO_PI);
    ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    ctx.fill();
  }
}

// ── White flash ring ────────────────────────────────────────────

class FlashParticle implements Particle {
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
    if (this.elapsed >= this.lifetime) { this.done = true; }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const t = this.elapsed / this.lifetime;
    const currentRadius = this.maxRadius * 2 * t;
    const alpha = 0.4 * (1 - t);
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, currentRadius, 0, TWO_PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }
}

// ── Screen flash overlay (new) ──────────────────────────────────

export interface ScreenEffect {
  done: boolean;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void;
}

export class ScreenFlash implements ScreenEffect {
  private elapsed = 0;
  done = false;

  constructor(
    private r: number,
    private g: number,
    private b: number,
    private maxAlpha: number,
    private duration: number,
  ) {}

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.duration) { this.done = true; }
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const t = this.elapsed / this.duration;
    const alpha = this.maxAlpha * (1 - t);
    ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  }
}

export class DamageVignette implements ScreenEffect {
  private elapsed = 0;
  done = false;

  constructor(private duration: number, private intensity: number) {}

  update(dt: number): void {
    this.elapsed += dt;
    if (this.elapsed >= this.duration) { this.done = true; }
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const t = this.elapsed / this.duration;
    const alpha = this.intensity * (1 - t);
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(width, height) * 0.7;

    const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(200, 0, 0, ${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

// ── Main particle system ────────────────────────────────────────

export class ParticleSystem {
  private particles: Particle[] = [];
  private screenEffects: ScreenEffect[] = [];

  clear(): void {
    this.particles = [];
    this.screenEffects = [];
  }

  spawnDeath(x: number, y: number, radius: number, outlineColor: string): void {
    if (this.particles.length >= MAX_PARTICLES) return;

    // Hollow ring bubble-up
    this.particles.push(new DeathParticle(x, y, radius, outlineColor));

    // Explosion burst
    const burstCount = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < burstCount; i++) {
      this.particles.push(new ExplosionParticle(x, y, outlineColor));
    }

    // Spark trails
    const sparkCount = 6 + Math.floor(radius * 0.3);
    for (let i = 0; i < sparkCount; i++) {
      this.particles.push(new SparkParticle(x, y, outlineColor, 120 + Math.random() * 180));
    }

    // Rotating debris
    const debrisCount = 4 + Math.floor(radius * 0.15);
    for (let i = 0; i < debrisCount; i++) {
      this.particles.push(new DebrisParticle(x, y, outlineColor, radius));
    }

    // Glow pool
    this.particles.push(new GlowPool(x, y, outlineColor, radius));

    // Flash for bigger enemies
    if (radius > 25) {
      this.particles.push(new FlashParticle(x, y, radius));
    }
  }

  spawnXpOrbs(x: number, y: number, playerX: number, playerY: number, count: number): void {
    if (this.particles.length >= MAX_PARTICLES) return;

    for (let i = 0; i < count; i++) {
      this.particles.push(new XpOrb(x, y, playerX, playerY));
    }
  }

  spawnFlash(x: number, y: number, radius: number): void {
    if (this.particles.length >= MAX_PARTICLES) return;
    this.particles.push(new FlashParticle(x, y, radius));
  }

  addScreenFlash(r: number, g: number, b: number, alpha: number, duration: number): void {
    this.screenEffects.push(new ScreenFlash(r, g, b, alpha, duration));
  }

  addDamageVignette(duration: number, intensity: number): void {
    this.screenEffects.push(new DamageVignette(duration, intensity));
  }

  update(dt: number): void {
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter(p => !p.done);

    for (const e of this.screenEffects) e.update(dt);
    this.screenEffects = this.screenEffects.filter(e => !e.done);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const p of this.particles) p.draw(ctx, camera);
  }

  drawScreenEffects(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    for (const e of this.screenEffects) e.draw(ctx, width, height);
  }
}
