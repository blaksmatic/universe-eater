import { wrappedDistanceSquared, wrappedAngle, TWO_PI } from '../utils';
import { Camera } from '../camera';
import { Enemy } from '../enemies';
import { audio } from '../audio';
import type { Weapon, WeaponModifiers } from './shared';
import { hitEnemy, getNearestEnemy } from './shared';

interface Missile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  target: Enemy | null;
  age: number;
  trail: { x: number; y: number }[];
}

interface MissileExplosion {
  x: number;
  y: number;
  radius: number;
  age: number;
}

export class SeekerSwarm implements Weapon {
  name: import('../ids').WeaponName = 'Seeker Swarm';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 0.6;
  private missiles: Missile[] = [];
  private explosions: MissileExplosion[] = [];
  private cachedStats = this.computeStats();
  private cachedLevel = 1;
  private pendingWave: { x: number; y: number } | null = null;
  private secondWaveTimer = 0;

  private computeStats(): {
    count: number;
    doubleVolley: boolean;
    damage: number;
    cooldown: number;
    speed: number;
    turnRate: number;
    aoeRadius: number;
    maxLifetime: number;
  } {
    const lvl = this.level;
    return {
      count: 2 + Math.floor(lvl / 2),
      doubleVolley: lvl >= 6,
      damage: 9 + lvl * 4,
      cooldown: Math.max(0.85, 2.5 - lvl * 0.16),
      speed: 380 + lvl * 14,
      turnRate: 3.2 + lvl * 0.18,
      aoeRadius: (30 + lvl * 3) * (lvl >= 8 ? 1.25 : 1),
      maxLifetime: 4,
    };
  }

  private getStats(): ReturnType<typeof this.computeStats> {
    if (this.level !== this.cachedLevel) {
      this.cachedStats = this.computeStats();
      this.cachedLevel = this.level;
    }
    return this.cachedStats;
  }

  private launchVolley(playerX: number, playerY: number, enemies: Enemy[], _modifiers: WeaponModifiers): void {
    const stats = this.getStats();
    for (let i = 0; i < stats.count; i++) {
      const spread = (i / stats.count) * TWO_PI;
      const angle = spread + Math.random() * 0.5;
      this.missiles.push({
        x: playerX + Math.cos(angle) * 14,
        y: playerY + Math.sin(angle) * 14,
        vx: Math.cos(angle) * stats.speed * 0.5,
        vy: Math.sin(angle) * stats.speed * 0.5,
        target: this.pickTarget(playerX, playerY, enemies, i),
        age: 0,
        trail: [],
      });
    }

    if (stats.doubleVolley) {
      this.secondWaveTimer = 0.24;
      this.pendingWave = { x: playerX, y: playerY };
    }
    audio.playMissile();
  }

  private pickTarget(px: number, py: number, enemies: Enemy[], index: number): Enemy | null {
    const rangeSq = 700 * 700;
    const alive: Enemy[] = [];
    for (const e of enemies) {
      if (e.dead) continue;
      if (wrappedDistanceSquared(px, py, e.x, e.y) < rangeSq) alive.push(e);
    }
    if (alive.length === 0) return null;
    return alive[index % alive.length];
  }

