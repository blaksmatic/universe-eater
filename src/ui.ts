import { Game } from './game';
import { Player } from './player';
import { WeaponManager } from './weapons';
import { formatTime, TWO_PI, easeOutCubic } from './utils';
import {
  touch,
  isTouchDevice,
  JOYSTICK_DISPLAY_RADIUS,
  getPauseButtonLayout,
  getSafeAreaInsets,
  getTouchUiMargin,
} from './input';

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
  'Reinforced Hull': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.roundRect(x - s * 0.7, y - s * 0.85, s * 1.4, s * 1.7, 2);
    ctx.strokeStyle = 'rgba(255, 135, 135, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y);
    ctx.lineTo(x + s * 0.45, y);
    ctx.moveTo(x, y - s * 0.45);
    ctx.lineTo(x, y + s * 0.45);
    ctx.stroke();
  },
  'Overdrive Thrusters': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.9, y + s * 0.5);
    ctx.lineTo(x, y - s * 0.8);
    ctx.lineTo(x + s * 0.9, y + s * 0.5);
    ctx.strokeStyle = 'rgba(130, 220, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.35, y + s * 0.65);
    ctx.lineTo(x - s * 0.12, y + s * 1.05);
    ctx.moveTo(x + s * 0.35, y + s * 0.65);
    ctx.lineTo(x + s * 0.12, y + s * 1.05);
    ctx.stroke();
  },
  'Nanoforge': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.65, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(110, 255, 190, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.2, 0, TWO_PI);
    ctx.fillStyle = 'rgba(180, 255, 220, 0.9)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.9, y);
    ctx.lineTo(x - s * 0.35, y);
    ctx.moveTo(x + s * 0.35, y);
    ctx.lineTo(x + s * 0.9, y);
    ctx.stroke();
  },
  'Phase Plating': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.85, y - s * 0.25);
    ctx.lineTo(x + s * 0.55, y + s);
    ctx.lineTo(x - s * 0.55, y + s);
    ctx.lineTo(x - s * 0.85, y - s * 0.25);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(210, 180, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
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
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const compactHud = w < 500;
    const hpRatio = player.hp / player.maxHp;
    const safe = getSafeAreaInsets();
    const margin = getTouchUiMargin();
    const leftInset = safe.left + margin;
    const rightInset = safe.right + margin;
    const topInset = safe.top + margin;
    const bottomInset = safe.bottom + margin;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px monospace';
    const timerText = game.timeRemainingFormatted;
    ctx.fillStyle = 'rgba(100, 200, 255, 0.15)';
    ctx.fillText(timerText, w / 2, topInset + 24);
    ctx.fillText(timerText, w / 2, topInset + 24);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timerText, w / 2, topInset + 24);
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = hpRatio < 0.3 ? 'rgba(255, 120, 120, 0.95)' : 'rgba(190, 225, 255, 0.85)';
    ctx.fillText(`HULL ${Math.ceil(hpRatio * 100)}%`, leftInset, topInset + 18);
    if (hpRatio < 0.35) {
      ctx.fillStyle = 'rgba(255, 120, 120, 0.65)';
      ctx.font = '12px monospace';
      ctx.fillText('CRITICAL', leftInset, topInset + 36);
    }

    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`${player.kills}`, w - rightInset, topInset + 19);
    ctx.beginPath();
    ctx.arc(w - rightInset - 35 - ctx.measureText(`${player.kills}`).width * 0.5, topInset + 14, 5, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (game.activeDoctrines.length > 0) {
      ctx.textAlign = 'right';
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = 'rgba(165, 205, 255, 0.55)';
      ctx.fillText('DOCTRINES', w - rightInset, topInset + 38);

      ctx.font = '11px monospace';
      for (let i = 0; i < game.activeDoctrines.length; i++) {
        ctx.fillStyle = 'rgba(230, 240, 255, 0.72)';
        ctx.fillText(game.activeDoctrines[i].shortLabel, w - rightInset, topInset + 54 + i * 14);
      }
    }

    const barW = compactHud
      ? Math.max(160, Math.min(w - leftInset - rightInset - 28, 250))
      : Math.max(180, Math.min(w * 0.5, w - leftInset - rightInset - 120));
    const barH = 6;
    const barX = (w - barW) / 2;
    const barY = h - bottomInset - 12;
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
    ctx.fillText(`LV ${player.level}  ${Math.floor(player.xp)}/${player.getXpForNextLevel()} XP`, w / 2, barY - 6);

    const weaponPanelX = leftInset - 2;
    const weaponPanelW = compactHud ? 230 : 212;
    const weaponPanelH = 88;
    const weaponPanelY = Math.max(topInset + 54, barY - weaponPanelH - (compactHud ? 32 : 22));
    ctx.beginPath();
    ctx.roundRect(weaponPanelX, weaponPanelY, weaponPanelW, weaponPanelH, 10);
    ctx.fillStyle = 'rgba(8, 14, 30, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 180, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(160, 210, 255, 0.58)';
    ctx.fillText('ARMAMENT', weaponPanelX + 12, weaponPanelY + 18);

    const weaponSlots = [
      { name: 'Laser Beam', weapon: wm.getWeapon('Laser Beam') },
      { name: 'Orbit Shield', weapon: wm.getWeapon('Orbit Shield') },
      { name: 'Nova Blast', weapon: wm.getWeapon('Nova Blast') },
    ];

    let wy = weaponPanelY + 38;
    for (const slot of weaponSlots) {
      const drawIcon = WEAPON_SHAPES[slot.name];
      if (drawIcon) {
        drawIcon(ctx, weaponPanelX + 14, wy - 4, 7);
      }
      ctx.font = '13px monospace';
      if (slot.weapon) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.74)';
        ctx.fillText(slot.name, weaponPanelX + 28, wy);
        ctx.fillStyle = 'rgba(110, 205, 255, 0.95)';
        ctx.fillText(`LV ${slot.weapon.level}`, weaponPanelX + 160, wy);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillText(slot.name, weaponPanelX + 28, wy);
        ctx.fillText('LOCKED', weaponPanelX + 160, wy);
      }
      wy += 22;
    }

    if (isTouchDevice()) {
      this.drawPauseButton(ctx, canvas);
      this.drawJoystick(ctx);
    }
  }

  private drawPauseButton(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const layout = getPauseButtonLayout(canvas.clientWidth);
    const x = layout.x;
    const y = layout.y;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(x, y, layout.radius, 0, TWO_PI);
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
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
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
    const compactTitle = w < 500;
    const titleSize = compactTitle
      ? Math.max(24, Math.min(34, Math.floor(w * 0.09)))
      : Math.max(30, Math.min(52, Math.floor(w * 0.13)));
    ctx.font = `bold ${titleSize}px monospace`;

    if (compactTitle) {
      ctx.fillStyle = `rgba(80, 180, 255, ${0.12 * titleAlpha})`;
      ctx.fillText('UNIVERSE', cx, cy - 44);
      ctx.fillText('EATER', cx, cy - 6);
      ctx.fillStyle = `rgba(80, 180, 255, ${0.08 * titleAlpha})`;
      ctx.fillText('UNIVERSE', cx + 1, cy - 43);
      ctx.fillText('EATER', cx + 1, cy - 5);
      ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
      ctx.fillText('UNIVERSE', cx, cy - 44);
      ctx.fillText('EATER', cx, cy - 6);
    } else {
      ctx.fillStyle = `rgba(80, 180, 255, ${0.12 * titleAlpha})`;
      ctx.fillText('UNIVERSE EATER', cx, cy - 30);
      ctx.fillStyle = `rgba(80, 180, 255, ${0.08 * titleAlpha})`;
      ctx.fillText('UNIVERSE EATER', cx + 1, cy - 29);
      ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
      ctx.fillText('UNIVERSE EATER', cx, cy - 30);
    }

    const subAlpha = Math.max(0, Math.min(1, (t - 0.5) * 2));
    ctx.font = `${w < 500 ? 12 : 14}px monospace`;
    ctx.fillStyle = `rgba(100, 180, 255, ${subAlpha * 0.6})`;
    ctx.fillText('SURVIVE 5 MINUTES', cx, cy + Math.max(0, titleSize * 0.55 - 18));

    const promptAlpha = Math.max(0, Math.min(1, (t - 1) * 2));
    const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3));
    ctx.font = `${w < 500 ? 14 : 16}px monospace`;
    ctx.fillStyle = `rgba(255, 255, 255, ${promptAlpha * breathe})`;
    const startMsg = isTouchDevice() ? 'Tap to start' : 'Press any key to start';
    ctx.fillText(startMsg, cx, cy + 60);

    const helpAlpha = Math.max(0, Math.min(1, (t - 1.3) * 2));
    ctx.font = `${w < 500 ? 11 : 13}px monospace`;
    ctx.fillStyle = `rgba(160, 200, 255, ${helpAlpha * 0.5})`;
    ctx.fillText('MOVE TO SURVIVE  •  WEAPONS AUTO-FIRE', cx, cy + (w < 500 ? 88 : 95));
    ctx.fillText('FIRST LEVEL-UPS UNLOCK NEW WEAPONS', cx, cy + (w < 500 ? 106 : 116));
  }

  drawNotifications(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: Game): void {
    const notifications = game.notifications;
    if (notifications.length === 0) return;
    const canvasWidth = canvas.clientWidth;

    ctx.textAlign = 'center';
    for (let i = 0; i < notifications.length; i++) {
      const n = notifications[i];
      const y = 86 + i * 42;
      const isUnlock = n.kind === 'unlock';
      const isUpgrade = n.kind === 'upgrade';
      const accent = isUnlock
        ? { fill: [255, 185, 90], stroke: [255, 205, 120], text: [255, 245, 220] }
        : isUpgrade
          ? { fill: [100, 200, 255], stroke: [130, 210, 255], text: [255, 255, 255] }
          : { fill: [120, 150, 200], stroke: [160, 190, 235], text: [220, 235, 255] };

      let fontSize = isUnlock ? 22 : 18;
      const maxTextWidth = canvasWidth - 70;
      do {
        ctx.font = `bold ${fontSize}px monospace`;
        if (ctx.measureText(n.text).width <= maxTextWidth || fontSize <= 12) break;
        fontSize--;
      } while (fontSize > 12);

      const textWidth = ctx.measureText(n.text).width;
      const pillW = Math.min(canvasWidth - 26, textWidth + (isUnlock ? 42 : 30));
      const pillH = fontSize >= 18 ? (isUnlock ? 36 : 30) : 28;
      const pillX = (canvasWidth - pillW) / 2;

      ctx.fillStyle = `rgba(${accent.fill[0]}, ${accent.fill[1]}, ${accent.fill[2]}, ${0.16 * n.alpha})`;
      ctx.strokeStyle = `rgba(${accent.stroke[0]}, ${accent.stroke[1]}, ${accent.stroke[2]}, ${0.45 * n.alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pillX, y - pillH / 2 - 4, pillW, pillH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `rgba(${accent.text[0]}, ${accent.text[1]}, ${accent.text[2]}, ${n.alpha})`;
      ctx.fillText(n.text, canvasWidth / 2, y);
    }
  }

  drawLevelUpDraft(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: Game): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const layout = this.getLevelUpLayout(canvas, game);

    ctx.fillStyle = 'rgba(4, 8, 18, 0.68)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.font = 'bold 38px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('LEVEL UP', w / 2, layout.headerY);

    ctx.font = '14px monospace';
    ctx.fillStyle = 'rgba(180, 215, 255, 0.72)';
    ctx.fillText('Choose your next mutation', w / 2, layout.headerY + 28);
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(180, 215, 255, 0.48)';
    ctx.fillText(
      isTouchDevice() ? 'Tap a card to mutate' : 'Arrow keys select  •  Enter confirms  •  R rerolls',
      w / 2,
      layout.headerY + 48,
    );

    for (let i = 0; i < layout.cards.length; i++) {
      const card = layout.cards[i];
      const choice = game.draftChoices[i];
      if (!choice) continue;
      const isSelected = i === game.selectedDraftIndex;

      ctx.beginPath();
      ctx.roundRect(card.x, card.y, card.width, card.height, 14);
      ctx.fillStyle = isSelected
        ? choice.kind === 'unlock' ? 'rgba(54, 38, 16, 0.94)' : 'rgba(20, 28, 54, 0.94)'
        : choice.kind === 'unlock' ? 'rgba(40, 30, 14, 0.88)' : 'rgba(14, 20, 38, 0.88)';
      ctx.fill();
      ctx.strokeStyle = isSelected
        ? choice.kind === 'unlock' ? 'rgba(255, 210, 135, 0.9)' : 'rgba(170, 220, 255, 0.85)'
        : choice.kind === 'unlock' ? 'rgba(255, 195, 110, 0.45)' : 'rgba(120, 190, 255, 0.35)';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();

      if (isSelected) {
        ctx.beginPath();
        ctx.roundRect(card.x - 4, card.y - 4, card.width + 8, card.height + 8, 16);
        ctx.strokeStyle = choice.kind === 'unlock' ? 'rgba(255, 210, 135, 0.26)' : 'rgba(150, 220, 255, 0.22)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(card.x + 30, card.y + 32, 14, 0, TWO_PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      const drawIcon = WEAPON_SHAPES[choice.iconName];
      if (drawIcon) drawIcon(ctx, card.x + 30, card.y + 32, 9);

      ctx.textAlign = 'left';
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = choice.kind === 'unlock' ? 'rgba(255, 210, 135, 0.85)' : 'rgba(145, 210, 255, 0.72)';
      ctx.fillText(`${i + 1}`, card.x + 56, card.y + 20);

      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#ffffff';
      this.drawWrappedText(ctx, choice.title, card.x + 20, card.y + 58, card.width - 40, 22);

      ctx.font = '13px monospace';
      ctx.fillStyle = 'rgba(215, 228, 245, 0.72)';
      this.drawWrappedText(ctx, choice.description, card.x + 20, card.y + 92, card.width - 40, 18);

      let chipX = card.x + 20;
      const chipY = card.y + card.height - 26;
      for (const tag of choice.tags) {
        const label = tag.toUpperCase();
        ctx.font = 'bold 10px monospace';
        const chipW = ctx.measureText(label).width + 16;
        ctx.beginPath();
        ctx.roundRect(chipX, chipY, chipW, 18, 9);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(180, 210, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(215, 232, 255, 0.82)';
        ctx.textAlign = 'center';
        ctx.fillText(label, chipX + chipW / 2, chipY + 12);
        chipX += chipW + 8;
      }
    }

    const reroll = layout.rerollButton;
    ctx.beginPath();
    ctx.roundRect(reroll.x, reroll.y, reroll.width, reroll.height, 10);
    const rerollEnabled = game.rerollsRemaining > 0;
    ctx.fillStyle = rerollEnabled ? 'rgba(18, 26, 52, 0.9)' : 'rgba(22, 22, 28, 0.82)';
    ctx.fill();
    ctx.strokeStyle = rerollEnabled ? 'rgba(140, 200, 255, 0.28)' : 'rgba(120, 120, 140, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = rerollEnabled ? 'rgba(200, 230, 255, 0.82)' : 'rgba(170, 170, 180, 0.55)';
    const rerollLabel = rerollEnabled
      ? `REROLL [R]  ${game.rerollsRemaining} LEFT`
      : 'REROLL SPENT';
    ctx.fillText(rerollLabel, reroll.x + reroll.width / 2, reroll.y + 22);
  }

  getLevelUpActionAt(
    canvas: HTMLCanvasElement,
    game: Game,
    x: number,
    y: number,
  ): { type: 'choice'; index: number } | { type: 'reroll' } | null {
    const layout = this.getLevelUpLayout(canvas, game);

    for (let i = 0; i < layout.cards.length; i++) {
      const card = layout.cards[i];
      if (x >= card.x && x <= card.x + card.width && y >= card.y && y <= card.y + card.height) {
        return { type: 'choice', index: i };
      }
    }

    const reroll = layout.rerollButton;
    if (
      game.rerollsRemaining > 0 &&
      x >= reroll.x &&
      x <= reroll.x + reroll.width &&
      y >= reroll.y &&
      y <= reroll.y + reroll.height
    ) {
      return { type: 'reroll' };
    }

    return null;
  }

  drawGameOver(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    player: Player,
    game: Game,
    canRestart: boolean,
    restartCountdown: number,
  ): void {
    const prompt = canRestart
      ? (isTouchDevice() ? 'Tap to restart' : 'Press any key to restart')
      : `Restart in ${restartCountdown.toFixed(1)}s`;
    this.drawEndScreen(ctx, canvas, 'GAME OVER', [255, 68, 68], [80, 0, 0], [
      `Survived  ${formatTime(game.elapsedTime)}`,
      `Kills  ${player.kills}`,
    ], prompt);
  }

  drawVictory(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, player: Player): void {
    this.drawEndScreen(ctx, canvas, 'VICTORY!', [68, 255, 136], [80, 60, 0], [
      `Total Kills  ${player.kills}`,
      `Level Reached  ${player.level}`,
    ], isTouchDevice() ? 'Tap to restart' : 'Press any key to restart');
  }

  private drawEndScreen(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    title: string,
    titleColor: [number, number, number],
    vignetteColor: [number, number, number],
    stats: string[],
    promptText: string,
  ): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
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
    ctx.fillStyle = `rgba(255, 255, 255, ${promptAlpha * (promptText.startsWith('Restart in') ? 0.55 : breathe * 0.5)})`;
    ctx.fillText(promptText, cx, cy + 95);
  }

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

  private getLevelUpLayout(canvas: HTMLCanvasElement, game: Game): {
    headerY: number;
    cards: { x: number; y: number; width: number; height: number }[];
    rerollButton: { x: number; y: number; width: number; height: number };
  } {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const count = Math.max(1, game.draftChoices.length);
    const stacked = w < 900;
    const cards: { x: number; y: number; width: number; height: number }[] = [];
    let rerollY = 0;
    let headerY = 0;

    if (stacked) {
      const gap = 12;
      const sidePadding = 16;
      const cardWidth = Math.min(360, w - sidePadding * 2);
      const cardHeight = 144;
      const startX = (w - cardWidth) / 2;
      const cardY = Math.max(118, Math.round(h * 0.18));
      headerY = Math.max(70, cardY - 72);

      for (let index = 0; index < count; index++) {
        cards.push({
          x: startX,
          y: cardY + index * (cardHeight + gap),
          width: cardWidth,
          height: cardHeight,
        });
      }

      rerollY = cardY + count * (cardHeight + gap) + 6;
    } else {
      const gap = 18;
      const maxCardWidth = 260;
      const cardWidth = Math.min(maxCardWidth, Math.floor((w - 80 - gap * (count - 1)) / count));
      const cardHeight = 204;
      const totalWidth = cardWidth * count + gap * (count - 1);
      const startX = (w - totalWidth) / 2;
      const cardY = Math.max(168, h / 2 - cardHeight / 2 + 24);
      headerY = Math.max(82, cardY - 82);

      for (let index = 0; index < count; index++) {
        cards.push({
          x: startX + index * (cardWidth + gap),
          y: cardY,
          width: cardWidth,
          height: cardHeight,
        });
      }

      rerollY = cardY + cardHeight + 20;
    }

    return {
      headerY,
      cards,
      rerollButton: {
        x: (w - 220) / 2,
        y: rerollY,
        width: 220,
        height: 34,
      },
    };
  }

  private drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ): void {
    const words = text.split(' ');
    let line = '';
    let lineY = y;

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, lineY);
        line = word;
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line) {
      ctx.fillText(line, x, lineY);
    }
  }
}
