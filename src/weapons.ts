import { wrappedDistance, wrappedAngle, MAP_WIDTH, MAP_HEIGHT } from './utils';
import { Camera } from './camera';
import { Enemy } from './enemies';

interface Weapon {
  name: string;
  level: number;
  maxLevel: number;
  update(dt: number, playerX: number, playerY: number, enemies: Enemy[]): void;
  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number): void;
}

export class LaserBeam implements Weapon {
  name = 'Laser Beam';
  level = 1;
  maxLevel = 10;
  private cooldownTimer = 0;
  private firingTimer = 0;
  private isFiring = false;
  private targetX = 0;
  private targetY = 0;

  private getStats() {
    const lvl = this.level;
    return {
      damage: 8 + lvl * 4,
      cooldown: Math.max(0.15, 0.8 - lvl * 0.065),
      duration: 0.1 + lvl * 0.01,
      range: 200 + lvl * 40,
      width: 1 + lvl * 0.8,
      glowAlpha: 0.1 + lvl * 0.06,
      particleCount: Math.floor(lvl / 3),
    };
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[]): void {
    const stats = this.getStats();

    if (this.isFiring) {
      this.firingTimer -= dt;
      if (this.firingTimer <= 0) this.isFiring = false;
    }

    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0 && !this.isFiring) {
      let nearest: Enemy | null = null;
      let nearestDist = Infinity;
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        const dist = wrappedDistance(playerX, playerY, enemy.x, enemy.y);
        if (dist < stats.range && dist < nearestDist) {
          nearestDist = dist;
          nearest = enemy;
        }
      }