  private detonate(missile: Missile, stats: ReturnType<typeof this.computeStats>, damage: number, enemies: Enemy[], modifiers: WeaponModifiers): void {
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      const r = stats.aoeRadius + enemy.radius;
      if (wrappedDistanceSquared(missile.x, missile.y, enemy.x, enemy.y) < r * r) {
        hitEnemy(enemy, damage, modifiers);
      }
    }
    this.explosions.push({ x: missile.x, y: missile.y, radius: stats.aoeRadius, age: 0 });
    audio.playExplosion(0.5);
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[], modifiers: WeaponModifiers): void {
    const stats = this.getStats();
    const cooldown = stats.cooldown * modifiers.cooldownMultiplier;

    if (this.secondWaveTimer > 0) {
      this.secondWaveTimer -= dt;
      if (this.secondWaveTimer <= 0 && this.pendingWave) {
        const wave = this.pendingWave;
        this.pendingWave = null;
        const fresh = this.getStats();
        for (let i = 0; i < fresh.count; i++) {
          const angle = Math.random() * TWO_PI;
          this.missiles.push({
            x: wave.x + Math.cos(angle) * 14,
            y: wave.y + Math.sin(angle) * 14,
            vx: Math.cos(angle) * fresh.speed * 0.5,
            vy: Math.sin(angle) * fresh.speed * 0.5,
            target: this.pickTarget(wave.x, wave.y, enemies, i + 1),
            age: 0,
            trail: [],
          });
        }
      }
    }

    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = cooldown;
      this.launchVolley(playerX, playerY, enemies, modifiers);
    }

    const speed = stats.speed;
    for (const m of this.missiles) {
      m.age += dt;
      if (!m.target || m.target.dead) {
        m.target = getNearestEnemy(m.x, m.y, enemies, 600);
      }

      if (m.target) {
        const desired = wrappedAngle(m.x, m.y, m.target.x, m.target.y);
        const current = Math.atan2(m.vy, m.vx);
        let diff = desired - current;
        while (diff > Math.PI) diff -= TWO_PI;
        while (diff < -Math.PI) diff += TWO_PI;
        const maxTurn = stats.turnRate * dt;
        const turned = current + Math.max(-maxTurn, Math.min(maxTurn, diff));
        m.vx = Math.cos(turned) * speed;
        m.vy = Math.sin(turned) * speed;

        if (m.age > 0.15) {
          const r = m.target.radius + 10;
          if (wrappedDistanceSquared(m.x, m.y, m.target.x, m.target.y) < r * r) {
            m.age = stats.maxLifetime + 1;
            this.detonate(m, stats, stats.damage * modifiers.damageMultiplier, enemies, modifiers);
            continue;
          }
        }
      }

      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 7) m.trail.shift();
      m.x += m.vx * dt;
      m.y += m.vy * dt;
    }

    // Compact missiles in-place (avoid GC)
    {
      let w = 0;
      for (let i = 0; i < this.missiles.length; i++) {
        if (this.missiles[i].age < stats.maxLifetime) this.missiles[w++] = this.missiles[i];
      }
      this.missiles.length = w;
    }
    for (const ex of this.explosions) ex.age += dt;
    {
      let w = 0;
      for (let i = 0; i < this.explosions.length; i++) {
        if (this.explosions[i].age < 0.3) this.explosions[w++] = this.explosions[i];
      }
      this.explosions.length = w;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, _playerX: number, _playerY: number, _playerRadius: number): void {
    for (const m of this.missiles) {
      const screen = camera.worldToScreen(m.x, m.y);

      for (let i = 1; i < m.trail.length; i++) {
        const p0 = camera.worldToScreen(m.trail[i - 1].x, m.trail[i - 1].y);
        const p1 = camera.worldToScreen(m.trail[i].x, m.trail[i].y);
        const t = i / m.trail.length;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = `rgba(255, ${140 + t * 60}, 80, ${t * 0.5})`;
        ctx.lineWidth = 1 + t * 2.2;
        ctx.stroke();
      }

      const angle = Math.atan2(m.vy, m.vx);
      ctx.save();
      ctx.translate(screen.x, screen.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-4, 3);
      ctx.lineTo(-4, -3);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 210, 160, 0.95)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-3, 0, 2.2, 0, TWO_PI);
      ctx.fillStyle = 'rgba(255, 160, 90, 0.9)';
      ctx.fill();
      ctx.restore();
    }

    for (const ex of this.explosions) {
      const t = ex.age / 0.3;
      const screen = camera.worldToScreen(ex.x, ex.y);
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, ex.radius * (0.5 + t * 0.6), 0, TWO_PI);
      ctx.strokeStyle = `rgba(255, 190, 120, ${(1 - t) * 0.8})`;
      ctx.lineWidth = 3 * (1 - t) + 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, ex.radius * t * 0.8, 0, TWO_PI);
      ctx.fillStyle = `rgba(255, 230, 180, ${(1 - t) * 0.25})`;
      ctx.fill();
    }
  }
}
