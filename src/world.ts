import { Camera } from './camera';
import { Player } from './player';
import { Background } from './background';
import { BackgroundGeometry } from './geometry';
import { EnemySpawner } from './enemies';
import { ParticleSystem } from './particles';
import { WeaponManager } from './weapons';
import { WorldCombatSystem, CombatFrameResult } from './world-combat';
import { WorldMotionTracker } from './world-motion';
import { WorldRenderer } from './world-renderer';
import { composeSpawnMods, type MutatorId } from './mutators';

export interface WorldUpdateResult extends CombatFrameResult {
  levelUps: number;
  bossPhaseEvents: number;
}

export class GameWorld {
  readonly camera: Camera;
  readonly player: Player;
  readonly background: Background;
  readonly geometry: BackgroundGeometry;
  readonly spawner: EnemySpawner;
  readonly particles: ParticleSystem;
  readonly weaponManager: WeaponManager;
  private readonly combat: WorldCombatSystem;
  private readonly motion: WorldMotionTracker;
  private readonly renderer: WorldRenderer;

  constructor(width: number, height: number) {
    this.camera = new Camera(width, height);
    this.player = new Player();
    this.background = new Background();
    this.geometry = new BackgroundGeometry();
    this.spawner = new EnemySpawner();
    this.spawner.setStage(1, 300);
    this.particles = new ParticleSystem();
    this.weaponManager = new WeaponManager();
    this.weaponManager.setOnLaserFire((angle) => this.player.addRipple(angle));
    this.combat = new WorldCombatSystem(this.player, this.spawner, this.particles, this.camera);
    this.motion = new WorldMotionTracker(this.player);
    this.renderer = new WorldRenderer({
      background: this.background,
      camera: this.camera,
      geometry: this.geometry,
      particles: this.particles,
      player: this.player,
      spawner: this.spawner,
      weaponManager: this.weaponManager,
    });

    // Route weapon hits into floating damage numbers.
    this.weaponManager.modifiers.onHit = (enemy, amount, crit) => {
      if (crit || amount >= 1) {
        this.combat.reportWeaponHit(enemy.x, enemy.y, amount, crit);
      }
    };
  }

  get combatSystem(): WorldCombatSystem {
    return this.combat;
  }

  resize(width: number, height: number): void {
    this.camera.resize(width, height);
  }

  updateTitle(dt: number): void {
    this.motion.sample(this.player, dt);
    this.background.update(dt, this.motion.speed, this.motion.vx, this.motion.vy);
    this.geometry.update(dt);
  }

  updatePlaying(dt: number, elapsedTime: number): WorldUpdateResult {
    this.player.update(dt);
    this.player.regenerate(dt);
    this.player.updateRipples(dt);
    this.motion.sample(this.player, dt);
    this.camera.follow(this.player.x, this.player.y);
    this.background.update(dt, this.motion.speed, this.motion.vx, this.motion.vy);
    this.geometry.update(dt);
    this.spawner.update(dt, elapsedTime, this.player.x, this.player.y, this.camera);

    // Sync player-derived weapon stats.
    this.weaponManager.modifiers.critChance = this.player.critChance;
    this.weaponManager.modifiers.critMultiplier = this.player.critMultiplier;

    this.combat.applyCollisions();
    this.combat.updateCombo(dt);
    this.weaponManager.update(dt, this.player.x, this.player.y, this.spawner.enemies);

    const result = this.combat.consumeDefeatedEnemies();
    this.spawner.removeDead();
    const bossPhaseEvents = this.spawner.drainBossPhaseEvents();
    if (bossPhaseEvents > 0) {
      // Phase transition: sweep the boss's bullets for a breathing-room beat.
      const boss = this.spawner.activeBoss;
      if (boss) boss.projectiles = [];
    }
    this.particles.update(dt);

    return { ...result, levelUps: result.levelUps, bossPhaseEvents };
  }

  /** Clear every hostile bullet on the field (boss death sweep). */
  clearHostileBullets(): void {
    for (const enemy of this.spawner.enemies) {
      enemy.projectiles = [];
    }
  }

  drawTitle(ctx: CanvasRenderingContext2D, time: number): void {
    this.renderer.drawTitle(ctx, time);
  }

  drawPlayfield(ctx: CanvasRenderingContext2D, time: number, renderEntityBodies = true): void {
    this.renderer.drawPlayfield(ctx, time, renderEntityBodies);
  }

  drawPausedScene(ctx: CanvasRenderingContext2D, time: number, renderEntityBodies = true): void {
    this.renderer.drawPausedScene(ctx, time, renderEntityBodies);
  }

  drawEndBackdrop(ctx: CanvasRenderingContext2D, time: number): void {
    this.renderer.drawEndBackdrop(ctx, time);
  }

  prepareNextStage(stage: number, stageDuration: number, mutators: MutatorId[] = []): void {
    this.spawner.setStage(stage, stageDuration, composeSpawnMods(mutators));
    this.spawner.clear();
    this.particles.clear();
    this.camera.follow(this.player.x, this.player.y);
    this.motion.reset(this.player);
  }

  spawnBoss(): void {
    const boss = this.spawner.spawnBoss(this.player.x, this.player.y);
    this.camera.shake(7, 0.6);
    this.particles.addScreenFlash(255, 60, 90, 0.14, 0.6);
    void boss;
  }

  triggerLevelUpBlast(levelUps: number): void {
    this.combat.triggerLevelUpBlast(levelUps);
  }
}
