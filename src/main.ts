import { Camera } from './camera';
import { Player } from './player';
import { Background } from './background';
import { EnemySpawner } from './enemies';
import { ParticleSystem } from './particles';
import { WeaponManager } from './weapons';
import { Game, GameState } from './game';
import { UI } from './ui';
import { consumePauseTap, consumeAnyTap } from './input';
import { wrappedDistance } from './utils';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let camera: Camera;
let player: Player;
let background: Background;
let spawner: EnemySpawner;
let particles: ParticleSystem;
let weaponManager: WeaponManager;
let game: Game;
const ui = new UI();

function init(): void {
  camera = new Camera(canvas.width, canvas.height);
  player = new Player();
  background = new Background();
  spawner = new EnemySpawner();
  particles = new ParticleSystem();
  weaponManager = new WeaponManager();
  weaponManager.setOnLaserFire((angle) => player.addRipple(angle));
  game = new Game();
}

let lastTime = 0;
let prevPlayerX = 0;
let prevPlayerY = 0;
let playerSpeed = 0;
let playerVx = 0;
let playerVy = 0;

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (camera) camera.resize(canvas.width, canvas.height);
}

window.addEventListener('resize', resize);
resize();
init();

// Input handlers
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && game.state === GameState.PLAYING) {
    game.state = GameState.PAUSED;
    return;
  }
  if (e.key === 'Escape' && game.state === GameState.PAUSED) {
    game.state = GameState.PLAYING;
    return;
  }
  if (game.state === GameState.TITLE) {
    game.state = GameState.PLAYING;
  } else if (game.state === GameState.GAME_OVER || game.state === GameState.VICTORY) {
    init();
    game.state = GameState.PLAYING;
  }
});

function gameLoop(timestamp: number): void {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  // Track player velocity for star drift and streaking
  if (dt > 0) {
    const dx = player.x - prevPlayerX;
    const dy = player.y - prevPlayerY;
    playerVx = dx / dt;
    playerVy = dy / dt;
    playerSpeed = Math.sqrt(playerVx * playerVx + playerVy * playerVy);
  }
  prevPlayerX = player.x;
  prevPlayerY = player.y;

  // Touch controls
  if (consumePauseTap()) {
    if (game.state === GameState.PLAYING) game.state = GameState.PAUSED;
    else if (game.state === GameState.PAUSED) game.state = GameState.PLAYING;
  }
  if (consumeAnyTap()) {
    if (game.state === GameState.TITLE) game.state = GameState.PLAYING;
    else if (game.state === GameState.GAME_OVER || game.state === GameState.VICTORY) {
      init();
      game.state = GameState.PLAYING;
    }
  }

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (game.state === GameState.TITLE) {
    background.update(dt, playerSpeed, playerVx, playerVy);
    background.draw(ctx, camera, timestamp / 1000);
    ui.drawTitleScreen(ctx, canvas);

  } else if (game.state === GameState.PLAYING) {
    game.elapsedTime += dt;
    if (game.timeRemaining <= 0) { game.state = GameState.VICTORY; }
    if (player.isDead()) { game.state = GameState.GAME_OVER; }

    player.update(dt);
    player.regenerate(dt);
    camera.follow(player.x, player.y);
    background.update(dt, playerSpeed, playerVx, playerVy);
    spawner.update(dt, game.elapsedTime, player.x, player.y, camera);

    // Collision damage
    const baseDmg = 10;
    for (const enemy of spawner.enemies) {
      if (wrappedDistance(player.x, player.y, enemy.x, enemy.y) < player.radius + enemy.radius) {
        player.takeDamage(baseDmg * enemy.damageMultiplier * dt);
      }
      // Boss projectile hits
      for (const p of enemy.projectiles) {
        if (wrappedDistance(player.x, player.y, p.x, p.y) < player.radius + p.radius) {
          player.takeDamage(8);
          p.lifetime = 0;
        }
      }
    }

    // Weapons
    weaponManager.update(dt, player.x, player.y, spawner.enemies);
    player.updateRipples(dt);

    // XP from dead enemies
    for (const enemy of spawner.enemies) {
      if (enemy.dead) {
        particles.spawnDeath(enemy.x, enemy.y, enemy.radius, enemy.outlineColor);
        player.kills++;
        const leveledUp = player.addXp(enemy.xpDrop);
        if (leveledUp && !weaponManager.allMaxed()) {
          game.applyRandomUpgrade(weaponManager);
        }
      }
    }
    spawner.removeDead();
    particles.update(dt);
    game.updateNotifications(dt);

    // Draw
    background.draw(ctx, camera, timestamp / 1000);
    spawner.draw(ctx, camera, timestamp / 1000);
    particles.draw(ctx, camera);
    weaponManager.draw(ctx, camera, player.x, player.y, player.radius);
    player.draw(ctx, camera);
    background.drawWrapZone(ctx, camera);
    ui.drawHUD(ctx, canvas, game, player, weaponManager);
    ui.drawNotifications(ctx, canvas, game);

  } else if (game.state === GameState.PAUSED) {
    background.draw(ctx, camera, timestamp / 1000);
    spawner.draw(ctx, camera, timestamp / 1000);
    weaponManager.draw(ctx, camera, player.x, player.y, player.radius);
    player.draw(ctx, camera);
    background.drawWrapZone(ctx, camera);
    ui.drawHUD(ctx, canvas, game, player, weaponManager);

    // Dim overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pause text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '18px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Press ESC or tap II to resume', canvas.width / 2, canvas.height / 2 + 30);

  } else if (game.state === GameState.GAME_OVER) {
    background.draw(ctx, camera, timestamp / 1000);
    ui.drawGameOver(ctx, canvas, player, game);

  } else if (game.state === GameState.VICTORY) {
    background.draw(ctx, camera, timestamp / 1000);
    ui.drawVictory(ctx, canvas, player);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame((t) => {
  lastTime = t;
  gameLoop(t);
});
