export const MAP_WIDTH = 50000;
export const MAP_HEIGHT = 50000;
export const WRAP_PADDING = 500;
export const TWO_PI = Math.PI * 2;

export interface Point {
  x: number;
  y: number;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

export function circlesOverlap(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
  return distance(x1, y1, x2, y2) < r1 + r2;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function wrapPosition(x: number, y: number): Point {
  let wx = x;
  let wy = y;
  if (wx < 0) wx += MAP_WIDTH;
  if (wx >= MAP_WIDTH) wx -= MAP_WIDTH;
  if (wy < 0) wy += MAP_HEIGHT;
  if (wy >= MAP_HEIGHT) wy -= MAP_HEIGHT;
  return { x: wx, y: wy };
}

export function wrappedDelta(x1: number, y1: number, x2: number, y2: number): Point {
  let dx = x2 - x1;
  let dy = y2 - y1;
  if (dx > MAP_WIDTH / 2) dx -= MAP_WIDTH;
  if (dx < -MAP_WIDTH / 2) dx += MAP_WIDTH;
  if (dy > MAP_HEIGHT / 2) dy -= MAP_HEIGHT;
  if (dy < -MAP_HEIGHT / 2) dy += MAP_HEIGHT;
  return { x: dx, y: dy };
}

export function wrappedDistance(x1: number, y1: number, x2: number, y2: number): number {
  const d = wrappedDelta(x1, y1, x2, y2);
  return Math.sqrt(d.x * d.x + d.y * d.y);
}

export function wrappedAngle(x1: number, y1: number, x2: number, y2: number): number {
  const d = wrappedDelta(x1, y1, x2, y2);
  return Math.atan2(d.y, d.x);
}

export function parseHexColor(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function formatTime(seconds: number): string {
  const t = Math.ceil(seconds);
  const min = Math.floor(t / 60);
  const sec = t % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function drawSphereShading(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number,
  r: number, g: number, b: number,
): void {
  const hlX = cx - radius * 0.3;
  const hlY = cy - radius * 0.3;
  const grad = ctx.createRadialGradient(hlX, hlY, radius * 0.1, cx, cy, radius);
  grad.addColorStop(0, `rgba(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)}, 0.25)`);
  grad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.08)`);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1, 0, TWO_PI);
  ctx.fillStyle = grad;
  ctx.fill();
}

/** Trace a regular polygon path (caller must stroke/fill). */
export function tracePoly(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, sides: number, rot: number,
): void {
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = rot + (i / sides) * TWO_PI;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function easeOutBack(t: number): number {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
