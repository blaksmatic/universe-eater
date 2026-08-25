import { wrappedAngle, wrappedDelta, wrappedDistance, TWO_PI } from '../utils';
import { Camera } from '../camera';
import type { Enemy } from '../enemies';
import { hitEnemySilent } from './shared';

export interface LaserStats {
  damage: number;
  cooldown: number;
  duration: number;
  range: number;
  width: number;
  glowAlpha: number;
  particleCount: number;
}

export interface BeamVisualColors {
  glow: string;
  glowAlphaBoost: number;
  midStart: [number, number, number];
  midEnd: [number, number, number];
  coreStart: [number, number, number];
  coreEnd: [number, number, number];
  impactOuter: string;
  impactMid: string;
  originOuter: string;
  originInner: string;
}

export const LASER_COLORS: BeamVisualColors = {
  glow: '80, 160, 255',
  glowAlphaBoost: 0,
  midStart: [100, 180, 255],
  midEnd: [255, 200, 255],
  coreStart: [255, 220, 240],
  coreEnd: [255, 255, 255],
  impactOuter: 'rgba(80, 160, 255, 0)',
  impactMid: 'rgba(100, 200, 255, 0.5)',
  originOuter: 'rgba(80, 150, 255, VAR)',
  originInner: 'rgba(210, 235, 255, VAR)',
};

export const ESCORT_COLORS: BeamVisualColors = {
  glow: '120, 255, 220',
  glowAlphaBoost: 0.06,
  midStart: [110, 255, 220],
  midEnd: [200, 255, 245],
  coreStart: [220, 255, 245],
  coreEnd: [255, 255, 255],
  impactOuter: 'rgba(80, 255, 220, 0)',
  impactMid: 'rgba(110, 255, 225, 0.45)',
  originOuter: 'rgba(90, 255, 220, VAR)',
  originInner: 'rgba(230, 255, 245, VAR)',
};

export function computeLaserStats(level: number): LaserStats {
  return {
    damage: 8 + level * 4,
    cooldown: Math.max(0.15, 0.8 - level * 0.065),
    duration: 0.1 + level * 0.01,
    range: 200 + level * 40,
    width: 1 + level * 0.8,
    glowAlpha: 0.1 + level * 0.06,
    particleCount: Math.floor(level / 3),
  };
}

export function applyBeamDamage(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  enemies: Enemy[],
  damage: number,
  range: number,
  width: number,
  modifiers: import('./shared').WeaponModifiers,
): void {
  const angle = wrappedAngle(originX, originY, targetX, targetY);
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dist = wrappedDistance(originX, originY, enemy.x, enemy.y);
    if (dist > range) continue;
    const eAngle = wrappedAngle(originX, originY, enemy.x, enemy.y);
    const diff = Math.abs(eAngle - angle);
    const normDiff = Math.min(diff, TWO_PI - diff);
    if (dist * Math.sin(normDiff) < enemy.radius + width) {
      hitEnemySilent(enemy, damage, modifiers);
    }
  }
}

