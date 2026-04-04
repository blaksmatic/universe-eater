import { Camera } from './camera';
import { Player } from './player';
import { Background } from './background';
import { BackgroundGeometry } from './geometry';
import { EnemySpawner } from './enemies';
import { ParticleSystem } from './particles';
import { WeaponManager } from './weapons';
import { WorldCombatSystem } from './world-combat';
import { WorldMotionTracker } from './world-motion';
import { WorldRenderer } from './world-renderer';

export interface WorldUpdateResult {
  levelUps: number;
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
    this.spawner.setStage(1);
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
    this.motion.sample(this.player, dt);
    this.camera.follow(this.player.x, this.player.y);
    this.background.update(dt, this.motion.speed, this.motion.vx, this.motion.vy);
    this.geometry.update(dt);
    this.spawner.update(dt, elapsedTime, this.player.x, this.player.y, this.camera);

    this.combat.applyCollisions();
    this.weaponManager.update(dt, this.player.x, this.player.y, this.spawner.enemies);
    this.player.updateRipples(dt);

    const levelUps = this.combat.consumeDefeatedEnemies();
    this.spawner.removeDead();
    this.particles.update(dt);

    return { levelUps };
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

  prepareNextStage(stage: number): void {
    this.spawner.setStage(stage);
    this.spawner.clear();
    this.particles.clear();
    this.camera.follow(this.player.x, this.player.y);
    this.motion.reset(this.player);
  }

  triggerLevelUpBlast(levelUps: number): void {
    this.combat.triggerLevelUpBlast(levelUps);
  }
}
