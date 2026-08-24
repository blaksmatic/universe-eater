import { wrappedDistance, wrappedAngle, wrappedDelta, TWO_PI } from './utils';
import { Camera } from './camera';
import { Enemy } from './enemies';
import { audio } from './audio';
import type { WeaponId, WeaponName } from './ids';

export type OnFireCallback = (angle: number) => void;

export interface WeaponModifiers {
  damageMultiplier: number;
  cooldownMultiplier: number;
  critChance: number;
  critMultiplier: number;
  /** Fired for every discrete weapon hit; used for damage popups. */
  onHit?: (enemy: Enemy, amount: number, crit: boolean) => void;
}

/** Apply damage with a crit roll and report it through the modifier sink. */
function hitEnemy(enemy: Enemy, amount: number, modifiers: WeaponModifiers): void {
  const crit = Math.random() < modifiers.critChance;
  const total = crit ? amount * modifiers.critMultiplier : amount;
  enemy.takeDamage(total);
  modifiers.onHit?.(enemy, total, crit);
}

/** Same as hitEnemy but never reports (for continuous per-frame ticks). */
function hitEnemySilent(enemy: Enemy, amount: number, _modifiers: WeaponModifiers): void {
  enemy.takeDamage(amount);
}

interface LaserStats {
  damage: number;
  cooldown: number;
  duration: number;
  range: number;
  width: number;
  glowAlpha: number;
  particleCount: number;
}

interface BeamVisualColors {
  glow: string;
  glowAlphaBoost: number;
  midStart: [number, number, number];
  midEnd: [number, number, number];
  coreStart: [number, number, number];
  coreEnd: [number, number, number];
  impactOuter: string;
  impactMid: string;
  originOuter: string;
  originInner: string;
}

const LASER_COLORS: BeamVisualColors = {
  glow: '80, 160, 255',
  glowAlphaBoost: 0,
  midStart: [100, 180, 255],
  midEnd: [255, 200, 255],
  coreStart: [255, 220, 240],
  coreEnd: [255, 255, 255],
  impactOuter: 'rgba(80, 160, 255, 0)',
  impactMid: 'rgba(100, 200, 255, 0.5)',
  originOuter: 'rgba(80, 150, 255, VAR)',
  originInner: 'rgba(210, 235, 255, VAR)',
};

const ESCORT_COLORS: BeamVisualColors = {
  glow: '120, 255, 220',
  glowAlphaBoost: 0.06,
  midStart: [110, 255, 220],
  midEnd: [200, 255, 245],
  coreStart: [220, 255, 245],
  coreEnd: [255, 255, 255],
  impactOuter: 'rgba(80, 255, 220, 0)',
  impactMid: 'rgba(110, 255, 225, 0.45)',
  originOuter: 'rgba(90, 255, 220, VAR)',
  originInner: 'rgba(230, 255, 245, VAR)',
};

interface Weapon {
  name: WeaponName;
  level: number;
  maxLevel: number;
  onFire?: OnFireCallback;
  update(dt: number, playerX: number, playerY: number, enemies: Enemy[], modifiers: WeaponModifiers): void;
  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, playerRadius: number): void;
}

function computeLaserStats(level: number): LaserStats {
  return {
    damage: 8 + level * 4,
    cooldown: Math.max(0.15, 0.8 - level * 0.065),
    duration: 0.1 + level * 0.01,
    range: 200 + level * 40,
    width: 1 + level * 0.8,
    glowAlpha: 0.1 + level * 0.06,
    particleCount: Math.floor(level / 3),
  };
}

function getNearestEnemy(originX: number, originY: number, enemies: Enemy[], range: number): Enemy | null {
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

function applyBeamDamage(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  enemies: Enemy[],
  damage: number,
  range: number,
  width: number,
  modifiers: WeaponModifiers,
): void {
  const angle = wrappedAngle(originX, originY, targetX, targetY);
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dist = wrappedDistance(originX, originY, enemy.x, enemy.y);
    if (dist > range) continue;
    const eAngle = wrappedAngle(originX, originY, enemy.x, enemy.y);
    const diff = Math.abs(eAngle - angle);
    const normDiff = Math.min(diff, TWO_PI - diff);
    if (dist * Math.sin(normDiff) < enemy.radius + width) {
      hitEnemySilent(enemy, damage, modifiers);
    }
  }
}

