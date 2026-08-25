import { describe, expect, it, vi } from 'vitest';
import { Game } from './game';
import { WeaponManager } from './weapons';
import { createEmptyPassiveStacks } from './upgrades';
import { PASSIVE_CAPS } from './ids';

describe('Game - timing', () => {
  it('gameDuration shrinks 20s per stage, floors at 180', () => {
    const g = new Game();
    g.stage = 1;
    expect(g.gameDuration).toBe(300);
    g.stage = 2;
    expect(g.gameDuration).toBe(280);
    g.stage = 7;
    expect(g.gameDuration).toBe(180); // 300-120=180
    g.stage = 10;
    expect(g.gameDuration).toBe(180); // clamped
  });

  it('timeRemaining is duration - elapsed, clamped to 0', () => {
    const g = new Game();
    g.stage = 1; // 300s
    g.elapsedTime = 100;
    expect(g.timeRemaining).toBe(200);
    g.elapsedTime = 400;
    expect(g.timeRemaining).toBe(0);
  });

  it('beginBossEncounter sets flag and pushes notification once', () => {
    const g = new Game();
    expect(g.bossEngaged).toBe(false);
    g.beginBossEncounter();
    expect(g.bossEngaged).toBe(true);
    const count = g.notifications.length;
    g.beginBossEncounter(); // idempotent
    expect(g.notifications.length).toBe(count);
  });

  it('advanceStage increments, resets timer, adds mutators', () => {
    const g = new Game();
    g.stage = 1;
    g.elapsedTime = 250;
    g.bossEngaged = true;
    g.rerollsRemaining = 2;
    g.advanceStage();
    expect(g.stage).toBe(2);
    expect(g.elapsedTime).toBe(0);
    expect(g.bossEngaged).toBe(false);
    expect(g.rerollsRemaining).toBe(3); // capped at 3
    g.advanceStage();
    expect(g.rerollsRemaining).toBe(3); // stays capped
  });
});

describe('Game - draft flow', () => {
  it('queueLevelUps ignored when all maxed', () => {
    const g = new Game();
    const wm = new WeaponManager();
    // Fill all weapons to max and all passives to cap
    for (const w of wm.weapons) w.level = w.maxLevel;
    // Add remaining weapons
    const ids: Array<'orbit' | 'nova' | 'escort' | 'seeker' | 'arc' | 'singularity'> = [
      'orbit',
      'nova',
      'escort',
      'seeker',
      'arc',
      'singularity',
    ];
    for (const id of ids) wm.addWeapon(id);
    for (const w of wm.weapons) w.level = w.maxLevel;

    const stacks = createEmptyPassiveStacks();
    for (const key of Object.keys(stacks) as Array<keyof typeof stacks>) {
      stacks[key] = PASSIVE_CAPS[key] === Infinity ? 100 : PASSIVE_CAPS[key];
    }
    // Inject capped stacks into game via private? We test the guard indirectly:
    // Game.allPassivesCapped uses its own internal stacks (empty). So we need to fill game.stacks.
    for (const k of Object.keys(g.passiveStacks) as Array<keyof typeof g.passiveStacks>) {
      g.passiveStacks[k] = PASSIVE_CAPS[k] === Infinity ? 100 : PASSIVE_CAPS[k];
    }
    g.queueLevelUps(1, wm);
    expect(g.pendingLevelUps).toBe(0);
  });

  it('buildUpgradeDraft returns 3 choices when pool large', () => {
    const g = new Game();
    const wm = new WeaponManager();
    const stacks = createEmptyPassiveStacks();
    // With 1 weapon and 8 passives + 6 unlocks, pool >3 -> should return 3
    const choices = g.draftChoices;
    expect(choices).toHaveLength(0);
    g.queueLevelUps(1, wm);
    // queue triggers beginNextDraft when not already LEVEL_UP
    expect(g.draftChoices.length).toBe(3);
    // Ensure IDs unique
    expect(new Set(g.draftChoices.map((c) => c.id)).size).toBe(3);
    void stacks;
  });

  it('rerollDraft fails when no rerolls or not in LEVEL_UP', () => {
    const g = new Game();
    const wm = new WeaponManager();
    expect(g.rerollDraft(wm)).toBe(false); // not in LEVEL_UP
    g.queueLevelUps(1, wm);
    g.rerollsRemaining = 0;
    expect(g.rerollDraft(wm)).toBe(false);
  });

  it('chooseDraft applies and clears draft', () => {
    const g = new Game();
    const wm = new WeaponManager();
    // Mock audio and player side-effects are fine - we just need player object
    const mockPlayer = { upgradeHull: vi.fn(), upgradeThrusters: vi.fn(), upgradeNanoforge: vi.fn(), upgradePlating: vi.fn(), upgradeTargeting: vi.fn(), upgradeVampiric: vi.fn(), upgradeAmplifier: vi.fn(), addMaxHull: vi.fn(), increaseContactGrace: vi.fn(), addSpeed: vi.fn(), multiplyRegen: vi.fn(), multiplyDamageTaken: vi.fn(), addCritChance: vi.fn() } as unknown as import('./player').Player;
    g.queueLevelUps(1, wm);
    const before = g.upgradeCount;
    const choiceCount = g.draftChoices.length;
    expect(choiceCount).toBeGreaterThan(0);
    const ok = g.chooseDraft(0, wm, mockPlayer);
    expect(ok).toBe(true);
    expect(g.upgradeCount).toBe(before + 1);
    expect(g.draftChoices.length).toBe(0);
  });
});
