export const MAP_WIDTH = 5000;
export const MAP_HEIGHT = 5000;
export const WRAP_PADDING = 200;

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

export function wrappedDistance(x1: number, y1: number, x2: number, y2: number): number {
  let dx = x2 - x1;
  let dy = y2 - y1;
  if (dx > MAP_WIDTH / 2) dx -= MAP_WIDTH;
  if (dx < -MAP_WIDTH / 2) dx += MAP_WIDTH;
  if (dy > MAP_HEIGHT / 2) dy -= MAP_HEIGHT;
  if (dy < -MAP_HEIGHT / 2) dy += MAP_HEIGHT;
  return Math.sqrt(dx * dx + dy * dy);
}

export function wrappedAngle(x1: number, y1: number, x2: number, y2: number): number {
  let dx = x2 - x1;
  let dy = y2 - y1;
  if (dx > MAP_WIDTH / 2) dx -= MAP_WIDTH;
  if (dx < -MAP_WIDTH / 2) dx += MAP_WIDTH;
  if (dy > MAP_HEIGHT / 2) dy -= MAP_HEIGHT;
  if (dy < -MAP_HEIGHT / 2) dy += MAP_HEIGHT;
  return Math.atan2(dy, dx);
}
