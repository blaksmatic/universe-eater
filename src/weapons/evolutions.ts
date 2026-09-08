import { getLanguage } from '../i18n';

export interface WeaponEvolution {
  name: string;
  description: string;
}

/** Actual mechanical evolutions, unlocked automatically at weapon level 8. */
export function getWeaponEvolution(name: string, level: number): WeaponEvolution | null {
  if (level < 8) return null;
  const zh = getLanguage() === 'zh-CN';
  if (name === 'Laser Beam') return {
    name: zh ? '棱镜阵列' : 'Prismatic Array',
    description: zh ? '向另外两个方向发射穿透光束，各造成45%伤害。' : 'Two extra piercing rays, each dealing 45% damage.',
  };
  if (name === 'Orbit Shield') return {
    name: zh ? '宙斯盾晶格' : 'Aegis Lattice',
    description: zh ? '轨道晶体拦截接触的敌方弹丸；每0.18秒最多拦截一发。' : 'Orbitals block shots on contact, up to one every 0.18s.',
  };
  if (name === 'Nova Blast') return {
    name: zh ? '超新星冲击' : 'Supernova Repulsor',
    description: zh ? '扩散冲击波将敌人向外推开；首领抗击退。' : 'An expanding shockwave pushes enemies back; bosses resist.',
  };
  return null;
}
