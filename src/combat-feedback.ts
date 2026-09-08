import type { EnemyType } from './enemies';
import { getLanguage } from './i18n';

export interface DamageSource {
  enemy: EnemyType;
  kind: 'contact' | 'projectile';
  x: number;
  y: number;
}

const ENEMY_NAMES: Record<EnemyType, [string, string]> = {
  swarmer: ['Swarmer', '蜂群'], drifter: ['Drifter', '漂流者'],
  titan: ['Titan', '泰坦'], overlord: ['Overlord', '霸主'],
  spitter: ['Spitter', '喷射者'], splitter: ['Splitter', '分裂者'],
  bomber: ['Bomber', '爆破者'], stalker: ['Stalker', '追猎者'],
  sentinel: ['Sentinel', '哨兵'], lancer: ['Lancer', '枪骑兵'], boss: ['Void Warden', '虚空看守者'],
};

export function describeLastHit(source: DamageSource): { cause: string; advice: string } {
  const cn = getLanguage() === 'zh-CN';
  const name = ENEMY_NAMES[source.enemy][cn ? 1 : 0];
  const cause = cn ? `${name} · ${source.kind === 'contact' ? '碰撞' : '弹幕'}`
    : `${name} / ${source.kind === 'contact' ? 'collision' : 'projectile'}`;
  let advice = cn ? '保持移动，留出撤退空间。' : 'Keep moving and leave yourself an escape route.';
  if (source.kind === 'projectile') advice = cn ? '等待弹幕接近，再冲刺穿过。' : 'Let the volley approach, then dash through it.';
  if (source.enemy === 'drifter' || source.enemy === 'lancer') advice = cn ? '看到瞄准线后，横向闪避冲锋。' : 'Dodge sideways when the charge line appears.';
  if (source.enemy === 'bomber') advice = cn ? '引燃后迅速离开爆破者。' : 'Create distance as soon as the bomber arms.';
  return { cause, advice };
}
