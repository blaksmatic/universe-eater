import { Player } from './player';
import { WeaponManager } from './weapons';
import { DoctrineId, PASSIVE_CAPS, PassiveId, PassiveName, UpgradeTag, WeaponId, WeaponName } from './ids';
import {
  TextResolver,
  getDoctrineDescription,
  getDoctrineShortLabel,
  getDoctrineTitle,
  getPassiveDescription,
  getPassiveLabel,
  getPassiveTitle,
  getUnlockDescription,
  getUnlockLabel,
  getUnlockTitle,
  getWeaponUpgradeDescription,
  getWeaponUpgradeLabel,
  getWeaponUpgradeTitle,
} from './i18n';

export interface Doctrine {
  id: DoctrineId;
  title: TextResolver;
  shortLabel: TextResolver;
  description: TextResolver;
  thresholdTag: UpgradeTag;
  thresholdCount: number;
}

export type TraitCounts = Record<UpgradeTag, number>;

export type PassiveStacks = Record<PassiveId, number>;

export type UnlockableWeaponId = Exclude<WeaponId, 'laser'>;
export type UnlockableWeaponName = Exclude<WeaponName, 'Laser Beam'>;

export type UpgradeChoice =
  | {
      id: string;
      kind: 'unlock';
      weaponType: UnlockableWeaponId;
      weaponName: UnlockableWeaponName;
      title: TextResolver;
      description: TextResolver;
      label: TextResolver;
      iconName: WeaponName;
      tags: UpgradeTag[];
    }
  | {
      id: string;
      kind: 'upgrade';
      weaponName: WeaponName;
      title: TextResolver;
      description: TextResolver;
      label: TextResolver;
      iconName: WeaponName;
      tags: UpgradeTag[];
    }
  | {
      id: string;
      kind: 'passive';
      passiveId: PassiveId;
      title: TextResolver;
      description: TextResolver;
      label: TextResolver;
      iconName: PassiveName;
      tags: UpgradeTag[];
    };

const DOCTRINES: Doctrine[] = [
  {
    id: 'bulwark',
    title: () => getDoctrineTitle('bulwark'),
    shortLabel: () => getDoctrineShortLabel('bulwark'),
    description: () => getDoctrineDescription('bulwark'),
    thresholdTag: 'ward',
    thresholdCount: 2,
  },
  {
    id: 'slipstream',
    title: () => getDoctrineTitle('slipstream'),
    shortLabel: () => getDoctrineShortLabel('slipstream'),
    description: () => getDoctrineDescription('slipstream'),
    thresholdTag: 'surge',
    thresholdCount: 2,
  },
  {
    id: 'nanite-lattice',
    title: () => getDoctrineTitle('nanite-lattice'),
    shortLabel: () => getDoctrineShortLabel('nanite-lattice'),
    description: () => getDoctrineDescription('nanite-lattice'),
    thresholdTag: 'forge',
    thresholdCount: 2,
  },
  {
    id: 'annihilation',
    title: () => getDoctrineTitle('annihilation'),
    shortLabel: () => getDoctrineShortLabel('annihilation'),
    description: () => getDoctrineDescription('annihilation'),
    thresholdTag: 'force',
    thresholdCount: 3,
  },
];

const WEAPON_TAGS: Record<WeaponName, UpgradeTag[]> = {
  'Laser Beam': ['force', 'forge'],
  'Orbit Shield': ['ward'],
  'Nova Blast': ['force', 'surge'],
  'Escort Wing': ['force', 'surge'],
  'Seeker Swarm': ['force', 'forge'],
  'Arc Reactor': ['force', 'surge'],
  'Singularity': ['force', 'ward'],
};

interface PassiveDef {
  id: PassiveId;
  name: PassiveName;
  tags: UpgradeTag[];
}

const PASSIVE_DEFS: PassiveDef[] = [
  { id: 'hull', name: 'Reinforced Hull', tags: ['ward'] },
  { id: 'thrusters', name: 'Overdrive Thrusters', tags: ['surge'] },
  { id: 'nanoforge', name: 'Nanoforge', tags: ['forge'] },
  { id: 'plating', name: 'Phase Plating', tags: ['ward', 'forge'] },
  { id: 'targeting', name: 'Targeting CPU', tags: ['force'] },
  { id: 'overclock', name: 'Overclock Core', tags: ['surge', 'forge'] },
  { id: 'vampiric', name: 'Vampiric Nanites', tags: ['ward', 'forge'] },
  { id: 'amplifier', name: 'XP Amplifier', tags: ['forge'] },
];

const UNLOCK_DEFS: { id: UnlockableWeaponId; name: UnlockableWeaponName }[] = [
  { id: 'orbit', name: 'Orbit Shield' },
  { id: 'nova', name: 'Nova Blast' },
  { id: 'escort', name: 'Escort Wing' },
  { id: 'seeker', name: 'Seeker Swarm' },
  { id: 'arc', name: 'Arc Reactor' },
  { id: 'singularity', name: 'Singularity' },
];

