import { Player } from './player';
import { WeaponManager } from './weapons';
import { DoctrineId, PassiveId, PassiveName, UpgradeTag, WeaponName } from './ids';
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

export type UpgradeChoice =
  | {
      id: string;
      kind: 'unlock';
      weaponType: 'orbit' | 'nova' | 'escort';
      weaponName: Exclude<WeaponName, 'Laser Beam'>;
      title: TextResolver;
      description: TextResolver;
      label: TextResolver;
      iconName: Exclude<WeaponName, 'Laser Beam'>;
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

export function createEmptyTraitCounts(): TraitCounts {
  return {
    force: 0,
    ward: 0,
    surge: 0,
    forge: 0,
  };
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

function buildPassiveChoices(): UpgradeChoice[] {
  return [
    {
      id: 'passive-hull',
      kind: 'passive',
      passiveId: 'hull',
      title: () => getPassiveTitle('hull'),
      description: () => getPassiveDescription('hull'),
      label: () => getPassiveLabel('hull'),
      iconName: 'Reinforced Hull',
      tags: ['ward'],
    },
    {
      id: 'passive-thrusters',
      kind: 'passive',
      passiveId: 'thrusters',
      title: () => getPassiveTitle('thrusters'),
      description: () => getPassiveDescription('thrusters'),
      label: () => getPassiveLabel('thrusters'),
      iconName: 'Overdrive Thrusters',
      tags: ['surge'],
    },
    {
      id: 'passive-nanoforge',
      kind: 'passive',
      passiveId: 'nanoforge',
      title: () => getPassiveTitle('nanoforge'),
      description: () => getPassiveDescription('nanoforge'),
      label: () => getPassiveLabel('nanoforge'),
      iconName: 'Nanoforge',
      tags: ['forge'],
    },
    {
      id: 'passive-plating',
      kind: 'passive',
      passiveId: 'plating',
      title: () => getPassiveTitle('plating'),
      description: () => getPassiveDescription('plating'),
      label: () => getPassiveLabel('plating'),
      iconName: 'Phase Plating',
      tags: ['ward', 'forge'],
    },
  ];
}

export function buildUpgradeDraft(wm: WeaponManager, upgradeCount: number): UpgradeChoice[] {
  const unlocks: UpgradeChoice[] = [];
  const upgrades: UpgradeChoice[] = [];
  const passives = buildPassiveChoices();

  if (!wm.hasWeapon('Orbit Shield')) {
    unlocks.push({
      id: 'unlock-orbit',
      kind: 'unlock',
      weaponType: 'orbit',
      weaponName: 'Orbit Shield',
      title: () => getUnlockTitle('Orbit Shield'),
      description: () => getUnlockDescription('Orbit Shield'),
      label: () => getUnlockLabel('Orbit Shield'),
      iconName: 'Orbit Shield',
      tags: ['ward'],
    });
  }

  if (!wm.hasWeapon('Nova Blast')) {
    unlocks.push({
      id: 'unlock-nova',
      kind: 'unlock',
      weaponType: 'nova',
      weaponName: 'Nova Blast',
      title: () => getUnlockTitle('Nova Blast'),
      description: () => getUnlockDescription('Nova Blast'),
      label: () => getUnlockLabel('Nova Blast'),
      iconName: 'Nova Blast',
      tags: ['force', 'surge'],
    });
  }

  if (!wm.hasWeapon('Escort Wing')) {
    unlocks.push({
      id: 'unlock-escort',
      kind: 'unlock',
      weaponType: 'escort',
      weaponName: 'Escort Wing',
      title: () => getUnlockTitle('Escort Wing'),
      description: () => getUnlockDescription('Escort Wing'),
      label: () => getUnlockLabel('Escort Wing'),
      iconName: 'Escort Wing',
      tags: ['force', 'surge'],
    });
  }

  for (const weapon of wm.weapons) {
    if (weapon.level >= weapon.maxLevel) continue;

    if (weapon.name === 'Laser Beam') {
      upgrades.push({
        id: `upgrade-laser-${weapon.level + 1}`,
        kind: 'upgrade',
        weaponName: 'Laser Beam',
        title: () => getWeaponUpgradeTitle('Laser Beam', weapon.level + 1),
        description: () => getWeaponUpgradeDescription('Laser Beam'),
        label: () => getWeaponUpgradeLabel('Laser Beam', weapon.level + 1),
        iconName: 'Laser Beam',
        tags: ['force', 'forge'],
      });
    } else if (weapon.name === 'Orbit Shield') {
      upgrades.push({
        id: `upgrade-orbit-${weapon.level + 1}`,
        kind: 'upgrade',
        weaponName: 'Orbit Shield',
        title: () => getWeaponUpgradeTitle('Orbit Shield', weapon.level + 1),
        description: () => getWeaponUpgradeDescription('Orbit Shield'),
        label: () => getWeaponUpgradeLabel('Orbit Shield', weapon.level + 1),
        iconName: 'Orbit Shield',
        tags: ['ward'],
      });
    } else if (weapon.name === 'Nova Blast') {
      upgrades.push({
        id: `upgrade-nova-${weapon.level + 1}`,
        kind: 'upgrade',
        weaponName: 'Nova Blast',
        title: () => getWeaponUpgradeTitle('Nova Blast', weapon.level + 1),
        description: () => getWeaponUpgradeDescription('Nova Blast'),
        label: () => getWeaponUpgradeLabel('Nova Blast', weapon.level + 1),
        iconName: 'Nova Blast',
        tags: ['force', 'surge'],
      });
    } else if (weapon.name === 'Escort Wing') {
      upgrades.push({
        id: `upgrade-escort-${weapon.level + 1}`,
        kind: 'upgrade',
        weaponName: 'Escort Wing',
        title: () => getWeaponUpgradeTitle('Escort Wing', weapon.level + 1),
        description: () => getWeaponUpgradeDescription('Escort Wing'),
        label: () => getWeaponUpgradeLabel('Escort Wing', weapon.level + 1),
        iconName: 'Escort Wing',
        tags: ['force', 'surge'],
      });
    }
  }

  const pool = [...unlocks, ...upgrades, ...passives];
  if (pool.length <= 3) return shuffle(pool);

  const earlyUnlockBias = upgradeCount < 2 && unlocks.length > 0;
  const forcedUnlocks = earlyUnlockBias ? sampleWithoutReplacement(unlocks, 1) : [];
  const forcedPassives = sampleWithoutReplacement(passives, Math.min(1, passives.length));
  const forced = [...forcedUnlocks, ...forcedPassives].slice(0, 2);
  const remaining = pool.filter((choice) => !forced.some((picked) => picked.id === choice.id));

  return [...forced, ...sampleWithoutReplacement(remaining, 3 - forced.length)];
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
