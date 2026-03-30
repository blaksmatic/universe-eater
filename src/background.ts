import { MAP_WIDTH, MAP_HEIGHT, randomRange } from './utils';
import { Camera } from './camera';

interface Star {
  x: number;
  y: number;
  layer: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: [number, number, number];
  alpha: number;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
}

function createStar(layer: number): Star {
  return {
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    layer,
    size: layer === 0 ? randomRange(0.5, 1) : layer === 1 ? randomRange(1, 2) : randomRange(1.5, 3),
    brightness: randomRange(0.3, 1.0),
    twinkleSpeed: randomRange(0.5, 2.0),
    twinkleOffset: Math.random() * Math.PI * 2,
  };
}

function createNebula(): Nebula {
  const colors: [number, number, number][] = [
    [100, 50, 150], [50, 80, 180], [150, 50, 100], [40, 100, 160],
  ];
  return {
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    radius: randomRange(200, 600),
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: randomRange(0.03, 0.08),
  };
}

function createDust(): DustParticle {
  return {
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    size: randomRange(0.5, 1.5),
    alpha: randomRange(0.1, 0.3),
    vx: randomRange(-5, 5),
    vy: randomRange(-5, 5),
  };
}

export class Background {
  private stars: Star[] = [];
  private nebulae: Nebula[] = [];
  private dust: DustParticle[] = [];

  constructor() {
    for (let i = 0; i < 300; i++) this.stars.push(createStar(0));
    for (let i = 0; i < 150; i++) this.stars.push(createStar(1));
    for (let i = 0; i < 80; i++) this.stars.push(createStar(2));
    for (let i = 0; i < 8; i++) this.nebulae.push(createNebula());
    for (let i = 0; i < 100; i++) this.dust.push(createDust());
  }

  update(dt: number): void {
    for (const d of this.dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.x < 0) d.x += MAP_WIDTH;
      if (d.x >= MAP_WIDTH) d.x -= MAP_WIDTH;
      if (d.y < 0) d.y += MAP_HEIGHT;
      if (d.y >= MAP_HEIGHT) d.y -= MAP_HEIGHT;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    // Nebulae (furthest back)
    for (const n of this.nebulae) {
      const px = n.x - camera.x * 0.3;
      const py = n.y - camera.y * 0.3;
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, n.radius);
      gradient.addColorStop(0, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${n.alpha})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(px - n.radius, py - n.radius, n.radius * 2, n.radius * 2);
    }

    // Stars with parallax
    const parallaxFactors = [0.2, 0.5, 0.8];
    for (const star of this.stars) {
      const factor = parallaxFactors[star.layer];
      const sx = star.x - camera.x * factor;
      const sy = star.y - camera.y * factor;
      const screenX = ((sx % camera.width) + camera.width) % camera.width;
      const screenY = ((sy % camera.height) + camera.height) % camera.height;

      const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * twinkle;

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cosmic dust
    for (const d of this.dust) {
      const screen = camera.worldToScreen(d.x, d.y);
      if (screen.x < -10 || screen.x > camera.width + 10 ||
          screen.y < -10 || screen.y > camera.height + 10) continue;
      ctx.fillStyle = `rgba(180, 200, 255, ${d.alpha})`;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawWrapZone(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const padding = 200;

    if (camera.x < padding) {
      const w = padding - camera.x;
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, 'rgba(30, 0, 60, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, camera.height);
    }
    if (camera.x + camera.width > MAP_WIDTH - padding) {
      const start = Math.max(0, camera.width - (camera.x + camera.width - (MAP_WIDTH - padding)));
      const gradient = ctx.createLinearGradient(camera.width, 0, start, 0);
      gradient.addColorStop(0, 'rgba(30, 0, 60, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(start, 0, camera.width - start, camera.height);
    }
    if (camera.y < padding) {
      const h = padding - camera.y;
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, 'rgba(30, 0, 60, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, camera.width, h);
    }
    if (camera.y + camera.height > MAP_HEIGHT - padding) {
      const start = Math.max(0, camera.height - (camera.y + camera.height - (MAP_HEIGHT - padding)));
      const gradient = ctx.createLinearGradient(0, camera.height, 0, start);
      gradient.addColorStop(0, 'rgba(30, 0, 60, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, start, camera.width, camera.height - start);
    }
  }
}
