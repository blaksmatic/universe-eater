import { wrappedDistanceSquared, TWO_PI } from '../utils';
import { Camera } from '../camera';
import { Enemy } from '../enemies';
import { audio } from '../audio';
import type { Weapon, WeaponModifiers } from './shared';
import { hitEnemy, getNearestEnemy } from './shared';

interface ArcSegment {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  age: number;
  seed: number;
}

export class ArcReactor implements Weapon {
  name: import('../ids').WeaponName = 'Arc Reactor';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 1;
  private segments: ArcSegment[] = [];
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats(): { damage: number; jumps: number; cooldown: number; firstRange: number; chainRange: number; falloff: number } {
    const lvl = this.level;
    return {
      damage: 13 + lvl * 6,
      jumps: Math.min(9, 2 + Math.floor(lvl / 1.5)),
      cooldown: Math.max(0.75, 1.7 - lvl * 0.095),
      firstRange: 270,
      chainRange: 155,
      falloff: 0.87,
    };
  }

  private getStats(): ReturnType<typeof this.computeStats> {
    if (this.level !== this.cachedLevel) {
      this.cachedStats = this.computeStats();
      this.cachedLevel = this.level;
    }
    return this.cachedStats;
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[], modifiers: WeaponModifiers): void {
    const stats = this.getStats();
    const cooldown = stats.cooldown * modifiers.cooldownMultiplier;
    this.cooldownTimer -= dt;

    if (this.cooldownTimer <= 0) {
      const first = getNearestEnemy(playerX, playerY, enemies, stats.firstRange);
      if (first) {
        this.cooldownTimer = cooldown;
        const visited = new Set<Enemy>();
        let current = first;
        let fromX = playerX;
        let fromY = playerY;
        let damage = stats.damage * modifiers.damageMultiplier;

        for (let jump = 0; jump < stats.jumps; jump++) {
          visited.add(current);
          hitEnemy(current, damage, modifiers);
          this.segments.push({
            fromX,
            fromY,
            toX: current.x,
            toY: current.y,
            age: 0,
            seed: Math.random() * 1000,
          });
          fromX = current.x;
          fromY = current.y;
          damage *= stats.falloff;

          let next: Enemy | null = null;
          let nextDistSq = stats.chainRange * stats.chainRange;
          for (const enemy of enemies) {
            if (enemy.dead || visited.has(enemy)) continue;
            const dSq = wrappedDistanceSquared(fromX, fromY, enemy.x, enemy.y);
            if (dSq < nextDistSq) {
              nextDistSq = dSq;
              next = enemy;
            }
          }
          if (!next) break;
          current = next;
        }
        audio.playCrit();
      }
    }

    for (const s of this.segments) s.age += dt;
    {
      let w = 0;
      for (let i = 0; i < this.segments.length; i++) {
        if (this.segments[i].age < 0.22) this.segments[w++] = this.segments[i];
      }
      this.segments.length = w;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, _playerX: number, _playerY: number, _playerRadius: number): void {
    for (const s of this.segments) {
      const t = s.age / 0.22;
      const alpha = 1 - t;
      const start = camera.worldToScreen(s.fromX, s.fromY);
      const end = camera.worldToScreen(s.toX, s.toY);

      const jaggedPoints: { x: number; y: number }[] = [start];
      const subSegments = 5;
      let rngState = s.seed;
      const rand = (): number => {
        rngState = (rngState * 16807) % 2147483647;
        return rngState / 2147483647;
      };
      for (let i = 1; i < subSegments; i++) {
        const tt = i / subSegments;
        const nx = start.x + (end.x - start.x) * tt;
        const ny = start.y + (end.y - start.y) * tt;
        const offset = (rand() - 0.5) * 26;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const len = Math.hypot(dx, dy) || 1;
        jaggedPoints.push({
          x: nx + (-dy / len) * offset,
          y: ny + (dx / len) * offset,
        });
      }
      jaggedPoints.push(end);

      const trace = (): void => {
        ctx.beginPath();
        ctx.moveTo(jaggedPoints[0].x, jaggedPoints[0].y);
        for (let i = 1; i < jaggedPoints.length; i++) ctx.lineTo(jaggedPoints[i].x, jaggedPoints[i].y);
      };

      trace();
      ctx.strokeStyle = `rgba(130, 220, 255, ${alpha * 0.35})`;
      ctx.lineWidth = 6;
      ctx.stroke();

      trace();
      ctx.strokeStyle = `rgba(220, 250, 255, ${alpha * 0.95})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      const tipR = 6 * (1 - t) + 2;
      const tipGrad = ctx.createRadialGradient(end.x, end.y, 0, end.x, end.y, tipR * 2);
      tipGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
      tipGrad.addColorStop(1, 'rgba(120, 220, 255, 0)');
      ctx.fillStyle = tipGrad;
      ctx.beginPath();
      ctx.arc(end.x, end.y, tipR * 2, 0, TWO_PI);
      ctx.fill();
    }
  }
}
