import { MAP_WIDTH, MAP_HEIGHT, randomRange, TWO_PI } from './utils';
import { Camera } from './camera';
import { loadSettings } from './storage';

const PARALLAX_FACTORS = [0.2, 0.5, 0.8] as const;

interface Star {
  x: number;
  y: number;
  layer: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  tint: [number, number, number];
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

const STAR_TINTS: [number, number, number][] = [
  [235, 242, 255],  // ice white
  [170, 205, 255],  // blue
  [255, 230, 190],  // warm
  [210, 180, 255],  // violet
  [160, 255, 235],  // teal
];

function createStar(layer: number): Star {
  return {
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    layer,
    size: layer === 0 ? randomRange(0.5, 1) : layer === 1 ? randomRange(1, 2) : randomRange(1.5, 3),
    brightness: randomRange(0.35, 1.0),
    twinkleSpeed: randomRange(0.5, 2.0),
    twinkleOffset: Math.random() * TWO_PI,
    tint: STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)],
  };
}

function createNebula(): Nebula {
  const colors: [number, number, number][] = [
    [120, 60, 220],    // violet
    [40, 110, 230],    // azure
    [220, 60, 160],    // magenta
    [30, 180, 200],    // teal
    [90, 60, 255],     // deep indigo
  ];
  return {
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    radius: randomRange(320, 900),
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: randomRange(0.05, 0.11),
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
  private driftIntensity = 0;
  private velocityX = 0;
  private velocityY = 0;

  constructor() {
    for (let i = 0; i < 300; i++) this.stars.push(createStar(0));
    for (let i = 0; i < 150; i++) this.stars.push(createStar(1));
    for (let i = 0; i < 90; i++) this.stars.push(createStar(2));
    for (let i = 0; i < 8; i++) this.nebulae.push(createNebula());
    for (let i = 0; i < 60; i++) this.dust.push(createDust());
  }

  update(dt: number, playerSpeed = 0, vx = 0, vy = 0): void {
    // Smoothly ramp drift intensity up when idle, down when moving
    const targetDrift = playerSpeed < 10 ? 1 : 0;
    const rampSpeed = 3; // transitions over ~0.3 seconds
    this.driftIntensity += (targetDrift - this.driftIntensity) * Math.min(1, rampSpeed * dt);

    // Smooth velocity tracking for star streaking
    const smoothing = Math.min(1, 8 * dt);
    this.velocityX += (vx - this.velocityX) * smoothing;
    this.velocityY += (vy - this.velocityY) * smoothing;

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
    // Nebulae (furthest back) — fewer when on low quality for fill-rate saving
    let nebulaeCount = this.nebulae.length;
    try {
      const q = loadSettings().particleQuality;
      if (q === 'low') nebulaeCount = 4;
      else if (q === 'medium') nebulaeCount = 6;
    } catch { /* ignore */ }
    for (let ni = 0; ni < nebulaeCount; ni++) {
      const n = this.nebulae[ni];
      const px = n.x - camera.x * 0.3;
      const py = n.y - camera.y * 0.3;
      // Quick viewport cull for nebulae
      if (px < -n.radius || px > camera.width + n.radius || py < -n.radius || py > camera.height + n.radius) continue;
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, n.radius);
      gradient.addColorStop(0, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${n.alpha})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(px - n.radius, py - n.radius, n.radius * 2, n.radius * 2);
    }

    // Stars with parallax, perspective scaling, and motion streaking
    const parallaxFactors = PARALLAX_FACTORS;
    const cx = camera.width / 2;
    const cy = camera.height / 2;
    const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    const streakFactors = [0, 0.03, 0.07]; // far stars don't streak, close ones do

    // Quality gate — skip faintest layer on low, reduce halos
    let quality: string = 'high';
    let reduced = false;
    try {
      const s = loadSettings();
      quality = s.particleQuality;
      reduced = s.reducedMotion;
    } catch { /* ignore */ }
    const skipFarLayer = quality === 'low';
    const skipGlow = quality === 'low' || reduced;

    for (const star of this.stars) {
      if (skipFarLayer && star.layer === 0) continue;
      const factor = parallaxFactors[star.layer];
      const sx = star.x - camera.x * factor;
      const sy = star.y - camera.y * factor;
      let screenX = ((sx % camera.width) + camera.width) % camera.width;
      let screenY = ((sy % camera.height) + camera.height) % camera.height;

      // Perspective scaling: skip sqrt on low quality (flat size)
      let drawSize: number;
      let offX = 0;
      let offY = 0;
      if (quality === 'low') {
        drawSize = star.size;
      } else {
        offX = (screenX - cx) / cx; // -1..1
        offY = (screenY - cy) / cy;
        const edgeDist = Math.sqrt(offX * offX + offY * offY); // 0 at center, ~1.4 at corners
        const perspScale = 1 + edgeDist * 0.075 * (star.layer * 0.5);
        drawSize = star.size * perspScale;
      }

      // Idle star drift — disabled on reducedMotion
      if (!reduced && this.driftIntensity > 0.01) {
        // Compute offX/offY if we skipped them above
        if (quality === 'low') {
          offX = (screenX - cx) / cx;
          offY = (screenY - cy) / cy;
        }
        const driftFactor = [5, 12, 20][star.layer];
        const oscillation = Math.sin(time * 0.4) * 0.5 + 0.5;
        screenX += offX * driftFactor * oscillation * this.driftIntensity;
        screenY += offY * driftFactor * oscillation * this.driftIntensity;
      }

      const twinkle = 0.55 + 0.45 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * twinkle;

      // Depth-of-field: far layer stars are softer
      const dofAlpha = star.layer === 0 ? alpha * 0.55 : alpha;
      const [tr, tg, tb] = star.tint;

      // Colored glow halo for foreground stars — skip on low/reduced for fill-rate
      if (!skipGlow && star.layer === 2 && star.size > 1.8) {
        const glowR = drawSize * 4;
        const glow = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowR);
        glow.addColorStop(0, `rgba(${tr}, ${tg}, ${tb}, ${dofAlpha * 0.4})`);
        glow.addColorStop(1, `rgba(${tr}, ${tg}, ${tb}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(screenX, screenY, glowR, 0, TWO_PI);
        ctx.fill();
      }

      // Motion streaking: elongate stars in velocity direction when moving
      const streakLen = speed * streakFactors[star.layer];
      if (streakLen > 1) {
        const nx = this.velocityX / speed;
        const ny = this.velocityY / speed;
        ctx.beginPath();
        ctx.moveTo(screenX - nx * streakLen, screenY - ny * streakLen);
        ctx.lineTo(screenX + nx * streakLen, screenY + ny * streakLen);
        ctx.strokeStyle = `rgba(${tr}, ${tg}, ${tb}, ${dofAlpha * 0.75})`;
        ctx.lineWidth = drawSize * 0.8;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${dofAlpha})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, drawSize, 0, TWO_PI);
        ctx.fill();
      }
    }

    // Cosmic dust — skip on low quality (saves worldToScreen per dust)
    const drawDust = quality !== 'low';
    if (drawDust) {
      for (const d of this.dust) {
        const screen = camera.worldToScreen(d.x, d.y);
        if (screen.x < -10 || screen.x > camera.width + 10 ||
            screen.y < -10 || screen.y > camera.height + 10) continue;
        ctx.fillStyle = `rgba(150, 190, 255, ${d.alpha})`;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, d.size, 0, TWO_PI);
        ctx.fill();
      }
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
