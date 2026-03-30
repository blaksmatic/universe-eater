import { wrappedAngle, randomRange, wrapPosition } from './utils';
import { Camera } from './camera';

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
    baseRadius: 10, radiusVariation: 4, speed: 150, baseHp: 15,
    color: [255, 60, 60], outlineColor: '#ff3c3c', xpDrop: 1, damageMultiplier: 1.0,
  },
  drifter: {
    baseRadius: 20, radiusVariation: 6, speed: 80, baseHp: 40,
    color: [255, 160, 40], outlineColor: '#ffa028', xpDrop: 3, damageMultiplier: 1.5,
  },
  titan: {
    baseRadius: 40, radiusVariation: 10, speed: 40, baseHp: 120,
    color: [160, 60, 255], outlineColor: '#a03cff', xpDrop: 8, damageMultiplier: 2.0,
  },
};

export type EnemyType = 'swarmer' | 'drifter' | 'titan';

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
  }

  update(dt: number, playerX: number, playerY: number): void {
    const angle = wrappedAngle(this.x, this.y, playerX, playerY);
    this.x += Math.cos(angle) * this.speed * dt;
    this.y += Math.sin(angle) * this.speed * dt;
    const wrapped = wrapPosition(this.x, this.y);
    this.x = wrapped.x;
    this.y = wrapped.y;
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screen = camera.worldToScreen(this.x, this.y);

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
    } else if (minute < 3) {
      return { spawnInterval: 0.5, types: [{ type: 'swarmer', weight: 3 }, { type: 'drifter', weight: 2 }, { type: 'titan', weight: 0.5 }] };
    }
    return { spawnInterval: 0.3, types: [{ type: 'swarmer', weight: 2 }, { type: 'drifter', weight: 2 }, { type: 'titan', weight: 1.5 }] };
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
  }

  removeDead(): void {
    this.enemies = this.enemies.filter(e => !e.dead);
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const enemy of this.enemies) {
      if (camera.isVisible(enemy.x, enemy.y, enemy.radius + 50)) {
        enemy.draw(ctx, camera);
      }
    }
  }
}
