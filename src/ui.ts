import { Game } from './game';
import { Player } from './player';
import { WeaponManager } from './weapons';
import { formatTime, TWO_PI, easeOutCubic } from './utils';
import { touch, isTouchDevice, JOYSTICK_DISPLAY_RADIUS } from './input';

// Weapon shape icons
const WEAPON_SHAPES: Record<string, (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => void> = {
  'Laser Beam': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + s, y, 2, 0, TWO_PI);
    ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.fill();
  },
  'Orbit Shield': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.7, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + s * 0.5, y - s * 0.3, 2, 0, TWO_PI);
    ctx.fillStyle = 'rgba(180, 220, 255, 0.9)';
    ctx.fill();
  },
  'Nova Blast': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.6, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(255, 160, 60, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.2, 0, TWO_PI);
    ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
    ctx.fill();
  },
};

export class UI {
  // State for animated transitions
  private stateAge = 0;
  private lastState = '';

  trackState(stateName: string, dt: number): void {
    if (stateName !== this.lastState) {
      this.lastState = stateName;
      this.stateAge = 0;
    }
    this.stateAge += dt;
  }

  drawHUD(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: Game, player: Player, wm: WeaponManager): void {
    const w = canvas.width;
    const h = canvas.height;

    // Timer with glow
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px monospace';
    const timerText = game.timeRemainingFormatted;
    ctx.fillStyle = 'rgba(100, 200, 255, 0.15)';
    ctx.fillText(timerText, w / 2, 40);
    ctx.fillText(timerText, w / 2, 40);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timerText, w / 2, 40);
    ctx.restore();

