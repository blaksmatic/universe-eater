import { afterEach, describe, expect, it, vi } from 'vitest';
import { Enemy, EnemySpawner } from './enemies';
import { Camera } from './camera';

afterEach(() => vi.restoreAllMocks());

describe('enemies - scaling', () => {
  it('higher stage increases hp and damage', () => {
    // Mock random to fixed 0 to remove variation noise
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const e1 = new Enemy('swarmer', 0, 0, 1, { hpMul: 1, speedMul: 1, radiusMul: 1, bulletSpeedMul: 1, bulletLifeMul: 1 });
    const e5 = new Enemy('swarmer', 0, 0, 5, { hpMul: 1, speedMul: 1, radiusMul: 1, bulletSpeedMul: 1, bulletLifeMul: 1 });
    expect(e5.maxHp).toBeGreaterThan(e1.maxHp);
    expect(e5.damageMultiplier).toBeGreaterThan(e1.damageMultiplier);
    expect(e5.speed).toBeGreaterThan(e1.speed);
    spy.mockRestore();
  });

  it('elite is larger, tougher, more xp', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const normal = new Enemy('titan', 0, 0, 1, { elite: false });
    const elite = new Enemy('titan', 0, 0, 1, { elite: true });
    expect(elite.radius).toBeGreaterThan(normal.radius);
    expect(elite.maxHp).toBeGreaterThan(normal.maxHp);
    expect(elite.xpDrop).toBeGreaterThan(normal.xpDrop);
    spy.mockRestore();
  });

  it('mutator hpMul scales hp', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const base = new Enemy('swarmer', 0, 0, 1, { hpMul: 1 });
    const buffed = new Enemy('swarmer', 0, 0, 1, { hpMul: 1.4 });
    expect(buffed.maxHp).toBeCloseTo(base.maxHp * 1.4, 0);
    spy.mockRestore();
  });

  it('boss has distinct spawn duration and phase', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const boss = new Enemy('boss', 0, 0, 1, { stageOffset: 0 });
    expect(boss.isBoss).toBe(true);
    expect(boss.spawnDuration).toBe(1.4);
    expect(boss.bossPhase).toBe(1);
    spy.mockRestore();
  });

  it('takeDamage kills when hp <=0', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const e = new Enemy('swarmer', 0, 0, 1);
    e.takeDamage(e.maxHp);
    expect(e.dead).toBe(true);
    spy.mockRestore();
  });
});

describe('enemy attack behavior', () => {
  it('stalkers weave laterally while closing in', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const stalker = new Enemy('stalker', 1000, 1000);
    stalker.update(0.1, 1400, 1000);
    expect(stalker.x).toBeGreaterThan(1000);
    expect(stalker.y).not.toBe(1000);
  });

  it('lancers approach before telegraphing a charge', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const lancer = new Enemy('lancer', 1000, 1000);
    lancer.update(0.1, 1400, 1000);
    expect(lancer.x).toBeCloseTo(1010);
    expect(lancer.fuseRatio).toBe(0);
  });

  it('sentinels telegraph an eight-way volley', () => {
    const sentinel = new Enemy('sentinel', 1000, 1000);
    for (let frame = 0; frame < 31; frame++) sentinel.update(0.1, 1400, 1000);
    expect(sentinel.fuseRatio).toBeGreaterThan(0);
    expect(sentinel.projectiles).toHaveLength(0);
    for (let frame = 0; frame < 4; frame++) sentinel.update(0.1, 1400, 1000);
    expect(sentinel.projectiles).toHaveLength(8);
  });

  it('spitters fire and overlords summon as well as shoot', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const spitter = new Enemy('spitter', 1000, 1000);
    const overlord = new Enemy('overlord', 1000, 1000);
    for (let frame = 0; frame < 190; frame++) {
      spitter.update(1 / 60, 1400, 1000);
      overlord.update(1 / 60, 1400, 1000);
    }
    expect(spitter.projectiles.length).toBeGreaterThan(0);
    expect(overlord.projectiles.length).toBeGreaterThan(0);
    expect(overlord.consumeSummon()).toBe(true);
    expect(overlord.consumeSummon()).toBe(false);
  });

  it('boss spiral density stays stable across frame rates', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const countSpiralShots = (fps: number) => {
      const boss = new Enemy('boss', 1000, 1000);
      boss.hp = boss.maxHp * 0.5;
      let shots = 0;
      for (let frame = 0; frame < fps * 6; frame++) {
        boss.update(1 / fps, 1400, 1000);
        shots += boss.projectiles.filter(p => p.damage === 8).length;
        boss.projectiles.length = 0;
      }
      return shots;
    };
    const normal = countSpiralShots(60);
    expect(normal).toBeGreaterThanOrEqual(42);
    expect(normal).toBeLessThanOrEqual(48);
    for (const fps of [10, 30, 120]) {
      expect(Math.abs(countSpiralShots(fps) - normal)).toBeLessThanOrEqual(3);
    }
  });
});

describe('spawn population budget', () => {
  const camera = new Camera(1280, 720);

  it('large late-stage swarmer packs cannot exceed the population budget', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const spawner = new EnemySpawner();
    spawner.setStage(100, 600);
    spawner.enemies = Array.from({ length: 170 }, () => new Enemy('swarmer', 1000, 1000));
    spawner.update(4, 500, 1400, 1000, camera);
    expect(spawner.enemies.length).toBe(spawner.maxEnemies);
  });

  it('summons and splitting deaths stay within the population budget', () => {
    const spawner = new EnemySpawner();
    spawner.enemies = Array.from({ length: 177 }, () => new Enemy('splitter', 1000, 1000));
    for (const enemy of spawner.enemies) {
      enemy.canSummon = true;
      spawner.handleDeathEffects(enemy);
    }
    spawner.update(0.01, 500, 1400, 1000, camera);
    expect(spawner.enemies.length).toBeLessThanOrEqual(spawner.maxEnemies);
  });
});
