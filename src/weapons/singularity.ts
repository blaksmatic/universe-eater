import { wrappedDistanceSquared, wrappedAngle, TWO_PI } from '../utils';
import { Camera } from '../camera';
import { Enemy } from '../enemies';
import { audio } from '../audio';
import type { Weapon, WeaponModifiers } from './shared';
import { hitEnemy, hitEnemySilent, getNearestEnemy } from './shared';
import { loadSettings } from '../storage';

type SingularityState =
  | { mode: 'idle' }
  | { mode: 'flying'; x: number; y: number; vx: number; vy: number; traveled: number }
  | { mode: 'active'; x: number; y: number; age: number }
  | { mode: 'collapsing'; x: number; y: number; age: number };

export class Singularity implements Weapon {
  name: import('../ids').WeaponName = 'Singularity';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 2;
  private state: SingularityState = { mode: 'idle' };
  private spin = 0;
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats(): {
    cooldown: number;
    travelSpeed: number;
    maxTravel: number;
    activeDuration: number;
    pullRadius: number;
    pullStrength: number;
    dps: number;
    collapseDamage: number;
    collapseRadiusMul: number;
  } {
    const lvl = this.level;
    return {
      cooldown: Math.max(4.2, 7.5 - lvl * 0.32),
      travelSpeed: 175,
      maxTravel: 330,
      activeDuration: 2.0 + lvl * 0.08,
      pullRadius: 140 + lvl * 9,
      pullStrength: 300 + lvl * 20,
      dps: 9 + lvl * 5,
      collapseDamage: 26 + lvl * 12,
      collapseRadiusMul: 0.78,
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
    this.spin += dt * 3;

    switch (this.state.mode) {
      case 'idle': {
        this.cooldownTimer -= dt;
        if (this.cooldownTimer <= 0) {
          const target = getNearestEnemy(playerX, playerY, enemies, 520);
          if (target) {
            const angle = wrappedAngle(playerX, playerY, target.x, target.y);
            this.state = {
              mode: 'flying',
              x: playerX,
              y: playerY,
              vx: Math.cos(angle) * stats.travelSpeed,
              vy: Math.sin(angle) * stats.travelSpeed,
              traveled: 0,
            };
            this.cooldownTimer = stats.cooldown * modifiers.cooldownMultiplier;
          }
        }
        break;
      }

      case 'flying': {
        const step = stats.travelSpeed * dt;
        this.state.x += this.state.vx * dt;
        this.state.y += this.state.vy * dt;
        this.state.traveled += step;
        if (this.state.traveled >= stats.maxTravel) {
          this.state = { mode: 'active', x: this.state.x, y: this.state.y, age: 0 };
        }
        break;
      }

      case 'active': {
        this.state.age += dt;

        const pullRadius = stats.pullRadius;
        const dpsRadius = pullRadius * 0.62;
        for (const enemy of enemies) {
          if (enemy.dead) continue;
          const distSq = wrappedDistanceSquared(this.state.x, this.state.y, enemy.x, enemy.y);
          const maxDist = pullRadius + enemy.radius;
          if (distSq < maxDist * maxDist) {
            const dist = Math.sqrt(distSq);
            const pullAngle = wrappedAngle(enemy.x, enemy.y, this.state.x, this.state.y);
            const strength = stats.pullStrength * (1 - Math.min(0.65, dist / pullRadius));
            enemy.x += Math.cos(pullAngle) * strength * dt;
            enemy.y += Math.sin(pullAngle) * strength * dt;
            if (dist < dpsRadius) {
              hitEnemySilent(enemy, stats.dps * modifiers.damageMultiplier * dt, modifiers);
            }
          }
        }

        if (this.state.age >= stats.activeDuration) {
          const collapseRadius = stats.pullRadius * stats.collapseRadiusMul;
          for (const enemy of enemies) {
            if (enemy.dead) continue;
            const r = collapseRadius + enemy.radius;
            if (wrappedDistanceSquared(this.state.x, this.state.y, enemy.x, enemy.y) < r * r) {
              hitEnemy(enemy, stats.collapseDamage * modifiers.damageMultiplier, modifiers);
            }
          }
          audio.playExplosion(1.2);
          this.state = { mode: 'collapsing', x: this.state.x, y: this.state.y, age: 0 };
        }
        break;
      }

      case 'collapsing': {
        this.state.age += dt;
        if (this.state.age >= 0.45) {
          this.state = { mode: 'idle' };
          this.cooldownTimer = stats.cooldown * modifiers.cooldownMultiplier;
        }
        break;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, _playerX: number, _playerY: number, _playerRadius: number): void {
    const stats = this.getStats();
    const settings = loadSettings();
    const evolved = this.level >= 5;
    const ascended = this.level >= 8;
    const detailed = settings.particleQuality !== 'low';
    const spin = settings.reducedMotion ? 0 : this.spin;

    if (this.state.mode === 'flying') {
      const screen = camera.worldToScreen(this.state.x, this.state.y);
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 7, 0, TWO_PI);
      ctx.fillStyle = 'rgba(190, 120, 255, 0.85)';
      ctx.fill();
      const tailAngle = Math.atan2(this.state.vy, this.state.vx) + Math.PI;
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y);
      ctx.lineTo(screen.x + Math.cos(tailAngle) * 26, screen.y + Math.sin(tailAngle) * 26);
      ctx.strokeStyle = 'rgba(160, 90, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.stroke();
      if (evolved) {
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y, ascended ? 19 : 14, 6, -0.4, 0, TWO_PI);
        ctx.strokeStyle = ascended ? '#ffd3ff' : '#be9aff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      return;
    }

    if (this.state.mode === 'active') {
      const screen = camera.worldToScreen(this.state.x, this.state.y);
      const progress = this.state.age / stats.activeDuration;
      const radius = stats.pullRadius * (0.85 + progress * 0.15);

      const field = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, radius);
      field.addColorStop(0, 'rgba(30, 8, 50, 0.55)');
      field.addColorStop(0.55, 'rgba(90, 30, 160, 0.18)');
      field.addColorStop(1, 'rgba(90, 30, 160, 0)');
      ctx.fillStyle = field;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, radius, 0, TWO_PI);
      ctx.fill();

      for (let i = 0; i < (detailed ? 4 : 2); i++) {
        const arcAngle = spin * (i % 2 === 0 ? 1 : -1.4) + i * 1.57;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius * (0.34 + i * 0.17), arcAngle, arcAngle + 1.6);
        ctx.strokeStyle = `rgba(${190 - i * 25}, ${110 - i * 18}, 255, ${0.5 - i * 0.09})`;
        ctx.lineWidth = 2.2 - i * 0.4;
        ctx.stroke();
      }

