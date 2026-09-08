import { describe, expect, it } from 'vitest';
import { Player } from './player';
import { Enemy, EnemySpawner } from './enemies';
import { Camera } from './camera';
import { ParticleSystem } from './particles';
import { WorldCombatSystem } from './world-combat';

function setup() {
  const player = new Player();
  const spawner = new EnemySpawner();
  const combat = new WorldCombatSystem(player, spawner, new ParticleSystem(), new Camera(800, 600));
  return { player, spawner, combat };
}

describe('Combat feedback and rewards', () => {
  it('records only accepted damage and preserves the killing source', () => {
    const p = new Player();
    p.hp = 10;
    p.takeDamage(30, { enemy: 'sentinel', kind: 'projectile', x: 10, y: 20 });
    p.takeDamage(30, { enemy: 'swarmer', kind: 'contact', x: 30, y: 40 });
    expect(p.lastDamageSource?.enemy).toBe('sentinel');
    expect(p.damageTaken).toBe(10);
    expect(p.hitsTaken).toBe(1);
  });
  it('ignores destroyed projectiles when resolving collisions', () => {
    const { player, spawner, combat } = setup();
    const enemy = new Enemy('spitter', player.x + 500, player.y);
    enemy.projectiles.push({ x: player.x, y: player.y, vx: 0, vy: 0, radius: 5, damage: 20, lifetime: 0 });
    spawner.enemies.push(enemy);
    combat.applyCollisions();
    expect(player.hp).toBe(100);
    expect(player.lastDamageSource).toBeNull();
  });
  it('queues all levels from a large reward without requiring another kill', () => {
    const { player, spawner, combat } = setup();
    const enemy = new Enemy('titan', player.x + 100, player.y);
    enemy.dead = true;
    enemy.xpDrop = 30;
    spawner.enemies.push(enemy);
    const result = combat.consumeDefeatedEnemies();
    expect(result.levelUps).toBe(3);
    expect(player.level).toBe(4);
    expect(player.xp).toBe(4);
  });
  it('rejects invalid damage and XP without corrupting state', () => {
    const p = new Player();
    expect(p.takeDamage(NaN)).toBe(false);
    expect(p.addXp(Infinity)).toBe(false);
    expect(p.addXp(-1)).toBe(false);
    expect(p.hp).toBe(100);
    expect(p.xp).toBe(0);
  });
});
