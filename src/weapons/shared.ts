import { wrappedDistance } from '../utils';
import { Enemy } from '../enemies';

export type OnFireCallback = (angle: number) => void;

export interface WeaponModifiers {
  damageMultiplier: number;
  cooldownMultiplier: number;
  critChance: number;
  critMultiplier: number;
  onHit?: (enemy: Enemy, amount: number, crit: boolean) => void;
}

export interface Weapon {
  name: import('../ids').WeaponName;
  level: number;
  maxLevel: number;
  onFire?: OnFireCallback;
  update(dt: number, playerX: number, playerY: number, enemies: Enemy[], modifiers: WeaponModifiers): void;
  draw(ctx: CanvasRenderingContext2D, camera: import('../camera').Camera, playerX: number, playerY: number, playerRadius: number): void;
}

export function hitEnemy(enemy: Enemy, amount: number, modifiers: WeaponModifiers): void {
  const crit = Math.random() < modifiers.critChance;
  const total = crit ? amount * modifiers.critMultiplier : amount;
  enemy.takeDamage(total);
  modifiers.onHit?.(enemy, total, crit);
}

export function hitEnemySilent(enemy: Enemy, amount: number, _modifiers: WeaponModifiers): void {
  enemy.takeDamage(amount);
}

export function getNearestEnemy(originX: number, originY: number, enemies: Enemy[], range: number): Enemy | null {
  let nearest: Enemy | null = null;
  let nearestDist = Infinity;
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dist = wrappedDistance(originX, originY, enemy.x, enemy.y);
    if (dist < range && dist < nearestDist) {
      nearestDist = dist;
      nearest = enemy;
    }
  }
  return nearest;
}
