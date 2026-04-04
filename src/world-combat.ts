import { Camera } from './camera';
import { EnemySpawner } from './enemies';
import { ParticleSystem } from './particles';
import { Player } from './player';
import { wrappedDistance } from './utils';

const CONTACT_HIT_DAMAGE = 9;
const PROJECTILE_DAMAGE = 8;
const SHARP_HIT_THRESHOLD = 0.5;
const MAX_SHAKE = 5;
const BIG_KILL_RADIUS = 35;
const MAX_XP_ORBS = 6;
const LEVEL_UP_BLAST_RADIUS = 260;
const LEVEL_UP_BLAST_DAMAGE = 120;

export class WorldCombatSystem {
  constructor(
    private readonly player: Player,
    private readonly spawner: EnemySpawner,
    private readonly particles: ParticleSystem,
    private readonly camera: Camera,
  ) {}

  applyCollisions(): void {
    const hpBefore = this.player.hp;

    for (const enemy of this.spawner.enemies) {
      if (enemy.dead) continue;

      if (wrappedDistance(this.player.x, this.player.y, enemy.x, enemy.y) < this.player.radius + enemy.radius) {
        this.player.takeContactHit(CONTACT_HIT_DAMAGE * enemy.damageMultiplier);
      }

      for (const projectile of enemy.projectiles) {
        if (wrappedDistance(this.player.x, this.player.y, projectile.x, projectile.y) < this.player.radius + projectile.radius) {
          this.player.takeDamage(PROJECTILE_DAMAGE);
          projectile.lifetime = 0;
        }
      }
    }

    const damageTaken = hpBefore - this.player.hp;
    if (damageTaken > 0) {
      const shakeStrength = damageTaken > SHARP_HIT_THRESHOLD
        ? Math.min(MAX_SHAKE, damageTaken * 0.2)
        : Math.min(2, damageTaken * 0.35);
      this.camera.shake(shakeStrength, 0.12);
      this.particles.addDamageVignette(0.2, Math.min(0.28, 0.07 + damageTaken * 0.012));
    }
  }

  consumeDefeatedEnemies(): number {
    let levelUps = 0;

    for (const enemy of this.spawner.enemies) {
      if (!enemy.dead) continue;

      this.particles.spawnDeath(enemy.x, enemy.y, enemy.radius, enemy.outlineColor);
      this.particles.spawnXpOrbs(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y,
        Math.min(MAX_XP_ORBS, Math.ceil(enemy.xpDrop * 0.7)),
      );
      this.player.kills++;

      if (enemy.radius > BIG_KILL_RADIUS) {
        this.camera.shake(enemy.radius * 0.08, 0.15);
      }

      if (this.player.addXp(enemy.xpDrop)) {
        levelUps++;
      }
    }

    return levelUps;
  }

  triggerLevelUpBlast(levelUps: number): void {
    if (levelUps <= 0) return;

    const radius = LEVEL_UP_BLAST_RADIUS + (levelUps - 1) * 50;
    const damage = LEVEL_UP_BLAST_DAMAGE + (levelUps - 1) * 35;

    for (const enemy of this.spawner.enemies) {
      if (enemy.dead) continue;

      const distance = wrappedDistance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > radius + enemy.radius) continue;

      const falloff = 1 - Math.min(0.7, distance / radius * 0.7);
      enemy.takeDamage(damage * falloff);

      for (const projectile of enemy.projectiles) {
        if (wrappedDistance(this.player.x, this.player.y, projectile.x, projectile.y) <= radius) {
          projectile.lifetime = 0;
        }
      }
    }

    this.camera.shake(Math.min(8, 4 + levelUps * 1.4), 0.18);
    this.particles.spawnFlash(this.player.x, this.player.y, radius * 0.22);
    this.particles.addScreenFlash(120, 200, 255, 0.12, 0.18);
  }
}
