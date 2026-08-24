import { Game } from './game';
import { Player } from './player';
import { WeaponManager, WEAPON_ORDER } from './weapons';
import { Enemy } from './enemies';
import { Language, formatBossTitle, formatCombo, formatHudWeaponLevel, formatHullLabel, formatKillsStat, formatLevelReachedStat, formatLockedCount, formatNextStageStat, formatReachedStageStat, formatRestartCountdown, formatRerollLabel, formatStageClearTitle, formatStageLabel, formatSurvivedStat, formatTotalKillsStat, formatXpLabel, getGameTitleLines, getLanguage, getLanguageButtonLabel, getTagLabel, getUiText, getWeaponName, uiFont } from './i18n';
import { PassiveName, WeaponName } from './ids';
import { loadRecords, loadSettings, saveSettings, RecordUpdateResult } from './storage';
import { audio } from './audio';
import { wrappedDelta } from './utils';
import { formatTime, TWO_PI, easeOutCubic, roundedRect } from './utils';
import {
  touch,
  isTouchDevice,
  JOYSTICK_DISPLAY_RADIUS,
  getPauseButtonLayout,
  getDashButtonLayout,
  getSafeAreaInsets,
  getTouchUiMargin,
} from './input';

type IconName = WeaponName | PassiveName;

const WEAPON_SHAPES: Record<IconName, (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => void> = {
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
  'Escort Wing': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s * 0.8, y + s * 0.8);
    ctx.lineTo(x, y + s * 0.35);
    ctx.lineTo(x - s * 0.8, y + s * 0.8);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(120, 255, 220, 0.95)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.55, y);
    ctx.lineTo(x + s * 1.2, y - s * 0.45);
    ctx.stroke();
  },
  'Seeker Swarm': (ctx, x, y, s) => {
    for (const [dx, dy] of [[-s * 0.5, -s * 0.3], [s * 0.45, -s * 0.15], [0, s * 0.5]]) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy - s * 0.42);
      ctx.lineTo(x + dx + s * 0.3, y + dy + s * 0.36);
      ctx.lineTo(x + dx - s * 0.3, y + dy + s * 0.36);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 190, 110, 0.95)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  },
  'Arc Reactor': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.7, y - s * 0.4);
    ctx.lineTo(x - s * 0.05, y - s * 0.05);
    ctx.lineTo(x - s * 0.45, y + s * 0.15);
    ctx.lineTo(x + s * 0.35, y + s * 0.6);
    ctx.strokeStyle = 'rgba(150, 225, 255, 0.95)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.25, y - s * 0.65);
    ctx.lineTo(x + s * 0.75, y - s * 0.15);
    ctx.stroke();
  },
  'Singularity': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.62, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(190, 120, 255, 0.95)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.28, 0.6, 3.6);
    ctx.strokeStyle = 'rgba(230, 180, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, s * 0.12, 0, TWO_PI);
    ctx.fillStyle = 'rgba(20, 4, 34, 1)';
    ctx.fill();
  },
  'Reinforced Hull': (ctx, x, y, s) => {
    ctx.beginPath();
    roundedRect(ctx, x - s * 0.7, y - s * 0.85, s * 1.4, s * 1.7, 2);
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
  'Targeting CPU': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.55, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(255, 210, 90, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x, y + s);
    ctx.moveTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.strokeStyle = 'rgba(255, 210, 90, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
  'Overclock Core': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x - s * 0.4, y + s * 0.1);
    ctx.lineTo(x + s * 0.1, y + s * 0.05);
    ctx.lineTo(x - s * 0.1, y + s);
    ctx.lineTo(x + s * 0.45, y - s * 0.05);
    ctx.lineTo(x - s * 0.05, y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(160, 240, 130, 0.9)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  },
  'Vampiric Nanites': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.75);
    ctx.bezierCurveTo(x - s * 1.1, y - s * 0.2, x - s * 0.5, y - s * 0.9, x, y - s * 0.25);
    ctx.bezierCurveTo(x + s * 0.5, y - s * 0.9, x + s * 1.1, y - s * 0.2, x, y + s * 0.75);
    ctx.strokeStyle = 'rgba(255, 110, 140, 0.9)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  },
  'XP Amplifier': (ctx, x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.7, y + s * 0.5);
    ctx.lineTo(x, y - s * 0.55);
    ctx.lineTo(x + s * 0.7, y + s * 0.5);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 225, 120, 0.9)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y + s * 0.08, s * 0.16, 0, TWO_PI);
    ctx.fillStyle = 'rgba(255, 235, 170, 0.95)';
    ctx.fill();
  },
};

export type PauseAction =
  | { type: 'resume' }
  | { type: 'restart' }
  | { type: 'quit' }
  | { type: 'toggle'; key: SettingKey };

export type SettingKey = 'soundEnabled' | 'musicEnabled' | 'shakeEnabled' | 'damageNumbersEnabled';

const SETTING_KEYS: SettingKey[] = ['soundEnabled', 'musicEnabled', 'shakeEnabled', 'damageNumbersEnabled'];

function settingLabel(key: SettingKey): string {
  switch (key) {
    case 'soundEnabled': return getUiText('settingSound');
    case 'musicEnabled': return getUiText('settingMusic');
    case 'shakeEnabled': return getUiText('settingShake');
    case 'damageNumbersEnabled': return getUiText('settingNumbers');
  }
}

export class UI {
  // State for animated transitions
  private stateAge = 0;
  private lastState = '';
  private comboPopAge = 99;

  trackState(stateName: string, dt: number): void {
    if (stateName !== this.lastState) {
      this.lastState = stateName;
      this.stateAge = 0;
    }
    this.stateAge += dt;
  }

  notifyComboMilestone(): void {
    this.comboPopAge = 0;
  }

