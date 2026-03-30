const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let lastTime = 0;

function resize(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

function gameLoop(timestamp: number): void {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Universe Eater - Game Loop Running', canvas.width / 2, canvas.height / 2);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame((t) => {
  lastTime = t;
  gameLoop(t);
});
