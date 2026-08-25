import { wrappedAngle } from '../utils';
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

        const angle = wrappedAngle(playerX, playerY, nearest.x, nearest.y);
        if (this.onFire) this.onFire(angle);

        applyBeamDamage(playerX, playerY, nearest.x, nearest.y, enemies, damage, stats.range, stats.width, modifiers);
        audio.playShoot();
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, playerRadius: number): void {
    if (!this.isFiring) return;
    const stats = this.getStats();
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