    // Kills with subtle icon
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`${player.kills}`, w - 20, 35);
    // Skull-ish icon
    ctx.beginPath();
    ctx.arc(w - 55 - ctx.measureText(`${player.kills}`).width * 0.5, 30, 5, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const barW = w * 0.5;
    const barH = 6;
    const barX = (w - barW) / 2;
    const barY = h - 28;
    const xpRatio = player.xp / player.getXpForNextLevel();
    const barRadius = barH / 2;

    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, barRadius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();

    if (xpRatio > 0.01) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, barRadius);
      ctx.clip();
      const fillW = barW * xpRatio;
      const grad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      grad.addColorStop(0, 'rgba(80, 180, 255, 0.6)');
      grad.addColorStop(1, 'rgba(120, 220, 255, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, fillW, barH);

      // Glow at fill edge
      const edgeX = barX + fillW;
      const glowGrad = ctx.createRadialGradient(edgeX, barY + barH / 2, 0, edgeX, barY + barH / 2, 15);
      glowGrad.addColorStop(0, 'rgba(150, 230, 255, 0.4)');
      glowGrad.addColorStop(1, 'rgba(150, 230, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(edgeX - 15, barY - 10, 30, barH + 20);
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LV ${player.level}`, w / 2, barY - 6);

    ctx.textAlign = 'left';
    let wy = h - 65;
    for (const wp of wm.weapons) {
      const drawIcon = WEAPON_SHAPES[wp.name];
      if (drawIcon) {
        drawIcon(ctx, 28, wy - 4, 8);
      }
      ctx.font = '13px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`${wp.name}`, 44, wy);
      ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
      ctx.fillText(`${wp.level}`, 44 + ctx.measureText(`${wp.name} `).width, wy);
      wy -= 22;
    }

    if (isTouchDevice()) {
      this.drawPauseButton(ctx, canvas);
      this.drawJoystick(ctx);
    }
  }

  private drawPauseButton(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const x = canvas.width - 45;
    const y = 45;
    const size = 20;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(x, y, size + 5, 0, TWO_PI);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x - 7, y - 8, 5, 16, 1);
    ctx.roundRect(x + 2, y - 8, 5, 16, 1);
    ctx.fill();
  }

  private drawJoystick(ctx: CanvasRenderingContext2D): void {
    if (!touch.active) return;

    const cx = touch.centerX;
    const cy = touch.centerY;
    const r = JOYSTICK_DISPLAY_RADIUS;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();

    const thumbX = cx + touch.dx * r;
    const thumbY = cy + touch.dy * r;
    const thumbR = 20;

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, thumbR, 0, TWO_PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawTitleScreen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const t = this.stateAge;

    const titleAlpha = Math.min(1, t * 2);

    const glowPulse = 0.6 + 0.4 * Math.sin(t * 1.5);
    const titleGrad = ctx.createRadialGradient(cx, cy - 40, 0, cx, cy - 40, 300);
    titleGrad.addColorStop(0, `rgba(80, 160, 255, ${0.06 * glowPulse * titleAlpha})`);
    titleGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = titleGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.font = 'bold 52px monospace';

    ctx.fillStyle = `rgba(80, 180, 255, ${0.12 * titleAlpha})`;
    ctx.fillText('UNIVERSE EATER', cx, cy - 30);
    ctx.fillStyle = `rgba(80, 180, 255, ${0.08 * titleAlpha})`;
    ctx.fillText('UNIVERSE EATER', cx + 1, cy - 29);

    ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
    ctx.fillText('UNIVERSE EATER', cx, cy - 30);

    // Subtitle — delayed fade
    const subAlpha = Math.max(0, Math.min(1, (t - 0.5) * 2));
    ctx.font = '14px monospace';
    ctx.fillStyle = `rgba(100, 180, 255, ${subAlpha * 0.6})`;
    ctx.fillText('SURVIVE 5 MINUTES', cx, cy + 10);

    // Start prompt — breathing
    const promptAlpha = Math.max(0, Math.min(1, (t - 1) * 2));
    const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3));
    ctx.font = '16px monospace';
    ctx.fillStyle = `rgba(255, 255, 255, ${promptAlpha * breathe})`;
    const startMsg = isTouchDevice() ? 'Tap to start' : 'Press any key to start';
    ctx.fillText(startMsg, cx, cy + 60);
  }

  drawNotifications(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: Game): void {
    const notifications = game.notifications;
    if (notifications.length === 0) return;

    ctx.textAlign = 'center';
    for (let i = 0; i < notifications.length; i++) {
      const n = notifications[i];
      const y = 80 + i * 40;

      ctx.font = 'bold 18px monospace';
      const textWidth = ctx.measureText(n.text).width;
      const pillW = textWidth + 30;
      const pillH = 30;
      const pillX = (canvas.width - pillW) / 2;

      ctx.fillStyle = `rgba(100, 200, 255, ${0.15 * n.alpha})`;
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.4 * n.alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pillX, y - pillH / 2 - 4, pillW, pillH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${n.alpha})`;
      ctx.fillText(n.text, canvas.width / 2, y);
    }
  }

  drawGameOver(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, player: Player, game: Game): void {
    this.drawEndScreen(ctx, canvas, 'GAME OVER', [255, 68, 68], [80, 0, 0], [
      `Survived  ${formatTime(game.elapsedTime)}`,
      `Kills  ${player.kills}`,
    ]);
  }

  drawVictory(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, player: Player): void {
    this.drawEndScreen(ctx, canvas, 'VICTORY!', [68, 255, 136], [80, 60, 0], [
      `Total Kills  ${player.kills}`,
      `Level Reached  ${player.level}`,
    ]);
  }

  private drawEndScreen(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    title: string,
    titleColor: [number, number, number],
    vignetteColor: [number, number, number],
    stats: string[],
  ): void {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const t = this.stateAge;
    const [tr, tg, tb] = titleColor;
    const [vr, vg, vb] = vignetteColor;

    const dimAlpha = Math.min(0.85, t * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${dimAlpha})`;
    ctx.fillRect(0, 0, w, h);

    const vigGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, `rgba(${vr}, ${vg}, ${vb}, ${Math.min(0.3, t)})`);
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);

    const titleScale = easeOutCubic(Math.min(1, t * 3));
    const titleAlpha = Math.min(1, t * 3);
    ctx.save();
    ctx.translate(cx, cy - 50);
    ctx.scale(titleScale, titleScale);
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${titleAlpha * 0.15})`;
    ctx.fillText(title, 0, 0);
    ctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${titleAlpha})`;
    ctx.fillText(title, 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.font = '18px monospace';
    for (let i = 0; i < stats.length; i++) {
      const statAlpha = Math.max(0, Math.min(1, (t - 0.4 - i * 0.2) * 3));
      ctx.fillStyle = `rgba(255, 255, 255, ${statAlpha * 0.7})`;
      ctx.fillText(stats[i], cx, cy + 15 + i * 30);
    }

    const promptAlpha = Math.max(0, Math.min(1, (t - 1.2) * 2));
    const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3));
    ctx.font = '14px monospace';
    ctx.fillStyle = `rgba(255, 255, 255, ${promptAlpha * breathe * 0.5})`;
    const restartMsg = isTouchDevice() ? 'Tap to restart' : 'Press any key to restart';
    ctx.fillText(restartMsg, cx, cy + 95);
  }

  // Permanent vignette overlay
  drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, hpRatio: number): void {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) * 0.75;

    // Base subtle vignette (always visible)
    const baseAlpha = 0.3 + (1 - hpRatio) * 0.35;
    const grad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(0, 0, 0, ${baseAlpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Red tint when low HP
    if (hpRatio < 0.35) {
      const redAlpha = (0.35 - hpRatio) * 0.4;
      const redGrad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
      redGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      redGrad.addColorStop(1, `rgba(150, 0, 0, ${redAlpha})`);
      ctx.fillStyle = redGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }
}
