import { wrappedAngle, wrappedDistanceSquared } from '../utils';
import { Camera } from '../camera';
import { Enemy } from '../enemies';
import { audio } from '../audio';
import type { Weapon, WeaponModifiers, OnFireCallback } from './shared';
import { getNearestEnemy } from './shared';
import { applyBeamDamage, computeLaserStats, drawBeam, LASER_COLORS } from './beam';

export class LaserBeam implements Weapon {
  name: import('../ids').WeaponName = 'Laser Beam';
  level = 1;
  maxLevel = 10;
  onFire?: OnFireCallback;
  private cooldownTimer = 0;
  private firingTimer = 0;
  private isFiring = false;
  private targetX = 0;
  private targetY = 0;
  private splitTargets: { x: number; y: number }[] = [];
  private time = 0;
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats(): ReturnType<typeof computeLaserStats> {
    return computeLaserStats(this.level);
  }

  private getStats(): ReturnType<typeof computeLaserStats> {
    if (this.level !== this.cachedLevel) {
      this.cachedStats = this.computeStats();
      this.cachedLevel = this.level;
    }
    return this.cachedStats;
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[], modifiers: WeaponModifiers): void {
    const stats = this.getStats();
    const damage = stats.damage * modifiers.damageMultiplier;
    const cooldown = stats.cooldown * modifiers.cooldownMultiplier;
    this.time += dt;

    if (this.isFiring) {
      this.firingTimer -= dt;
      if (this.firingTimer <= 0) this.isFiring = false;
    }

    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0 && !this.isFiring) {
      const nearest = getNearestEnemy(playerX, playerY, enemies, stats.range);

      if (nearest) {
        this.isFiring = true;
        this.firingTimer = stats.duration;
        this.cooldownTimer = cooldown;
        this.targetX = nearest.x;
        this.targetY = nearest.y;
        this.splitTargets.length = 0;

        const angle = wrappedAngle(playerX, playerY, nearest.x, nearest.y);
        if (this.onFire) this.onFire(angle);

        if (this.level >= 8) {
          // Distinct headings spread damage across a crowd instead of stacking
          // bonus rays onto a single boss. Select before the main ray can kill.
          const headings = [angle];
          for (let ray = 0; ray < 2; ray++) {
            let candidate: Enemy | null = null;
            let best = stats.range * stats.range;
            for (const enemy of enemies) {
              if (enemy.dead || enemy === nearest) continue;
              const heading = wrappedAngle(playerX, playerY, enemy.x, enemy.y);
              if (headings.some(a => Math.abs(Math.atan2(Math.sin(heading - a), Math.cos(heading - a))) < 0.3)) continue;
              const distance = wrappedDistanceSquared(playerX, playerY, enemy.x, enemy.y);
              if (distance < best) { best = distance; candidate = enemy; }
            }
            if (!candidate) break;
            const heading = wrappedAngle(playerX, playerY, candidate.x, candidate.y);
            headings.push(heading);
            this.splitTargets.push({ x: playerX + Math.cos(heading) * stats.range, y: playerY + Math.sin(heading) * stats.range });
          }
        }
        this.targetX = playerX + Math.cos(angle) * stats.range;
        this.targetY = playerY + Math.sin(angle) * stats.range;
        applyBeamDamage(playerX, playerY, this.targetX, this.targetY, enemies, damage, stats.range, stats.width, modifiers);
        for (const target of this.splitTargets) {
          applyBeamDamage(playerX, playerY, target.x, target.y, enemies, damage * 0.45, stats.range, stats.width * 0.55, modifiers);
        }
        audio.playShoot();
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, playerRadius: number): void {
    if (!this.isFiring) return;
    const stats = this.getStats();
    if (this.splitTargets.length) {
      const splitStats = { ...stats, width: stats.width * 0.55, glowAlpha: stats.glowAlpha * 0.6, particleCount: 0 };
      for (const target of this.splitTargets) {
        drawBeam(ctx, camera, playerX, playerY, playerRadius, target.x, target.y, splitStats, this.time, 3, LASER_COLORS);
      }
    }
    drawBeam(
      ctx,
      camera,
      playerX,
      playerY,
      playerRadius,
      this.targetX,
      this.targetY,
      stats,
      this.time,
      this.level,
      LASER_COLORS,
    );
  }
}