export function createEmptyTraitCounts(): TraitCounts {
  return {
    force: 0,
    ward: 0,
    surge: 0,
    forge: 0,
  };
}

export function createEmptyPassiveStacks(): PassiveStacks {
  const stacks = {} as PassiveStacks;
  for (const def of PASSIVE_DEFS) {
    stacks[def.id] = 0;
  }
  return stacks;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sampleWithoutReplacement<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}

export function buildUpgradeDraft(wm: WeaponManager, upgradeCount: number, stacks: PassiveStacks): UpgradeChoice[] {
  const unlocks: UpgradeChoice[] = [];
  const upgrades: UpgradeChoice[] = [];

  for (const def of UNLOCK_DEFS) {
    if (!wm.hasWeapon(def.name)) {
      const weaponName = def.name;
      unlocks.push({
        id: `unlock-${def.id}`,
        kind: 'unlock',
        weaponType: def.id,
        weaponName,
        title: () => getUnlockTitle(weaponName),
        description: () => getUnlockDescription(weaponName),
        label: () => getUnlockLabel(weaponName),
        iconName: weaponName,
        tags: [...WEAPON_TAGS[weaponName]],
      });
    }
  }

  for (const weapon of wm.weapons) {
    if (weapon.level >= weapon.maxLevel) continue;
    const weaponName = weapon.name;
    upgrades.push({
      id: `upgrade-${weaponName}-${weapon.level + 1}`,
      kind: 'upgrade',
      weaponName,
      title: () => getWeaponUpgradeTitle(weaponName, weapon.level + 1),
      description: () => getWeaponUpgradeDescription(weaponName),
      label: () => getWeaponUpgradeLabel(weaponName, weapon.level + 1),
      iconName: weaponName,
      tags: [...WEAPON_TAGS[weaponName]],
    });
  }

  // Passives that still have headroom.
  const availablePassives = PASSIVE_DEFS.filter(def => stacks[def.id] < capFor(def.id));
  const passives: UpgradeChoice[] = availablePassives.map(def => ({
    id: `passive-${def.id}`,
    kind: 'passive' as const,
    passiveId: def.id,
    title: () => getPassiveTitle(def.id),
    description: () => getPassiveDescription(def.id),
    label: () => getPassiveLabel(def.id),
    iconName: def.name,
    tags: [...def.tags],
  }));

  const pool = [...unlocks, ...upgrades, ...passives];
  if (pool.length <= 3) return shuffle(pool);

  const earlyUnlockBias = upgradeCount < 2 && unlocks.length > 0;
  const forcedUnlocks = earlyUnlockBias ? sampleWithoutReplacement(unlocks, 1) : [];
  const forcedPassives = sampleWithoutReplacement(passives, Math.min(1, passives.length));
  const forced = [...forcedUnlocks, ...forcedPassives].slice(0, 2);
  const remaining = pool.filter((choice) => !forced.some((picked) => picked.id === choice.id));

  return [...forced, ...sampleWithoutReplacement(remaining, 3 - forced.length)];
}

function capFor(id: PassiveId): number {
  return PASSIVE_CAPS[id];
}

export function applyUpgradeChoice(choice: UpgradeChoice, wm: WeaponManager, player: Player): void {
  if (choice.kind === 'unlock') {
    wm.addWeapon(choice.weaponType);
    return;
  }

  if (choice.kind === 'passive') {
    switch (choice.passiveId) {
      case 'hull':
        player.upgradeHull();
        return;
      case 'thrusters':
        player.upgradeThrusters();
        return;
      case 'nanoforge':
        player.upgradeNanoforge();
        return;
      case 'plating':
        player.upgradePlating();
        return;
      case 'targeting':
        player.upgradeTargeting();
        return;
      case 'overclock':
        wm.multiplyCooldown(0.93);
        return;
      case 'vampiric':
        player.upgradeVampiric();
        return;
      case 'amplifier':
        player.upgradeAmplifier();
        return;
    }
  }

  const weapon = wm.getWeapon(choice.weaponName);
  if (weapon) {
    weapon.level++;
  }
}

export function getNewDoctrines(traitCounts: TraitCounts, unlockedIds: string[]): Doctrine[] {
  return DOCTRINES.filter((doctrine) => (
    !unlockedIds.includes(doctrine.id) &&
    traitCounts[doctrine.thresholdTag] >= doctrine.thresholdCount
  ));
}

export function applyDoctrine(doctrine: Doctrine, wm: WeaponManager, player: Player): void {
  switch (doctrine.id) {
    case 'bulwark':
      player.addMaxHull(20, 20);
      player.increaseContactGrace(0.12);
      return;
    case 'slipstream':
      player.addSpeed(20);
      wm.multiplyCooldown(0.9);
      return;
    case 'nanite-lattice':
      player.multiplyRegen(1.2, 10);
      wm.multiplyDamage(1.08);
      return;
    case 'annihilation':
      wm.multiplyDamage(1.12);
      wm.multiplyCooldown(0.9);
      return;
  }
}
