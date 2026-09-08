import { describe, expect, it, vi } from 'vitest';
import { Enemy } from '../enemies';
import { MAP_WIDTH } from '../utils';
import { applyBeamDamage } from './beam';
import { LaserBeam } from './laser';
import { OrbitShield } from './orbit';
import { NovaBlast } from './nova';
import { getWeaponEvolution } from './evolutions';

vi.mock('../audio', () => ({ audio: { playShoot: vi.fn(), playExplosion: vi.fn() } }));
const modifiers = { damageMultiplier: 1, cooldownMultiplier: 1, critChance: 0, critMultiplier: 2 };
function target(x: number, y: number): Enemy {
  const enemy = new Enemy('titan', x, y);
  enemy.radius = 5;
  enemy.hp = enemy.maxHp = 1000;
  return enemy;
}
function shot(x: number, y: number) {
  return { x, y, vx: 0, vy: 0, lifetime: 5, radius: 5, damage: 10 };
}

describe('forward beam collision', () => {
  it('pierces forward targets while excluding rear, side and out-of-range enemies', () => {
    const enemies = [target(1100, 1000), target(1200, 1000), target(900, 1000), target(1100, 1030), target(1400, 1000)];
    applyBeamDamage(1000, 1000, 1100, 1000, enemies, 20, 300, 2, modifiers);
    expect(enemies.map(e => e.hp)).toEqual([980, 980, 1000, 1000, 1000]);
  });
  it('uses the forward direction across the toroidal world seam', () => {
    const forward = target(15, 1000);
    const behind = target(MAP_WIDTH - 30, 1000);
    applyBeamDamage(MAP_WIDTH - 10, 1000, 15, 1000, [forward, behind], 20, 300, 2, modifiers);
    expect(forward.hp).toBe(980);
    expect(behind.hp).toBe(1000);
  });
  it('ignores a zero-length aim', () => {
    const enemy = target(100, 100);
    applyBeamDamage(100, 100, 100, 100, [enemy], 20, 300, 2, modifiers);
    expect(enemy.hp).toBe(1000);
  });
});

describe('Prismatic Array evolution', () => {
  it('unlocks two distinct fractional-damage rays at level 8', () => {
    const laser = new LaserBeam();
    laser.level = 8;
    const enemies = [target(1100, 1000), target(1000, 1200), target(1000, 780), target(750, 1000)];
    laser.update(1 / 60, 1000, 1000, enemies, modifiers);
    expect(enemies.map(e => e.hp)).toEqual([960, 982, 982, 1000]);
  });
  it('does not split before level 8 or multiply damage against a lone boss', () => {
    const laser = new LaserBeam();
    laser.level = 7;
    const enemies = [target(1100, 1000), target(1000, 1200)];
    laser.update(1 / 60, 1000, 1000, enemies, modifiers);
    expect(enemies.map(e => e.hp)).toEqual([964, 1000]);
    const evolved = new LaserBeam();
    evolved.level = 8;
    const boss = target(1100, 1000);
    evolved.update(1 / 60, 1000, 1000, [boss], modifiers);
    expect(boss.hp).toBe(960);
  });
});

describe('Aegis Lattice evolution', () => {
  it('intercepts on contact, globally limits fire rate, and leaves distant bullets intact', () => {
    const shield = new OrbitShield();
    shield.level = 8;
    const enemy = target(2000, 2000);
    enemy.projectiles = [shot(1214, 1000), shot(1214, 1000), shot(1000, 1000)];
    shield.update(0, 1000, 1000, [enemy], modifiers);
    expect(enemy.projectiles).toHaveLength(2);
    shield.update(0.01, 1000, 1000, [enemy], modifiers);
    expect(enemy.projectiles).toHaveLength(2);
    // Follow the moving orbital to distinguish cooldown from contact geometry.
    enemy.projectiles[0].x = 1000 + Math.cos(4.4 * 0.2) * 214;
    enemy.projectiles[0].y = 1000 + Math.sin(4.4 * 0.2) * 214;
    shield.update(0.19, 1000, 1000, [enemy], modifiers);
    expect(enemy.projectiles).toHaveLength(1);
    expect(enemy.projectiles[0].x).toBe(1000);
  });
  it('does not intercept before the evolution and wraps contact across the map seam', () => {
    const shield = new OrbitShield();
    shield.level = 7;
    const enemy = target(2000, 2000);
    enemy.projectiles = [shot(1196, 1000)];
    shield.update(0, 1000, 1000, [enemy], modifiers);
    expect(enemy.projectiles).toHaveLength(1);
    shield.level = 8;
    enemy.projectiles = [shot(114, 1000)];
    shield.update(0, MAP_WIDTH - 100, 1000, [enemy], modifiers);
    expect(enemy.projectiles).toHaveLength(0);
  });
});

it('only exposes implemented evolutions after their unlock level', () => {
  expect(getWeaponEvolution('Laser Beam', 7)).toBeNull();
  expect(getWeaponEvolution('Laser Beam', 8)?.name).toBeTruthy();
  expect(getWeaponEvolution('Orbit Shield', 8)?.description).toBeTruthy();
  expect(getWeaponEvolution('Nova Blast', 8)?.name).toBeTruthy();
  expect(getWeaponEvolution('Escort Wing', 10)).toBeNull();
});

describe('Supernova Repulsor evolution', () => {
  it('deals damage once when the visible shock front arrives and repels survivors', () => {
    const nova = new NovaBlast();
    nova.level = 8;
    const enemy = target(1200, 1000);
    nova.update(0, 1000, 1000, [enemy], modifiers);
    nova.update(0.1, 1000, 1000, [enemy], modifiers);
    expect(enemy.hp).toBe(1000);
    nova.update(0.2, 1000, 1000, [enemy], modifiers);
    expect(enemy.hp).toBe(921);
    expect(enemy.x).toBe(1236);
    nova.update(0.05, 1000, 1000, [enemy], modifiers);
    expect(enemy.hp).toBe(921);
  });
  it('anchors the wave at its origin as the player moves, with boss knockback resistance', () => {
    const nova = new NovaBlast();
    nova.level = 8;
    const boss = new Enemy('boss', 1200, 1000);
    nova.update(0, 1000, 1000, [boss], modifiers);
    nova.update(0.3, 1400, 1000, [boss], modifiers);
    expect(boss.x).toBe(1206);
  });
  it('lower-level shockwaves damage without knockback', () => {
    const nova = new NovaBlast();
    nova.level = 7;
    const enemy = target(1100, 1000);
    nova.update(0, 1000, 1000, [enemy], modifiers);
    nova.update(0.3, 1000, 1000, [enemy], modifiers);
    expect(enemy.hp).toBe(929);
    expect(enemy.x).toBe(1100);
  });
});
