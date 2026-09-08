import { Game } from '../game';
import { Player } from '../player';
import { getLanguage, getUiText, uiFont } from '../i18n';
import { isTouchDevice, getSafeAreaInsets } from '../input';
import { loadSettings } from '../storage';
import { roundedRect, TWO_PI } from '../utils';

const MINT = '#93f5da';

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 11, color = '#7f9aab'): void {
  ctx.font = uiFont(size);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/** Procedural accretion disc: crisp at every resolution, no downloaded assets. */
function singularity(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.25);
  const halo = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.1);
  halo.addColorStop(0, '#02060b');
  halo.addColorStop(0.32, 'rgba(44,110,119,0.28)');
  halo.addColorStop(0.55, 'rgba(61,94,151,0.12)');
  halo.addColorStop(1, 'rgba(20,40,70,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(-r * 2.1, -r * 2.1, r * 4.2, r * 4.2);
  for (let i = 0; i < 30; i++) {
    const radius = r * (1.02 + i * 0.025);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.5, radius * 0.34, 0, 0, TWO_PI);
    ctx.strokeStyle = `rgba(${i < 9 ? '166,248,221' : '94,150,194'},${0.2 - i * 0.005})`;
    ctx.lineWidth = i < 4 ? 2 : 1;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.73, 0, TWO_PI);
  ctx.fillStyle = '#02060c';
  ctx.fill();
  ctx.shadowColor = MINT;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = '#bcffe5';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;
  for (let i = 0; i < 110; i++) {
    const angle = i * 2.39996 + time * (0.035 + (i % 3) * 0.012);
    const orbit = r * (0.95 + (i % 17) / 20);
    const px = Math.cos(angle) * orbit * 1.5;
    const py = Math.sin(angle) * orbit * 0.34;
    if (px * px + py * py < r * r * 0.55) continue;
    ctx.fillStyle = i % 4 === 0 ? '#d7f9e8' : '#527e8f';
    ctx.fillRect(px, py, i % 4 === 0 ? 2 : 1, 1);
  }
  ctx.restore();
}