function drawBeam(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  originWorldX: number,
  originWorldY: number,
  originRadius: number,
  targetWorldX: number,
  targetWorldY: number,
  stats: LaserStats,
  time: number,
  level: number,
  colors: BeamVisualColors,
): void {
  const screen = camera.worldToScreen(originWorldX, originWorldY);
  const delta = wrappedDelta(originWorldX, originWorldY, targetWorldX, targetWorldY);
  const endX = screen.x + delta.x;
  const endY = screen.y + delta.y;
  const beamAngle = Math.atan2(delta.y, delta.x);
  const originX = screen.x + Math.cos(beamAngle) * originRadius;
  const originY = screen.y + Math.sin(beamAngle) * originRadius;
  const beamLength = Math.max(0, Math.sqrt(delta.x * delta.x + delta.y * delta.y) - originRadius);
  const perpX = -Math.sin(beamAngle);
  const perpY = Math.cos(beamAngle);
  const amplitude = 0.5 + level * 0.6;
  const frequency = 3.5;
  const waveSpeed = 8;
  const segments = 20;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const along = t * beamLength;
    const wave = Math.sin(t * frequency * TWO_PI + time * waveSpeed) * amplitude;
    points.push({
      x: originX + Math.cos(beamAngle) * along + perpX * wave,
      y: originY + Math.sin(beamAngle) * along + perpY * wave,
    });
  }

  const drawWavyPath = () => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= segments; i++) ctx.lineTo(points[i].x, points[i].y);
  };

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (level >= 3) {
    drawWavyPath();
    ctx.strokeStyle = `rgba(${colors.glow}, ${stats.glowAlpha + colors.glowAlphaBoost})`;
    ctx.lineWidth = stats.width * 5;
    ctx.stroke();
  }

  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const taper = 1.0 - t * 0.5;
    const r = Math.round(colors.midStart[0] + (colors.midEnd[0] - colors.midStart[0]) * t);
    const g = Math.round(colors.midStart[1] + (colors.midEnd[1] - colors.midStart[1]) * t);
    const b = Math.round(colors.midStart[2] + (colors.midEnd[2] - colors.midStart[2]) * t);
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(points[i + 1].x, points[i + 1].y);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.35 + stats.glowAlpha})`;
    ctx.lineWidth = stats.width * 2.5 * taper;
    ctx.stroke();
  }

  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const taper = 1.0 - t * 0.6;
    const r = Math.round(colors.coreStart[0] + (colors.coreEnd[0] - colors.coreStart[0]) * t);
    const g = Math.round(colors.coreStart[1] + (colors.coreEnd[1] - colors.coreStart[1]) * t);
    const b = Math.round(colors.coreStart[2] + (colors.coreEnd[2] - colors.coreStart[2]) * t);
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(points[i + 1].x, points[i + 1].y);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.95)`;
    ctx.lineWidth = stats.width * taper;
    ctx.stroke();
  }

  const flashRadius = stats.width * 3 + 4;
  const flashGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, flashRadius * 2.5);
  flashGrad.addColorStop(0, 'rgba(230, 255, 255, 0.9)');
  flashGrad.addColorStop(0.4, colors.impactMid);
  flashGrad.addColorStop(1, colors.impactOuter);
  ctx.beginPath();
  ctx.arc(endX, endY, flashRadius * 2.5, 0, TWO_PI);
  ctx.fillStyle = flashGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(endX, endY, flashRadius * 0.5, 0, TWO_PI);
  ctx.fillStyle = 'rgba(240, 255, 255, 0.95)';
  ctx.fill();

  if (level >= 5) {
    const orbPulse = 0.6 + 0.4 * Math.sin(time * 12);
    const orbRadius = stats.width * 2.5 * orbPulse;
    const orbGrad = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, orbRadius * 3);
    orbGrad.addColorStop(0, colors.originOuter.replace('VAR', `${0.8 * orbPulse}`));
    orbGrad.addColorStop(0.5, colors.originOuter.replace('VAR', `${0.4 * orbPulse}`));
    orbGrad.addColorStop(1, colors.impactOuter);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, orbRadius * 3, 0, TWO_PI);
    ctx.fillStyle = orbGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, orbRadius, 0, TWO_PI);
    ctx.fillStyle = colors.originInner.replace('VAR', `${0.9 * orbPulse}`);
    ctx.fill();
  }

  for (let i = 0; i < stats.particleCount; i++) {
    const t = Math.random();
    const segIdx = Math.floor(t * segments);
    const px = points[segIdx].x + (Math.random() - 0.5) * stats.width * 3;
    const py = points[segIdx].y + (Math.random() - 0.5) * stats.width * 3;
    ctx.fillStyle = `rgba(220, 255, 255, ${0.5 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, Math.random() * 2, 0, TWO_PI);
    ctx.fill();
  }
}

export class LaserBeam implements Weapon {
  name: WeaponName = 'Laser Beam';
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

  private computeStats(): LaserStats {
    return computeLaserStats(this.level);
  }

  private getStats(): LaserStats {
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

export class EscortWing implements Weapon {
  name: WeaponName = 'Escort Wing';
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

  private computeStats(): LaserStats & { orbitRadius: number; craftRadius: number } {
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

  private getStats(): LaserStats & { orbitRadius: number; craftRadius: number } {
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
    ctx.arc(0, 0, stats.craftRadius * 2.2, 0, TWO_PI);
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

export class OrbitShield implements Weapon {
  name: WeaponName = 'Orbit Shield';
  level = 1;
  maxLevel = 10;
  private angle = 0;
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats() {
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

  private getStats() {
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

      for (const enemy of enemies) {
        if (enemy.dead) continue;
        if (wrappedDistance(px, py, enemy.x, enemy.y) < stats.hitRadius + enemy.radius) {
          hitEnemySilent(enemy, damage * dt * 10, modifiers);
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, _playerRadius: number): void {
    const stats = this.getStats();
    const screen = camera.worldToScreen(playerX, playerY);

    for (let i = 0; i < stats.projectileCount; i++) {
      const a = this.angle + (TWO_PI / stats.projectileCount) * i;
      const px = screen.x + Math.cos(a) * stats.orbitRadius;
      const py = screen.y + Math.sin(a) * stats.orbitRadius;

      for (let t = 1; t <= stats.trailLength; t++) {
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
    }

    if (this.level >= 5) {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, stats.orbitRadius, 0, TWO_PI);
      ctx.strokeStyle = 'rgba(80, 160, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

export class NovaBlast implements Weapon {
  name: WeaponName = 'Nova Blast';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 0;
  private blastRadius = 0;
  private isBlasting = false;
  private hasDealtDamage = false;
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats() {
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

  private getStats() {
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

// ── Seeker Swarm: homing missile volleys ───────────────────────

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
  name: WeaponName = 'Seeker Swarm';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 0.6;
  private missiles: Missile[] = [];
  private explosions: MissileExplosion[] = [];
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats() {
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

  private getStats() {
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
      // Second wave launched after a short delay via queued timer.
      this.secondWaveTimer = 0.24;
      this.pendingWave = { x: playerX, y: playerY };
    }
    audio.playMissile();
  }

  private pendingWave: { x: number; y: number } | null = null;
  private secondWaveTimer = 0;

  private pickTarget(px: number, py: number, enemies: Enemy[], index: number): Enemy | null {
    const alive = enemies.filter(e => !e.dead && wrappedDistance(px, py, e.x, e.y) < 700);
    if (alive.length === 0) return null;
    return alive[index % alive.length];
  }

  private detonate(missile: Missile, stats: ReturnType<SeekerSwarm['computeStats']>, damage: number, enemies: Enemy[], modifiers: WeaponModifiers): void {
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      if (wrappedDistance(missile.x, missile.y, enemy.x, enemy.y) < stats.aoeRadius + enemy.radius) {
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

        if (m.age > 0.15 && wrappedDistance(m.x, m.y, m.target.x, m.target.y) < m.target.radius + 10) {
          m.age = stats.maxLifetime + 1;
          this.detonate(m, stats, stats.damage * modifiers.damageMultiplier, enemies, modifiers);
          continue;
        }
      }

      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 7) m.trail.shift();
      m.x += m.vx * dt;
      m.y += m.vy * dt;
    }

    this.missiles = this.missiles.filter(m => m.age < stats.maxLifetime);
    for (const ex of this.explosions) ex.age += dt;
    this.explosions = this.explosions.filter(ex => ex.age < 0.3);
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

// ── Arc Reactor: chain lightning ───────────────────────────────

interface ArcSegment {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  age: number;
  seed: number;
}

export class ArcReactor implements Weapon {
  name: WeaponName = 'Arc Reactor';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 1;
  private segments: ArcSegment[] = [];
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats() {
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

  private getStats() {
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
            fromX, fromY,
            toX: current.x, toY: current.y,
            age: 0,
            seed: Math.random() * 1000,
          });
          fromX = current.x;
          fromY = current.y;
          damage *= stats.falloff;

          let next: Enemy | null = null;
          let nextDist = Infinity;
          for (const enemy of enemies) {
            if (enemy.dead || visited.has(enemy)) continue;
            const d = wrappedDistance(fromX, fromY, enemy.x, enemy.y);
            if (d < stats.chainRange && d < nextDist) {
              nextDist = d;
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
    this.segments = this.segments.filter(s => s.age < 0.22);
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
      const rand = () => {
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

      const trace = () => {
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

// ── Singularity: gravity well ──────────────────────────────────

type SingularityState =
  | { mode: 'idle' }
  | { mode: 'flying'; x: number; y: number; vx: number; vy: number; traveled: number }
  | { mode: 'active'; x: number; y: number; age: number }
  | { mode: 'collapsing'; x: number; y: number; age: number };

export class Singularity implements Weapon {
  name: WeaponName = 'Singularity';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 2;
  private state: SingularityState = { mode: 'idle' };
  private spin = 0;
  private cachedStats = this.computeStats();
  private cachedLevel = 1;

  private computeStats() {
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

  private getStats() {
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

        for (const enemy of enemies) {
          if (enemy.dead) continue;
          const dist = wrappedDistance(this.state.x, this.state.y, enemy.x, enemy.y);
          if (dist < stats.pullRadius + enemy.radius) {
            const pullAngle = wrappedAngle(enemy.x, enemy.y, this.state.x, this.state.y);
            const strength = stats.pullStrength * (1 - Math.min(0.65, dist / stats.pullRadius));
            enemy.x += Math.cos(pullAngle) * strength * dt;
            enemy.y += Math.sin(pullAngle) * strength * dt;
            if (dist < stats.pullRadius * 0.62) {
              hitEnemySilent(enemy, stats.dps * modifiers.damageMultiplier * dt, modifiers);
            }
          }
        }

        if (this.state.age >= stats.activeDuration) {
          const collapseRadius = stats.pullRadius * stats.collapseRadiusMul;
          for (const enemy of enemies) {
            if (enemy.dead) continue;
            if (wrappedDistance(this.state.x, this.state.y, enemy.x, enemy.y) < collapseRadius + enemy.radius) {
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
      return;
    }

    if (this.state.mode === 'active') {
      const screen = camera.worldToScreen(this.state.x, this.state.y);
      const progress = this.state.age / stats.activeDuration;
      const radius = stats.pullRadius * (0.85 + progress * 0.15);

      // Distortion field
      const field = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, radius);
      field.addColorStop(0, 'rgba(30, 8, 50, 0.55)');
      field.addColorStop(0.55, 'rgba(90, 30, 160, 0.18)');
      field.addColorStop(1, 'rgba(90, 30, 160, 0)');
      ctx.fillStyle = field;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, radius, 0, TWO_PI);
      ctx.fill();

      // Accretion arcs
      for (let i = 0; i < 4; i++) {
        const arcAngle = this.spin * (i % 2 === 0 ? 1 : -1.4) + i * 1.57;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius * (0.34 + i * 0.17), arcAngle, arcAngle + 1.6);
        ctx.strokeStyle = `rgba(${190 - i * 25}, ${110 - i * 18}, 255, ${0.5 - i * 0.09})`;
        ctx.lineWidth = 2.2 - i * 0.4;
        ctx.stroke();
      }

      // Core
      const coreR = 11 * (1 + Math.sin(this.spin * 4) * 0.08);
      const core = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, coreR * 2);
      core.addColorStop(0, 'rgba(10, 0, 20, 0.98)');
      core.addColorStop(0.6, 'rgba(70, 20, 130, 0.85)');
      core.addColorStop(1, 'rgba(150, 80, 255, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, coreR * 2, 0, TWO_PI);
      ctx.fill();

      // Inward sparks
      for (let i = 0; i < 5; i++) {
        const sparkAngle = this.spin * 2.2 + i * 1.256;
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
    }
  }
}

// ── Registry & manager ─────────────────────────────────────────

export const WEAPON_ORDER: { id: WeaponId; name: WeaponName }[] = [
  { id: 'laser', name: 'Laser Beam' },
  { id: 'orbit', name: 'Orbit Shield' },
  { id: 'nova', name: 'Nova Blast' },
  { id: 'escort', name: 'Escort Wing' },
  { id: 'seeker', name: 'Seeker Swarm' },
  { id: 'arc', name: 'Arc Reactor' },
  { id: 'singularity', name: 'Singularity' },
];

export class WeaponManager {
  weapons: Weapon[] = [];
  readonly modifiers: WeaponModifiers = {
    damageMultiplier: 1,
    cooldownMultiplier: 1,
    critChance: 0,
    critMultiplier: 2,
  };
  private laser: LaserBeam;

  constructor() {
    this.laser = new LaserBeam();
    this.weapons.push(this.laser);
  }

  setOnLaserFire(cb: OnFireCallback): void {
    this.laser.onFire = cb;
  }

  addWeapon(id: WeaponId): boolean {
    if (this.hasId(id)) return false;
    const factory: Record<Exclude<WeaponId, 'laser'>, () => Weapon> = {
      orbit: () => new OrbitShield(),
      nova: () => new NovaBlast(),
      escort: () => new EscortWing(),
      seeker: () => new SeekerSwarm(),
      arc: () => new ArcReactor(),
      singularity: () => new Singularity(),
    };
    if (id === 'laser') return false;
    this.weapons.push(factory[id]());
    return true;
  }

  hasId(id: WeaponId): boolean {
    const entry = WEAPON_ORDER.find(w => w.id === id);
    return entry ? this.hasWeapon(entry.name) : false;
  }

  hasWeapon(name: string): boolean {
    return this.weapons.some(w => w.name === name);
  }

  getWeapon(name: string): Weapon | undefined {
    return this.weapons.find(w => w.name === name);
  }

  multiplyDamage(multiplier: number): void {
    this.modifiers.damageMultiplier *= multiplier;
  }

  multiplyCooldown(multiplier: number): void {
    this.modifiers.cooldownMultiplier *= multiplier;
  }

  allMaxed(): boolean {
    return this.weapons.length === WEAPON_ORDER.length && this.weapons.every(w => w.level >= w.maxLevel);
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[]): void {
    for (const weapon of this.weapons) {
      weapon.update(dt, playerX, playerY, enemies, this.modifiers);
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, playerRadius: number): void {
    for (const weapon of this.weapons) {
      weapon.draw(ctx, camera, playerX, playerY, playerRadius);
    }
  }
}
