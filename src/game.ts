import { WeaponManager } from './weapons';

export enum GameState {
  TITLE = 'title',
  PLAYING = 'playing',
  LEVEL_UP = 'levelUp',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory',
}

export interface LevelUpChoice {
  type: 'new' | 'upgrade';
  weapon: string;
  name: string;
  description: string;
}

export class Game {
  state = GameState.TITLE;
  elapsedTime = 0;
  gameDuration = 300;
  levelUpChoices: LevelUpChoice[] = [];
  selectedChoice = 0;

  get timeRemaining(): number {
    return Math.max(0, this.gameDuration - this.elapsedTime);
  }

  get timeRemainingFormatted(): string {
    const t = Math.ceil(this.timeRemaining);
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  generateLevelUpChoices(wm: WeaponManager): void {
    const choices: LevelUpChoice[] = [];

    if (!wm.hasWeapon('Orbit Shield')) {
      choices.push({ type: 'new', weapon: 'orbit', name: 'Orbit Shield', description: 'Projectiles orbit around you' });
    }
    if (!wm.hasWeapon('Nova Blast')) {
      choices.push({ type: 'new', weapon: 'nova', name: 'Nova Blast', description: 'AoE pulse damages nearby enemies' });
    }

    for (const w of wm.weapons) {
      if (w.level < w.maxLevel) {
        choices.push({ type: 'upgrade', weapon: w.name, name: `${w.name} Lv.${w.level + 1}`, description: `Upgrade ${w.name}` });
      }
    }

    while (choices.length > 3) {
      choices.splice(Math.floor(Math.random() * choices.length), 1);
    }

    this.levelUpChoices = choices;
    this.selectedChoice = 0;
  }

  applyLevelUpChoice(index: number, wm: WeaponManager): void {
    const choice = this.levelUpChoices[index];
    if (!choice) return;

    if (choice.type === 'new') {
      wm.addWeapon(choice.weapon as 'orbit' | 'nova');
    } else {
      const weapon = wm.getWeapon(choice.weapon);
      if (weapon) weapon.level++;
    }
  }
}
