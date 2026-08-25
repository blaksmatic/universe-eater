import { describe, expect, it } from 'vitest';
import {
  createEmptyPassiveStacks,
  createEmptyTraitCounts,
  getNewDoctrines,
  buildUpgradeDraft,
  applyDoctrine,
} from './upgrades';
import { WeaponManager } from './weapons';
import { Player } from './player';

describe('upgrades - doctrines', () => {
  it('creates empty trait counts', () => {
    expect(createEmptyTraitCounts()).toEqual({ force: 0, ward: 0, surge: 0, forge: 0 });
  });

  it('creates empty passive stacks', () => {
    const stacks = createEmptyPassiveStacks();
    for (const v of Object.values(stacks)) expect(v).toBe(0);
  });

  it('bulwark unlocks at 2 ward', () => {
    const counts = createEmptyTraitCounts();
    counts.ward = 2;
    const docs = getNewDoctrines(counts, []);
    expect(docs.map((d) => d.id)).toContain('bulwark');
  });

  it('does not re-unlock already unlocked', () => {
    const counts = createEmptyTraitCounts();
    counts.ward = 5;
    counts.force = 5;
    const docs = getNewDoctrines(counts, ['bulwark']);
    expect(docs.map((d) => d.id)).not.toContain('bulwark');
    expect(docs.map((d) => d.id)).toContain('annihilation');
  });

  it('annihilation needs 3 force', () => {
    const counts = createEmptyTraitCounts();
    counts.force = 2;
    expect(getNewDoctrines(counts, []).map((d) => d.id)).not.toContain('annihilation');
    counts.force = 3;
    expect(getNewDoctrines(counts, []).map((d) => d.id)).toContain('annihilation');
  });

  it('applyDoctrine mutates player/weapon correctly', () => {
    const counts = createEmptyTraitCounts();
    counts.surge = 2;
    const docs = getNewDoctrines(counts, []);
    const slip = docs.find((d) => d.id === 'slipstream');
    expect(slip).toBeDefined();
    const p = new Player();
    const wm = new WeaponManager();
    const speedBefore = p.speed;
    const cdBefore = wm.modifiers.cooldownMultiplier;
    applyDoctrine(slip!, wm, p);
    expect(p.speed).toBe(speedBefore + 20);
    expect(wm.modifiers.cooldownMultiplier).toBeCloseTo(cdBefore * 0.9);
  });
});

describe('upgrades - draft builder', () => {
  it('returns 3 when pool >3 and respects caps', () => {
    const wm = new WeaponManager();
    const stacks = createEmptyPassiveStacks();
    const draft = buildUpgradeDraft(wm, 5, stacks);
    expect(draft).toHaveLength(3);
    expect(new Set(draft.map((c) => c.id)).size).toBe(3);
  });

  it('caps passives are excluded', () => {
    const wm = new WeaponManager();
    const stacks = createEmptyPassiveStacks();
    // Cap targeting (cap 6)
    stacks.targeting = 6;
    const draft = buildUpgradeDraft(wm, 5, stacks);
    expect(draft.find((c) => c.kind === 'passive' && c.passiveId === 'targeting')).toBeUndefined();
  });

  it('early unlock bias forces at least one unlock when upgradeCount<2', () => {
    const wm = new WeaponManager();
    // Only laser owned, so 6 unlocks available
    const stacks = createEmptyPassiveStacks();
    let hadUnlock = 0;
    for (let i = 0; i < 20; i++) {
      const d = buildUpgradeDraft(wm, 0, stacks);
      if (d.some((c) => c.kind === 'unlock')) hadUnlock++;
    }
    // Should almost always force an unlock (sampled 1 forced)
    expect(hadUnlock).toBeGreaterThan(15);
  });
});
