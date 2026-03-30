import { wrappedAngle, wrappedDistance, randomRange, wrapPosition, drawSphereShading } from './utils';
import { Camera } from './camera';

const CHARGE_SPEED = 500;

interface EnemyTypeConfig {
  baseRadius: number;
  radiusVariation: number;
  speed: number;
  baseHp: number;
  color: [number, number, number];
  outlineColor: string;
  xpDrop: number;
  damageMultiplier: number;
}

const ENEMY_TYPES: Record<string, EnemyTypeConfig> = {
  swarmer: {
    baseRadius: 10, radiusVariation: 4, speed: 150, baseHp: 38,
    color: [255, 60, 60], outlineColor: '#ff3c3c', xpDrop: 1, damageMultiplier: 1.0,
  },
  drifter: {
    baseRadius: 20, radiusVariation: 6, speed: 80, baseHp: 100,
    color: [255, 160, 40], outlineColor: '#ffa028', xpDrop: 3, damageMultiplier: 1.5,
  },
  titan: {
    baseRadius: 40, radiusVariation: 10, speed: 40, baseHp: 300,
    color: [160, 60, 255], outlineColor: '#a03cff', xpDrop: 8, damageMultiplier: 2.0,
  },
  overlord: {
    baseRadius: 55, radiusVariation: 10, speed: 60, baseHp: 800,
    color: [200, 20, 40], outlineColor: '#c81428', xpDrop: 15, damageMultiplier: 2.5,
  },
};

export type EnemyType = 'swarmer' | 'drifter' | 'titan' | 'overlord';

export interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifetime: number;
  radius: number;
}

export class Enemy {
  x: number;
  y: number;
  radius: number;
  maxHp: number;
  hp: number;
  speed: number;
  color: [number, number, number];
  outlineColor: string;
  xpDrop: number;
  damageMultiplier: number;
  dead = false;
  type: EnemyType;
  rotation = 0;
  summonTimer = 0;
  canSummon = false;
  shootTimer = 0;
  projectiles: BossProjectile[] = [];
  chargeTimer = 0;
  isCharging = false;
  chargeVx = 0;
  chargeVy = 0;
  chargeDuration = 0;

  constructor(type: EnemyType, x: number, y: number) {
    const config = ENEMY_TYPES[type];
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = config.baseRadius + randomRange(-config.radiusVariation / 2, config.radiusVariation / 2);
    const sizeRatio = this.radius / config.baseRadius;
    this.maxHp = config.baseHp * sizeRatio;
    this.hp = this.maxHp;
    this.speed = config.speed;
    this.color = config.color;
    this.outlineColor = config.outlineColor;
    this.xpDrop = config.xpDrop;
    this.damageMultiplier = config.damageMultiplier;
    if (type === 'overlord') {
      this.summonTimer = 3;
      this.shootTimer = 2;
    }
    if (type === 'drifter') {
      this.chargeTimer = randomRange(3, 6);
    }
  }

  update(dt: number, playerX: number, playerY: number): void {
    const angle = wrappedAngle(this.x, this.y, playerX, playerY);

    // Drifter charge attack
    if (this.type === 'drifter') {
      if (this.isCharging) {
        this.chargeDuration -= dt;
        this.x += this.chargeVx * dt;
        this.y += this.chargeVy * dt;
        if (this.chargeDuration <= 0) {
          this.isCharging = false;
          this.chargeTimer = randomRange(3, 6);
        }
      } else {
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0 && wrappedDistance(this.x, this.y, playerX, playerY) < 600) {
          this.isCharging = true;
          this.chargeDuration = 0.6;
          this.chargeVx = Math.cos(angle) * CHARGE_SPEED;
          this.chargeVy = Math.sin(angle) * CHARGE_SPEED;
        } else {
          this.x += Math.cos(angle) * this.speed * dt;
          this.y += Math.sin(angle) * this.speed * dt;
        }
      }
    } else {
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;
    }

    const wrapped = wrapPosition(this.x, this.y);
    this.x = wrapped.x;
    this.y = wrapped.y;

