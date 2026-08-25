export const CHARGE_SPEED = 500;
export const BOSS_CHARGE_SPEED = 620;
export const SPAWN_DURATION = 0.3;
export const BOSS_SPAWN_DURATION = 1.4;
export const HIT_FLASH_DURATION = 0.08;
export const ENEMY_HP_SCALE = 0.5;
export const BOSS_BASE_HP = 60000;

export interface EnemyTypeConfig {
  baseRadius: number;
  radiusVariation: number;
  speed: number;
  baseHp: number;
  color: [number, number, number];
  outlineColor: string;
  xpDrop: number;
  damageMultiplier: number;
}

export type EnemyType = 'swarmer' | 'drifter' | 'titan' | 'overlord' | 'spitter' | 'splitter' | 'bomber' | 'boss';

export const ENEMY_TYPES: Record<EnemyType, EnemyTypeConfig> = {
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
  spitter: {
    baseRadius: 16, radiusVariation: 3, speed: 95, baseHp: 70,
    color: [74, 255, 138], outlineColor: '#4aff8a', xpDrop: 4, damageMultiplier: 1.1,
  },
  splitter: {
    baseRadius: 24, radiusVariation: 5, speed: 65, baseHp: 140,
    color: [255, 79, 216], outlineColor: '#ff4fd8', xpDrop: 5, damageMultiplier: 1.3,
  },
  bomber: {
    baseRadius: 14, radiusVariation: 2, speed: 185, baseHp: 46,
    color: [212, 255, 79], outlineColor: '#d5ff4f', xpDrop: 3, damageMultiplier: 1.2,
  },
  boss: {
    baseRadius: 68, radiusVariation: 0, speed: 55, baseHp: BOSS_BASE_HP,
    color: [255, 40, 90], outlineColor: '#ff285a', xpDrop: 120, damageMultiplier: 2.6,
  },
};

export interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifetime: number;
  radius: number;
  damage: number;
}

export interface EnemySpawnOptions {
  elite?: boolean;
  scale?: number;
  hpScale?: number;
  xpScale?: number;
  hpMul?: number;
  speedMul?: number;
  radiusMul?: number;
  bulletSpeedMul?: number;
  bulletLifeMul?: number;
  eliteXpMul?: number;
  stageOffset?: number;
}

export interface SpawnWeight {
  type: EnemyType;
  weight: number;
}
