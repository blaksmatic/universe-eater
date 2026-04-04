import { Camera } from './camera';
import { Player } from './player';
import { Background } from './background';
import { BackgroundGeometry } from './geometry';
import { EnemySpawner } from './enemies';
import { ParticleSystem } from './particles';
import { WeaponManager } from './weapons';
import { Game, GameState } from './game';
import { UI } from './ui';
import { consumePauseTap, consumeAnyTap } from './input';
import { wrappedDistance } from './utils';

// Gameplay tuning
const CONTACT_DPS = 10;
const PROJECTILE_DAMAGE = 8;
const SHARP_HIT_THRESHOLD = 3;
const MAX_SHAKE = 5;
const BIG_KILL_RADIUS = 35;
const MAX_XP_ORBS = 6;

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let camera: Camera;
let player: Player;
let background: Background;
let geometry: BackgroundGeometry;
let spawner: EnemySpawner;
let particles: ParticleSystem;
let weaponManager: WeaponManager;
let game: Game;
const ui = new UI();

function init(): void {
  camera = new Camera(canvas.width, canvas.height);
  player = new Player();
  background = new Background();
  geometry = new BackgroundGeometry();
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

  if (dt > 0) {
    const dx = player.x - prevPlayerX;
    const dy = player.y - prevPlayerY;
    playerVx = dx / dt;
    playerVy = dy / dt;
    playerSpeed = Math.sqrt(playerVx * playerVx + playerVy * playerVy);
  }
  prevPlayerX = player.x;
  prevPlayerY = player.y;

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

  camera.updateShake(dt);
  ui.trackState(game.state, dt);

  if (game.state === GameState.TITLE) {
    background.update(dt, playerSpeed, playerVx, playerVy);
    geometry.update(dt);
    background.draw(ctx, camera, timestamp / 1000);
    geometry.draw(ctx, camera, timestamp / 1000, camera.x + camera.width / 2, camera.y + camera.height / 2);
    ui.drawTitleScreen(ctx, canvas);

  } else if (game.state === GameState.PLAYING) {
    game.elapsedTime += dt;
    if (game.timeRemaining <= 0) { game.state = GameState.VICTORY; }
    if (player.isDead()) { game.state = GameState.GAME_OVER; }

    player.update(dt);
    player.regenerate(dt);
    camera.follow(player.x, player.y);
    background.update(dt, playerSpeed, playerVx, playerVy);
    geometry.update(dt);
    spawner.update(dt, game.elapsedTime, player.x, player.y, camera);

    // Collision — skip dead enemies
    const hpBefore = player.hp;
    for (const enemy of spawner.enemies) {
      if (enemy.dead) continue;
      if (wrappedDistance(player.x, player.y, enemy.x, enemy.y) < player.radius + enemy.radius) {
        player.takeDamage(CONTACT_DPS * enemy.damageMultiplier * dt);
      }
      for (const p of enemy.projectiles) {
        if (wrappedDistance(player.x, player.y, p.x, p.y) < player.radius + p.radius) {
          player.takeDamage(PROJECTILE_DAMAGE);
          p.lifetime = 0;
        }
      }
    }

    const dmgTaken = hpBefore - player.hp;
    if (dmgTaken > SHARP_HIT_THRESHOLD) {
      camera.shake(Math.min(MAX_SHAKE, dmgTaken * 0.2), 0.12);
      particles.addDamageVignette(0.2, Math.min(0.25, dmgTaken * 0.015));
    }

    weaponManager.update(dt, player.x, player.y, spawner.enemies);
    player.updateRipples(dt);

    for (const enemy of spawner.enemies) {
      if (!enemy.dead) continue;
      particles.spawnDeath(enemy.x, enemy.y, enemy.radius, enemy.outlineColor);
      particles.spawnXpOrbs(enemy.x, enemy.y, player.x, player.y,
        Math.min(MAX_XP_ORBS, Math.ceil(enemy.xpDrop * 0.7)));
      player.kills++;

      if (enemy.radius > BIG_KILL_RADIUS) {
        camera.shake(enemy.radius * 0.08, 0.15);
      }

      const leveledUp = player.addXp(enemy.xpDrop);
      if (leveledUp && !weaponManager.allMaxed()) {
        game.applyRandomUpgrade(weaponManager);
      }
    }
    spawner.removeDead();
    particles.update(dt);
    game.updateNotifications(dt);

    background.draw(ctx, camera, timestamp / 1000);
    geometry.draw(ctx, camera, timestamp / 1000, player.x, player.y);
    spawner.draw(ctx, camera, timestamp / 1000);
    particles.draw(ctx, camera);
    weaponManager.draw(ctx, camera, player.x, player.y, player.radius);
    player.draw(ctx, camera);
    background.drawWrapZone(ctx, camera);
    ui.drawVignette(ctx, canvas.width, canvas.height, player.hp / player.maxHp);
    particles.drawScreenEffects(ctx, canvas.width, canvas.height);
    ui.drawHUD(ctx, canvas, game, player, weaponManager);
    ui.drawNotifications(ctx, canvas, game);

  } else if (game.state === GameState.PAUSED) {
    background.draw(ctx, camera, timestamp / 1000);
    geometry.draw(ctx, camera, timestamp / 1000, player.x, player.y);
    spawner.draw(ctx, camera, timestamp / 1000);
    weaponManager.draw(ctx, camera, player.x, player.y, player.radius);
    player.draw(ctx, camera);
    background.drawWrapZone(ctx, camera);
    ui.drawHUD(ctx, canvas, game, player, weaponManager);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '18px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Press ESC or tap II to resume', canvas.width / 2, canvas.height / 2 + 30);

  } else if (game.state === GameState.GAME_OVER) {
    background.draw(ctx, camera, timestamp / 1000);
    geometry.draw(ctx, camera, timestamp / 1000, player.x, player.y);
    ui.drawGameOver(ctx, canvas, player, game);

  } else if (game.state === GameState.VICTORY) {
    background.draw(ctx, camera, timestamp / 1000);
    geometry.draw(ctx, camera, timestamp / 1000, player.x, player.y);
    ui.drawVictory(ctx, canvas, player);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame((t) => {
  lastTime = t;
  gameLoop(t);
});