  drawHUD(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    game: Game,
    player: Player,
    wm: WeaponManager,
    enemies: Enemy[],
    comboCount: number,
  ): void {
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

    // ── Timer (or SLAY prompt during boss fight)
    ctx.save();
    ctx.textAlign = 'center';
    if (game.bossEngaged) {
      const pulse = 0.72 + 0.28 * Math.sin(this.stateAge * 6);
      ctx.font = uiFont(24, 'bold');
      ctx.fillStyle = `rgba(255, 60, 90, ${pulse})`;
      ctx.fillText(getUiText('slayPrompt'), w / 2, topInset + 26);
    } else {
      ctx.font = uiFont(28, 'bold');
      const timerText = game.timeRemainingFormatted;
      ctx.fillStyle = 'rgba(100, 200, 255, 0.15)';
      ctx.fillText(timerText, w / 2, topInset + 24);
      ctx.fillText(timerText, w / 2, topInset + 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(timerText, w / 2, topInset + 24);
    }
    ctx.restore();

    this.drawBossBar(ctx, canvas, game, enemies, topInset);
    this.drawOffscreenIndicators(ctx, canvas, player, enemies);
    this.drawComboMeter(ctx, canvas, game, comboCount, topInset);

    ctx.textAlign = 'left';
    ctx.font = uiFont(14, 'bold');
    ctx.fillStyle = hpRatio < 0.3 ? 'rgba(255, 120, 120, 0.95)' : 'rgba(190, 225, 255, 0.85)';
    ctx.fillText(formatHullLabel(Math.ceil(hpRatio * 100)), leftInset, topInset + 18);
    if (hpRatio < 0.35) {
      ctx.fillStyle = 'rgba(255, 120, 120, 0.65)';
      ctx.font = uiFont(12);
      ctx.fillText(getUiText('critical'), leftInset, topInset + 36);
    }

    ctx.font = uiFont(11);
    ctx.fillStyle = 'rgba(160, 210, 255, 0.58)';
    ctx.fillText(formatStageLabel(game.stage), leftInset, topInset + 52);

    ctx.font = uiFont(16);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const killsX = isTouchDevice() ? w - rightInset - 72 : w - rightInset;
    ctx.fillText(`${player.kills}`, killsX, topInset + 19);
    ctx.beginPath();
    ctx.arc(killsX - 35 - ctx.measureText(`${player.kills}`).width * 0.5, topInset + 14, 5, 0, TWO_PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (game.activeDoctrines.length > 0) {
      ctx.textAlign = 'right';
      ctx.font = uiFont(10, 'bold');
      ctx.fillStyle = 'rgba(165, 205, 255, 0.55)';
      ctx.fillText(getUiText('doctrines'), killsX, topInset + 38);

      ctx.font = uiFont(11);
      for (let i = 0; i < game.activeDoctrines.length; i++) {
        ctx.fillStyle = 'rgba(230, 240, 255, 0.72)';
        ctx.fillText(game.activeDoctrines[i].shortLabel(), killsX, topInset + 54 + i * 14);
      }
    }

    // ── XP bar
    const barW = compactHud
      ? Math.max(160, Math.min(w - leftInset - rightInset - 28, 250))
      : Math.max(180, Math.min(w * 0.5, w - leftInset - rightInset - 120));
    const barH = 6;
    const barX = (w - barW) / 2;
    const barY = h - bottomInset - 12;
    const xpRatio = player.xp / player.getXpForNextLevel();
    const barRadius = barH / 2;

    ctx.beginPath();
    roundedRect(ctx, barX, barY, barW, barH, barRadius);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();

    if (xpRatio > 0.01) {
      ctx.save();
      ctx.beginPath();
      roundedRect(ctx, barX, barY, barW, barH, barRadius);
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
    ctx.font = uiFont(11);
    ctx.textAlign = 'center';
    ctx.fillText(formatXpLabel(player.level, player.xp, player.getXpForNextLevel()), w / 2, barY - 6);

    this.drawArmamentPanel(ctx, wm, leftInset, topInset, barY, compactHud);

    if (isTouchDevice()) {
      this.drawPauseButton(ctx, canvas);
      this.drawDashButton(ctx, canvas, player);
      this.drawJoystick(ctx);
    }
  }

  private drawArmamentPanel(
    ctx: CanvasRenderingContext2D,
    wm: WeaponManager,
    leftInset: number,
    topInset: number,
    barY: number,
    compactHud: boolean,
  ): void {
    const owned = WEAPON_ORDER.filter(entry => wm.hasWeapon(entry.name));
    const lockedCount = WEAPON_ORDER.length - owned.length;
    const rows = compactHud ? owned.length : WEAPON_ORDER.length;
    const rowH = 19;
    const panelH = 22 + rows * rowH + (compactHud && lockedCount > 0 ? 16 : 10);
    const panelW = compactHud ? 168 : 196;
    const panelX = leftInset - 2;
    const panelY = Math.max(topInset + 60, barY - panelH - (compactHud ? 30 : 20));

    ctx.beginPath();
    roundedRect(ctx, panelX, panelY, panelW, panelH, 10);
    ctx.fillStyle = 'rgba(8, 14, 30, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 180, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = uiFont(11, 'bold');
    ctx.fillStyle = 'rgba(160, 210, 255, 0.58)';
    ctx.fillText(getUiText('armament'), panelX + 12, panelY + 17);

    let wy = panelY + 34;
    for (const entry of WEAPON_ORDER) {
      const weapon = wm.getWeapon(entry.name);
      if (!weapon && compactHud) continue;

      const drawIcon = WEAPON_SHAPES[entry.name];
      if (drawIcon) {
        drawIcon(ctx, panelX + 13, wy - 4, 6.5);
      }
      ctx.font = uiFont(weapon ? 12 : 11);
      if (weapon) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.74)';
        ctx.fillText(getWeaponName(entry.name), panelX + 26, wy);
        ctx.fillStyle = 'rgba(110, 205, 255, 0.95)';
        ctx.textAlign = 'right';
        ctx.fillText(formatHudWeaponLevel(weapon.level), panelX + panelW - 10, wy);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillText(getWeaponName(entry.name), panelX + 26, wy);
      }
      wy += rowH;
    }

    if (compactHud && lockedCount > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = uiFont(10);
      ctx.fillText(formatLockedCount(lockedCount), panelX + 26, wy + 2);
    }
  }

  private drawBossBar(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    game: Game,
    enemies: Enemy[],
    topInset: number,
  ): void {
    const boss = enemies.find(e => e.isBoss && !e.dead);
    if (!boss || !game.bossEngaged) return;

    const w = canvas.clientWidth;
    const barW = Math.min(430, w * 0.62);
    const barH = 10;
    const barX = (w - barW) / 2;
    const barY = topInset + 66;
    const hpRatio = boss.hp / boss.maxHp;

    ctx.save();
    // Name
    ctx.textAlign = 'center';
    ctx.font = uiFont(12, 'bold');
    ctx.fillStyle = 'rgba(255, 190, 205, 0.92)';
    ctx.fillText(formatBossTitle(game.stage), w / 2, barY - 6);

    // Backing
    ctx.beginPath();
    roundedRect(ctx, barX, barY, barW, barH, barH / 2);
    ctx.fillStyle = 'rgba(20, 6, 12, 0.75)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 90, 120, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fill with phase gradient
    if (hpRatio > 0) {
      ctx.save();
      ctx.beginPath();
      roundedRect(ctx, barX, barY, barW, barH, barH / 2);
      ctx.clip();
      const fillW = barW * hpRatio;
      const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      grad.addColorStop(0, boss.bossPhase === 3 ? 'rgba(255, 40, 40, 0.95)' : 'rgba(255, 40, 90, 0.9)');
      grad.addColorStop(1, boss.bossPhase === 3 ? 'rgba(255, 140, 60, 0.95)' : 'rgba(255, 120, 80, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, fillW, barH);
      ctx.restore();
    }

    // Phase pips
    const pips = 3;
    for (let i = 0; i < pips; i++) {
      const px = barX + barW + 12 + i * 12;
      ctx.beginPath();
      ctx.arc(px, barY + barH / 2, 3.4, 0, TWO_PI);
      ctx.fillStyle = boss.bossPhase > i ? 'rgba(255, 90, 110, 0.95)' : 'rgba(255, 90, 110, 0.2)';
      ctx.fill();
    }
    ctx.restore();
  }

  private drawOffscreenIndicators(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    player: Player,
    enemies: Enemy[],
  ): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const edgePad = 30;
    const camCx = player.x;
    const camCy = player.y;

    for (const enemy of enemies) {
      const isPriority = enemy.isBoss || enemy.isElite;
      if (!isPriority || enemy.dead) continue;

      const delta = wrappedDelta(camCx, camCy, enemy.x, enemy.y);
      const sx = cx + delta.x;
      const sy = cy + delta.y;
      if (sx > edgePad && sx < w - edgePad && sy > edgePad && sy < h - edgePad) continue;

      const dx = sx - cx;
      const dy = sy - cy;
      const angle = Math.atan2(dy, dx);
      const scaleX = dx !== 0 ? (w / 2 - edgePad) / Math.abs(dx) : Infinity;
      const scaleY = dy !== 0 ? (h / 2 - edgePad) / Math.abs(dy) : Infinity;
      const scale = Math.min(scaleX, scaleY);
      const ix = cx + dx * scale;
      const iy = cy + dy * scale;

      const color = enemy.isBoss ? '255, 70, 100' : '205, 145, 255';
      const size = enemy.isBoss ? 9 : 6;

      ctx.save();
      ctx.translate(ix, iy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.7, size * 0.66);
      ctx.lineTo(-size * 0.7, -size * 0.66);
      ctx.closePath();
      ctx.fillStyle = `rgba(${color}, ${enemy.isBoss ? 0.85 : 0.55})`;
      ctx.fill();
      ctx.restore();
    }
  }

  private drawComboMeter(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    _game: Game,
    comboCount: number,
    topInset: number,
  ): void {
    if (comboCount < 3) return;
    const w = canvas.clientWidth;
    const pop = Math.max(0, 1 - this.comboPopAge * 3);
    this.comboPopAge += 1 / 60;
    const scale = 1 + pop * 0.35;
    const label = formatCombo(comboCount);
    const heat = Math.min(1, comboCount / 30);

    ctx.save();
    ctx.translate(w / 2, topInset + 78);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.font = uiFont(15, 'bold');
    const r = Math.round(150 + heat * 105);
    const g = Math.round(220 - heat * 90);
    const b = 120;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.16)`;
    ctx.fillText(label, 0, 1);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.92)`;
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }

  private drawPauseButton(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const layout = getPauseButtonLayout(canvas.clientWidth);

    ctx.fillStyle = 'rgba(10, 18, 38, 0.72)';
    ctx.beginPath();
    ctx.arc(layout.x, layout.y, layout.radius, 0, TWO_PI);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(220, 235, 255, 0.85)';
    ctx.beginPath();
    roundedRect(ctx, layout.x - 7, layout.y - 8, 5, 16, 1.5);
    roundedRect(ctx, layout.x + 2, layout.y - 8, 5, 16, 1.5);
    ctx.fill();
  }

  private drawDashButton(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, player: Player): void {
    const layout = getDashButtonLayout(canvas.clientWidth, canvas.clientHeight);
    const ready = player.dashCooldownRatio <= 0;

    ctx.beginPath();
    ctx.arc(layout.x, layout.y, layout.radius, 0, TWO_PI);
    ctx.fillStyle = ready ? 'rgba(90, 180, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)';
    ctx.fill();
    ctx.strokeStyle = ready ? 'rgba(120, 200, 255, 0.5)' : 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (!ready) {
      ctx.beginPath();
      ctx.arc(layout.x, layout.y, layout.radius, -Math.PI / 2, -Math.PI / 2 + TWO_PI * (1 - player.dashCooldownRatio));
      ctx.strokeStyle = 'rgba(120, 200, 255, 0.55)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Bolt icon
    ctx.beginPath();
    ctx.moveTo(layout.x + 4, layout.y - 14);
    ctx.lineTo(layout.x - 7, layout.y + 2);
    ctx.lineTo(layout.x - 1, layout.y + 2);
    ctx.lineTo(layout.x - 4, layout.y + 14);
    ctx.lineTo(layout.x + 7, layout.y - 3);
    ctx.lineTo(layout.x + 1, layout.y - 3);
    ctx.closePath();
    ctx.fillStyle = ready ? 'rgba(190, 230, 255, 0.9)' : 'rgba(255, 255, 255, 0.25)';
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
    ctx.font = uiFont(titleSize, 'bold');

    const titleLines = getGameTitleLines(compactTitle);
    if (titleLines.length === 2) {
      ctx.fillStyle = `rgba(80, 180, 255, ${0.12 * titleAlpha})`;
      ctx.fillText(titleLines[0], cx, cy - 44);
      ctx.fillText(titleLines[1], cx, cy - 6);
      ctx.fillStyle = `rgba(80, 180, 255, ${0.08 * titleAlpha})`;
      ctx.fillText(titleLines[0], cx + 1, cy - 43);
      ctx.fillText(titleLines[1], cx + 1, cy - 5);
      ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
      ctx.fillText(titleLines[0], cx, cy - 44);
      ctx.fillText(titleLines[1], cx, cy - 6);
    } else {
      ctx.fillStyle = `rgba(80, 180, 255, ${0.12 * titleAlpha})`;
      ctx.fillText(titleLines[0], cx, cy - 30);
      ctx.fillStyle = `rgba(80, 180, 255, ${0.08 * titleAlpha})`;
      ctx.fillText(titleLines[0], cx + 1, cy - 29);
      ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
      ctx.fillText(titleLines[0], cx, cy - 30);
    }

    const subAlpha = Math.max(0, Math.min(1, (t - 0.5) * 2));
    ctx.font = uiFont(w < 500 ? 12 : 14);
    ctx.fillStyle = `rgba(255, 120, 140, ${subAlpha * 0.75})`;
    ctx.fillText(getUiText('titleSubtitle'), cx, cy + Math.max(0, titleSize * 0.55 - 18));

    const promptAlpha = Math.max(0, Math.min(1, (t - 1) * 2));
    const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3));
    ctx.font = uiFont(w < 500 ? 14 : 16);
    ctx.fillStyle = `rgba(255, 255, 255, ${promptAlpha * breathe})`;
    const startMsg = isTouchDevice() ? getUiText('tapToStart') : getUiText('pressAnyKeyToStart');
    ctx.fillText(startMsg, cx, cy + 60);