      const coreR = (ascended ? 19 : evolved ? 15 : 11) * (1 + Math.sin(spin * 4) * 0.08);
      const core = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, coreR * 2);
      core.addColorStop(0, 'rgba(10, 0, 20, 0.98)');
      core.addColorStop(0.6, 'rgba(70, 20, 130, 0.85)');
      core.addColorStop(1, 'rgba(150, 80, 255, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, coreR * 2, 0, TWO_PI);
      ctx.fill();

      if (evolved) {
        // An accretion disk and opaque event horizon give the vortex real depth.
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y, coreR * 3.8, coreR * 0.9, -0.35, 0, TWO_PI);
        ctx.strokeStyle = 'rgba(178,106,255,0.3)';
        ctx.lineWidth = ascended ? 9 : 6;
        ctx.stroke();
        ctx.strokeStyle = ascended ? 'rgba(255,212,255,0.85)' : 'rgba(215,173,255,0.8)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, coreR, 0, TWO_PI);
        ctx.fillStyle = '#080510';
        ctx.fill();
        ctx.strokeStyle = 'rgba(230,195,255,0.75)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        if (ascended && detailed) {
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const a = -spin * 0.35 + i * TWO_PI / 3;
            ctx.moveTo(screen.x + Math.cos(a) * radius * 0.8, screen.y + Math.sin(a) * radius * 0.8);
            ctx.arc(screen.x, screen.y, radius * 0.8, a, a + 0.75);
          }
          ctx.strokeStyle = 'rgba(250,179,255,0.28)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      for (let i = 0; detailed && !settings.reducedMotion && i < 5; i++) {
        const sparkAngle = spin * 2.2 + i * 1.256;
        const outerR = radius * 0.9;
        const innerR = radius * 0.42;
        ctx.beginPath();
        ctx.moveTo(screen.x + Math.cos(sparkAngle) * outerR, screen.y + Math.sin(sparkAngle) * outerR);
        ctx.lineTo(screen.x + Math.cos(sparkAngle) * innerR, screen.y + Math.sin(sparkAngle) * innerR);
        ctx.strokeStyle = 'rgba(215, 160, 255, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      return;
    }

    if (this.state.mode === 'collapsing') {
      const t = this.state.age / 0.45;
      const screen = camera.worldToScreen(this.state.x, this.state.y);
      const radius = stats.pullRadius * stats.collapseRadiusMul;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, radius * (0.3 + t * 0.9), 0, TWO_PI);
      ctx.strokeStyle = `rgba(220, 170, 255, ${(1 - t) * 0.9})`;
      ctx.lineWidth = 5 * (1 - t) + 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, radius * (0.2 + t * 0.6), 0, TWO_PI);
      ctx.fillStyle = `rgba(255, 240, 255, ${(1 - t) * 0.28})`;
      ctx.fill();
      if (evolved && detailed && !settings.reducedMotion) {
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y, radius * (0.4 + t), radius * (0.12 + t * 0.3), -0.35, 0, TWO_PI);
        ctx.strokeStyle = `rgba(255,210,255,${(1 - t) * 0.7})`;
        ctx.lineWidth = ascended ? 3 : 1.5;
        ctx.stroke();
      }
    }
  }
}
