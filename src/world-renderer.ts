import { Background } from './background';
import { Camera } from './camera';
import { EnemySpawner } from './enemies';
import { BackgroundGeometry } from './geometry';
import { ParticleSystem } from './particles';
import { Player } from './player';
import { WeaponManager } from './weapons';
import { TWO_PI } from './utils';

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

  /**
   * Threat auras drawn on the 2D layer (which sits above the 3D overlay),
   * so bosses and elites stay readable even when their 3D bodies blend
   * into a dark backdrop.
   */
  private drawThreatAuras(ctx: CanvasRenderingContext2D, time: number): void {
    for (const enemy of this.deps.spawner.enemies) {
      if (enemy.dead) continue;
      if (!enemy.isBoss && !enemy.isElite) continue;
      const screen = this.deps.camera.worldToScreen(enemy.x, enemy.y);
      if (!this.deps.camera.isVisible(enemy.x, enemy.y, enemy.radius + 120)) continue;
      const pulse = 0.5 + 0.5 * Math.sin(time * (enemy.isBoss ? 3 : 2) + enemy.x * 0.01);

      if (enemy.isBoss) {
        const r = enemy.radius * 1.5;
        const grad = ctx.createRadialGradient(screen.x, screen.y, r * 0.5, screen.x, screen.y, r);
        grad.addColorStop(0, 'rgba(255, 40, 80, 0)');
        grad.addColorStop(0.75, `rgba(255, 40, 80, ${0.1 + pulse * 0.08})`);
        grad.addColorStop(1, 'rgba(255, 40, 80, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, r, 0, TWO_PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(screen.x, screen.y, enemy.radius * 1.18, 0, TWO_PI);
        ctx.strokeStyle = `rgba(255, 90, 120, ${0.5 + pulse * 0.3})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, enemy.radius * 1.32, 0, TWO_PI);
        ctx.strokeStyle = `rgba(205, 145, 255, ${0.28 + pulse * 0.18})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

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
    this.drawThreatAuras(ctx, time);
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
