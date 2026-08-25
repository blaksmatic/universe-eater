import { describe, expect, it, vi } from 'vitest';
import { Enemy } from './enemies';

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
