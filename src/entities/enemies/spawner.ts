import { wrapPosition, randomRange, TWO_PI } from '../../utils';
import { Camera } from '../../camera';
import { NEUTRAL_SPAWN_MODS, type EnemySpawnMods } from '../../mutators';
import { Enemy } from './enemy';
import type { EnemyType, EnemySpawnOptions, SpawnWeight } from './types';

export class EnemySpawner {
  enemies: Enemy[] = [];
  bossSpawned = false;
  private bossPhaseEvents = 0;
  private spawnTimer = -2.2;
  private stage = 1;
  private spawnMods: EnemySpawnMods = NEUTRAL_SPAWN_MODS;

  setStage(stage: number, stageDuration: number, spawnMods: EnemySpawnMods = NEUTRAL_SPAWN_MODS): void {
    this.stage = Math.max(1, stage);
    this.spawnMods = spawnMods;
    void stageDuration;
  }

  clear(): void {
    this.enemies = [];
    this.bossSpawned = false;
    this.bossPhaseEvents = 0;
    this.spawnTimer = -Math.max(1.1, 2.2 - (this.stage - 1) * 0.18);
  }

  drainBossPhaseEvents(): number {
    const events = this.bossPhaseEvents;
    this.bossPhaseEvents = 0;
    return events;
  }

  get activeBoss(): Enemy | null {
    return this.enemies.find(e => e.isBoss && !e.dead) ?? null;
  }

  spawnBoss(playerX: number, playerY: number): Enemy {
    const angle = Math.random() * TWO_PI;
    const pos = wrapPosition(
      playerX + Math.cos(angle) * 720,
      playerY + Math.sin(angle) * 720,
    );
    const boss = new Enemy('boss', pos.x, pos.y, this.stage, {
      hpMul: this.spawnMods.hpMul,
      speedMul: this.spawnMods.speedMul,
      radiusMul: this.spawnMods.radiusMul,
      bulletSpeedMul: this.spawnMods.bulletSpeedMul,
      bulletLifeMul: this.spawnMods.bulletLifeMul,
      stageOffset: this.spawnMods.scaleBonus,
    });
    this.enemies.push(boss);
    this.bossSpawned = true;
    return boss;
  }

  handleDeathEffects(enemy: Enemy): void {
    if (enemy.noXp) return;
    if (enemy.type === 'splitter') {
      const shards = 3;
      for (let i = 0; i < shards; i++) {
        const gp = wrapPosition(enemy.x + randomRange(-26, 26), enemy.y + randomRange(-26, 26));
        this.enemies.push(new Enemy('swarmer', gp.x, gp.y, this.stage, this.spawnOptions(false, { scale: 0.55, hpScale: 0.35 })));
      }
    }
  }

  private getSpawnConfig(elapsed: number): { spawnInterval: number; types: SpawnWeight[] } {
    const difficulty = this.stage - 1;
    const effectiveElapsed = elapsed + difficulty * 60;
    let spawnInterval: number;
    let types: SpawnWeight[];

    if (effectiveElapsed < 20) {
      spawnInterval = 1.4;
      types = [{ type: 'swarmer', weight: 1 }];
    } else if (effectiveElapsed < 45) {
      spawnInterval = 1.05;
      types = [
        { type: 'swarmer', weight: 3 },
        { type: 'spitter', weight: 0.45 },
      ];
    } else if (effectiveElapsed < 90) {
      spawnInterval = 0.85;
      types = [
        { type: 'swarmer', weight: 3 },
        { type: 'spitter', weight: 1 },
        { type: 'splitter', weight: 0.8 },
      ];
    } else if (effectiveElapsed < 150) {
      spawnInterval = 0.7;
      types = [
        { type: 'swarmer', weight: 2.6 },
        { type: 'drifter', weight: 0.9 },
        { type: 'spitter', weight: 1.15 },
        { type: 'splitter', weight: 1 },
        { type: 'bomber', weight: 0.95 },
      ];
    } else if (effectiveElapsed < 215) {
      spawnInterval = 0.55;
      types = [
        { type: 'swarmer', weight: 2.2 },
        { type: 'drifter', weight: 1.6 },
        { type: 'titan', weight: 0.5 },
        { type: 'spitter', weight: 1.25 },
        { type: 'splitter', weight: 1.1 },
        { type: 'bomber', weight: 1.15 },
      ];
    } else {
      spawnInterval = 0.34;
      types = [
        { type: 'swarmer', weight: 2 },
        { type: 'drifter', weight: 2 },
        { type: 'titan', weight: 1.4 },
        { type: 'overlord', weight: 0.7 },
        { type: 'spitter', weight: 1.3 },
        { type: 'splitter', weight: 1.2 },
        { type: 'bomber', weight: 1.35 },
      ];
    }

    const paceScale = 1 + difficulty * 0.12;
    const scaledTypes = types.map(({ type, weight }) => ({
      type,
      weight: this.scaleSpawnWeight(type, weight),
    }));
    return {
      spawnInterval: Math.max(0.18, spawnInterval / paceScale),
      types: scaledTypes,
    };
  }

