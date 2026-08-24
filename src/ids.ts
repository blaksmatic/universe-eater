export type WeaponId = 'laser' | 'orbit' | 'nova' | 'escort' | 'seeker' | 'arc' | 'singularity';

export type WeaponName =
  | 'Laser Beam'
  | 'Orbit Shield'
  | 'Nova Blast'
  | 'Escort Wing'
  | 'Seeker Swarm'
  | 'Arc Reactor'
  | 'Singularity';

export type PassiveId = 'hull' | 'thrusters' | 'nanoforge' | 'plating' | 'targeting' | 'overclock' | 'vampiric' | 'amplifier';
export type PassiveName =
  | 'Reinforced Hull'
  | 'Overdrive Thrusters'
  | 'Nanoforge'
  | 'Phase Plating'
  | 'Targeting CPU'
  | 'Overclock Core'
  | 'Vampiric Nanites'
  | 'XP Amplifier';

export type UpgradeTag = 'force' | 'ward' | 'surge' | 'forge';

export type DoctrineId = 'bulwark' | 'slipstream' | 'nanite-lattice' | 'annihilation';

export type MutatorId = 'frenzy' | 'heavy' | 'overdrive' | 'shrapnel' | 'elites' | 'tiny' | 'veterans';

/** Maximum stacks per repeatable passive (Infinity = uncapped). */
export const PASSIVE_CAPS: Record<PassiveId, number> = {
  hull: Infinity,
  thrusters: Infinity,
  nanoforge: Infinity,
  plating: Infinity,
  targeting: 6,
  overclock: 5,
  vampiric: 5,
  amplifier: 5,
};
