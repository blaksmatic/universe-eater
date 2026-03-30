import { Game } from './game';
import { Player } from './player';
import { WeaponManager } from './weapons';

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
  }

  drawTitleScreen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UNIVERSE EATER', canvas.width / 2, canvas.height / 2 - 30);

    ctx.font = '18px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('Press any key to start', canvas.width / 2, canvas.height / 2 + 30);
  }

  drawLevelUpScreen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: Game): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL UP!', canvas.width / 2, canvas.height / 2 - 120);

    ctx.font = '16px monospace';
    ctx.fillText('Choose an upgrade (1/2/3 or click)', canvas.width / 2, canvas.height / 2 - 80);

    const choices = game.levelUpChoices;
    const boxW = 200, boxH = 80, gap = 20;
    const totalW = choices.length * boxW + (choices.length - 1) * gap;
    const startX = (canvas.width - totalW) / 2;
    const boxY = canvas.height / 2 - 30;

    for (let i = 0; i < choices.length; i++) {
      const bx = startX + i * (boxW + gap);
      const sel = i === game.selectedChoice;

      ctx.fillStyle = sel ? 'rgba(100, 200, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = sel ? '#64c8ff' : '#555';
      ctx.lineWidth = 2;
      ctx.fillRect(bx, boxY, boxW, boxH);
      ctx.strokeRect(bx, boxY, boxW, boxH);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(choices[i].name, bx + boxW / 2, boxY + 30);

      ctx.fillStyle = '#aaa';
      ctx.font = '12px monospace';
      ctx.fillText(choices[i].description, bx + boxW / 2, boxY + 55);

      ctx.fillStyle = '#666';
      ctx.font = '14px monospace';
      ctx.fillText(`[${i + 1}]`, bx + boxW / 2, boxY + boxH + 20);
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
    const survived = Math.floor(game.elapsedTime);
    const min = Math.floor(survived / 60);
    const sec = survived % 60;
    ctx.fillText(`Survived: ${min}:${sec.toString().padStart(2, '0')}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText(`Kills: ${player.kills}`, canvas.width / 2, canvas.height / 2 + 40);

    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 90);
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
    ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 90);
  }
}
