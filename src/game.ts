import { WeaponManager } from './weapons';
import { Player } from './player';
import {
  Doctrine,
  TraitCounts,
  UpgradeChoice,
  applyDoctrine,
  applyUpgradeChoice,
  buildUpgradeDraft,
  createEmptyTraitCounts,
  getNewDoctrines,
} from './upgrades';
import { formatTime } from './utils';

export enum GameState {
  TITLE = 'title',
  PLAYING = 'playing',
  LEVEL_UP = 'levelUp',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory',
}

export interface Notification {
  text: string;
  timer: number;
  alpha: number;
  kind: 'info' | 'upgrade' | 'unlock';
}

export class Game {
  state = GameState.TITLE;
  stage = 1;
  elapsedTime = 0;
  totalElapsedTime = 0;
  gameDuration = 480;
  notifications: Notification[] = [{
    text: 'Keep moving. First level-ups unlock new weapons.',
    timer: 4,
    alpha: 1,
    kind: 'info',
  }];
  upgradeCount = 0;
  pendingLevelUps = 0;
  rerollsRemaining = 1;
  draftChoices: UpgradeChoice[] = [];
  selectedDraftIndex = 0;
  readonly traitCounts: TraitCounts = createEmptyTraitCounts();
  activeDoctrines: Doctrine[] = [];

  get timeRemaining(): number {
    return Math.max(0, this.gameDuration - this.elapsedTime);
  }

  get timeRemainingFormatted(): string {
    return formatTime(this.timeRemaining);
  }

  advanceStage(): void {
    this.stage++;
    this.elapsedTime = 0;
    this.state = GameState.PLAYING;
    this.pendingLevelUps = 0;
    this.draftChoices = [];
    this.selectedDraftIndex = 0;
    this.notifications.push({
      text: `Stage ${this.stage} engaged`,
      timer: 2.8,
      alpha: 1,
      kind: 'unlock',
    });
  }

  queueLevelUps(count: number, wm: WeaponManager): void {
    if (count <= 0) return;
    this.pendingLevelUps += count;

    if (this.state !== GameState.LEVEL_UP) {
      this.beginNextDraft(wm);
    }
  }

  beginNextDraft(wm: WeaponManager): boolean {
    if (this.pendingLevelUps <= 0) {
      this.draftChoices = [];
      return false;
    }

    const choices = buildUpgradeDraft(wm, this.upgradeCount);
    if (choices.length === 0) {
      this.pendingLevelUps = 0;
      this.draftChoices = [];
      return false;
    }

    this.pendingLevelUps--;
    this.draftChoices = choices;
    this.selectedDraftIndex = 0;
    this.state = GameState.LEVEL_UP;
    return true;
  }

  setDraftSelection(index: number): void {
    if (this.draftChoices.length === 0) return;
    this.selectedDraftIndex = Math.max(0, Math.min(index, this.draftChoices.length - 1));
  }

  moveDraftSelection(delta: number): void {
    if (this.draftChoices.length === 0) return;
    const count = this.draftChoices.length;
    this.selectedDraftIndex = (this.selectedDraftIndex + delta + count) % count;
  }

  chooseSelectedDraft(wm: WeaponManager, player: Player): boolean {
    return this.chooseDraft(this.selectedDraftIndex, wm, player);
  }

  chooseDraft(index: number, wm: WeaponManager, player: Player): boolean {
    const choice = this.draftChoices[index];
    if (!choice) return false;

    applyUpgradeChoice(choice, wm, player);
    this.registerChoice(choice, wm, player);
    this.upgradeCount++;
    this.pushUpgradeNotification(choice);
    this.draftChoices = [];

    if (!this.beginNextDraft(wm)) {
      this.state = GameState.PLAYING;
    }
    return true;
  }

  rerollDraft(wm: WeaponManager): boolean {
    if (this.state !== GameState.LEVEL_UP || this.rerollsRemaining <= 0) return false;

    const choices = buildUpgradeDraft(wm, this.upgradeCount);
    if (choices.length === 0) return false;

    this.rerollsRemaining--;
    this.draftChoices = choices;
    this.selectedDraftIndex = 0;
    this.notifications.push({
      text: 'Draft rerolled',
      timer: 1.6,
      alpha: 1,
      kind: 'info',
    });
    return true;
  }

  private pushUpgradeNotification(choice: UpgradeChoice): void {
    this.notifications.push({
      text: choice.label,
      timer: choice.kind === 'unlock' ? 3.4 : 2.8,
      alpha: 1,
      kind: choice.kind === 'unlock' ? 'unlock' : 'upgrade',
    });
  }

  private registerChoice(choice: UpgradeChoice, wm: WeaponManager, player: Player): void {
    for (const tag of choice.tags) {
      this.traitCounts[tag]++;
    }

    const doctrines = getNewDoctrines(
      this.traitCounts,
      this.activeDoctrines.map((doctrine) => doctrine.id),
    );

    for (const doctrine of doctrines) {
      applyDoctrine(doctrine, wm, player);
      this.activeDoctrines.push(doctrine);
      this.notifications.push({
        text: `${doctrine.title} online`,
        timer: 3.2,
        alpha: 1,
        kind: 'unlock',
      });
    }
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
