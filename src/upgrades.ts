import { Player } from './player';
import { WeaponManager } from './weapons';

type PassiveId = 'hull' | 'thrusters' | 'nanoforge' | 'plating';
export type UpgradeTag = 'force' | 'ward' | 'surge' | 'forge';

export interface Doctrine {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  thresholdTag: UpgradeTag;
  thresholdCount: number;
}

export type TraitCounts = Record<UpgradeTag, number>;

export type UpgradeChoice =
  | {
      id: string;
      kind: 'unlock';
      weaponType: 'orbit' | 'nova' | 'escort';
      weaponName: 'Orbit Shield' | 'Nova Blast' | 'Escort Wing';
      title: string;
      description: string;
      label: string;
      iconName: 'Orbit Shield' | 'Nova Blast' | 'Escort Wing';
      tags: UpgradeTag[];
    }
  | {
      id: string;
      kind: 'upgrade';
      weaponName: 'Laser Beam' | 'Orbit Shield' | 'Nova Blast' | 'Escort Wing';
      title: string;
      description: string;
      label: string;
      iconName: 'Laser Beam' | 'Orbit Shield' | 'Nova Blast' | 'Escort Wing';
      tags: UpgradeTag[];
    }
  | {
      id: string;
      kind: 'passive';
      passiveId: PassiveId;
      title: string;
      description: string;
      label: string;
      iconName: 'Reinforced Hull' | 'Overdrive Thrusters' | 'Nanoforge' | 'Phase Plating';
      tags: UpgradeTag[];
    };

const DOCTRINES: Doctrine[] = [
  {
    id: 'bulwark',
    title: 'Bulwark Protocol',
    shortLabel: 'BULWARK',
    description: 'Ward upgrades harden the core. Gain +20 max hull and longer contact grace.',
    thresholdTag: 'ward',
    thresholdCount: 2,
  },
  {
    id: 'slipstream',
    title: 'Slipstream Doctrine',
    shortLabel: 'SLIPSTREAM',
    description: 'Surge upgrades accelerate the whole rig. Gain speed and faster weapon cadence.',
    thresholdTag: 'surge',
    thresholdCount: 2,
  },
  {
    id: 'nanite-lattice',
    title: 'Nanite Lattice',
    shortLabel: 'LATTICE',
    description: 'Forge upgrades reinforce the swarm-eater shell. Gain regen and weapon damage.',
    thresholdTag: 'forge',
    thresholdCount: 2,
  },
  {
    id: 'annihilation',
    title: 'Annihilation Pattern',
    shortLabel: 'ANNIHILATION',
    description: 'Force upgrades sharpen every emitter. Your weapons hit harder and cycle faster.',
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
      title: 'Reinforced Hull',
      description: 'Increase maximum hull by 25 and instantly repair the new plating.',
      label: 'Reinforced Hull +25',
      iconName: 'Reinforced Hull',
      tags: ['ward'],
    },
    {
      id: 'passive-thrusters',
      kind: 'passive',
      passiveId: 'thrusters',
      title: 'Overdrive Thrusters',
      description: 'Boost movement speed so you can kite wider and break collapsing swarms.',
      label: 'Thrusters +18',
      iconName: 'Overdrive Thrusters',
      tags: ['surge'],
    },
    {
      id: 'passive-nanoforge',
      kind: 'passive',
      passiveId: 'nanoforge',
      title: 'Nanoforge',
      description: 'Accelerate hull regeneration and patch yourself up on install.',
      label: 'Nanoforge installed',
      iconName: 'Nanoforge',
      tags: ['forge'],
    },
    {
      id: 'passive-plating',
      kind: 'passive',
      passiveId: 'plating',
      title: 'Phase Plating',
      description: 'Reduce incoming damage so mistakes cost less and boss pressure lands cleaner.',
      label: 'Phase Plating hardened',
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
      title: 'Unlock Orbit Shield',
      description: 'Add rotating satellites that chew through anything close to your hull.',
      label: 'New weapon: Orbit Shield',
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
      title: 'Unlock Nova Blast',
      description: 'Gain a timed shockwave that clears breathing room when swarms collapse in.',
      label: 'New weapon: Nova Blast',
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
      title: 'Unlock Escort Wing',
      description: 'Deploy a wingmate that tracks beside you and fires a support laser at the same cadence.',
      label: 'New weapon: Escort Wing',
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
        title: `Laser Beam Lv ${weapon.level + 1}`,
        description: 'Higher damage, longer reach, and faster beam cadence.',
        label: `Laser Beam → Lv.${weapon.level + 1}`,
        iconName: 'Laser Beam',
        tags: ['force', 'forge'],
      });
    } else if (weapon.name === 'Orbit Shield') {
      upgrades.push({
        id: `upgrade-orbit-${weapon.level + 1}`,
        kind: 'upgrade',
        weaponName: 'Orbit Shield',
        title: `Orbit Shield Lv ${weapon.level + 1}`,
        description: 'More damage and wider orbit pressure, with extra satellites at key levels.',
        label: `Orbit Shield → Lv.${weapon.level + 1}`,
        iconName: 'Orbit Shield',
        tags: ['ward'],
      });
    } else if (weapon.name === 'Nova Blast') {
      upgrades.push({
        id: `upgrade-nova-${weapon.level + 1}`,
        kind: 'upgrade',
        weaponName: 'Nova Blast',
        title: `Nova Blast Lv ${weapon.level + 1}`,
        description: 'Bigger detonation radius with a stronger burst to reset dangerous screens.',
        label: `Nova Blast → Lv.${weapon.level + 1}`,
        iconName: 'Nova Blast',
        tags: ['force', 'surge'],
      });
    } else if (weapon.name === 'Escort Wing') {
      upgrades.push({
        id: `upgrade-escort-${weapon.level + 1}`,
        kind: 'upgrade',
        weaponName: 'Escort Wing',
        title: `Escort Wing Lv ${weapon.level + 1}`,
        description: 'Boost the wingmate beam so its support laser hits harder while keeping pace with your main emitter.',
        label: `Escort Wing → Lv.${weapon.level + 1}`,
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
