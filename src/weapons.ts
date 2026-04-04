import { wrappedDistance, wrappedAngle, wrappedDelta, TWO_PI } from './utils';
import { Camera } from './camera';
import { Enemy } from './enemies';

export type OnFireCallback = (angle: number) => void;

export interface WeaponModifiers {
  damageMultiplier: number;
  cooldownMultiplier: number;
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
  name: string;
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
      enemy.takeDamage(damage);
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
  name = 'Laser Beam';
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

        applyBeamDamage(playerX, playerY, nearest.x, nearest.y, enemies, damage, stats.range, stats.width);
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
  name = 'Escort Wing';
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
        applyBeamDamage(escort.x, escort.y, nearest.x, nearest.y, enemies, damage, stats.range, stats.width);
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
  name = 'Orbit Shield';
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
          enemy.takeDamage(damage * dt * 10);
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
  name = 'Nova Blast';
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
            enemy.takeDamage(damage);
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

export class WeaponManager {
  weapons: Weapon[] = [];
  private laser: LaserBeam;
  readonly modifiers: WeaponModifiers = {
    damageMultiplier: 1,
    cooldownMultiplier: 1,
  };

  constructor() {
    this.laser = new LaserBeam();
    this.weapons.push(this.laser);
  }

  setOnLaserFire(cb: OnFireCallback): void {
    this.laser.onFire = cb;
  }

  addWeapon(type: 'orbit' | 'nova' | 'escort'): void {
    if (type === 'orbit' && !this.hasWeapon('Orbit Shield')) {
      this.weapons.push(new OrbitShield());
    } else if (type === 'nova' && !this.hasWeapon('Nova Blast')) {
      this.weapons.push(new NovaBlast());
    } else if (type === 'escort' && !this.hasWeapon('Escort Wing')) {
      this.weapons.push(new EscortWing());
    }
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
    return this.weapons.length === 4 && this.weapons.every(w => w.level >= w.maxLevel);
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[]): void {
    for (const weapon of this.weapons) weapon.update(dt, playerX, playerY, enemies, this.modifiers);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, playerRadius: number): void {
    for (const weapon of this.weapons) weapon.draw(ctx, camera, playerX, playerY, playerRadius);
  }
}
