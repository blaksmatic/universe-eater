import { describe, expect, it, beforeEach } from 'vitest';
import { Player } from './player';

describe('Player - XP', () => {
  it('getXpForNextLevel scales with level', () => {
    const p = new Player();
    p.level = 1;
    const lvl1 = p.getXpForNextLevel();
    p.level = 2;
    const lvl2 = p.getXpForNextLevel();
    p.level = 5;
    const lvl5 = p.getXpForNextLevel();
    expect(lvl2).toBeGreaterThan(lvl1);
    expect(lvl5).toBeGreaterThan(lvl2);
    // Formula: floor(8 * 1.35^(lvl-1) * 0.7)
    p.level = 1;
    expect(p.getXpForNextLevel()).toBe(Math.floor(8 * Math.pow(1.35, 0) * 0.7));
  });

  it('addXp levels up when threshold met and respects amplifier', () => {
    const p = new Player();
    p.level = 1;
    p.xp = 0;
    const need = p.getXpForNextLevel();
    p.xpGainMultiplier = 1;
    const leveled = p.addXp(need);
    expect(leveled).toBe(true);
    expect(p.level).toBe(2);
    expect(p.xp).toBe(0); // excess consumed

    // Amplifier doubles XP gain
    p.level = 1;
    p.xp = 0;
    p.xpGainMultiplier = 2;
    const need2 = p.getXpForNextLevel();
    const leveled2 = p.addXp(need2 / 2);
    expect(leveled2).toBe(true);
  });

  it('does not level up if not enough XP', () => {
    const p = new Player();
    p.level = 1;
    const need = p.getXpForNextLevel();
    const leveled = p.addXp(need - 1);
    expect(leveled).toBe(false);
    expect(p.level).toBe(1);
  });
});

describe('Player - health', () => {
  let p: Player;
  beforeEach(() => {
    p = new Player();
    p.maxHp = 100;
    p.hp = 100;
    // Reset invuln timers by not calling update; direct state
    (p as unknown as { postHitInvuln: number }).postHitInvuln = 0;
    (p as unknown as { invulnTimer: number }).invulnTimer = 0;
  });

  it('takeDamage reduces hp and sets postHitInvuln', () => {
    const took = p.takeDamage(30);
    expect(took).toBe(true);
    expect(p.hp).toBe(70);
    // Second hit immediately blocked by postHitInvuln 0.25
    const took2 = p.takeDamage(30);
    expect(took2).toBe(false);
    expect(p.hp).toBe(70);
  });

  it('heal caps at maxHp', () => {
    p.hp = 90;
    p.heal(20);
    expect(p.hp).toBe(100);
  });

  it('addMaxHull increases max and heals', () => {
    p.hp = 80;
    p.addMaxHull(25, 10);
    expect(p.maxHp).toBe(125);
    expect(p.hp).toBe(90);
  });

  it('damageTakenMultiplier scales damage', () => {
    p.damageTakenMultiplier = 0.5;
    p.takeDamage(40);
    expect(p.hp).toBe(80); // 40*0.5=20
  });
});

describe('Player - upgrades', () => {
  it('upgradeTargeting caps crit at 0.75', () => {
    const p = new Player();
    for (let i = 0; i < 20; i++) p.upgradeTargeting();
    expect(p.critChance).toBeLessThanOrEqual(0.75);
  });

  it('upgradeVampiric stacks', () => {
    const p = new Player();
    p.upgradeVampiric();
    p.upgradeVampiric();
    expect(p.healOnKill).toBeCloseTo(1.6);
  });

  it('upgradePlating reduces damageTaken', () => {
    const p = new Player();
    p.upgradePlating();
    expect(p.damageTakenMultiplier).toBeCloseTo(0.88);
  });
});
