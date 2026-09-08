import { wrappedDistanceSquared, TWO_PI } from '../utils';
import { Camera } from '../camera';
import { Enemy } from '../enemies';
import type { Weapon, WeaponModifiers } from './shared';
import { hitEnemySilent } from './shared';
import { loadSettings } from '../storage';

export class OrbitShield implements Weapon {
  name: import('../ids').WeaponName = 'Orbit Shield';
  level = 1;
  maxLevel = 10;
  private angle = 0;
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats(): {
    damage: number;
    orbitRadius: number;
    projectileCount: number;
    hitRadius: number;
    drawRadius: number;
    rotationSpeed: number;
    trailLength: number;
    glowAlpha: number;
  } {
    const lvl = this.level;
    return {
      damage: 8 + lvl * 5,
      orbitRadius: 70 + lvl * 18,
      projectileCount: 2 + Math.floor(lvl / 2),
      hitRadius: 12 + lvl * 3,
      drawRadius: 5 + lvl * 1,
      rotationSpeed: 2 + lvl * 0.3,
      trailLength: Math.floor(lvl / 2),
      glowAlpha: 0.1 + lvl * 0.05,
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
    this.angle += stats.rotationSpeed * dt;

    for (let i = 0; i < stats.projectileCount; i++) {
      const a = this.angle + (TWO_PI / stats.projectileCount) * i;
      const px = playerX + Math.cos(a) * stats.orbitRadius;
      const py = playerY + Math.sin(a) * stats.orbitRadius;

      const hitRadiusSq = stats.hitRadius;
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        const r = hitRadiusSq + enemy.radius;
        if (wrappedDistanceSquared(px, py, enemy.x, enemy.y) < r * r) {
          hitEnemySilent(enemy, damage * dt * 10, modifiers);
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, _playerRadius: number): void {
    const stats = this.getStats();
    const screen = camera.worldToScreen(playerX, playerY);
    const settings = loadSettings();
    const evolved = this.level >= 5;
    const ascended = this.level >= 8;
    const detailed = settings.particleQuality !== 'low';

    for (let i = 0; i < stats.projectileCount; i++) {
      const a = this.angle + (TWO_PI / stats.projectileCount) * i;
      const px = screen.x + Math.cos(a) * stats.orbitRadius;
      const py = screen.y + Math.sin(a) * stats.orbitRadius;

      for (let t = 1; t <= (settings.reducedMotion || !detailed ? 0 : stats.trailLength); t++) {
        const ta = a - t * 0.15;
        const tx = screen.x + Math.cos(ta) * stats.orbitRadius;
        const ty = screen.y + Math.sin(ta) * stats.orbitRadius;
        ctx.beginPath();
        ctx.arc(tx, ty, stats.drawRadius * 0.7, 0, TWO_PI);
        ctx.fillStyle = `rgba(100, 200, 255, ${(1 - t / (stats.trailLength + 1)) * 0.4})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(px, py, stats.drawRadius * 2.5, 0, TWO_PI);
      ctx.fillStyle = `rgba(80, 160, 255, ${stats.glowAlpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, stats.drawRadius, 0, TWO_PI);
      ctx.fillStyle = 'rgba(180, 220, 255, 0.9)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, stats.drawRadius * 0.4, 0, TWO_PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      if (evolved) {
        // Tangential crystal blades retain their silhouette even at low quality.
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(a + Math.PI / 2);
        const r = stats.drawRadius;
        ctx.beginPath();
        ctx.moveTo(r * 2.2, 0);
        ctx.lineTo(-r * 0.7, r * 0.8);
        ctx.lineTo(-r * 0.25, 0);
        ctx.lineTo(-r * 0.7, -r * 0.8);
        ctx.closePath();
        ctx.fillStyle = ascended ? '#d6fff6' : '#c2e9ff';
        ctx.fill();
        ctx.strokeStyle = ascended ? '#5affcf' : '#62caff';
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.restore();
        if (detailed && !settings.reducedMotion) {
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, stats.orbitRadius, a - 0.42, a - 0.07);
          ctx.strokeStyle = ascended ? 'rgba(95,255,212,0.32)' : 'rgba(90,190,255,0.28)';
          ctx.lineWidth = ascended ? 5 : 3;
          ctx.stroke();
        }
      }
    }

    if (this.level >= 5) {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, stats.orbitRadius, 0, TWO_PI);
      ctx.strokeStyle = 'rgba(80, 160, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
      if (ascended && detailed) {
        // Broken outer containment ring, with no additional projectile objects.
        ctx.beginPath();
        const phase = settings.reducedMotion ? 0 : -this.angle * 0.15;
        for (let i = 0; i < 6; i++) {
          const a = phase + i * TWO_PI / 6;
          const r = stats.orbitRadius + stats.drawRadius * 1.6;
          ctx.moveTo(screen.x + Math.cos(a) * r, screen.y + Math.sin(a) * r);
          ctx.arc(screen.x, screen.y, r, a, a + 0.35);
        }
        ctx.strokeStyle = 'rgba(105,255,218,0.24)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }
}
