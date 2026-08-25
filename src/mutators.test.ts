import { describe, expect, it, vi } from 'vitest';
import { NEUTRAL_SPAWN_MODS, composeSpawnMods, rollMutators } from './mutators';
import type { MutatorId } from './ids';

describe('mutators - NEUTRAL_SPAWN_MODS', () => {
  it('is neutral (all muls 1, bonus 0)', () => {
    expect(NEUTRAL_SPAWN_MODS).toEqual({
      hpMul: 1,
      speedMul: 1,
      radiusMul: 1,
      intervalMul: 1,
      bulletSpeedMul: 1,
      bulletLifeMul: 1,
      eliteChanceMul: 1,
      eliteXpMul: 1,
      scaleBonus: 0,
    });
  });

  it('composeSpawnMods does not mutate neutral', () => {
    const before = { ...NEUTRAL_SPAWN_MODS };
    composeSpawnMods(['heavy', 'frenzy']);
    expect(NEUTRAL_SPAWN_MODS).toEqual(before);
  });
});

describe('mutators - composeSpawnMods', () => {
  it('heavy increases hp and interval', () => {
    const m = composeSpawnMods(['heavy']);
    expect(m.hpMul).toBeCloseTo(1.4);
    expect(m.intervalMul).toBeCloseTo(1.15);
  });

  it('frenzy decreases hp and interval', () => {
    const m = composeSpawnMods(['frenzy']);
    expect(m.hpMul).toBeCloseTo(0.85);
    expect(m.intervalMul).toBeCloseTo(0.8);
  });

  it('tiny makes smaller/faster/fragile', () => {
    const m = composeSpawnMods(['tiny']);
    expect(m.radiusMul).toBeCloseTo(0.6);
    expect(m.speedMul).toBeCloseTo(1.25);
    expect(m.hpMul).toBeCloseTo(0.7);
  });

  it('veterans adds scaleBonus', () => {
    const m = composeSpawnMods(['veterans']);
    expect(m.scaleBonus).toBe(2);
    const m2 = composeSpawnMods(['veterans', 'veterans']);
    expect(m2.scaleBonus).toBe(4);
  });

  it('elites multiplies eliteChance and eliteXp', () => {
    const m = composeSpawnMods(['elites']);
    expect(m.eliteChanceMul).toBeCloseTo(2.2);
    expect(m.eliteXpMul).toBeCloseTo(1.5);
  });

  it('combines multiplicatively', () => {
    const m = composeSpawnMods(['heavy', 'overdrive']);
    expect(m.hpMul).toBeCloseTo(1.4);
    expect(m.speedMul).toBeCloseTo(1.2);
  });

  it('empty ids returns neutral copy', () => {
    const m = composeSpawnMods([]);
    expect(m).toEqual(NEUTRAL_SPAWN_MODS);
    expect(m).not.toBe(NEUTRAL_SPAWN_MODS);
  });

  it('shrapnel boosts bullet speed and life', () => {
    const m = composeSpawnMods(['shrapnel']);
    expect(m.bulletSpeedMul).toBeCloseTo(1.25);
    expect(m.bulletLifeMul).toBeCloseTo(1.2);
  });
});

describe('mutators - rollMutators', () => {
  it('stage 1 returns empty', () => {
    expect(rollMutators(1)).toEqual([]);
    expect(rollMutators(0)).toEqual([]);
  });

  it('stage 2 returns exactly 1 mutator', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const picked = rollMutators(2);
    expect(picked).toHaveLength(1);
    spy.mockRestore();
  });

  it('stage 3 returns 1 or 2', () => {
    // Force second mutator to be picked (Math.random < 0.4)
    const seq = [0.1, 0.2, 0.5]; // first index, roll <0.4, second index
    let i = 0;
    const spy = vi.spyOn(Math, 'random').mockImplementation(() => seq[i++ % seq.length] ?? 0.1);
    const picked = rollMutators(3);
    expect(picked.length).toBeGreaterThanOrEqual(1);
    expect(picked.length).toBeLessThanOrEqual(2);
    // No duplicates
    expect(new Set(picked).size).toBe(picked.length);
    spy.mockRestore();
  });

  it('stage 3 can return 1 when second roll fails', () => {
    const seq = [0.1, 0.9]; // first pick, then 0.9 >=0.4 => no second
    let idx = 0;
    const spy = vi.spyOn(Math, 'random').mockImplementation(() => seq[idx++] ?? 0.1);
    const picked = rollMutators(3);
    expect(picked).toHaveLength(1);
    spy.mockRestore();
  });

  it('returns valid MutatorId values', () => {
    const valid: MutatorId[] = ['frenzy', 'heavy', 'overdrive', 'shrapnel', 'elites', 'tiny', 'veterans'];
    for (let s = 2; s <= 5; s++) {
      const picked = rollMutators(s);
      for (const id of picked) expect(valid).toContain(id);
    }
  });
});
