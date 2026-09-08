import { getLanguage } from './i18n';
import type { EnemyType } from './entities/enemies/types';

/** All timing is in expedition seconds; stage duration can scale the whole arc. */
export const ENCOUNTER_WARNING = 6;
export const ENCOUNTER_LENGTH = 22;
export const ENCOUNTER_RECOVERY = 18;

export interface EncounterEvent {
  readonly at: number;
  readonly type: EnemyType;
  readonly count: number;
  readonly name: readonly [string, string];
  readonly tactic: readonly [string, string];
}

export const ENCOUNTERS: readonly EncounterEvent[] = [
  { at: 120, type: 'stalker', count: 2, name: ['Hunter pair', '猎手双袭'], tactic: ['Keep moving; the hunters weave toward you.', '持续移动，猎手会曲线逼近。'] },
  { at: 240, type: 'lancer', count: 2, name: ['Lance patrol', '突击巡逻队'], tactic: ['Move sideways when their charge lights up.', '看到冲锋预警时横向闪避。'] },
  { at: 360, type: 'sentinel', count: 2, name: ['Sentinel breach', '哨兵突破'], tactic: ['Watch the volley gaps and keep an exit open.', '穿过弹幕空隙，保持退路。'] },
  { at: 480, type: 'overlord', count: 1, name: ['Brood sovereign', '虫群霸主'], tactic: ['Focus the summoner before its swarm grows.', '优先击败召唤者，阻止虫群扩张。'] },
];

const names: readonly (readonly [string, string])[] = [
  ['First light', '初光'], ['Build momentum', '积蓄力量'], ['Hostile orbit', '危机轨道'],
  ['Event horizon', '事件视界'], ['Warden approach', '守望者逼近'], ['Warden encounter', '迎战守望者'],
];
const descriptions: readonly (readonly [string, string])[] = [
  ['Gather XP and establish your first weapon upgrades.', '收集经验，强化初始武器。'],
  ['Shape your build and keep a route through the swarm.', '完善流派，在虫群中留出退路。'],
  ['New threats demand movement and focused fire.', '新威胁出现，灵活移动并集中火力。'],
  ['Use your evolved arsenal to control the pressure.', '利用进化武器，掌控战场压力。'],
  ['Collect nearby XP and prepare for the Warden.', '收集附近经验，准备迎战守望者。'],
  ['Read its attack signals and strike between volleys.', '观察攻击预警，在弹幕间隙反击。'],
];

function expeditionTime(elapsed: number, duration: number): number {
  return Math.max(0, elapsed) * 600 / Math.max(1, duration);
}

function localized(pair: readonly [string, string]): string {
  return pair[getLanguage() === 'zh-CN' ? 1 : 0];
}

export function getEncounterName(event: EncounterEvent): string {
  return localized(event.name);
}

export function getEncounterMessage(event: EncounterEvent, warning: boolean): string {
  return warning
    ? (getLanguage() === 'zh-CN' ? `${getEncounterName(event)}即将抵达 · 准备迎战` : `${getEncounterName(event)} inbound · prepare`)
    : `${getEncounterName(event)} · ${localized(event.tactic)}`;
}

/** One-way timeline: an event must be seen in its warning window to be armed.
 * A suspended tab or debug time jump can never unleash a backlog of elites. */
export class EncounterDirector {
  private next = 0;
  private armed = false;
  private warnedAt = 0;

  reset(): void {
    this.next = 0;
    this.armed = false;
  }

  update(elapsed: number, duration = 600): { kind: 'warning' | 'spawn'; event: EncounterEvent } | null {
    const time = expeditionTime(elapsed, duration);
    while (this.next < ENCOUNTERS.length) {
      const event = ENCOUNTERS[this.next];
      if (time < event.at - ENCOUNTER_WARNING) return null;
      if (time < event.at) {
        if (this.armed) return null;
        this.armed = true;
        this.warnedAt = time;
        return { kind: 'warning', event };
      }
      this.next++;
      const shouldSpawn = this.armed && time - this.warnedAt >= 3 && time <= event.at + 3;
      this.armed = false;
      if (shouldSpawn) return { kind: 'spawn', event };
    }
    return null;
  }
}

/** Multiply regular spawn intervals to preserve space around named encounters. */
export function getEncounterSpawnPace(elapsed: number, duration = 600): number {
  const time = expeditionTime(elapsed, duration);
  for (const event of ENCOUNTERS) {
    if (time >= event.at - ENCOUNTER_WARNING && time < event.at + ENCOUNTER_LENGTH) return 1.45;
    if (time >= event.at + ENCOUNTER_LENGTH && time < event.at + ENCOUNTER_LENGTH + ENCOUNTER_RECOVERY) return 2.2;
  }
  if (time >= 570 && time < 600) return 1.6;
  return time > 60 && time % 60 < 9 ? 1.65 : 1;
}

export function getEncounterPhase(elapsed: number, duration = 600): { name: string; description: string; progress: number } {
  const time = expeditionTime(elapsed, duration);
  const progress = Math.min(1, time / 600);
  for (const event of ENCOUNTERS) {
    if (time >= event.at - ENCOUNTER_WARNING && time < event.at) {
      return { name: localized(['Elite signal', '精英信号']), description: getEncounterMessage(event, true), progress };
    }
    if (time >= event.at && time < event.at + ENCOUNTER_LENGTH) {
      return { name: getEncounterName(event), description: localized(event.tactic), progress };
    }
    if (time >= event.at + ENCOUNTER_LENGTH && time < event.at + ENCOUNTER_LENGTH + ENCOUNTER_RECOVERY) {
      return { name: localized(['Gather & regroup', '收集与整备']), description: localized(['Reinforcements have slowed. Gather XP and find space.', '增援暂缓。收集经验，寻找安全空间。']), progress };
    }
  }
  const phase = time < 60 ? 0 : time < 180 ? 1 : time < 360 ? 2 : time < 540 ? 3 : time < 600 ? 4 : 5;
  return { name: localized(names[phase]), description: localized(descriptions[phase]), progress };
}
