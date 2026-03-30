import { Camera } from './camera';
import { Player } from './player';
import { Background } from './background';
import { EnemySpawner } from './enemies';
import { ParticleSystem } from './particles';
import { WeaponManager } from './weapons';
import { Game, GameState } from './game';
import { UI } from './ui';
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
  game = new Game();
}

let lastTime = 0;

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
  if (game.state === GameState.LEVEL_UP) {
    const num = parseInt(e.key);
    if (num >= 1 && num <= game.levelUpChoices.length) {
      game.applyLevelUpChoice(num - 1, weaponManager);
      game.state = GameState.PLAYING;
    }
  } else if (game.state === GameState.TITLE) {
    game.state = GameState.PLAYING;
  } else if (game.state === GameState.GAME_OVER || game.state === GameState.VICTORY) {
    init();
    game.state = GameState.PLAYING;
  }
});

canvas.addEventListener('click', (e) => {
  if (game.state === GameState.LEVEL_UP) {
    const choices = game.levelUpChoices;
    const boxW = 200, boxH = 80, gap = 20;
    const totalW = choices.length * boxW + (choices.length - 1) * gap;
    const startX = (canvas.width - totalW) / 2;
    const boxY = canvas.height / 2 - 30;

    for (let i = 0; i < choices.length; i++) {
      const bx = startX + i * (boxW + gap);
      if (e.clientX >= bx && e.clientX <= bx + boxW && e.clientY >= boxY && e.clientY <= boxY + boxH) {
        game.applyLevelUpChoice(i, weaponManager);
        game.state = GameState.PLAYING;
        break;
      }
    }
  }
});

function gameLoop(timestamp: number): void {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (game.state === GameState.TITLE) {
    background.update(dt);
    background.draw(ctx, camera, timestamp / 1000);
    ui.drawTitleScreen(ctx, canvas);

  } else if (game.state === GameState.PLAYING) {
    game.elapsedTime += dt;
    if (game.timeRemaining <= 0) { game.state = GameState.VICTORY; }
    if (player.isDead()) { game.state = GameState.GAME_OVER; }

    player.update(dt);
    camera.follow(player.x, player.y);
    background.update(dt);
    spawner.update(dt, game.elapsedTime, player.x, player.y, camera);

    // Collision damage
    const baseDmg = 10;
    for (const enemy of spawner.enemies) {
      if (wrappedDistance(player.x, player.y, enemy.x, enemy.y) < player.radius + enemy.radius) {
        player.takeDamage(baseDmg * enemy.damageMultiplier * dt);
      }
    }

    // Weapons
    weaponManager.update(dt, player.x, player.y, spawner.enemies);

    // XP from dead enemies
    for (const enemy of spawner.enemies) {
      if (enemy.dead) {
        particles.spawnDeath(enemy.x, enemy.y, enemy.radius, enemy.outlineColor);
        player.kills++;
        const leveledUp = player.addXp(enemy.xpDrop);
        if (leveledUp && !weaponManager.allMaxed()) {
          game.generateLevelUpChoices(weaponManager);
          game.state = GameState.LEVEL_UP;
        }
      }
    }
    spawner.removeDead();
    particles.update(dt);

    // Draw
    background.draw(ctx, camera, timestamp / 1000);
    spawner.draw(ctx, camera);
    particles.draw(ctx, camera);
    weaponManager.draw(ctx, camera, player.x, player.y);
    player.draw(ctx, camera);
    background.drawWrapZone(ctx, camera);
    ui.drawHUD(ctx, canvas, game, player, weaponManager);

  } else if (game.state === GameState.LEVEL_UP) {
    background.draw(ctx, camera, timestamp / 1000);
    spawner.draw(ctx, camera);
    particles.draw(ctx, camera);
    weaponManager.draw(ctx, camera, player.x, player.y);
    player.draw(ctx, camera);
    ui.drawHUD(ctx, canvas, game, player, weaponManager);
    ui.drawLevelUpScreen(ctx, canvas, game);

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
