import { roundedRect } from '../utils';

/** Canonical UI palette — keep in sync with HUD / pause / title treatments. */
export const UI_COLORS = {
  accent: '110, 150, 255',
  accentBright: '150, 200, 255',
  gold: '255, 202, 110',
  danger: '255, 92, 112',
  teal: '90, 235, 210',
  violet: '190, 130, 255',
} as const;

/** Frosted glass panel: soft shadow, gradient fill, luminous top edge. */
export function glassPanel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  radius = 14,
  tint = '12, 18, 40',
  alpha = 0.72,
): void {
  ctx.save();
  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, `rgba(${tint}, ${Math.min(1, alpha + 0.1)})`);
  grad.addColorStop(1, `rgba(${tint}, ${alpha})`);
  ctx.beginPath();
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Luminous top edge
  const edge = ctx.createLinearGradient(x, y, x + w, y);
  edge.addColorStop(0, 'rgba(150, 200, 255, 0)');
  edge.addColorStop(0.5, 'rgba(150, 200, 255, 0.5)');
  edge.addColorStop(1, 'rgba(150, 200, 255, 0)');
  ctx.beginPath();
  roundedRect(ctx, x + 1, y + 0.5, w - 2, h - 1, radius);
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Outer border
  ctx.beginPath();
  roundedRect(ctx, x, y, w, h, radius);
  ctx.strokeStyle = 'rgba(140, 180, 255, 0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

/** Text with a soft outer glow. */
export function glowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  fill: string,
  glow: string,
  blur = 10,
): void {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = blur;
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = blur * 0.5;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Draw text with per-character letter spacing (centered on x). */
export function spacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  spacing: number,
): number {
  const chars = Array.from(text);
  const total = chars.reduce((s, c) => s + ctx.measureText(c).width + spacing, 0) - spacing;
  let cx = x - total / 2;
  for (const c of chars) {
    ctx.fillText(c, cx + ctx.measureText(c).width / 2, y);
    cx += ctx.measureText(c).width + spacing;
  }
  return total;
}

/** Vertical gradient fill applied to text. */
export function gradientText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  top: string,
  bottom: string,
): void {
  const m = ctx.measureText(text);
  const grad = ctx.createLinearGradient(0, y - m.actualBoundingBoxAscent, 0, y + m.actualBoundingBoxDescent);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);
}
