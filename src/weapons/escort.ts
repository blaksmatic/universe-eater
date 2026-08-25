import { wrappedAngle } from '../utils';
import { Camera } from '../camera';
import { Enemy } from '../enemies';
import type { Weapon, WeaponModifiers } from './shared';
import { getNearestEnemy } from './shared';
import { applyBeamDamage, computeLaserStats, drawBeam, ESCORT_COLORS } from './beam';

export class EscortWing implements Weapon {
  name: import('../ids').WeaponName = 'Escort Wing';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 0;
  private firingTimer = 0;
  private isFiring = false;
  private targetX = 0;
  private targetY = 0;
  private time = 0;
  private facingAngle = 0;
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats(): ReturnType<typeof computeLaserStats> & { orbitRadius: number; craftRadius: number } {
    const base = computeLaserStats(this.level);
    return {
      ...base,
      damage: base.damage * 0.7,
      width: Math.max(1.1, base.width * 0.82),
      glowAlpha: base.glowAlpha + 0.03,
      orbitRadius: 28 + this.level * 2.5,
      craftRadius: 8 + this.level * 0.35,
    };
  }

  private getStats(): ReturnType<typeof computeLaserStats> & { orbitRadius: number; craftRadius: number } {
    if (this.level !== this.cachedLevel) {
      this.cachedStats = this.computeStats();
      this.cachedLevel = this.level;
    }
    return this.cachedStats;
  }

  private getEscortPosition(playerX: number, playerY: number): { x: number; y: number } {
    const stats = this.getStats();
    const angle = this.time * 1.4;
    return {
      x: playerX + Math.cos(angle) * stats.orbitRadius,
      y: playerY + Math.sin(angle * 1.15) * stats.orbitRadius * 0.6 - 20,
    };
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[], modifiers: WeaponModifiers): void {
    const stats = this.getStats();
    const damage = stats.damage * modifiers.damageMultiplier;
    const cooldown = stats.cooldown * modifiers.cooldownMultiplier;
    this.time += dt;
    const escort = this.getEscortPosition(playerX, playerY);
    const aimTarget = this.isFiring
      ? { x: this.targetX, y: this.targetY }
      : getNearestEnemy(escort.x, escort.y, enemies, stats.range);

    if (aimTarget) {
      this.facingAngle = wrappedAngle(escort.x, escort.y, aimTarget.x, aimTarget.y) + Math.PI / 2;
    }

    if (this.isFiring) {
      this.firingTimer -= dt;
      if (this.firingTimer <= 0) this.isFiring = false;
    }

    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0 && !this.isFiring) {
      const nearest = getNearestEnemy(escort.x, escort.y, enemies, stats.range);
      if (nearest) {
        this.isFiring = true;
        this.firingTimer = stats.duration;
        this.cooldownTimer = cooldown;
        this.targetX = nearest.x;
        this.targetY = nearest.y;
        this.facingAngle = wrappedAngle(escort.x, escort.y, nearest.x, nearest.y) + Math.PI / 2;
        applyBeamDamage(escort.x, escort.y, nearest.x, nearest.y, enemies, damage, stats.range, stats.width, modifiers);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, _playerRadius: number): void {
    const stats = this.getStats();
    const escort = this.getEscortPosition(playerX, playerY);
    const screen = camera.worldToScreen(escort.x, escort.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.rotate(this.facingAngle);

    ctx.beginPath();
    ctx.arc(0, 0, stats.craftRadius * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(90, 255, 220, 0.12)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -stats.craftRadius * 1.4);
    ctx.lineTo(stats.craftRadius * 0.95, stats.craftRadius * 1.1);
    ctx.lineTo(0, stats.craftRadius * 0.5);
    ctx.lineTo(-stats.craftRadius * 0.95, stats.craftRadius * 1.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(150, 255, 235, 0.9)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -stats.craftRadius * 0.6);
    ctx.lineTo(stats.craftRadius * 0.45, stats.craftRadius * 0.35);
    ctx.lineTo(-stats.craftRadius * 0.45, stats.craftRadius * 0.35);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-stats.craftRadius * 1.4, stats.craftRadius * 0.2);
    ctx.lineTo(-stats.craftRadius * 2.1, stats.craftRadius * 1.15);
    ctx.moveTo(stats.craftRadius * 1.4, stats.craftRadius * 0.2);
    ctx.lineTo(stats.craftRadius * 2.1, stats.craftRadius * 1.15);
    ctx.strokeStyle = 'rgba(110, 255, 225, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    if (!this.isFiring) return;
    drawBeam(
      ctx,
      camera,
      escort.x,
      escort.y,
      stats.craftRadius * 0.8,
      this.targetX,
      this.targetY,
      stats,
      this.time,
      this.level,
      ESCORT_COLORS,
    );
  }
}
