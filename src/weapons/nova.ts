import { wrappedDistance, TWO_PI } from '../utils';
import { Camera } from '../camera';
import { Enemy } from '../enemies';
import { audio } from '../audio';
import type { Weapon, WeaponModifiers } from './shared';
import { hitEnemy } from './shared';

export class NovaBlast implements Weapon {
  name: import('../ids').WeaponName = 'Nova Blast';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 0;
  private blastRadius = 0;
  private isBlasting = false;
  private hasDealtDamage = false;
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats(): {
    damage: number;
    cooldown: number;
    maxRadius: number;
    expandSpeed: number;
    ringWidth: number;
    debrisCount: number;
    innerGlow: boolean;
    shockwave: boolean;
  } {
    const lvl = this.level;
    return {
      damage: 15 + lvl * 8,
      cooldown: Math.max(1.5, 4.0 - lvl * 0.25),
      maxRadius: 80 + lvl * 25,
      expandSpeed: 300 + lvl * 50,
      ringWidth: 2 + lvl * 0.8,
      debrisCount: Math.floor(lvl / 2),
      innerGlow: lvl >= 4,
      shockwave: lvl >= 7,
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
    const damage = stats.damage * modifiers.damageMultiplier;
    const cooldown = stats.cooldown * modifiers.cooldownMultiplier;

    if (this.isBlasting) {
      this.blastRadius += stats.expandSpeed * dt;
      if (!this.hasDealtDamage) {
        for (const enemy of enemies) {
          if (enemy.dead) continue;
          if (wrappedDistance(playerX, playerY, enemy.x, enemy.y) < stats.maxRadius) {
            hitEnemy(enemy, damage, modifiers);
          }
        }
        this.hasDealtDamage = true;
      }
      if (this.blastRadius >= stats.maxRadius) {
        this.isBlasting = false;
        this.blastRadius = 0;
      }
    }

    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0 && !this.isBlasting) {
      this.isBlasting = true;
      this.cooldownTimer = cooldown;
      this.blastRadius = 0;
      this.hasDealtDamage = false;
      audio.playExplosion(0.8);
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, _playerRadius: number): void {
    if (!this.isBlasting) return;
    const stats = this.getStats();
    const screen = camera.worldToScreen(playerX, playerY);
    const progress = this.blastRadius / stats.maxRadius;
    const alpha = 1 - progress;

    if (stats.innerGlow) {
      const gradient = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, this.blastRadius);
      gradient.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.15})`);
      gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, this.blastRadius, 0, TWO_PI);
      ctx.fill();
    }

    if (stats.shockwave) {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, this.blastRadius * 1.05, 0, TWO_PI);
      ctx.strokeStyle = `rgba(255, 220, 150, ${alpha * 0.3})`;
      ctx.lineWidth = stats.ringWidth * 0.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.blastRadius, 0, TWO_PI);
    ctx.strokeStyle = `rgba(255, 180, 80, ${alpha})`;
    ctx.lineWidth = stats.ringWidth;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.blastRadius, 0, TWO_PI);
    ctx.strokeStyle = `rgba(255, 150, 50, ${alpha * 0.3})`;
    ctx.lineWidth = stats.ringWidth * 3;
    ctx.stroke();

    for (let i = 0; i < stats.debrisCount; i++) {
      const angle = (TWO_PI / stats.debrisCount) * i + progress * 2;
      const dx = screen.x + Math.cos(angle) * this.blastRadius;
      const dy = screen.y + Math.sin(angle) * this.blastRadius;
      ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
      ctx.beginPath();
      ctx.arc(dx, dy, 2 + this.level * 0.3, 0, TWO_PI);
      ctx.fill();
    }
  }
}
