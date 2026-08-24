import { getMutatorDesc, getMutatorName, getMutatorShort } from './i18n';
import type { MutatorId } from './ids';

export type { MutatorId } from './ids';

/** Enemy-side stage modifiers. Everything flows through EnemySpawnMods so
 *  effects never compound into persistent player/weapon stats. */
export interface EnemySpawnMods {
  hpMul: number;
  speedMul: number;
  radiusMul: number;
  intervalMul: number;
  bulletSpeedMul: number;
  bulletLifeMul: number;
  eliteChanceMul: number;
  eliteXpMul: number;
  /** Extra difficulty offset applied to per-enemy stage scaling. */
  scaleBonus: number;
}

export const NEUTRAL_SPAWN_MODS: EnemySpawnMods = {
  hpMul: 1,
  speedMul: 1,
  radiusMul: 1,
  intervalMul: 1,
  bulletSpeedMul: 1,
  bulletLifeMul: 1,
  eliteChanceMul: 1,
  eliteXpMul: 1,
  scaleBonus: 0,
};

const MUTATOR_ORDER: MutatorId[] = ['frenzy', 'heavy', 'overdrive', 'shrapnel', 'elites', 'tiny', 'veterans'];

export function getMutatorIds(): MutatorId[] {
  return [...MUTATOR_ORDER];
}

export function mutatorName(id: MutatorId): string {
  return getMutatorName(id);
}

export function mutatorShort(id: MutatorId): string {
  return getMutatorShort(id);
}

export function mutatorDesc(id: MutatorId): string {
  return getMutatorDesc(id);
}

/** Pick 1 mutator for stage 2; 1 (+40% chance of a second) for stage 3+. */
export function rollMutators(stage: number): MutatorId[] {
  if (stage < 2) return [];
  const pool = [...MUTATOR_ORDER];
  const picked: MutatorId[] = [];
  const first = Math.floor(Math.random() * pool.length);
  picked.push(pool.splice(first, 1)[0]);
  if (stage >= 3 && Math.random() < 0.4 && pool.length > 0) {
    const second = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(second, 1)[0]);
  }
  return picked;
}

export function composeSpawnMods(ids: MutatorId[]): EnemySpawnMods {
  const mods = { ...NEUTRAL_SPAWN_MODS };
  for (const id of ids) {
    switch (id) {
      case 'frenzy':
        mods.intervalMul *= 0.8;
        mods.hpMul *= 0.85;
        break;
      case 'heavy':
        mods.hpMul *= 1.4;
        mods.intervalMul *= 1.15;
        break;
      case 'overdrive':
        mods.speedMul *= 1.2;
        break;
      case 'shrapnel':
        mods.bulletSpeedMul *= 1.25;
        mods.bulletLifeMul *= 1.2;
        break;
      case 'elites':
        mods.eliteChanceMul *= 2.2;
        mods.eliteXpMul *= 1.5;
        break;
      case 'tiny':
        mods.radiusMul *= 0.6;
        mods.speedMul *= 1.25;
        mods.hpMul *= 0.7;
        break;
      case 'veterans':
        mods.scaleBonus += 2;
        break;
    }
  }
  return mods;
}