export function drawObservatoryTitle(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, age: number): void {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const compact = w < 760;
  const short = h < 560;
  const cn = getLanguage() === 'zh-CN';
  const margin = compact ? 24 : Math.max(48, w * 0.065);
  const time = loadSettings().reducedMotion ? 0 : age;
  const headerInset = getSafeAreaInsets().top;
  ctx.save();
  const shade = ctx.createLinearGradient(0, 0, w, h);
  shade.addColorStop(0, 'rgba(3,10,17,0.94)');
  shade.addColorStop(1, 'rgba(5,12,22,0.38)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'left';
  label(ctx, 'UE / DEEP SPACE DIVISION', margin, 36 + headerInset, 10, MINT);
  ctx.textAlign = 'right';
  label(ctx, 'VOL. 01   /   EVENT HORIZON', w - margin, 36 + headerInset, compact ? 8 : 10);
  ctx.strokeStyle = '#21333f';
  ctx.beginPath(); ctx.moveTo(margin, 52 + headerInset); ctx.lineTo(w - margin, 52 + headerInset); ctx.stroke();

  const orbX = compact ? w * 0.72 : w * 0.75;
  const orbY = compact ? h * 0.32 : h * 0.46;
  const radius = compact ? Math.min(w * 0.29, h * 0.19) : Math.min(w * 0.18, h * 0.28);
  singularity(ctx, orbX, orbY, radius, time);
  if (!compact) {
    ctx.textAlign = 'right';
    label(ctx, 'ANOMALY 001', w - margin, h * 0.78, 11, MINT);
    label(ctx, 'MASS: UNKNOWN / SIGNAL: ACTIVE', w - margin, h * 0.78 + 21, 9);
  }
  const top = short ? h * 0.24 : h * (compact ? 0.28 : 0.29);
  ctx.textAlign = 'left';
  label(ctx, cn ? '虚空生存 / 十分钟远征' : 'A COSMIC SURVIVAL ROGUELITE', margin, top, 10, MINT);
  const size = compact ? Math.min(w * 0.13, h * 0.14, 56) : Math.min(w * 0.074, h * 0.12, 100);
  ctx.font = `900 ${size}px "Arial Black", "Segoe UI", sans-serif`;
  ctx.fillStyle = '#f0f4ed';
  ctx.fillText(cn ? '宇宙' : 'UNIVERSE', margin - 3, top + size * 1.05);
  ctx.fillStyle = MINT;
  ctx.fillText(cn ? '吞噬者' : 'EATER', margin - 3, top + size * 2.02);
  const subY = top + size * 2.02 + 30;
  label(ctx, cn ? '从微尘开始。成为宇宙的终结。' : 'Begin as a speck. Become the end of everything.', margin, subY, compact ? 10 : 13, '#acbac2');
  const buttonY = subY + (short ? 17 : 32);
  const buttonW = compact ? Math.min(285, w - margin * 2) : 280;
  ctx.beginPath(); roundedRect(ctx, margin, buttonY, buttonW, short ? 40 : 52, 4);
  ctx.fillStyle = MINT; ctx.fill();
  ctx.textAlign = 'center';
  label(ctx, cn ? '进入虚空  →' : 'ENTER THE VOID  →', margin + buttonW / 2, buttonY + (short ? 25 : 32), 14, '#072623');
  ctx.textAlign = 'left';
  label(ctx, getUiText(isTouchDevice() ? 'tapToStart' : 'pressAnyKeyToStart'), margin, buttonY + (short ? 58 : 74), 10);
  if (h > 680) {
    const y = h - 140;
    ctx.strokeStyle = '#21333f';
    ctx.beginPath(); ctx.moveTo(margin, y - 25); ctx.lineTo(w - margin, y - 25); ctx.stroke();
    const items = cn ? ['01 / 生存 10:00', '02 / 进化武装', '03 / 击败看守者'] : ['01 / SURVIVE 10:00', '02 / EVOLVE YOUR ARSENAL', '03 / SLAY THE WARDEN'];
    items.forEach((item, i) => label(ctx, item, margin + i * (w - margin * 2) / 3, y, compact ? 8 : 11, '#b9cbc9'));
    if (!compact) label(ctx, 'WASD / MOVE     SPACE / DASH     ESC / PAUSE     AUTO-FIRE / ALWAYS ON', margin, y + 28, 9);
  }
  ctx.restore();
}

export function drawHudFrame(ctx: CanvasRenderingContext2D, w: number, h: number, left: number, top: number, right: number, player: Player, game: Game): void {
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 0, 0, 115);
  gradient.addColorStop(0, 'rgba(3,12,20,0.94)');
  gradient.addColorStop(1, 'rgba(3,12,20,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, 115);
  const hullW = Math.min(136, w * 0.25);
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = i / 20 < player.hp / player.maxHp ? (player.hp / player.maxHp < 0.3 ? '#ff7383' : MINT) : '#20323e';
    ctx.fillRect(left + i * hullW / 20, top + 28, hullW / 20 - 2, 4);
  }
  ctx.fillStyle = '#1a303b'; ctx.fillRect(w / 2 - 55, top + 33, 110, 2);
  ctx.fillStyle = MINT; ctx.fillRect(w / 2 - 55, top + 33, 110 * Math.min(1, game.elapsedTime / game.gameDuration), 2);
  if (w > 650) {
    ctx.textAlign = 'right';
    label(ctx, getLanguage() === 'zh-CN' ? '空格 / 冲刺' : 'SPACE / DASH', w - right, h - 52, 10, '#a8bfca');
    ctx.fillStyle = '#20323e'; ctx.fillRect(w - right - 110, h - 39, 110, 3);
    ctx.fillStyle = MINT; ctx.fillRect(w - right - 110, h - 39, 110 * (1 - player.dashCooldownRatio), 3);
    if (game.activeDoctrines.length === 0) label(ctx, 'ESC / II', w - right, top + 54, 9);
  }
  ctx.restore();
}
