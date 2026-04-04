import { Camera } from './camera';
import { Player } from './player';
import { Background } from './background';
import { BackgroundGeometry } from './geometry';
import { EnemySpawner } from './enemies';
import { ParticleSystem } from './particles';
import { WeaponManager } from './weapons';
import { wrappedDistance } from './utils';

const CONTACT_HIT_DAMAGE = 9;
const PROJECTILE_DAMAGE = 8;
const SHARP_HIT_THRESHOLD = 0.5;
const MAX_SHAKE = 5;
const BIG_KILL_RADIUS = 35;
const MAX_XP_ORBS = 6;
const LEVEL_UP_BLAST_RADIUS = 260;
const LEVEL_UP_BLAST_DAMAGE = 120;

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

  private prevPlayerX: number;
  private prevPlayerY: number;
  private playerSpeed = 0;
  private playerVx = 0;
  private playerVy = 0;

  constructor(width: number, height: number) {
    this.camera = new Camera(width, height);
    this.player = new Player();
    this.background = new Background();
    this.geometry = new BackgroundGeometry();
    this.spawner = new EnemySpawner();
    this.particles = new ParticleSystem();
    this.weaponManager = new WeaponManager();
    this.weaponManager.setOnLaserFire((angle) => this.player.addRipple(angle));

    this.prevPlayerX = this.player.x;
    this.prevPlayerY = this.player.y;
  }

  resize(width: number, height: number): void {
    this.camera.resize(width, height);
  }

  updateTitle(dt: number): void {
    this.sampleMotion(dt);
    this.background.update(dt, this.playerSpeed, this.playerVx, this.playerVy);
    this.geometry.update(dt);
  }

  updatePlaying(dt: number, elapsedTime: number): WorldUpdateResult {
    this.sampleMotion(dt);

    this.player.update(dt);
    this.player.regenerate(dt);
    this.camera.follow(this.player.x, this.player.y);
    this.background.update(dt, this.playerSpeed, this.playerVx, this.playerVy);
    this.geometry.update(dt);
    this.spawner.update(dt, elapsedTime, this.player.x, this.player.y, this.camera);

    this.applyCollisions();
    this.weaponManager.update(dt, this.player.x, this.player.y, this.spawner.enemies);
    this.player.updateRipples(dt);

    const levelUps = this.consumeDefeatedEnemies();
    this.spawner.removeDead();
    this.particles.update(dt);

    return { levelUps };
  }

  drawTitle(ctx: CanvasRenderingContext2D, time: number): void {
    this.background.draw(ctx, this.camera, time);
    this.geometry.draw(
      ctx,
      this.camera,
      time,
      this.camera.x + this.camera.width / 2,
      this.camera.y + this.camera.height / 2,
    );
  }

  drawPlayfield(ctx: CanvasRenderingContext2D, time: number): void {
    this.background.draw(ctx, this.camera, time);
    this.geometry.draw(ctx, this.camera, time, this.player.x, this.player.y);
    this.spawner.draw(ctx, this.camera, time);
    this.particles.draw(ctx, this.camera);
    this.weaponManager.draw(ctx, this.camera, this.player.x, this.player.y, this.player.radius);
    this.player.draw(ctx, this.camera);
    this.background.drawWrapZone(ctx, this.camera);
  }

  drawPausedScene(ctx: CanvasRenderingContext2D, time: number): void {
    this.background.draw(ctx, this.camera, time);
    this.geometry.draw(ctx, this.camera, time, this.player.x, this.player.y);
    this.spawner.draw(ctx, this.camera, time);
    this.weaponManager.draw(ctx, this.camera, this.player.x, this.player.y, this.player.radius);
    this.player.draw(ctx, this.camera);
    this.background.drawWrapZone(ctx, this.camera);
  }

  drawEndBackdrop(ctx: CanvasRenderingContext2D, time: number): void {
    this.background.draw(ctx, this.camera, time);
    this.geometry.draw(ctx, this.camera, time, this.player.x, this.player.y);
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

  private sampleMotion(dt: number): void {
    if (dt > 0) {
      const dx = this.player.x - this.prevPlayerX;
      const dy = this.player.y - this.prevPlayerY;
      this.playerVx = dx / dt;
      this.playerVy = dy / dt;
      this.playerSpeed = Math.sqrt(this.playerVx * this.playerVx + this.playerVy * this.playerVy);
    }
    this.prevPlayerX = this.player.x;
    this.prevPlayerY = this.player.y;
  }

  private applyCollisions(): void {
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

  private consumeDefeatedEnemies(): number {
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
}
