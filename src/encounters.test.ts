import { afterEach, describe, expect, it, vi } from 'vitest';
import { EncounterDirector, ENCOUNTERS, getEncounterPhase, getEncounterSpawnPace } from './encounters';
import { setLanguage } from './i18n';
import { Game } from './game';
import { Enemy, EnemySpawner } from './enemies';
import { Camera } from './camera';
import { wrappedDistance } from './utils';
import { NEUTRAL_SPAWN_MODS } from './mutators';

afterEach(() => { vi.restoreAllMocks(); setLanguage('en'); });

describe('expedition director', () => {
  it('warns once, then dispatches once at each milestone', () => {
    const director = new EncounterDirector();
    for (const event of ENCOUNTERS) {
      expect(director.update(event.at - 7)).toBeNull();
      expect(director.update(event.at - 6)).toEqual({ kind: 'warning', event });
      expect(director.update(event.at - 1)).toBeNull();
      expect(director.update(event.at)).toEqual({ kind: 'spawn', event });
      expect(director.update(event.at + 1)).toBeNull();
    }
    expect(director.update(900)).toBeNull();
  });

  it('skips missed warnings and stale armed events instead of catching up', () => {
    const director = new EncounterDirector();
    director.update(114);
    expect(director.update(360)).toBeNull();
    expect(director.update(474)?.kind).toBe('warning');
    expect(director.update(480)?.kind).toBe('spawn');
    const jumped = new EncounterDirector();
    expect(jumped.update(480)).toBeNull();
  });

  it('rescales milestones and resets for the next stage', () => {
    const director = new EncounterDirector();
    expect(director.update(57, 300)?.kind).toBe('warning');
    expect(director.update(60, 300)?.kind).toBe('spawn');
    director.reset();
    expect(director.update(114)?.kind).toBe('warning');
    expect(director.update(120)?.kind).toBe('spawn');
  });

  it('never dispatches an elite with less than three seconds of warning', () => {
    const director = new EncounterDirector();
    expect(director.update(119.9)?.kind).toBe('warning');
    expect(director.update(120)).toBeNull();
    expect(director.update(123)).toBeNull();
  });

  it('gives recovery after encounters and a calmer boss approach', () => {
    expect(getEncounterSpawnPace(143)).toBeGreaterThan(getEncounterSpawnPace(121));
    expect(getEncounterSpawnPace(143)).toBeGreaterThan(getEncounterSpawnPace(170));
    expect(getEncounterSpawnPace(575)).toBeGreaterThan(getEncounterSpawnPace(565));
  });

  it('localizes phase, warning, tactics, and recovery while clamping progress', () => {
    setLanguage('en');
    expect(getEncounterPhase(-10).progress).toBe(0);
    expect(getEncounterPhase(114).name).toBe('Elite signal');
    expect(getEncounterPhase(120).name).toBe('Hunter pair');
    expect(getEncounterPhase(143).name).toBe('Gather & regroup');
    expect(getEncounterPhase(1200).progress).toBe(1);
    const english = getEncounterPhase(240);
    setLanguage('zh-CN');
    expect(getEncounterPhase(240).name).not.toBe(english.name);
    expect(getEncounterPhase(240).description).not.toBe(english.description);
    expect(getEncounterPhase(240).progress).toBe(0.4);
  });
});

describe('encounter integration', () => {
  const camera = new Camera(390, 844);
  camera.follow(25000, 25000);

  it('spawns a bounded offscreen elite pair after warning, preserving mutator stats', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const spawner = new EnemySpawner();
    spawner.setStage(2, 600, { ...NEUTRAL_SPAWN_MODS, hpMul: 1.4 });
    spawner.update(0, 114, 25000, 25000, camera);
    expect(spawner.enemies).toHaveLength(0);
    spawner.update(0, 120, 25000, 25000, camera);
    expect(spawner.enemies).toHaveLength(2);
    const baseline = new Enemy('stalker', 0, 0, 2, { elite: true, hpScale: 0.85 });
    for (const enemy of spawner.enemies) {
      expect(enemy.isElite).toBe(true);
      expect(enemy.type).toBe('stalker');
      expect(wrappedDistance(enemy.x, enemy.y, 25000, 25000)).toBeGreaterThan(600);
      expect(camera.isVisible(enemy.x, enemy.y, enemy.radius)).toBe(false);
      expect(enemy.maxHp).toBeCloseTo(baseline.maxHp * 1.4);
    }
    spawner.update(0, 120.1, 25000, 25000, camera);
    expect(spawner.enemies).toHaveLength(2);
  });

  it('respects the enemy cap and does not defer missed spawns', () => {
    const spawner = new EnemySpawner();
    spawner.enemies = Array.from({ length: spawner.maxEnemies }, () => new Enemy('swarmer', 24000, 24000));
    spawner.update(0, 114, 25000, 25000, camera);
    spawner.update(0, 120, 25000, 25000, camera);
    expect(spawner.enemies).toHaveLength(spawner.maxEnemies);
    spawner.enemies = [];
    spawner.update(0, 120.1, 25000, 25000, camera);
    expect(spawner.enemies).toHaveLength(0);
  });

  it('clears the director for new stages and suppresses events during a boss', () => {
    const spawner = new EnemySpawner();
    spawner.update(0, 114, 25000, 25000, camera);
    spawner.bossSpawned = true;
    spawner.update(0, 120, 25000, 25000, camera);
    expect(spawner.enemies).toHaveLength(0);
    spawner.clear();
    spawner.update(0, 114, 25000, 25000, camera);
    spawner.update(0, 120, 25000, 25000, camera);
    expect(spawner.enemies).toHaveLength(2);
  });

  it('uses the same schedule for localized game warnings and resets each stage', () => {
    const game = new Game();
    game.elapsedTime = 114;
    game.updateNotifications(0);
    const count = game.notifications.length;
    game.updateNotifications(0);
    expect(game.notifications).toHaveLength(count);
    const warning = game.notifications.find(notification => notification.kind === 'danger')!;
    expect(typeof warning.text).toBe('function');
    expect((warning.text as () => string)()).toContain('Hunter pair');
    setLanguage('zh-CN');
    expect((warning.text as () => string)()).toContain('猎手');
    game.advanceStage();
    game.elapsedTime = 114;
    game.updateNotifications(0);
    expect((game.notifications[game.notifications.length - 1].text as () => string)()).toContain('猎手');
  });
});
