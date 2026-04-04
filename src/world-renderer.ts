import { Background } from './background';
import { Camera } from './camera';
import { EnemySpawner } from './enemies';
import { BackgroundGeometry } from './geometry';
import { ParticleSystem } from './particles';
import { Player } from './player';
import { WeaponManager } from './weapons';

type WorldRenderDeps = {
  background: Background;
  camera: Camera;
  geometry: BackgroundGeometry;
  particles: ParticleSystem;
  player: Player;
  spawner: EnemySpawner;
  weaponManager: WeaponManager;
};

export class WorldRenderer {
  constructor(private readonly deps: WorldRenderDeps) {}

  drawTitle(ctx: CanvasRenderingContext2D, time: number): void {
    this.deps.background.draw(ctx, this.deps.camera, time);
    this.deps.geometry.draw(
      ctx,
      this.deps.camera,
      time,
      this.deps.camera.x + this.deps.camera.width / 2,
      this.deps.camera.y + this.deps.camera.height / 2,
    );
  }

  drawPlayfield(ctx: CanvasRenderingContext2D, time: number, renderEntityBodies = true): void {
    this.deps.background.draw(ctx, this.deps.camera, time);
    this.deps.geometry.draw(ctx, this.deps.camera, time, this.deps.player.x, this.deps.player.y);
    if (renderEntityBodies) {
      this.deps.spawner.draw(ctx, this.deps.camera, time);
    } else {
      this.deps.spawner.drawProjectiles(ctx, this.deps.camera);
    }
    this.deps.particles.draw(ctx, this.deps.camera);
    this.deps.weaponManager.draw(ctx, this.deps.camera, this.deps.player.x, this.deps.player.y, this.deps.player.radius);
    if (renderEntityBodies) {
      this.deps.player.draw(ctx, this.deps.camera);
    } else {
      this.deps.player.drawEffects(ctx, this.deps.camera);
    }
    this.deps.background.drawWrapZone(ctx, this.deps.camera);
  }

  drawPausedScene(ctx: CanvasRenderingContext2D, time: number, renderEntityBodies = true): void {
    this.deps.background.draw(ctx, this.deps.camera, time);
    this.deps.geometry.draw(ctx, this.deps.camera, time, this.deps.player.x, this.deps.player.y);
    if (renderEntityBodies) {
      this.deps.spawner.draw(ctx, this.deps.camera, time);
    } else {
      this.deps.spawner.drawProjectiles(ctx, this.deps.camera);
    }
    this.deps.weaponManager.draw(ctx, this.deps.camera, this.deps.player.x, this.deps.player.y, this.deps.player.radius);
    if (renderEntityBodies) {
      this.deps.player.draw(ctx, this.deps.camera);
    } else {
      this.deps.player.drawEffects(ctx, this.deps.camera);
    }
    this.deps.background.drawWrapZone(ctx, this.deps.camera);
  }

  drawEndBackdrop(ctx: CanvasRenderingContext2D, time: number): void {
    this.deps.background.draw(ctx, this.deps.camera, time);
    this.deps.geometry.draw(ctx, this.deps.camera, time, this.deps.player.x, this.deps.player.y);
  }
}