    const helpAlpha = Math.max(0, Math.min(1, (t - 1.3) * 2));
    ctx.font = uiFont(w < 500 ? 11 : 13);
    ctx.fillStyle = `rgba(160, 200, 255, ${helpAlpha * 0.5})`;
    ctx.fillText(getUiText('titleHintPrimary'), cx, cy + (w < 500 ? 88 : 95));
    if (w < 500) {
      ctx.fillText(getUiText('titleHintSecondaryCompact'), cx, cy + 106);
    } else {
      ctx.fillText(getUiText('titleHintSecondaryWide'), cx, cy + 116);
    }

    // Records strip (hidden on short/landscape viewports to avoid collisions)
    const records = loadRecords();
    if (records.runsPlayed > 0 && h >= 500) {
      const recAlpha = Math.max(0, Math.min(1, (t - 1.6) * 2));
      ctx.font = uiFont(11);
      ctx.fillStyle = `rgba(255, 215, 130, ${recAlpha * 0.55})`;
      const recordLine = `${getUiText('bestStageStat')} ${records.bestStage}   •   ${getUiText('bestComboStat')} ${records.bestCombo}   •   ${getUiText('runsStat')} ${records.runsPlayed}`;
      ctx.fillText(recordLine, cx, h - 96);
    }

    // Version tag
    ctx.font = uiFont(10);
    ctx.fillStyle = 'rgba(160, 200, 255, 0.3)';
    ctx.textAlign = 'right';
    ctx.fillText(getUiText('versionTag'), w - 12, 18);
    ctx.textAlign = 'center';

    this.drawLanguageSelector(ctx, canvas);
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
      const isDanger = n.kind === 'danger';
      const accent = isUnlock
        ? { fill: [255, 185, 90], stroke: [255, 205, 120], text: [255, 245, 220] }
        : isDanger
          ? { fill: [255, 70, 90], stroke: [255, 100, 115], text: [255, 225, 230] }
          : n.kind === 'upgrade'
            ? { fill: [100, 200, 255], stroke: [130, 210, 255], text: [255, 255, 255] }
            : { fill: [120, 150, 200], stroke: [160, 190, 235], text: [220, 235, 255] };

      let fontSize = isUnlock || isDanger ? 22 : 18;
      const maxTextWidth = canvasWidth - 70;
      do {
        ctx.font = uiFont(fontSize, 'bold');
        const text = n.text();
        if (ctx.measureText(text).width <= maxTextWidth || fontSize <= 12) break;
        fontSize--;
      } while (fontSize > 12);

      const textWidth = ctx.measureText(n.text()).width;
      const pillW = Math.min(canvasWidth - 26, textWidth + (isUnlock || isDanger ? 42 : 30));
      const pillH = fontSize >= 18 ? (isUnlock || isDanger ? 36 : 30) : 28;
      const pillX = (canvasWidth - pillW) / 2;

