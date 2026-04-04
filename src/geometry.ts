import { Camera } from './camera';
import { randomRange, TWO_PI, tracePoly } from './utils';

// Neon palette
const NEON: [number, number, number][] = [
  [0, 255, 255],    // cyan
  [255, 0, 128],    // hot pink
  [128, 0, 255],    // purple
  [0, 128, 255],    // electric blue
  [0, 255, 160],    // neon green
];

interface FloatingShape {
  x: number;
  y: number;
  sides: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  color: number;
  alpha: number;
  pulsePhase: number;
  parallax: number;
}

interface RingDef {
  sides: number;
  radius: number;
  speed: number;
  color: number;
  alpha: number;
}

const RING_DEFS: RingDef[] = [
  { sides: 6,  radius: 180, speed:  0.15,  color: 0, alpha: 0.045 },
  { sides: 4,  radius: 300, speed: -0.10,  color: 1, alpha: 0.035 },
  { sides: 8,  radius: 420, speed:  0.07,  color: 3, alpha: 0.028 },
  { sides: 3,  radius: 550, speed: -0.18,  color: 2, alpha: 0.022 },
  { sides: 5,  radius: 700, speed:  0.12,  color: 4, alpha: 0.020 },
  { sides: 10, radius: 900, speed: -0.04,  color: 0, alpha: 0.016 },
];

const NUM_RADIALS = 24;
const RADIAL_MAX_LEN = 1200;
const GRID_SPACING = 250;
const GRID_PARALLAX = 0.12;
const GRID_WAVE_SEGMENTS = 10;
const GRID_WAVE_AMP = 6;

export class BackgroundGeometry {
  private shapes: FloatingShape[] = [];