    if (this.type === 'overlord') {
      this.rotation += 0.5 * dt;
      this.summonTimer -= dt;
      if (this.summonTimer <= 0) {
        this.summonTimer = 3;
        this.canSummon = true;
      }

      // Shoot projectiles at player
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1.5;
        const projSpeed = 250;
        const spread = 0.15;
        for (let i = -1; i <= 1; i++) {
          const a = angle + i * spread;
          this.projectiles.push({
            x: this.x, y: this.y,
            vx: Math.cos(a) * projSpeed,
            vy: Math.sin(a) * projSpeed,
            lifetime: 3,
            radius: 4,
          });
        }
      }
    }

    if (this.projectiles.length > 0) {
      for (const p of this.projectiles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.lifetime -= dt;
      }
      this.projectiles = this.projectiles.filter(p => p.lifetime > 0);
    }
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    const screen = camera.worldToScreen(this.x, this.y);

    // Draw drifter charge trail
    if (this.type === 'drifter' && this.isCharging) {
      const trailLen = 20;
      const nx = -this.chargeVx / CHARGE_SPEED;
      const ny = -this.chargeVy / CHARGE_SPEED;
      for (let i = 1; i <= 4; i++) {
        const tx = screen.x + nx * trailLen * i;
        const ty = screen.y + ny * trailLen * i;
        ctx.beginPath();
        ctx.arc(tx, ty, this.radius * (1 - i * 0.15), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 160, 40, ${0.15 - i * 0.03})`;
        ctx.fill();
      }
    }

    // Draw boss projectiles
    for (const p of this.projectiles) {
      const ps = camera.worldToScreen(p.x, p.y);
      const glow = ctx.createRadialGradient(ps.x, ps.y, 0, ps.x, ps.y, p.radius * 3);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glow.addColorStop(0.4, 'rgba(255, 200, 200, 0.3)');
      glow.addColorStop(1, 'rgba(255, 100, 100, 0)');
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, p.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
    }

    if (this.type === 'overlord') {
      const side = this.radius * 2;

      // Subtle pulsing glow
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.5);
      const glowSize = this.radius + 10 + pulse * 8;
      ctx.save();
      ctx.translate(screen.x, screen.y);
      ctx.rotate(this.rotation);
      const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, glowSize * 1.4);
      gradient.addColorStop(0, `rgba(200, 20, 40, ${0.25 + pulse * 0.15})`);
      gradient.addColorStop(1, 'rgba(200, 20, 40, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(-glowSize * 1.4, -glowSize * 1.4, glowSize * 2.8, glowSize * 2.8);
      ctx.restore();

      // Outline
      ctx.save();
      ctx.translate(screen.x, screen.y);
      ctx.rotate(this.rotation);
      ctx.strokeStyle = this.outlineColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(-side / 2, -side / 2, side, side);
      ctx.restore();

      // HP fill clipped to square shape
      const hpRatio = this.hp / this.maxHp;
      if (hpRatio > 0) {
        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        const innerSide = side - 2;
        ctx.rect(-innerSide / 2, -innerSide / 2, innerSide, innerSide);
        ctx.clip();
        const fillTop = -this.radius + 1 + (innerSide * (1 - hpRatio));
        const [r, g, b] = this.color;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(-innerSide / 2, fillTop, innerSide, innerSide);
        ctx.restore();
      }
    } else {
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.outlineColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      const hpRatio = this.hp / this.maxHp;
      if (hpRatio > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, this.radius - 1, 0, Math.PI * 2);
        ctx.clip();
        const fillTop = screen.y + this.radius - (this.radius * 2 * hpRatio);
        const [r, g, b] = this.color;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(screen.x - this.radius, fillTop, this.radius * 2, this.radius * 2);
        ctx.restore();
      }

      drawSphereShading(ctx, screen.x, screen.y, this.radius, ...this.color);
    }
  }
}

interface SpawnWeight {
  type: EnemyType;
  weight: number;
}

export class EnemySpawner {
  enemies: Enemy[] = [];
  private spawnTimer = 0;

  private getSpawnConfig(elapsed: number): { spawnInterval: number; types: SpawnWeight[] } {
    const minute = elapsed / 60;
    if (minute < 1) {
      return { spawnInterval: 1.0, types: [{ type: 'swarmer', weight: 1 }] };
    } else if (minute < 2) {
      return { spawnInterval: 0.7, types: [{ type: 'swarmer', weight: 3 }, { type: 'drifter', weight: 1 }] };
    } else if (minute < 2.5) {
      return { spawnInterval: 0.5, types: [{ type: 'swarmer', weight: 3 }, { type: 'drifter', weight: 2 }, { type: 'titan', weight: 0.5 }] };
    } else if (minute < 3) {
      return {
        spawnInterval: 0.5,
        types: [{ type: 'swarmer', weight: 3 }, { type: 'drifter', weight: 2 }, { type: 'titan', weight: 0.5 }, { type: 'overlord', weight: 0.3 }],
      };
    }
    return {
      spawnInterval: 0.3,
      types: [{ type: 'swarmer', weight: 2 }, { type: 'drifter', weight: 2 }, { type: 'titan', weight: 1.5 }, { type: 'overlord', weight: 0.8 }],
    };
  }

  private pickType(types: SpawnWeight[]): EnemyType {
    const total = types.reduce((s, t) => s + t.weight, 0);
    let roll = Math.random() * total;
    for (const t of types) {
      roll -= t.weight;
      if (roll <= 0) return t.type;
    }
    return types[0].type;
  }

  private spawnEnemy(type: EnemyType, camera: Camera): void {
    const margin = 100;
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (side) {
      case 0: x = camera.x + Math.random() * camera.width; y = camera.y - margin - Math.random() * 100; break;
      case 1: x = camera.x + Math.random() * camera.width; y = camera.y + camera.height + margin + Math.random() * 100; break;
      case 2: x = camera.x - margin - Math.random() * 100; y = camera.y + Math.random() * camera.height; break;
      default: x = camera.x + camera.width + margin + Math.random() * 100; y = camera.y + Math.random() * camera.height; break;
    }

    const pos = wrapPosition(x, y);

    if (type === 'swarmer') {
      const count = Math.floor(randomRange(3, 6));
      for (let i = 0; i < count; i++) {
        const gp = wrapPosition(pos.x + randomRange(-40, 40), pos.y + randomRange(-40, 40));
        this.enemies.push(new Enemy('swarmer', gp.x, gp.y));
      }
    } else if (type === 'drifter' && Math.random() < 0.4) {
      this.enemies.push(new Enemy('drifter', pos.x, pos.y));
      const dp = wrapPosition(pos.x + randomRange(-30, 30), pos.y + randomRange(-30, 30));
      this.enemies.push(new Enemy('drifter', dp.x, dp.y));
    } else {
      this.enemies.push(new Enemy(type, pos.x, pos.y));
    }
  }

  update(dt: number, elapsed: number, playerX: number, playerY: number, camera: Camera): void {
    const config = this.getSpawnConfig(elapsed);
    this.spawnTimer += dt;
    if (this.spawnTimer >= config.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy(this.pickType(config.types), camera);
    }
    for (const enemy of this.enemies) {
      enemy.update(dt, playerX, playerY);
    }

    // Handle overlord summoning
    for (const overlord of this.enemies) {
      if (!overlord.canSummon) continue;
      overlord.canSummon = false;
      const count = Math.floor(randomRange(2, 4));
      for (let i = 0; i < count; i++) {
        const sp = wrapPosition(
          overlord.x + randomRange(-80, 80),
          overlord.y + randomRange(-80, 80),
        );
        this.enemies.push(new Enemy('swarmer', sp.x, sp.y));
      }
    }
  }

  removeDead(): void {
    this.enemies = this.enemies.filter(e => !e.dead);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    for (const enemy of this.enemies) {
      if (camera.isVisible(enemy.x, enemy.y, enemy.radius + 50)) {
        enemy.draw(ctx, camera, time);
      }
    }
  }
}