  private scaleSpawnWeight(type: EnemyType, baseWeight: number): number {
    const difficulty = this.stage - 1;
    switch (type) {
      case 'swarmer':
        return baseWeight * (1 + difficulty * 0.06);
      case 'spitter':
        return baseWeight * (1 + difficulty * 0.12);
      case 'splitter':
        return baseWeight * (1 + difficulty * 0.14);
      case 'bomber':
        return baseWeight * (1 + difficulty * 0.16);
      case 'drifter':
        return baseWeight * (1 + difficulty * 0.14);
      case 'titan':
        return baseWeight * (1 + difficulty * 0.22);
      case 'overlord':
        return baseWeight * (1 + difficulty * 0.28);
      case 'boss':
        return 0;
    }
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

  private getSwarmerCount(elapsed: number): number {
    const effectiveElapsed = elapsed + (this.stage - 1) * 50;
    const extra = Math.floor((this.stage - 1) / 2);
    if (effectiveElapsed < 20) return Math.floor(randomRange(1, 3)) + extra;
    if (effectiveElapsed < 45) return Math.floor(randomRange(2, 4)) + extra;
    if (effectiveElapsed < 120) return Math.floor(randomRange(2, 5)) + extra;
    return Math.floor(randomRange(3, 6)) + extra;
  }

  private maybeElite(type: EnemyType): boolean {
    const baseChance = Math.min(0.18, 0.03 + (this.stage - 1) * 0.035) * this.spawnMods.eliteChanceMul;
    const chance = type === 'swarmer' ? baseChance * 0.5 : baseChance;
    return Math.random() < Math.min(0.5, chance);
  }

  private spawnOptions(elite: boolean, extra: { scale?: number; hpScale?: number } = {}): EnemySpawnOptions {
    const m = this.spawnMods;
    return {
      elite,
      ...extra,
      hpMul: m.hpMul,
      speedMul: m.speedMul,
      radiusMul: m.radiusMul,
      bulletSpeedMul: m.bulletSpeedMul,
      bulletLifeMul: m.bulletLifeMul,
      eliteXpMul: m.eliteXpMul,
      stageOffset: m.scaleBonus,
    };
  }

  private spawnEnemy(type: EnemyType, camera: Camera, elapsed: number): void {
    const margin = elapsed < 45 ? 140 : 100;
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (side) {
      case 0: x = camera.x + Math.random() * camera.width; y = camera.y - margin - Math.random() * 100; break;
      case 1: x = camera.x + Math.random() * camera.width; y = camera.y + camera.height + margin + Math.random() * 100; break;
      case 2: x = camera.x - margin - Math.random() * 100; y = camera.y + Math.random() * camera.height; break;
      default: x = camera.x + camera.width + margin + Math.random() * 100; y = camera.y + Math.random() * camera.height; break;
    }

    const pos = wrapPosition(x, y);
    const bossActive = this.bossSpawned;

    if (bossActive && (type === 'titan' || type === 'overlord')) {
      type = 'swarmer';
    }

    if (type === 'swarmer') {
      const count = this.getSwarmerCount(elapsed);
      const packCount = this.bossSpawned ? Math.max(1, Math.ceil(count / 2)) : count;
      for (let i = 0; i < packCount; i++) {
        const gp = wrapPosition(pos.x + randomRange(-40, 40), pos.y + randomRange(-40, 40));
        this.enemies.push(new Enemy('swarmer', gp.x, gp.y, this.stage, this.spawnOptions(this.maybeElite('swarmer'))));
      }
    } else if (type === 'drifter' && elapsed > 75 && Math.random() < Math.min(0.7, 0.35 + (this.stage - 1) * 0.06)) {
      this.enemies.push(new Enemy('drifter', pos.x, pos.y, this.stage, this.spawnOptions(this.maybeElite('drifter'))));
      const dp = wrapPosition(pos.x + randomRange(-30, 30), pos.y + randomRange(-30, 30));
      this.enemies.push(new Enemy('drifter', dp.x, dp.y, this.stage));
    } else {
      this.enemies.push(new Enemy(type, pos.x, pos.y, this.stage, this.spawnOptions(this.maybeElite(type))));
    }
  }

  update(dt: number, elapsed: number, playerX: number, playerY: number, camera: Camera): void {
    const config = this.getSpawnConfig(elapsed);
    this.spawnTimer += dt;
    const interval = this.bossSpawned ? config.spawnInterval * 2.4 : config.spawnInterval;
    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawnEnemy(this.pickType(config.types), camera, elapsed);
    }
    for (const enemy of this.enemies) {
      enemy.update(dt, playerX, playerY);
    }

    for (const summoner of this.enemies) {
      if (summoner.dead) continue;
      if (summoner.consumeSummon()) {
        const isBoss = summoner.isBoss;
        const count = isBoss ? 4 : Math.floor(randomRange(2, 4));
        for (let i = 0; i < count; i++) {
          const sp = wrapPosition(
            summoner.x + randomRange(-80, 80),
            summoner.y + randomRange(-80, 80),
          );
          this.enemies.push(new Enemy('swarmer', sp.x, sp.y, this.stage, this.spawnOptions(false)));
        }
      }
      if (summoner.consumePhaseNotification()) {
        this.bossPhaseEvents++;
      }
    }
  }

  removeDead(): void {
    // In-place compact to avoid allocating a new array each frame (called from world.updatePlaying)
    let write = 0;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (!e.dead) this.enemies[write++] = e;
    }
    this.enemies.length = write;
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    for (const enemy of this.enemies) {
      if (camera.isVisible(enemy.x, enemy.y, enemy.radius + 50)) {
        enemy.draw(ctx, camera, time);
      }
    }
  }

  drawProjectiles(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const enemy of this.enemies) {
      enemy.drawProjectiles(ctx, camera);
    }
  }
}
