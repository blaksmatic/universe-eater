import { MAP_WIDTH, MAP_HEIGHT, randomRange, TWO_PI } from './utils';
import { Camera } from './camera';
import { loadSettings } from './storage';

const PARALLAX = [0.2, 0.5, 0.8];
const TINTS = ['225,240,255', '130,185,255', '255,223,177', '194,169,255', '139,241,222'];
const NEBULA_TINTS = ['103,60,204', '35,102,171', '78,66,155', '25,142,150'];
const wrap = (value: number, span: number): number => ((value % span) + span) % span;
type SpriteCanvas = HTMLCanvasElement | OffscreenCanvas;

/** Never use wx.createCanvas(): its first canvas may be the visible game surface. */
function createSprite(size: number): SpriteCanvas | null {
  try {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(size, size);
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      return canvas;
    }
    const runtime = (globalThis as unknown as {
      wx?: { createOffscreenCanvas?: (options: { type: string; width: number; height: number }) => SpriteCanvas };
    }).wx;
    return runtime?.createOffscreenCanvas?.({ type: '2d', width: size, height: size }) ?? null;
  } catch {
    return null;
  }
}

function glowSprite(tint: string, nebula: boolean): SpriteCanvas | null {
  const size = nebula ? 384 : 48;
  const canvas = createSprite(size);
  if (!canvas) return null;
  try {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!ctx) return null;
    const clouds = nebula ? [[0.48, 0.51, 0.46], [0.32, 0.4, 0.28], [0.65, 0.58, 0.26]] : [[0.5, 0.5, 0.5]];
    for (const [x, y, radius] of clouds) {
      const gradient = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, radius * size);
      gradient.addColorStop(0, `rgba(${tint},${nebula ? 0.7 : 0.65})`);
      gradient.addColorStop(0.35, `rgba(${tint},${nebula ? 0.28 : 0.12})`);
      gradient.addColorStop(1, `rgba(${tint},0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    return canvas;
  } catch {
    return null;
  }
}

export class Background {
  private starGlows = TINTS.map(tint => glowSprite(tint, false));
  private nebulaGlows = NEBULA_TINTS.map(tint => glowSprite(tint, true));
  private stars = Array.from({ length: 380 }, (_, i) => ({
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    layer: i < 220 ? 0 : i < 330 ? 1 : 2,
    size: i < 220 ? randomRange(0.45, 0.85) : i < 330 ? randomRange(0.8, 1.4) : randomRange(1.3, 2.2),
    brightness: randomRange(0.22, 0.72),
    twinkleSpeed: randomRange(0.3, 1.2),
    phase: Math.random() * TWO_PI,
    tint: Math.floor(Math.random() * TINTS.length),
  }));
  private nebulae = Array.from({ length: 7 }, (_, i) => ({
    x: (i * 0.618 + 0.25) % 1,
    y: (i * 0.382 + 0.35) % 1,
    radius: randomRange(400, 720),
    tint: i % NEBULA_TINTS.length,
    alpha: randomRange(0.17, 0.26),
  }));
  private dust = Array.from({ length: 36 }, () => ({
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    size: randomRange(0.4, 1),
    alpha: randomRange(0.06, 0.18),
    vx: randomRange(-3, 3),
    vy: randomRange(-3, 3),
  }));
  private driftIntensity = 0;
  private velocityX = 0;
  private velocityY = 0;

  update(dt: number, playerSpeed = 0, vx = 0, vy = 0): void {
    this.driftIntensity += ((playerSpeed < 10 ? 1 : 0) - this.driftIntensity) * Math.min(1, 3 * dt);
    this.velocityX += (vx - this.velocityX) * Math.min(1, 8 * dt);
    this.velocityY += (vy - this.velocityY) * Math.min(1, 8 * dt);
    if (loadSettings().reducedMotion) return;
    for (const d of this.dust) {
      d.x = wrap(d.x + d.vx * dt, MAP_WIDTH);
      d.y = wrap(d.y + d.vy * dt, MAP_HEIGHT);
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    if (camera.width <= 0 || camera.height <= 0) return;
    const { particleQuality: quality, reducedMotion: reduced } = loadSettings();
    const count = quality === 'low' ? 3 : quality === 'medium' ? 5 : this.nebulae.length;
    ctx.save();
    for (let i = 0; i < count; i++) {
      const n = this.nebulae[i];
      const spanX = camera.width + n.radius * 2;
      const spanY = camera.height + n.radius * 2;
      // Viewport tiling keeps clouds visible throughout the enormous world.
      const x = wrap(n.x * spanX - camera.x * 0.06, spanX) - n.radius;
      const y = wrap(n.y * spanY - camera.y * 0.06, spanY) - n.radius;
      const sprite = this.nebulaGlows[n.tint];
      if (sprite) {
        ctx.globalAlpha = n.alpha;
        ctx.drawImage(sprite, x - n.radius, y - n.radius * 0.65, n.radius * 2, n.radius * 1.3);
      }
    }
    ctx.globalAlpha = 1;
    const speed = reduced ? 0 : Math.hypot(this.velocityX, this.velocityY);
    const oscillation = reduced ? 0 : Math.sin(time * 0.4) * 0.5 + 0.5;
    const cx = camera.width / 2;
    const cy = camera.height / 2;
    const streakFactors = [0, 0.012, 0.025];
    const driftFactors = [3, 7, 12];
    ctx.lineCap = 'round';
    for (const star of this.stars) {
      if (quality === 'low' && star.layer === 0) continue;
      let x = wrap(star.x - camera.x * PARALLAX[star.layer], camera.width);
      let y = wrap(star.y - camera.y * PARALLAX[star.layer], camera.height);
      const drift = driftFactors[star.layer] * oscillation * this.driftIntensity;
      x += ((x - cx) / cx) * drift;
      y += ((y - cy) / cy) * drift;
      const twinkle = reduced ? 0.8 : 0.8 + 0.2 * Math.sin(time * star.twinkleSpeed + star.phase);
      const alpha = star.brightness * twinkle * (star.layer === 0 ? 0.65 : 1);
      const tint = TINTS[star.tint];
      const glow = this.starGlows[star.tint];
      if (quality !== 'low' && star.layer === 2 && glow) {
        const radius = star.size * 5;
        ctx.globalAlpha = alpha * 0.7;
        ctx.drawImage(glow, x - radius, y - radius, radius * 2, radius * 2);
        ctx.globalAlpha = 1;
      }
      const streak = Math.min(12, speed * streakFactors[star.layer]);
      if (streak > 1) {
        const dx = this.velocityX / speed * streak;
        const dy = this.velocityY / speed * streak;
        ctx.strokeStyle = `rgba(${tint},${alpha * 0.75})`;
        ctx.lineWidth = star.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(x - dx, y - dy);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(${tint},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, TWO_PI);
        ctx.fill();
      }
    }
    if (quality !== 'low') {
      for (const d of this.dust) {
        const x = wrap(d.x - camera.x * 0.65, camera.width + 20) - 10;
        const y = wrap(d.y - camera.y * 0.65, camera.height + 20) - 10;
        ctx.fillStyle = `rgba(140,185,210,${d.alpha})`;
        ctx.fillRect(x, y, d.size, d.size);
      }
    }
    ctx.restore();
  }

  drawWrapZone(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const padding = 200;
    const edges = [
      [0, 0, Math.max(0, padding - camera.x), camera.height],
      [Math.max(0, MAP_WIDTH - padding - camera.x), 0, Math.max(0, camera.x + camera.width - MAP_WIDTH + padding), camera.height],
      [0, 0, camera.width, Math.max(0, padding - camera.y)],
      [0, Math.max(0, MAP_HEIGHT - padding - camera.y), camera.width, Math.max(0, camera.y + camera.height - MAP_HEIGHT + padding)],
    ];
    ctx.save();
    for (let i = 0; i < edges.length; i++) {
      const [x, y, w, h] = edges[i];
      if (w <= 0 || h <= 0) continue;
      const vertical = i >= 2;
      const reverse = i % 2 === 1;
      const gradient = ctx.createLinearGradient(x, y, vertical ? x : x + w, vertical ? y + h : y);
      gradient.addColorStop(reverse ? 1 : 0, 'rgba(63,91,155,0.18)');
      gradient.addColorStop(reverse ? 0 : 1, 'rgba(20,30,60,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }
}
