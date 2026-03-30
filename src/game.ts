import { WeaponManager } from './weapons';
import { formatTime } from './utils';

export enum GameState {
  TITLE = 'title',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory',
}

interface Notification {
  text: string;
  timer: number;
  alpha: number;
}

export class Game {
  state = GameState.TITLE;
  elapsedTime = 0;
  gameDuration = 300;
  notifications: Notification[] = [];

  get timeRemaining(): number {
    return Math.max(0, this.gameDuration - this.elapsedTime);
  }

  get timeRemainingFormatted(): string {
    return formatTime(this.timeRemaining);
  }

  applyRandomUpgrade(wm: WeaponManager): void {
    const choices: { type: 'new' | 'upgrade'; weapon: string; label: string }[] = [];

    if (!wm.hasWeapon('Orbit Shield')) {
      choices.push({ type: 'new', weapon: 'orbit', label: 'New weapon: Orbit Shield' });
    }
    if (!wm.hasWeapon('Nova Blast')) {
      choices.push({ type: 'new', weapon: 'nova', label: 'New weapon: Nova Blast' });
    }
    for (const w of wm.weapons) {
      if (w.level < w.maxLevel) {
        choices.push({ type: 'upgrade', weapon: w.name, label: `${w.name} → Lv.${w.level + 1}` });
      }
    }

    if (choices.length === 0) return;

    const choice = choices[Math.floor(Math.random() * choices.length)];
    if (choice.type === 'new') {
      wm.addWeapon(choice.weapon as 'orbit' | 'nova');
    } else {
      const weapon = wm.getWeapon(choice.weapon);
      if (weapon) weapon.level++;
    }

    this.notifications.push({ text: choice.label, timer: 2.5, alpha: 1 });
  }

  updateNotifications(dt: number): void {
    for (const n of this.notifications) {
      n.timer -= dt;
      if (n.timer < 0.5) {
        n.alpha = Math.max(0, n.timer / 0.5);
      }
    }
    this.notifications = this.notifications.filter(n => n.timer > 0);
  }
}