export function drawBeam(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  originWorldX: number,
  originWorldY: number,
  originRadius: number,
  targetWorldX: number,
  targetWorldY: number,
  stats: LaserStats,
  time: number,
  level: number,
  colors: BeamVisualColors,
): void {
  const screen = camera.worldToScreen(originWorldX, originWorldY);
  const delta = wrappedDelta(originWorldX, originWorldY, targetWorldX, targetWorldY);
  const endX = screen.x + delta.x;
  const endY = screen.y + delta.y;
  const beamAngle = Math.atan2(delta.y, delta.x);
  const originX = screen.x + Math.cos(beamAngle) * originRadius;
  const originY = screen.y + Math.sin(beamAngle) * originRadius;
  const beamLength = Math.max(0, Math.sqrt(delta.x * delta.x + delta.y * delta.y) - originRadius);
  const perpX = -Math.sin(beamAngle);
  const perpY = Math.cos(beamAngle);
  const amplitude = 0.5 + level * 0.6;
  const frequency = 3.5;
  const waveSpeed = 8;
  const segments = 20;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const along = t * beamLength;
    const wave = Math.sin(t * frequency * TWO_PI + time * waveSpeed) * amplitude;
    points.push({
      x: originX + Math.cos(beamAngle) * along + perpX * wave,
      y: originY + Math.sin(beamAngle) * along + perpY * wave,
    });
  }

  const drawWavyPath = (): void => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= segments; i++) ctx.lineTo(points[i].x, points[i].y);
  };

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (level >= 3) {
    drawWavyPath();
    ctx.strokeStyle = `rgba(${colors.glow}, ${stats.glowAlpha + colors.glowAlphaBoost})`;
    ctx.lineWidth = stats.width * 5;
    ctx.stroke();
  }

  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const taper = 1.0 - t * 0.5;
    const r = Math.round(colors.midStart[0] + (colors.midEnd[0] - colors.midStart[0]) * t);
    const g = Math.round(colors.midStart[1] + (colors.midEnd[1] - colors.midStart[1]) * t);
    const b = Math.round(colors.midStart[2] + (colors.midEnd[2] - colors.midStart[2]) * t);
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(points[i + 1].x, points[i + 1].y);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.35 + stats.glowAlpha})`;
    ctx.lineWidth = stats.width * 2.5 * taper;
    ctx.stroke();
  }

  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const taper = 1.0 - t * 0.6;
    const r = Math.round(colors.coreStart[0] + (colors.coreEnd[0] - colors.coreStart[0]) * t);
    const g = Math.round(colors.coreStart[1] + (colors.coreEnd[1] - colors.coreStart[1]) * t);
    const b = Math.round(colors.coreStart[2] + (colors.coreEnd[2] - colors.coreStart[2]) * t);
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(points[i + 1].x, points[i + 1].y);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.95)`;
    ctx.lineWidth = stats.width * taper;
    ctx.stroke();
  }

  const flashRadius = stats.width * 3 + 4;
  const flashGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, flashRadius * 2.5);
  flashGrad.addColorStop(0, 'rgba(230, 255, 255, 0.9)');
  flashGrad.addColorStop(0.4, colors.impactMid);
  flashGrad.addColorStop(1, colors.impactOuter);
  ctx.beginPath();
  ctx.arc(endX, endY, flashRadius * 2.5, 0, TWO_PI);
  ctx.fillStyle = flashGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(endX, endY, flashRadius * 0.5, 0, TWO_PI);
  ctx.fillStyle = 'rgba(240, 255, 255, 0.95)';
  ctx.fill();

  if (level >= 5) {
    const orbPulse = 0.6 + 0.4 * Math.sin(time * 12);
    const orbRadius = stats.width * 2.5 * orbPulse;
    const orbGrad = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, orbRadius * 3);
    orbGrad.addColorStop(0, colors.originOuter.replace('VAR', `${0.8 * orbPulse}`));
    orbGrad.addColorStop(0.5, colors.originOuter.replace('VAR', `${0.4 * orbPulse}`));
    orbGrad.addColorStop(1, colors.impactOuter);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, orbRadius * 3, 0, TWO_PI);
    ctx.fillStyle = orbGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, orbRadius, 0, TWO_PI);
    ctx.fillStyle = colors.originInner.replace('VAR', `${0.9 * orbPulse}`);
    ctx.fill();
  }

  for (let i = 0; i < stats.particleCount; i++) {
    const t = Math.random();
    const segIdx = Math.floor(t * segments);
    const px = points[segIdx].x + (Math.random() - 0.5) * stats.width * 3;
    const py = points[segIdx].y + (Math.random() - 0.5) * stats.width * 3;
    ctx.fillStyle = `rgba(220, 255, 255, ${0.5 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, Math.random() * 2, 0, TWO_PI);
    ctx.fill();
  }
}