  constructor() {
    for (let i = 0; i < 30; i++) {
      this.shapes.push({
        x: randomRange(-3000, 3000),
        y: randomRange(-3000, 3000),
        sides: [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)],
        radius: randomRange(40, 180),
        rotation: Math.random() * TWO_PI,
        rotSpeed: randomRange(-0.2, 0.2),
        color: Math.floor(Math.random() * NEON.length),
        alpha: randomRange(0.015, 0.04),
        pulsePhase: Math.random() * TWO_PI,
        parallax: randomRange(0.05, 0.25),
      });
    }
  }

  update(dt: number): void {
    for (const s of this.shapes) {
      s.rotation += s.rotSpeed * dt;
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    time: number,
    playerX: number,
    playerY: number,
  ): void {
    this.drawGrid(ctx, camera, time);
    this.drawRadials(ctx, camera, time, playerX, playerY);
    this.drawFloatingShapes(ctx, camera, time);
    this.drawRings(ctx, camera, time, playerX, playerY);
  }

  // ── Grid: wavy neon lines with glow ───────────────────────────

  private drawGrid(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    const sp = GRID_SPACING;
    const offX = (camera.x * GRID_PARALLAX) % sp;
    const offY = (camera.y * GRID_PARALLAX) % sp;
    const pulse = 0.6 + 0.4 * Math.sin(time * 0.3);
    const baseAlpha = 0.024 * pulse;
    const [r, g, b] = NEON[3];

    // Glow pass (thick, dim)
    ctx.lineWidth = 5;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha * 0.3})`;
    this.traceGridPaths(ctx, camera, sp, offX, offY, time);
    ctx.stroke();

    // Core pass (thin, bright)
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha})`;
    this.traceGridPaths(ctx, camera, sp, offX, offY, time);
    ctx.stroke();

    // Intersection dots
    ctx.fillStyle = `rgba(${r + 50}, ${g + 70}, ${b}, ${baseAlpha * 1.8})`;
    for (let gx = -offX - sp; gx <= camera.width + sp; gx += sp) {
      for (let gy = -offY - sp; gy <= camera.height + sp; gy += sp) {
        const wx = gx + Math.sin(gy * 0.008 + time * 0.4) * GRID_WAVE_AMP;
        const wy = gy + Math.sin(gx * 0.008 + time * 0.35) * GRID_WAVE_AMP;
        ctx.beginPath();
        ctx.arc(wx, wy, 1.8, 0, TWO_PI);
        ctx.fill();
      }
    }
  }

  private traceGridPaths(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    sp: number,
    offX: number,
    offY: number,
    time: number,
  ): void {
    const segs = GRID_WAVE_SEGMENTS;
    const amp = GRID_WAVE_AMP;
    ctx.beginPath();

    // Vertical wavy lines
    for (let gx = -offX - sp; gx <= camera.width + sp; gx += sp) {
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const y = t * camera.height;
        const wx = gx + Math.sin(y * 0.008 + time * 0.4) * amp;
        if (s === 0) ctx.moveTo(wx, y);
        else ctx.lineTo(wx, y);
      }
    }

    // Horizontal wavy lines
    for (let gy = -offY - sp; gy <= camera.height + sp; gy += sp) {
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const x = t * camera.width;
        const wy = gy + Math.sin(x * 0.008 + time * 0.35) * amp;
        if (s === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
    }
  }

  // ── Radial light rays from player ─────────────────────────────

  private drawRadials(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    time: number,
    px: number,
    py: number,
  ): void {
    const screen = camera.worldToScreen(px, py);
    const cx = screen.x;
    const cy = screen.y;
    const baseRot = time * 0.05;

    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    for (let i = 0; i < NUM_RADIALS; i++) {
      const angle = baseRot + (i / NUM_RADIALS) * TWO_PI;
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.8 + i * 0.5);
      const len = RADIAL_MAX_LEN * (0.5 + 0.5 * pulse);
      const alpha = 0.015 * pulse;

      const ex = cx + Math.cos(angle) * len;
      const ey = cy + Math.sin(angle) * len;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
      ctx.stroke();
    }
  }

  // ── Floating wireframe shapes with parallax ───────────────────

  private drawFloatingShapes(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    time: number,
  ): void {
    for (const s of this.shapes) {
      const sx = s.x - camera.x * s.parallax;
      const sy = s.y - camera.y * s.parallax;
      const padW = camera.width + 400;
      const padH = camera.height + 400;
      const screenX = ((sx % padW) + padW) % padW - 200;
      const screenY = ((sy % padH) + padH) % padH - 200;

      const pulse = 1 + 0.15 * Math.sin(time * 0.8 + s.pulsePhase);
      const r = s.radius * pulse;
      const [cr, cg, cb] = NEON[s.color];
      const alpha = s.alpha * (0.7 + 0.3 * Math.sin(time * 0.5 + s.pulsePhase));

      this.drawNeonPoly(ctx, screenX, screenY, r, s.sides, s.rotation, cr, cg, cb, alpha, 4);
    }
  }

  // ── Concentric rotating polygon rings around player ───────────

  private drawRings(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    time: number,
    px: number,
    py: number,
  ): void {
    const screen = camera.worldToScreen(px, py);
    const cx = screen.x;
    const cy = screen.y;

    for (const ring of RING_DEFS) {
      const breathe = 1 + 0.08 * Math.sin(time * 0.6 + ring.radius * 0.01);
      const r = ring.radius * breathe;
      const rot = time * ring.speed;
      const [cr, cg, cb] = NEON[ring.color];
      const a = ring.alpha * (0.7 + 0.3 * Math.sin(time * 0.4 + ring.radius * 0.005));

      this.drawNeonPoly(ctx, cx, cy, r, ring.sides, rot, cr, cg, cb, a, 3);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────

  private drawNeonPoly(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, r: number, sides: number, rot: number,
    cr: number, cg: number, cb: number, alpha: number,
    glowWidth: number,
  ): void {
    // Glow pass
    ctx.lineWidth = glowWidth;
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.35})`;
    tracePoly(ctx, cx, cy, r, sides, rot);
    ctx.stroke();

    // Core pass
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
    tracePoly(ctx, cx, cy, r, sides, rot);
    ctx.stroke();

    // Vertex dots
    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 1.8})`;
    for (let i = 0; i < sides; i++) {
      const a = rot + (i / sides) * TWO_PI;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 0, TWO_PI);
      ctx.fill();
    }
  }
}
