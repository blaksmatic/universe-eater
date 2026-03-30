import { Camera } from './camera';
import { Player } from './player';
import { Background } from './background';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const camera = new Camera(window.innerWidth, window.innerHeight);
const player = new Player();
const background = new Background();

let lastTime = 0;

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.resize(canvas.width, canvas.height);
}

window.addEventListener('resize', resize);
resize();

function gameLoop(timestamp: number): void {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  player.update(dt);
  camera.follow(player.x, player.y);

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  background.update(dt);
  background.draw(ctx, camera, timestamp / 1000);

  player.draw(ctx, camera);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame((t) => {
  lastTime = t;
  gameLoop(t);
});
