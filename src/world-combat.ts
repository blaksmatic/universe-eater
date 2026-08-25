import { Camera } from './camera';
import { EnemySpawner } from './enemies';
import { ParticleSystem } from './particles';
import { Player } from './player';
import { wrappedDistanceSquared, wrappedCirclesOverlap } from './utils';
import { audio } from './audio';
import { loadSettings } from './storage';

const CONTACT_HIT_DAMAGE = 9;
const SHARP_HIT_THRESHOLD = 0.5;
const MAX_SHAKE = 5;
const BIG_KILL_RADIUS = 35;
const MAX_XP_ORBS = 6;
const LEVEL_UP_BLAST_RADIUS = 260;
const LEVEL_UP_BLAST_DAMAGE = 120;

const COMBO_WINDOW = 3.2;
const COMBO_MILESTONE = 10;

export interface CombatFrameResult {
  levelUps: number;
  kills: number;
  bossKilled: boolean;
}

export class WorldCombatSystem {
  comboCount = 0;
  comboBest = 0;
  /** Incremented every time the combo hits a milestone (for UI/audio pops). */
  milestoneEvents = 0;
  private comboTimer = 0;
  private comboMilestoneFlash = 0;

  constructor(
    private readonly player: Player,
    private readonly spawner: EnemySpawner,
    private readonly particles: ParticleSystem,
    private readonly camera: Camera,
  ) {}

  get comboMilestoneRatio(): number {
    return Math.max(0, this.comboMilestoneFlash / 0.6);
  }

  updateCombo(dt: number): void {
    if (this.comboCount > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }
    if (this.comboMilestoneFlash > 0) {
      this.comboMilestoneFlash -= dt;
    }
  }

  applyCollisions(): void {
    const hpBefore = this.player.hp;
    const px = this.player.x;
    const py = this.player.y;
    const pr = this.player.radius;

    for (const enemy of this.spawner.enemies) {
      if (enemy.dead) continue;

      if (wrappedCirclesOverlap(px, py, pr, enemy.x, enemy.y, enemy.radius)) {
        this.player.takeContactHit(CONTACT_HIT_DAMAGE * enemy.damageMultiplier);
      }

      // Inline projectile checks with squared distance to avoid sqrt + allocation
      for (const projectile of enemy.projectiles) {
        if (wrappedCirclesOverlap(px, py, pr, projectile.x, projectile.y, projectile.radius)) {
          this.player.takeDamage(projectile.damage);
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
      audio.playPlayerHurt();
    }
  }

  consumeDefeatedEnemies(): CombatFrameResult {
    let levelUps = 0;
    let kills = 0;
    let bossKilled = false;

    // Snapshot dead enemies first — remains (splitter shards) get appended below.
    // Manual collect to avoid filter allocation when none dead (common case)
    let deadCount = 0;
    for (const e of this.spawner.enemies) if (e.dead) deadCount++;
    if (deadCount === 0) return { levelUps, kills, bossKilled };
    const deadEnemies: typeof this.spawner.enemies = [];
    for (const e of this.spawner.enemies) if (e.dead) deadEnemies.push(e);

    for (const enemy of deadEnemies) {
      this.particles.spawnDeath(enemy.x, enemy.y, enemy.radius, enemy.outlineColor);

      if (!enemy.noXp) {
        this.particles.spawnXpOrbs(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y,
          Math.min(MAX_XP_ORBS, Math.ceil(enemy.xpDrop * 0.7)),
        );
        this.player.kills++;
        kills++;

        // Combo chain
        this.comboCount++;
        this.comboTimer = COMBO_WINDOW;
        if (this.comboCount > this.comboBest) this.comboBest = this.comboCount;
        if (this.comboCount % COMBO_MILESTONE === 0) {
          this.comboMilestoneFlash = 0.6;
          this.milestoneEvents++;
          audio.playComboMilestone(this.comboCount);
          // Milestone reward: bonus XP orbs burst from the kill site.
          this.particles.spawnXpOrbs(enemy.x, enemy.y, this.player.x, this.player.y, 3);
        }

        // Vampiric nanites
        if (this.player.healOnKill > 0) {
          this.player.heal(this.player.healOnKill);
        }

        // Remains (splitter splits into shards)
        this.spawner.handleDeathEffects(enemy);
      }

      if (enemy.isBoss) {
        bossKilled = true;
        this.camera.shake(10, 0.5);
        for (let i = 0; i < 6; i++) {
          this.particles.spawnFlash(
            enemy.x + (Math.random() - 0.5) * enemy.radius * 2,
            enemy.y + (Math.random() - 0.5) * enemy.radius * 2,
            enemy.radius * 0.4,
          );
        }
        this.particles.addScreenFlash(255, 220, 230, 0.22, 0.5);
      } else if (enemy.radius > BIG_KILL_RADIUS) {
        this.camera.shake(enemy.radius * 0.08, 0.15);
      }

      if (!enemy.noXp && this.player.addXp(enemy.xpDrop)) {
        levelUps++;
      }
    }

    return { levelUps, kills, bossKilled };
  }

  /** Called by the weapon hit sink for floating damage numbers. */
  reportWeaponHit(x: number, y: number, amount: number, crit: boolean): void {
    if (!loadSettings().damageNumbersEnabled) return;
    this.particles.spawnDamageNumber(x, y - 8, amount, crit);
    if (crit) {
      audio.playCrit();
    }
  }

  triggerLevelUpBlast(levelUps: number): void {
    if (levelUps <= 0) return;

    const radius = LEVEL_UP_BLAST_RADIUS + (levelUps - 1) * 50;
    const damage = LEVEL_UP_BLAST_DAMAGE + (levelUps - 1) * 35;

    const px = this.player.x;
    const py = this.player.y;
    const radiusSq = radius * radius;
    for (const enemy of this.spawner.enemies) {
      if (enemy.dead) continue;

      const distSq = wrappedDistanceSquared(px, py, enemy.x, enemy.y);
      const maxDist = radius + enemy.radius;
      if (distSq > maxDist * maxDist) continue;

      const distance = Math.sqrt(distSq);
      const falloff = 1 - Math.min(0.7, distance / radius * 0.7);
      enemy.takeDamage(damage * falloff);

      for (const projectile of enemy.projectiles) {
        if (wrappedDistanceSquared(px, py, projectile.x, projectile.y) <= radiusSq) {
          projectile.lifetime = 0;
        }
      }
    }

    this.camera.shake(Math.min(8, 4 + levelUps * 1.4), 0.18);
    this.particles.spawnFlash(this.player.x, this.player.y, radius * 0.22);
    this.particles.addScreenFlash(120, 200, 255, 0.12, 0.18);
  }
}
