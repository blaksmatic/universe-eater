import { Game } from './game';
import { Player } from './player';
import { WeaponManager } from './weapons';
import { formatTime } from './utils';
import { touch, isTouchDevice, JOYSTICK_DISPLAY_RADIUS } from './input';

export class UI {
  drawHUD(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: Game, player: Player, wm: WeaponManager): void {
    // Timer
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(game.timeRemainingFormatted, canvas.width / 2, 40);

    // Kills
    ctx.font = '18px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Kills: ${player.kills}`, canvas.width - 20, 35);

    // XP bar
    const barW = canvas.width * 0.6;
    const barH = 8;
    const barX = (canvas.width - barW) / 2;
    const barY = canvas.height - 30;
    const xpRatio = player.xp / player.getXpForNextLevel();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
    ctx.fillRect(barX, barY, barW * xpRatio, barH);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${player.level}`, canvas.width / 2, barY - 5);

    // Weapons
    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    let wy = canvas.height - 80;
    for (const w of wm.weapons) {
      ctx.fillStyle = '#ccc';
      ctx.fillText(`${w.name} Lv.${w.level}`, 20, wy);
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

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(x, y, size + 5, 0, Math.PI * 2);
    ctx.fill();

    // Two pause bars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(x - 7, y - 8, 5, 16);
    ctx.fillRect(x + 2, y - 8, 5, 16);
  }

  private drawJoystick(ctx: CanvasRenderingContext2D): void {
    if (!touch.active) return;

    const cx = touch.centerX;
    const cy = touch.centerY;
    const r = JOYSTICK_DISPLAY_RADIUS;

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();

    // Thumb position
    const thumbX = cx + touch.dx * r;
    const thumbY = cy + touch.dy * r;
    const thumbR = 20;

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, thumbR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawTitleScreen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UNIVERSE EATER', canvas.width / 2, canvas.height / 2 - 30);

    ctx.font = '18px monospace';
    ctx.fillStyle = '#888';
    const startMsg = isTouchDevice() ? 'Tap to start' : 'Press any key to start';
    ctx.fillText(startMsg, canvas.width / 2, canvas.height / 2 + 30);
  }

  drawNotifications(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: Game): void {
    const notifications = game.notifications;
    if (notifications.length === 0) return;

    ctx.textAlign = 'center';
    for (let i = 0; i < notifications.length; i++) {
      const n = notifications[i];
      const y = 80 + i * 40;

      // Background pill
      ctx.font = 'bold 18px monospace';
      const textWidth = ctx.measureText(n.text).width;
      const pillW = textWidth + 30;
      const pillH = 30;
      const pillX = (canvas.width - pillW) / 2;

      ctx.fillStyle = `rgba(100, 200, 255, ${0.2 * n.alpha})`;
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 * n.alpha})`;
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
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText(`Survived: ${formatTime(game.elapsedTime)}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText(`Kills: ${player.kills}`, canvas.width / 2, canvas.height / 2 + 40);

    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    const restartMsg = isTouchDevice() ? 'Tap to restart' : 'Press any key to restart';
    ctx.fillText(restartMsg, canvas.width / 2, canvas.height / 2 + 90);
  }

  drawVictory(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, player: Player): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#44ff88';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.fillText(`Total Kills: ${player.kills}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText(`Level Reached: ${player.level}`, canvas.width / 2, canvas.height / 2 + 40);

    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    const restartMsg2 = isTouchDevice() ? 'Tap to restart' : 'Press any key to restart';
    ctx.fillText(restartMsg2, canvas.width / 2, canvas.height / 2 + 90);
  }
}
