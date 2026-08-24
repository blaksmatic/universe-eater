import { TWO_PI, roundedRect } from '../utils';
import type { PassiveName, WeaponName } from '../ids';

export type IconName = WeaponName | PassiveName;

export const WEAPON_SHAPES: Record<IconName, (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => void> = {
  'Laser Beam': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + s, y, 2, 0, TWO_PI);
    ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.fill();
  },
  'Orbit Shield': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.7, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + s * 0.5, y - s * 0.3, 2, 0, TWO_PI);
    ctx.fillStyle = 'rgba(180, 220, 255, 0.9)';
    ctx.fill();
  },
  'Nova Blast': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.6, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(255, 160, 60, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.2, 0, TWO_PI);
    ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
    ctx.fill();
  },
  'Escort Wing': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.8, y + s * 0.8);
    ctx.lineTo(x, y + s * 0.35);
    ctx.lineTo(x - s * 0.8, y + s * 0.8);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(120, 255, 220, 0.95)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.55, y);
    ctx.lineTo(x + s * 1.2, y - s * 0.45);
    ctx.stroke();
  },
  'Seeker Swarm': (ctx, x, y, s) => {
    for (const [dx, dy] of [[-s * 0.5, -s * 0.3], [s * 0.45, -s * 0.15], [0, s * 0.5]] as const) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy - s * 0.42);
      ctx.lineTo(x + dx + s * 0.3, y + dy + s * 0.36);
      ctx.lineTo(x + dx - s * 0.3, y + dy + s * 0.36);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 190, 110, 0.95)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  },
  'Arc Reactor': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.7, y - s * 0.4);
    ctx.lineTo(x - s * 0.05, y - s * 0.05);
    ctx.lineTo(x - s * 0.45, y + s * 0.15);
    ctx.lineTo(x + s * 0.35, y + s * 0.6);
    ctx.strokeStyle = 'rgba(150, 225, 255, 0.95)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.25, y - s * 0.65);
    ctx.lineTo(x + s * 0.75, y - s * 0.15);
    ctx.stroke();
  },
  'Singularity': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.62, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(190, 120, 255, 0.95)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.28, 0.6, 3.6);
    ctx.strokeStyle = 'rgba(230, 180, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.12, 0, TWO_PI);
    ctx.fillStyle = 'rgba(20, 4, 34, 1)';
    ctx.fill();
  },
  'Reinforced Hull': (ctx, x, y, s) => {
    ctx.beginPath();
    roundedRect(ctx, x - s * 0.7, y - s * 0.85, s * 1.4, s * 1.7, 2);
    ctx.strokeStyle = 'rgba(255, 135, 135, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y);
    ctx.lineTo(x + s * 0.45, y);
    ctx.moveTo(x, y - s * 0.45);
    ctx.lineTo(x, y + s * 0.45);
    ctx.stroke();
  },
  'Overdrive Thrusters': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.9, y + s * 0.5);
    ctx.lineTo(x, y - s * 0.8);
    ctx.lineTo(x + s * 0.9, y + s * 0.5);
    ctx.strokeStyle = 'rgba(130, 220, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.35, y + s * 0.65);
    ctx.lineTo(x - s * 0.12, y + s * 1.05);
    ctx.moveTo(x + s * 0.35, y + s * 0.65);
    ctx.lineTo(x + s * 0.12, y + s * 1.05);
    ctx.stroke();
  },
  'Nanoforge': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.65, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(110, 255, 190, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.2, 0, TWO_PI);
    ctx.fillStyle = 'rgba(180, 255, 220, 0.9)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.9, y);
    ctx.lineTo(x - s * 0.35, y);
    ctx.moveTo(x + s * 0.35, y);
    ctx.lineTo(x + s * 0.9, y);
    ctx.stroke();
  },
  'Phase Plating': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.85, y - s * 0.25);
    ctx.lineTo(x + s * 0.55, y + s);
    ctx.lineTo(x - s * 0.55, y + s);
    ctx.lineTo(x - s * 0.85, y - s * 0.25);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(210, 180, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  },
  'Targeting CPU': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.55, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(255, 210, 90, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x, y + s);
    ctx.moveTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.strokeStyle = 'rgba(255, 210, 90, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
  'Overclock Core': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x - s * 0.4, y + s * 0.1);
    ctx.lineTo(x + s * 0.1, y + s * 0.05);
    ctx.lineTo(x - s * 0.1, y + s);
    ctx.lineTo(x + s * 0.45, y - s * 0.05);
    ctx.lineTo(x - s * 0.05, y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(160, 240, 130, 0.9)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  },
  'Vampiric Nanites': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.75);
    ctx.bezierCurveTo(x - s * 1.1, y - s * 0.2, x - s * 0.5, y - s * 0.9, x, y - s * 0.25);
    ctx.bezierCurveTo(x + s * 0.5, y - s * 0.9, x + s * 1.1, y - s * 0.2, x, y + s * 0.75);
    ctx.strokeStyle = 'rgba(255, 110, 140, 0.9)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  },
  'XP Amplifier': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.7, y + s * 0.5);
    ctx.lineTo(x, y - s * 0.55);
    ctx.lineTo(x + s * 0.7, y + s * 0.5);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 225, 120, 0.9)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y + s * 0.08, s * 0.16, 0, TWO_PI);
    ctx.fillStyle = 'rgba(255, 235, 170, 0.95)';
    ctx.fill();
  },
};
