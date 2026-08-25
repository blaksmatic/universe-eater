import type { WeaponId, WeaponName } from '../ids';
import type { Weapon, WeaponModifiers } from './shared';
import { LaserBeam } from './laser';
import { OrbitShield } from './orbit';
import { NovaBlast } from './nova';
import { EscortWing } from './escort';
import { SeekerSwarm } from './seeker';
import { ArcReactor } from './arc';
import { Singularity } from './singularity';
import type { Camera } from '../camera';
import type { Enemy } from '../enemies';
import type { OnFireCallback } from './shared';

export const WEAPON_ORDER: { id: WeaponId; name: WeaponName }[] = [
  { id: 'laser', name: 'Laser Beam' },
  { id: 'orbit', name: 'Orbit Shield' },
  { id: 'nova', name: 'Nova Blast' },
  { id: 'escort', name: 'Escort Wing' },
  { id: 'seeker', name: 'Seeker Swarm' },
  { id: 'arc', name: 'Arc Reactor' },
  { id: 'singularity', name: 'Singularity' },
];

export class WeaponManager {
  weapons: Weapon[] = [];
  readonly modifiers: WeaponModifiers = {
    damageMultiplier: 1,
    cooldownMultiplier: 1,
    critChance: 0,
    critMultiplier: 2,
  };
  private laser: LaserBeam;

  constructor() {
    this.laser = new LaserBeam();
    this.weapons.push(this.laser);
  }

  setOnLaserFire(cb: OnFireCallback): void {
    this.laser.onFire = cb;
  }

  addWeapon(id: WeaponId): boolean {
    if (this.hasId(id)) return false;
    const factory: Record<Exclude<WeaponId, 'laser'>, () => Weapon> = {
      orbit: () => new OrbitShield(),
      nova: () => new NovaBlast(),
      escort: () => new EscortWing(),
      seeker: () => new SeekerSwarm(),
      arc: () => new ArcReactor(),
      singularity: () => new Singularity(),
    };
    if (id === 'laser') return false;
    this.weapons.push(factory[id]());
    return true;
  }

  hasId(id: WeaponId): boolean {
    const entry = WEAPON_ORDER.find((w) => w.id === id);
    return entry ? this.hasWeapon(entry.name) : false;
  }

  hasWeapon(name: string): boolean {
    return this.weapons.some((w) => w.name === name);
  }

  getWeapon(name: string): Weapon | undefined {
    return this.weapons.find((w) => w.name === name);
  }

  multiplyDamage(multiplier: number): void {
    this.modifiers.damageMultiplier *= multiplier;
  }

  multiplyCooldown(multiplier: number): void {
    this.modifiers.cooldownMultiplier *= multiplier;
  }

  allMaxed(): boolean {
    return this.weapons.length === WEAPON_ORDER.length && this.weapons.every((w) => w.level >= w.maxLevel);
  }

  update(dt: number, playerX: number, playerY: number, enemies: Enemy[]): void {
    for (const weapon of this.weapons) {
      weapon.update(dt, playerX, playerY, enemies, this.modifiers);
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, playerX: number, playerY: number, playerRadius: number): void {
    for (const weapon of this.weapons) {
      weapon.draw(ctx, camera, playerX, playerY, playerRadius);
    }
  }
}