      if (nearest) {
        this.isFiring = true;
        this.firingTimer = stats.duration;
        this.cooldownTimer = stats.cooldown;
        this.targetX = nearest.x;
        this.targetY = nearest.y;

        const angle = wrappedAngle(playerX, playerY, nearest.x, nearest.y);
        for (const enemy of enemies) {
          if (enemy.dead) continue;
          const dist = wrappedDistance(playerX, playerY, enemy.x, enemy.y);
          if (dist > stats.range) continue;
          const eAngle = wrappedAngle(playerX, playerY, enemy.x, enemy.y);
          const diff = Math.abs(eAngle - angle);
          const normDiff = Math.min(diff, Math.PI * 2 - diff);
          if (dist * Math.sin(normDiff) < enemy.radius + stats.width) {
            enemy.takeDamage(stats.damage);
          }
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number): void {
    if (!this.isFiring) return;
    const stats = this.getStats();
    const screen = camera.worldToScreen(playerX, playerY);

    let dx = this.targetX - playerX;
    let dy = this.targetY - playerY;
    if (dx > MAP_WIDTH / 2) dx -= MAP_WIDTH;
    if (dx < -MAP_WIDTH / 2) dx += MAP_WIDTH;
    if (dy > MAP_HEIGHT / 2) dy -= MAP_HEIGHT;
    if (dy < -MAP_HEIGHT / 2) dy += MAP_HEIGHT;
    const endX = screen.x + dx;
    const endY = screen.y + dy;

    if (this.level >= 3) {
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `rgba(100, 180, 255, ${stats.glowAlpha})`;
      ctx.lineWidth = stats.width * 4;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = `rgba(150, 200, 255, ${0.3 + stats.glowAlpha})`;
    ctx.lineWidth = stats.width * 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = stats.width;
    ctx.stroke();

    for (let i = 0; i < stats.particleCount; i++) {
      const t = Math.random();
      const px = screen.x + dx * t + (Math.random() - 0.5) * stats.width * 3;
      const py = screen.y + dy * t + (Math.random() - 0.5) * stats.width * 3;
      ctx.fillStyle = `rgba(200, 220, 255, ${0.5 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(px, py, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export class OrbitShield implements Weapon {
  name = 'Orbit Shield';
  level = 1;
  maxLevel = 10;
  private angle = 0;

  private getStats() {
    const lvl = this.level;
    return {
      damage: 5 + lvl * 3,
      orbitRadius: 50 + lvl * 12,
      projectileCount: 2 + Math.floor(lvl / 2),
      projectileRadius: 3 + lvl * 0.5,
      rotationSpeed: 2 + lvl * 0.3,
      trailLength: Math.floor(lvl / 2),
      glowAlpha: 0.1 + lvl * 0.05,
    };
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[]): void {
    const stats = this.getStats();
    this.angle += stats.rotationSpeed * dt;

    for (let i = 0; i < stats.projectileCount; i++) {
      const a = this.angle + (Math.PI * 2 / stats.projectileCount) * i;
      const px = playerX + Math.cos(a) * stats.orbitRadius;
      const py = playerY + Math.sin(a) * stats.orbitRadius;

      for (const enemy of enemies) {
        if (enemy.dead) continue;
        if (wrappedDistance(px, py, enemy.x, enemy.y) < stats.projectileRadius + enemy.radius) {
          enemy.takeDamage(stats.damage * dt * 10);
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number): void {
    const stats = this.getStats();
    const screen = camera.worldToScreen(playerX, playerY);

    for (let i = 0; i < stats.projectileCount; i++) {
      const a = this.angle + (Math.PI * 2 / stats.projectileCount) * i;
      const px = screen.x + Math.cos(a) * stats.orbitRadius;
      const py = screen.y + Math.sin(a) * stats.orbitRadius;

      for (let t = 1; t <= stats.trailLength; t++) {
        const ta = a - t * 0.15;
        const tx = screen.x + Math.cos(ta) * stats.orbitRadius;
        const ty = screen.y + Math.sin(ta) * stats.orbitRadius;
        ctx.beginPath();
        ctx.arc(tx, ty, stats.projectileRadius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${(1 - t / (stats.trailLength + 1)) * 0.4})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(px, py, stats.projectileRadius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(80, 160, 255, ${stats.glowAlpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, stats.projectileRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180, 220, 255, 0.9)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, stats.projectileRadius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    if (this.level >= 5) {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, stats.orbitRadius, 0, Math.PI * 2);
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

  private getStats() {
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

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[]): void {
    const stats = this.getStats();

    if (this.isBlasting) {
      this.blastRadius += stats.expandSpeed * dt;
      if (!this.hasDealtDamage) {
        for (const enemy of enemies) {
          if (enemy.dead) continue;
          if (wrappedDistance(playerX, playerY, enemy.x, enemy.y) < stats.maxRadius) {
            enemy.takeDamage(stats.damage);
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
      let hasTarget = false;
      for (const enemy of enemies) {
        if (!enemy.dead && wrappedDistance(playerX, playerY, enemy.x, enemy.y) < stats.maxRadius) {
          hasTarget = true;
          break;
        }
      }
      if (hasTarget) {
        this.isBlasting = true;
        this.cooldownTimer = stats.cooldown;
        this.blastRadius = 0;
        this.hasDealtDamage = false;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number): void {
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
      ctx.arc(screen.x, screen.y, this.blastRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (stats.shockwave) {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, this.blastRadius * 1.05, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 220, 150, ${alpha * 0.3})`;
      ctx.lineWidth = stats.ringWidth * 0.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.blastRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 180, 80, ${alpha})`;
    ctx.lineWidth = stats.ringWidth;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, this.blastRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 150, 50, ${alpha * 0.3})`;
    ctx.lineWidth = stats.ringWidth * 3;
    ctx.stroke();

    for (let i = 0; i < stats.debrisCount; i++) {
      const angle = (Math.PI * 2 / stats.debrisCount) * i + progress * 2;
      const dx = screen.x + Math.cos(angle) * this.blastRadius;
      const dy = screen.y + Math.sin(angle) * this.blastRadius;
      ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
      ctx.beginPath();
      ctx.arc(dx, dy, 2 + this.level * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export class WeaponManager {
  weapons: Weapon[] = [];

  constructor() {
    this.weapons.push(new LaserBeam());
  }

  addWeapon(type: 'orbit' | 'nova'): void {
    if (type === 'orbit' && !this.hasWeapon('Orbit Shield')) {
      this.weapons.push(new OrbitShield());
    } else if (type === 'nova' && !this.hasWeapon('Nova Blast')) {
      this.weapons.push(new NovaBlast());
    }
  }

  hasWeapon(name: string): boolean {
    return this.weapons.some(w => w.name === name);
  }

  getWeapon(name: string): Weapon | undefined {
    return this.weapons.find(w => w.name === name);
  }

  allMaxed(): boolean {
    return this.weapons.length === 3 && this.weapons.every(w => w.level >= w.maxLevel);
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[]): void {
    for (const weapon of this.weapons) weapon.update(dt, playerX, playerY, enemies);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number): void {
    for (const weapon of this.weapons) weapon.draw(ctx, camera, playerX, playerY);
  }
}