      ctx.fillStyle = `rgba(${accent.fill[0]}, ${accent.fill[1]}, ${accent.fill[2]}, ${0.16 * n.alpha})`;
      ctx.strokeStyle = `rgba(${accent.stroke[0]}, ${accent.stroke[1]}, ${accent.stroke[2]}, ${0.45 * n.alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      roundedRect(ctx, pillX, y - pillH / 2 - 4, pillW, pillH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `rgba(${accent.text[0]}, ${accent.text[1]}, ${accent.text[2]}, ${n.alpha})`;
      ctx.fillText(n.text(), canvasWidth / 2, y);
    }
  }

  drawLevelUpDraft(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: Game): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const layout = this.getLevelUpLayout(canvas, game);

    ctx.fillStyle = 'rgba(4, 8, 18, 0.68)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    const draftShort = h < 560;
    ctx.font = uiFont(draftShort ? 28 : 38, 'bold');
    ctx.fillStyle = '#ffffff';
    ctx.fillText(getUiText('levelUpTitle'), w / 2, layout.headerY);

    ctx.font = uiFont(14);
    ctx.fillStyle = 'rgba(180, 215, 255, 0.72)';
    ctx.fillText(getUiText('levelUpSubtitle'), w / 2, layout.headerY + (draftShort ? 24 : 28));
    if (!draftShort) {
      ctx.font = uiFont(12);
      ctx.fillStyle = 'rgba(180, 215, 255, 0.48)';
      ctx.fillText(
        isTouchDevice() ? getUiText('tapCardToMutate') : getUiText('keyboardDraftControls'),
        w / 2,
        layout.headerY + 48,
      );
    }

    for (let i = 0; i < layout.cards.length; i++) {
      const card = layout.cards[i];
      const choice = game.draftChoices[i];
      if (!choice) continue;
      const isSelected = i === game.selectedDraftIndex;
      const compact = card.height < 120;
      const iconR = compact ? 11 : 14;
      const iconX = card.x + (compact ? 24 : 30);
      const iconY = card.y + (compact ? 24 : 32);

      ctx.beginPath();
      roundedRect(ctx, card.x, card.y, card.width, card.height, 14);
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
        roundedRect(ctx, card.x - 4, card.y - 4, card.width + 8, card.height + 8, 16);
        ctx.strokeStyle = choice.kind === 'unlock' ? 'rgba(255, 210, 135, 0.26)' : 'rgba(150, 220, 255, 0.22)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(iconX, iconY, iconR, 0, TWO_PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      const drawIcon = WEAPON_SHAPES[choice.iconName];
      if (drawIcon) drawIcon(ctx, iconX, iconY, compact ? 7 : 9);

      ctx.textAlign = 'left';
      ctx.font = uiFont(12, 'bold');
      ctx.fillStyle = choice.kind === 'unlock' ? 'rgba(255, 210, 135, 0.85)' : 'rgba(145, 210, 255, 0.72)';
      ctx.fillText(`${i + 1}`, iconX + (compact ? 20 : 26), card.y + 20);

      const titleSize = compact ? 15 : 18;
      ctx.font = uiFont(titleSize, 'bold');
      ctx.fillStyle = '#ffffff';
      this.drawWrappedText(ctx, choice.title(), card.x + 20, card.y + (compact ? 44 : 58), card.width - 40, compact ? 18 : 22);

      if (!compact) {
        ctx.font = uiFont(13);
        ctx.fillStyle = 'rgba(215, 228, 245, 0.72)';
        this.drawWrappedText(ctx, choice.description(), card.x + 20, card.y + 92, card.width - 40, 18);
      }

      let chipX = card.x + 20;
      const chipY = card.y + card.height - (compact ? 24 : 26);
      for (const tag of choice.tags) {
        const label = getTagLabel(tag);
        ctx.font = uiFont(10, 'bold');
        const chipW = ctx.measureText(label).width + 16;
        ctx.beginPath();
        roundedRect(ctx, chipX, chipY, chipW, 18, 9);
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
    roundedRect(ctx, reroll.x, reroll.y, reroll.width, reroll.height, 10);
    const rerollEnabled = game.rerollsRemaining > 0;
    ctx.fillStyle = rerollEnabled ? 'rgba(18, 26, 52, 0.9)' : 'rgba(22, 22, 28, 0.82)';
    ctx.fill();
    ctx.strokeStyle = rerollEnabled ? 'rgba(140, 200, 255, 0.28)' : 'rgba(120, 120, 140, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = uiFont(13, 'bold');
    ctx.fillStyle = rerollEnabled ? 'rgba(200, 230, 255, 0.82)' : 'rgba(170, 170, 180, 0.55)';
    const rerollLabel = rerollEnabled
      ? formatRerollLabel(game.rerollsRemaining)
      : getUiText('rerollSpent');
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

  // ── Pause menu ──────────────────────────────────────────────

  private getPauseMenuLayout(canvas: HTMLCanvasElement): {
    panel: { x: number; y: number; width: number; height: number };
    resume: { x: number; y: number; width: number; height: number };
    restart: { x: number; y: number; width: number; height: number };
    quit: { x: number; y: number; width: number; height: number };
    settingRows: { key: SettingKey; x: number; y: number; width: number; height: number }[];
    buildLabelY: number;
    buildIconY: number;
  } {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const compact = h < 620; // short/landscape viewports
    const panelWidth = Math.min(520, w - 36);
    const panelX = (w - panelWidth) / 2;

    const buttonWidth = Math.min(200, panelWidth - 40);
    const titleH = compact ? 44 : 58;
    const resumeH = compact ? 38 : 44;
    const resume = { x: (w - buttonWidth) / 2, y: titleH + 12, width: buttonWidth, height: resumeH };

    const settingRows: { key: SettingKey; x: number; y: number; width: number; height: number }[] = [];
    const rowHeight = compact ? 26 : 30;
    if (compact) {
      // 2×2 grid to save vertical space.
      const cellGap = 10;
      const cellW = (panelWidth - 56 - cellGap) / 2;
      const gridTop = resume.y + resumeH + 30;
      SETTING_KEYS.forEach((key, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        settingRows.push({
          key,
          x: panelX + 28 + col * (cellW + cellGap),
          y: gridTop + row * (rowHeight + cellGap),
          width: cellW,
          height: rowHeight,
        });
      });
    } else {
      const rowWidth = panelWidth - 56;
      let ry = resume.y + resumeH + 34;
      for (const key of SETTING_KEYS) {
        settingRows.push({ key, x: panelX + 28, y: ry, width: rowWidth, height: rowHeight });
        ry += 36;
      }
    }

    const lastRow = settingRows[settingRows.length - 1];
    const buildLabelY = lastRow.y + rowHeight + 12;
    const buildIconY = buildLabelY + (compact ? 18 : 22);

    const bottomButtonW = (panelWidth - 68) / 2;
    const bottomY = buildIconY + (compact ? 24 : 30);
    const bottomH = compact ? 32 : 38;
    const restart = { x: panelX + 28, y: bottomY, width: bottomButtonW, height: bottomH };
    const quit = { x: panelX + 40 + bottomButtonW, y: bottomY, width: bottomButtonW, height: bottomH };

    const panelHeight = bottomY + bottomH + (compact ? 22 : 30);
    const panelY = Math.max(compact ? 34 : 56, (h - panelHeight) / 2 - 10);

    const rel = <T extends { y: number }>(r: T, dy: number): T => ({ ...r, y: r.y + dy });

    return {
      panel: { x: panelX, y: panelY, width: panelWidth, height: panelHeight },
      resume: rel(resume, panelY),
      restart: rel(restart, panelY),
      quit: rel(quit, panelY),
      settingRows: settingRows.map(r => rel(r, panelY)),
      buildLabelY: buildLabelY + panelY,
      buildIconY: buildIconY + panelY,
    };
  }

  drawPauseMenu(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, game: Game, player: Player, wm: WeaponManager): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const layout = this.getPauseMenuLayout(canvas);
    const compact = h < 620;
    const t = this.stateAge;
    const dimAlpha = Math.min(0.72, t * 3);
    ctx.fillStyle = `rgba(2, 4, 12, ${dimAlpha})`;
    ctx.fillRect(0, 0, w, h);

    // Panel
    ctx.beginPath();
    roundedRect(ctx, layout.panel.x, layout.panel.y, layout.panel.width, layout.panel.height, 16);
    ctx.fillStyle = 'rgba(10, 16, 34, 0.94)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 180, 255, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = uiFont(compact ? 24 : 30, 'bold');
    ctx.fillStyle = '#ffffff';
    ctx.fillText(getUiText('paused'), w / 2, layout.panel.y + (compact ? 30 : 38));

    // Resume
    this.drawMenuButton(ctx, layout.resume, getUiText('resumeBtn'), 'accent');

    // Settings
    ctx.font = uiFont(11, 'bold');
    ctx.fillStyle = 'rgba(160, 210, 255, 0.5)';
    ctx.textAlign = 'left';
    ctx.fillText(getUiText('settingsSection'), layout.panel.x + 28, layout.resume.y + layout.resume.height + (compact ? 16 : 20));
    ctx.textAlign = 'center';

    for (const row of layout.settingRows) {
      const enabled = this.readSetting(row.key);
      ctx.beginPath();
      roundedRect(ctx, row.x, row.y, row.width, row.height, 8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140, 180, 240, 0.14)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = uiFont(compact ? 12 : 13);
      ctx.fillStyle = 'rgba(225, 235, 250, 0.85)';
      ctx.textAlign = 'left';
      ctx.fillText(settingLabel(row.key), row.x + 10, row.y + row.height / 2 + 4);
      ctx.textAlign = 'right';

      const pillW = compact ? 40 : 52;
      const pillH = Math.min(row.height - 6, 20);
      const pillX = row.x + row.width - pillW - 8;
      const pillY = row.y + (row.height - pillH) / 2;
      ctx.beginPath();
      roundedRect(ctx, pillX, pillY, pillW, pillH, 8);
      ctx.fillStyle = enabled ? 'rgba(70, 160, 255, 0.3)' : 'rgba(90, 90, 110, 0.25)';
      ctx.fill();
      ctx.font = uiFont(10, 'bold');
      ctx.fillStyle = enabled ? 'rgba(190, 230, 255, 0.95)' : 'rgba(180, 180, 195, 0.6)';
      ctx.fillText(enabled ? getUiText('toggleOn') : getUiText('toggleOff'), pillX + pillW / 2, pillY + pillH / 2 + 4);
      ctx.textAlign = 'center';
    }

    // Build summary
    const buildY = layout.buildLabelY;
    const iconRowY = layout.buildIconY;
    ctx.font = uiFont(11, 'bold');
    ctx.fillStyle = 'rgba(160, 210, 255, 0.5)';
    ctx.textAlign = 'left';
    ctx.fillText(getUiText('currentBuild'), layout.panel.x + 28, buildY);

    let iconX = layout.panel.x + 34;
    let iconY = iconRowY;
    for (const entry of WEAPON_ORDER) {
      const weapon = wm.getWeapon(entry.name);
      if (!weapon) continue;
      const drawIcon = WEAPON_SHAPES[entry.name];
      if (drawIcon) drawIcon(ctx, iconX, iconY, 8);
      ctx.font = uiFont(12, 'bold');
      ctx.fillStyle = 'rgba(140, 210, 255, 0.9)';
      ctx.fillText(formatHudWeaponLevel(weapon.level), iconX + 13, iconY + 4);
      iconX += 46;
      if (iconX > layout.panel.x + layout.panel.width - 40) {
        iconX = layout.panel.x + 34;
        iconY += 26;
      }
    }
    for (const doctrine of game.activeDoctrines) {
      ctx.font = uiFont(10, 'bold');
      const label = doctrine.shortLabel();
      const chipW = ctx.measureText(label).width + 14;
      if (iconX + chipW > layout.panel.x + layout.panel.width - 24) {
        iconX = layout.panel.x + 34;
        iconY += 22;
      }
      ctx.beginPath();
      roundedRect(ctx, iconX, iconY - 10, chipW, 16, 8);
      ctx.fillStyle = 'rgba(165, 205, 255, 0.12)';
      ctx.fill();
      ctx.fillStyle = 'rgba(200, 225, 255, 0.75)';
      ctx.textAlign = 'center';
      ctx.fillText(label, iconX + chipW / 2, iconY + 1);
      iconX += chipW + 8;
    }
    ctx.textAlign = 'center';

    // Bottom buttons
    this.drawMenuButton(ctx, layout.restart, getUiText('restartBtn'), 'normal');
    this.drawMenuButton(ctx, layout.quit, getUiText('quitBtn'), 'danger');

    // Hull line for context
    ctx.font = uiFont(11);
    ctx.fillStyle = 'rgba(190, 225, 255, 0.45)';
    ctx.fillText(formatHullLabel(Math.ceil((player.hp / player.maxHp) * 100)), w / 2, layout.panel.y + layout.panel.height - (compact ? 8 : 10));

    // Only draw the language selector when it cannot collide with the panel.
    const selectorTop = h - getSafeAreaInsets().bottom - getTouchUiMargin() - 44 - 10;
    if (layout.panel.y + layout.panel.height < selectorTop) {
      this.drawLanguageSelector(ctx, canvas);
    }
  }

  private readSetting(key: SettingKey): boolean {
    return loadSettings()[key];
  }

  applySettingToggle(key: SettingKey): void {
    const settings = loadSettings();
    settings[key] = !settings[key];
    saveSettings(settings);
    audio.setSoundEnabled(settings.soundEnabled);
    audio.setMusicEnabled(settings.musicEnabled);
    audio.playUiClick();
  }

  getPauseActionAt(canvas: HTMLCanvasElement, x: number, y: number): PauseAction | null {
    const hit = this.getPauseMenuLayout(canvas);
    if (this.inRect(hit.resume, x, y)) return { type: 'resume' };
    if (this.inRect(hit.restart, x, y)) return { type: 'restart' };
    if (this.inRect(hit.quit, x, y)) return { type: 'quit' };
    for (const row of hit.settingRows) {
      if (this.inRect(row, x, y)) return { type: 'toggle', key: row.key };
    }
    return null;
  }

  private inRect(rect: Rect, x: number, y: number): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  private drawMenuButton(
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    label: string,
    style: 'accent' | 'normal' | 'danger',
  ): void {
    const colors = style === 'accent'
      ? { fill: 'rgba(50, 110, 220, 0.4)', stroke: 'rgba(150, 210, 255, 0.6)', text: 'rgba(235, 245, 255, 0.98)' }
      : style === 'danger'
        ? { fill: 'rgba(120, 30, 45, 0.35)', stroke: 'rgba(255, 110, 130, 0.4)', text: 'rgba(255, 210, 218, 0.9)' }
        : { fill: 'rgba(255, 255, 255, 0.05)', stroke: 'rgba(150, 190, 245, 0.25)', text: 'rgba(220, 232, 248, 0.85)' };

    ctx.beginPath();
    roundedRect(ctx, rect.x, rect.y, rect.width, rect.height, 10);
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = uiFont(style === 'accent' ? 16 : 13, 'bold');
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2 + 5);
  }

  drawGameOver(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    player: Player,
    game: Game,
    canRestart: boolean,
    restartCountdown: number,
    recordResult?: RecordUpdateResult,
    bestCombo?: number,
  ): void {
    const prompt = canRestart
      ? (isTouchDevice() ? getUiText('tapToRestart') : getUiText('pressAnyKeyToRestart'))
      : formatRestartCountdown(restartCountdown);
    const stats: string[] = [
      formatSurvivedStat(formatTime(game.totalElapsedTime)),
      formatReachedStageStat(game.stage),
      formatKillsStat(player.kills),
    ];
    const badges = [
      !!recordResult?.newBestTime,
      !!recordResult?.newBestStage,
      !!recordResult?.newBestKills,
    ];
    if (typeof bestCombo === 'number' && bestCombo >= 3) {
      stats.push(`${getUiText('bestComboStat')}  ${bestCombo}`);
      badges.push(!!recordResult?.newBestCombo);
    }
    this.drawEndScreen(ctx, canvas, getUiText('gameOver'), [255, 68, 68], [80, 0, 0], stats, prompt, !canRestart, badges);
  }

  drawVictory(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    player: Player,
    game: Game,
    recordResult?: RecordUpdateResult,
  ): void {
    this.drawEndScreen(ctx, canvas, formatStageClearTitle(game.stage), [68, 255, 136], [80, 60, 0], [
      formatNextStageStat(game.stage + 1),
      formatTotalKillsStat(player.kills),
      formatLevelReachedStat(player.level),
    ], isTouchDevice() ? getUiText('tapToNextStage') : getUiText('pressAnyKeyToNextStage'), false, [
      false,
      !!recordResult?.newBestKills,
      !!recordResult?.newBestLevel,
    ]);
  }

  private drawEndScreen(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    title: string,
    titleColor: [number, number, number],
    vignetteColor: [number, number, number],
    stats: string[],
    promptText: string,
    subduedPrompt = false,
    newRecordBadges?: boolean[],
  ): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const t = this.stateAge;
    const shortEnd = h < 500;
    const statGap = shortEnd ? 24 : 30;
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
    ctx.translate(cx, cy - (shortEnd ? 70 : 50) - Math.min(stats.length, 4) * (statGap / 2));
    ctx.scale(titleScale, titleScale);
    ctx.font = uiFont(shortEnd ? 38 : 52, 'bold');
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${titleAlpha * 0.15})`;
    ctx.fillText(title, 0, 0);
    ctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${titleAlpha})`;
    ctx.fillText(title, 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.font = uiFont(18);
    for (let i = 0; i < stats.length; i++) {
      const statAlpha = Math.max(0, Math.min(1, (t - 0.4 - i * 0.2) * 3));
      const text = stats[i];
      const badge = newRecordBadges?.[i] ?? false;
      const badgeLabel = `★ ${getUiText('newRecord')}`;
      ctx.font = uiFont(18);
      const textW = ctx.measureText(text).width;
      ctx.font = uiFont(14, 'bold');
      const badgeW = badge ? ctx.measureText(badgeLabel).width : 0;
      const totalW = textW + (badge ? badgeW + 10 : 0);
      const startX = cx - totalW / 2;

      ctx.textAlign = 'left';
      ctx.font = uiFont(shortEnd ? 15 : 18);
      ctx.fillStyle = `rgba(255, 255, 255, ${statAlpha * 0.7})`;
      ctx.fillText(text, startX, cy + 15 + i * statGap);
      if (badge && statAlpha > 0.1) {
        const badgePulse = 0.75 + 0.25 * Math.sin(t * 5);
        ctx.font = uiFont(shortEnd ? 12 : 14, 'bold');
        ctx.fillStyle = `rgba(255, 210, 90, ${statAlpha * badgePulse})`;
        ctx.fillText(badgeLabel, startX + textW + 10, cy + 15 + i * statGap);
      }
    }
    ctx.textAlign = 'center';

    const promptAlpha = Math.max(0, Math.min(1, (t - 1.2) * 2));
    const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3));
    ctx.font = uiFont(14);
    ctx.fillStyle = `rgba(255, 255, 255, ${promptAlpha * (subduedPrompt ? 0.55 : breathe * 0.5)})`;
    ctx.fillText(promptText, cx, cy + (shortEnd ? 78 : 95) + Math.max(0, stats.length - 3) * statGap);
    this.drawLanguageSelector(ctx, canvas);
  }

  drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, hpRatio: number): void {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) * 0.75;

    const baseAlpha = 0.3 + (1 - hpRatio) * 0.35;
    const grad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(0, 0, 0, ${baseAlpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

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
    // Stack vertically on narrow-ish screens that are tall enough; anything
    // short (landscape phones) uses the 3-column layout with compact cards.
    const shortScreen = h < 560;
    const stacked = w < 900 && !shortScreen;
    const cards: { x: number; y: number; width: number; height: number }[] = [];
    let rerollY = 0;
    let headerY = 0;

    if (stacked) {
      const gap = shortScreen ? 8 : 12;
      const sidePadding = 16;
      const headerBlock = shortScreen ? 92 : 118;
      const rerollBlock = 48;
      const cardWidth = Math.min(360, w - sidePadding * 2);
      const cardHeight = Math.max(92, Math.min(144, Math.floor((h - headerBlock - rerollBlock - gap * (count - 1)) / count)));
      const startX = (w - cardWidth) / 2;
      const cardY = Math.max(shortScreen ? 84 : 118, Math.round(h * 0.18));
      headerY = Math.max(shortScreen ? 48 : 70, cardY - (shortScreen ? 52 : 72));

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
      const cardHeight = Math.max(150, Math.min(204, h - 150));
      const totalWidth = cardWidth * count + gap * (count - 1);
      const startX = (w - totalWidth) / 2;
      const cardY = Math.max(shortScreen ? 96 : 168, h / 2 - cardHeight / 2 + 24);
      headerY = Math.max(shortScreen ? 52 : 82, cardY - (shortScreen ? 58 : 82));

      for (let index = 0; index < count; index++) {
        cards.push({
          x: startX + index * (cardWidth + gap),
          y: cardY,
          width: cardWidth,
          height: cardHeight,
        });
      }

      rerollY = cardY + cardHeight + (shortScreen ? 10 : 14);
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

  drawLanguageSelector(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const layout = this.getLanguageSelectorLayout(canvas);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = uiFont(11, 'bold');
    ctx.fillStyle = 'rgba(180, 215, 255, 0.7)';
    ctx.fillText(getUiText('languageLabel'), canvas.clientWidth / 2, layout.labelY);

    for (const button of layout.buttons) {
      const active = button.language === getLanguage();
      ctx.beginPath();
      roundedRect(ctx, button.x, button.y, button.width, button.height, 10);
      ctx.fillStyle = active ? 'rgba(70, 132, 230, 0.42)' : 'rgba(10, 16, 30, 0.72)';
      ctx.fill();
      ctx.strokeStyle = active ? 'rgba(170, 220, 255, 0.8)' : 'rgba(160, 190, 235, 0.22)';
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.stroke();

      ctx.font = uiFont(13, active ? 'bold' : 'normal');
      ctx.fillStyle = active ? '#ffffff' : 'rgba(215, 228, 245, 0.78)';
      ctx.fillText(getLanguageButtonLabel(button.language), button.x + button.width / 2, button.y + 21);
    }
    ctx.restore();
  }

  getLanguageActionAt(canvas: HTMLCanvasElement, x: number, y: number): Language | null {
    const layout = this.getLanguageSelectorLayout(canvas);
    for (const button of layout.buttons) {
      if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
        return button.language;
      }
    }
    return null;
  }

  private getLanguageSelectorLayout(canvas: HTMLCanvasElement): {
    labelY: number;
    buttons: { language: Language; x: number; y: number; width: number; height: number }[];
  } {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const safe = getSafeAreaInsets();
    const bottomInset = safe.bottom + getTouchUiMargin();
    const buttonWidth = 112;
    const buttonHeight = 32;
    const gap = 12;
    const totalWidth = buttonWidth * 2 + gap;
    const startX = (w - totalWidth) / 2;
    const y = h - bottomInset - buttonHeight - 12;

    return {
      labelY: y - 10,
      buttons: [
        { language: 'zh-CN', x: startX, y, width: buttonWidth, height: buttonHeight },
        { language: 'en', x: startX + buttonWidth + gap, y, width: buttonWidth, height: buttonHeight },
      ],
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
    const tokens = text.includes(' ') ? text.split(/(\s+)/).filter(Boolean) : Array.from(text);
    let line = '';
    let lineY = y;

    for (const token of tokens) {
      const testLine = `${line}${token}`;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line.trimEnd(), x, lineY);
        line = token.trimStart();
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line) {
      ctx.fillText(line.trimEnd(), x, lineY);
    }
  }
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
