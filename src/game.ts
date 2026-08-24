import { WeaponManager } from './weapons';
import { Player } from './player';
import {
  Doctrine,
  PassiveStacks,
  TraitCounts,
  UpgradeChoice,
  applyDoctrine,
  applyUpgradeChoice,
  buildUpgradeDraft,
  createEmptyPassiveStacks,
  createEmptyTraitCounts,
  getNewDoctrines,
} from './upgrades';
import { TextResolver, formatDoctrineOnline, formatStageEngaged, formatBossTitle, formatStageMutators, getMutatorDesc, getMutatorName, getUiText } from './i18n';
import { formatTime } from './utils';
import { isTouchDevice } from './input';
import { PASSIVE_CAPS } from './ids';
import { rollMutators, type MutatorId } from './mutators';

export enum GameState {
  TITLE = 'title',
  PLAYING = 'playing',
  LEVEL_UP = 'levelUp',
  PAUSED = 'paused',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory',
}

export interface Notification {
  text: TextResolver;
  timer: number;
  alpha: number;
  kind: 'info' | 'upgrade' | 'unlock' | 'danger';
}

interface ScheduledNotification {
  atElapsed: number;
  text: TextResolver;
  kind: Notification['kind'];
  duration: number;
}

export class Game {
  state = GameState.TITLE;
  stage = 1;
  elapsedTime = 0;
  totalElapsedTime = 0;
  notifications: Notification[] = [{
    text: () => getUiText('keepMovingTutorial'),
    timer: 4,
    alpha: 1,
    kind: 'info',
  }];
  upgradeCount = 0;
  pendingLevelUps = 0;
  rerollsRemaining = 2;
  draftChoices: UpgradeChoice[] = [];
  selectedDraftIndex = 0;
  readonly traitCounts: TraitCounts = createEmptyTraitCounts();
  readonly passiveStacks: PassiveStacks = createEmptyPassiveStacks();
  activeDoctrines: Doctrine[] = [];
  /** True once the countdown hit zero and the boss encounter began. */
  bossEngaged = false;
  /** Active stage mutators (empty for stage 1). */
  mutators: MutatorId[] = [];
  private scheduled: ScheduledNotification[] = [
    {
      atElapsed: 6,
      kind: 'info',
      duration: 4.5,
      text: () => getUiText(isTouchDevice() ? 'tutorialDashTouch' : 'tutorialDashKey'),
    },
  ];

  /** Survival countdown before the Warden arrives; shrinks on later stages. */
  get gameDuration(): number {
    return Math.max(180, 300 - (this.stage - 1) * 20);
  }

  get timeRemaining(): number {
    return Math.max(0, this.gameDuration - this.elapsedTime);
  }

  get timeRemainingFormatted(): string {
    return formatTime(this.timeRemaining);
  }

  beginBossEncounter(): void {
    if (this.bossEngaged) return;
    this.bossEngaged = true;
    this.notifications.push({
      text: () => getUiText('bossIncoming'),
      timer: 3.2,
      alpha: 1,
      kind: 'danger',
    });
  }

  notifyBossDefeated(): void {
    this.notifications.push({
      text: () => getUiText('bossDefeated'),
      timer: 2.6,
      alpha: 1,
      kind: 'unlock',
    });
  }

  advanceStage(): void {
    this.stage++;
    this.elapsedTime = 0;
    this.bossEngaged = false;
    this.state = GameState.PLAYING;
    this.pendingLevelUps = 0;
    this.draftChoices = [];
    this.selectedDraftIndex = 0;
    this.rerollsRemaining = Math.min(3, this.rerollsRemaining + 1);
    this.mutators = rollMutators(this.stage);
    this.notifications.push({
      text: () => formatStageEngaged(this.stage),
      timer: 2.8,
      alpha: 1,
      kind: 'unlock',
    });
    this.notifications.push({
      text: () => formatBossTitle(this.stage),
      timer: 3,
      alpha: 1,
      kind: 'danger',
    });
    if (this.mutators.length > 0) {
      this.notifications.push({
        text: () => `${formatStageMutators(this.stage)}: ${this.mutators.map(m => getMutatorName(m)).join(' + ')}`,
        timer: 4.2,
        alpha: 1,
        kind: 'danger',
      });
      for (const id of this.mutators) {
        this.notifications.push({
          text: () => `${getMutatorName(id)} — ${getMutatorDesc(id)}`,
          timer: 4.6,
          alpha: 1,
          kind: 'info',
        });
      }
    }
  }

  queueLevelUps(count: number, wm: WeaponManager): void {
    if (count <= 0) return;
    if (wm.allMaxed() && this.allPassivesCapped()) {
      this.pendingLevelUps = 0;
      return;
    }
    this.pendingLevelUps += count;

    if (this.state !== GameState.LEVEL_UP) {
      this.beginNextDraft(wm);
    }
  }

  private allPassivesCapped(): boolean {
    return (Object.keys(this.passiveStacks) as (keyof typeof this.passiveStacks)[])
      .every(id => this.passiveStacks[id] >= PASSIVE_CAPS[id]);
  }

  beginNextDraft(wm: WeaponManager): boolean {
    if (this.pendingLevelUps <= 0) {
      this.draftChoices = [];
      return false;
    }

    const choices = buildUpgradeDraft(wm, this.upgradeCount, this.passiveStacks);
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

    const choices = buildUpgradeDraft(wm, this.upgradeCount, this.passiveStacks);
    if (choices.length === 0) return false;

    this.rerollsRemaining--;
    this.draftChoices = choices;
    this.selectedDraftIndex = 0;
    this.notifications.push({
      text: () => getUiText('draftRerolled'),
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
    if (choice.kind === 'passive') {
      this.passiveStacks[choice.passiveId]++;
    }

    const doctrines = getNewDoctrines(
      this.traitCounts,
      this.activeDoctrines.map((doctrine) => doctrine.id),
    );

    for (const doctrine of doctrines) {
      applyDoctrine(doctrine, wm, player);
      this.activeDoctrines.push(doctrine);
      this.notifications.push({
        text: () => formatDoctrineOnline(doctrine.id),
        timer: 3.2,
        alpha: 1,
        kind: 'unlock',
      });
    }
  }

  updateNotifications(dt: number): void {
    while (this.scheduled.length > 0 && this.elapsedTime >= this.scheduled[0].atElapsed) {
      const item = this.scheduled.shift()!;
      this.notifications.push({
        text: item.text,
        timer: item.duration,
        alpha: 1,
        kind: item.kind,
      });
    }

    for (const n of this.notifications) {
      n.timer -= dt;
      if (n.timer < 0.5) {
        n.alpha = Math.max(0, n.timer / 0.5);
      }
    }
    this.notifications = this.notifications.filter(n => n.timer > 0);
  }
}
