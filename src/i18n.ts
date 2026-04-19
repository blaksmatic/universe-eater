import { DoctrineId, PassiveId, PassiveName, UpgradeTag, WeaponName } from './ids';

export type Language = 'zh-CN' | 'en';
export type TextResolver = () => string;

const STORAGE_KEY = 'universe-eater.language';
const DEFAULT_LANGUAGE: Language = 'zh-CN';

const UI_TEXT = {
  'zh-CN': {
    gameTitle: '宇宙吞噬者',
    languageLabel: '语言 / Language',
    armament: '武装',
    critical: '危险',
    doctrines: '学说',
    locked: '未解锁',
    titleSubtitle: '生存 8 分钟',
    tapToStart: '点击开始',
    pressAnyKeyToStart: '按任意键开始',
    titleHintPrimary: '移动求生  •  武器自动开火',
    titleHintSecondaryCompact: '阶段越来越难  •  构筑会延续',
    titleHintSecondaryWide: '阶段难度会叠加  •  构筑会延续到下一阶段',
    levelUpTitle: '升级',
    levelUpSubtitle: '选择下一项变异',
    tapCardToMutate: '点击卡牌进行变异',
    keyboardDraftControls: '方向键选择  •  Enter 确认  •  R 重抽',
    rerollSpent: '重抽已用完',
    paused: '已暂停',
    resumePrompt: '按 ESC 或点击 II 继续',
    tapToRestart: '点击重新开始',
    pressAnyKeyToRestart: '按任意键重新开始',
    tapToNextStage: '点击进入下一阶段',
    pressAnyKeyToNextStage: '按任意键进入下一阶段',
    gameOver: '游戏结束',
    keepMovingTutorial: '持续移动，首次升级会解锁新武器。',
    draftRerolled: '升级选项已重抽',
  },
  en: {
    gameTitle: 'Universe Eater',
    languageLabel: 'Language / 语言',
    armament: 'ARMAMENT',
    critical: 'CRITICAL',
    doctrines: 'DOCTRINES',
    locked: 'LOCKED',
    titleSubtitle: 'SURVIVE 8 MINUTES',
    tapToStart: 'Tap to start',
    pressAnyKeyToStart: 'Press any key to start',
    titleHintPrimary: 'MOVE TO SURVIVE  •  WEAPONS AUTO-FIRE',
    titleHintSecondaryCompact: 'STAGES GET HARDER  •  BUILD CARRIES FORWARD',
    titleHintSecondaryWide: 'STAGES STACK DIFFICULTY  •  YOUR BUILD CARRIES FORWARD',
    levelUpTitle: 'LEVEL UP',
    levelUpSubtitle: 'Choose your next mutation',
    tapCardToMutate: 'Tap a card to mutate',
    keyboardDraftControls: 'Arrow keys select  •  Enter confirms  •  R rerolls',
    rerollSpent: 'REROLL SPENT',
    paused: 'PAUSED',
    resumePrompt: 'Press ESC or tap II to resume',
    tapToRestart: 'Tap to restart',
    pressAnyKeyToRestart: 'Press any key to restart',
    tapToNextStage: 'Tap to enter the next stage',
    pressAnyKeyToNextStage: 'Press any key to enter the next stage',
    gameOver: 'GAME OVER',
    keepMovingTutorial: 'Keep moving. First level-ups unlock new weapons.',
    draftRerolled: 'Draft rerolled',
  },
} as const;

const WEAPON_NAMES: Record<Language, Record<WeaponName, string>> = {
  'zh-CN': {
    'Laser Beam': '激光束',
    'Orbit Shield': '环轨护盾',
    'Nova Blast': '新星爆发',
    'Escort Wing': '护航僚机',
  },
  en: {
    'Laser Beam': 'Laser Beam',
    'Orbit Shield': 'Orbit Shield',
    'Nova Blast': 'Nova Blast',
    'Escort Wing': 'Escort Wing',
  },
};

const PASSIVE_NAMES: Record<Language, Record<PassiveName, string>> = {
  'zh-CN': {
    'Reinforced Hull': '强化船体',
    'Overdrive Thrusters': '超载推进器',
    'Nanoforge': '纳米工坊',
    'Phase Plating': '相位装甲',
  },
  en: {
    'Reinforced Hull': 'Reinforced Hull',
    'Overdrive Thrusters': 'Overdrive Thrusters',
    'Nanoforge': 'Nanoforge',
    'Phase Plating': 'Phase Plating',
  },
};

const PASSIVE_TEXT: Record<Language, Record<PassiveId, { title: string; description: string; label: string }>> = {
  'zh-CN': {
    hull: {
      title: '强化船体',
      description: '最大船体 +25，并立刻修复新增装甲。',
      label: '强化船体 +25',
    },
    thrusters: {
      title: '超载推进器',
      description: '提高移动速度，让你更容易拉扯并冲出包围。',
      label: '推进器 +18',
    },
    nanoforge: {
      title: '纳米工坊',
      description: '加快船体回复，并在安装时立即修复一部分损伤。',
      label: '已安装纳米工坊',
    },
    plating: {
      title: '相位装甲',
      description: '降低受到的伤害，让失误代价更低，也更容易扛住首领压力。',
      label: '相位装甲强化',
    },
  },
  en: {
    hull: {
      title: 'Reinforced Hull',
      description: 'Increase maximum hull by 25 and instantly repair the new plating.',
      label: 'Reinforced Hull +25',
    },
    thrusters: {
      title: 'Overdrive Thrusters',
      description: 'Boost movement speed so you can kite wider and break collapsing swarms.',
      label: 'Thrusters +18',
    },
    nanoforge: {
      title: 'Nanoforge',
      description: 'Accelerate hull regeneration and patch yourself up on install.',
      label: 'Nanoforge installed',
    },
    plating: {
      title: 'Phase Plating',
      description: 'Reduce incoming damage so mistakes cost less and boss pressure lands cleaner.',
      label: 'Phase Plating hardened',
    },
  },
};

const UNLOCK_TEXT: Record<Language, Record<Exclude<WeaponName, 'Laser Beam'>, { title: string; description: string; label: string }>> = {
  'zh-CN': {
    'Orbit Shield': {
      title: '解锁 环轨护盾',
      description: '获得环绕卫星，持续撕碎靠近船体的敌人。',
      label: '新武器：环轨护盾',
    },
    'Nova Blast': {
      title: '解锁 新星爆发',
      description: '获得定时冲击波，在敌群贴身时清出喘息空间。',
      label: '新武器：新星爆发',
    },
    'Escort Wing': {
      title: '解锁 护航僚机',
      description: '部署护航僚机，它会伴飞并以同样节奏发射支援激光。',
      label: '新武器：护航僚机',
    },
  },
  en: {
    'Orbit Shield': {
      title: 'Unlock Orbit Shield',
      description: 'Add rotating satellites that chew through anything close to your hull.',
      label: 'New weapon: Orbit Shield',
    },
    'Nova Blast': {
      title: 'Unlock Nova Blast',
      description: 'Gain a timed shockwave that clears breathing room when swarms collapse in.',
      label: 'New weapon: Nova Blast',
    },
    'Escort Wing': {
      title: 'Unlock Escort Wing',
      description: 'Deploy a wingmate that tracks beside you and fires a support laser at the same cadence.',
      label: 'New weapon: Escort Wing',
    },
  },
};

const UPGRADE_DESCRIPTIONS: Record<Language, Record<WeaponName, string>> = {
  'zh-CN': {
    'Laser Beam': '提高伤害、射程和激光频率。',
    'Orbit Shield': '提高伤害与压制范围，并在关键等级追加卫星。',
    'Nova Blast': '扩大爆炸半径，并强化爆发伤害以重置危险局面。',
    'Escort Wing': '强化僚机激光，让支援火力更猛，同时保持与你主武器同步。',
  },
  en: {
    'Laser Beam': 'Higher damage, longer reach, and faster beam cadence.',
    'Orbit Shield': 'More damage and wider orbit pressure, with extra satellites at key levels.',
    'Nova Blast': 'Bigger detonation radius with a stronger burst to reset dangerous screens.',
    'Escort Wing': 'Boost the wingmate beam so its support laser hits harder while keeping pace with your main emitter.',
  },
};

const DOCTRINE_TEXT: Record<Language, Record<DoctrineId, { title: string; shortLabel: string; description: string }>> = {
  'zh-CN': {
    bulwark: {
      title: '堡垒协议',
      shortLabel: '堡垒',
      description: '防护系升级会强化核心。获得 +20 最大船体，并延长接触保护时间。',
    },
    slipstream: {
      title: '滑流学说',
      shortLabel: '滑流',
      description: '机动系升级会加速整套机体。获得移动速度并提升武器频率。',
    },
    'nanite-lattice': {
      title: '纳米晶格',
      shortLabel: '晶格',
      description: '锻造系升级会强化吞噬者外壳。获得更高回复与武器伤害。',
    },
    annihilation: {
      title: '湮灭模式',
      shortLabel: '湮灭',
      description: '火力系升级会锐化每个发射器。所有武器伤害更高，循环更快。',
    },
  },
  en: {
    bulwark: {
      title: 'Bulwark Protocol',
      shortLabel: 'BULWARK',
      description: 'Ward upgrades harden the core. Gain +20 max hull and longer contact grace.',
    },
    slipstream: {
      title: 'Slipstream Doctrine',
      shortLabel: 'SLIPSTREAM',
      description: 'Surge upgrades accelerate the whole rig. Gain speed and faster weapon cadence.',
    },
    'nanite-lattice': {
      title: 'Nanite Lattice',
      shortLabel: 'LATTICE',
      description: 'Forge upgrades reinforce the swarm-eater shell. Gain regen and weapon damage.',
    },
    annihilation: {
      title: 'Annihilation Pattern',
      shortLabel: 'ANNIHILATION',
      description: 'Force upgrades sharpen every emitter. Your weapons hit harder and cycle faster.',
    },
  },
};

const TAG_TEXT: Record<Language, Record<UpgradeTag, string>> = {
  'zh-CN': {
    force: '火力',
    ward: '防护',
    surge: '机动',
    forge: '锻造',
  },
  en: {
    force: 'FORCE',
    ward: 'WARD',
    surge: 'SURGE',
    forge: 'FORGE',
  },
};

let currentLanguage = readStoredLanguage();

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'zh-CN' || stored === 'en') {
      return stored;
    }
  } catch {
    // Ignore storage access failures and fall back to the default language.
  }
  return DEFAULT_LANGUAGE;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function setLanguage(language: Language): void {
  currentLanguage = language;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage access failures; the language can still change for this session.
    }
  }
  syncDocumentLanguage();
}

export function syncDocumentLanguage(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = currentLanguage;
  document.title = getGameTitle();
}

export function getGameTitle(): string {
  return UI_TEXT[currentLanguage].gameTitle;
}

export function getGameTitleLines(compact: boolean): string[] {
  if (currentLanguage === 'zh-CN') {
    return ['宇宙吞噬者'];
  }
  return compact ? ['UNIVERSE', 'EATER'] : ['UNIVERSE EATER'];
}

export function getLanguageButtonLabel(language: Language): string {
  return language === 'zh-CN' ? '中文' : 'English';
}

export function getUiText(key: keyof typeof UI_TEXT.en): string {
  return UI_TEXT[currentLanguage][key];
}

export function getWeaponName(name: WeaponName): string {
  return WEAPON_NAMES[currentLanguage][name];
}

export function getPassiveName(name: PassiveName): string {
  return PASSIVE_NAMES[currentLanguage][name];
}

export function getPassiveTitle(id: PassiveId): string {
  return PASSIVE_TEXT[currentLanguage][id].title;
}

export function getPassiveDescription(id: PassiveId): string {
  return PASSIVE_TEXT[currentLanguage][id].description;
}

export function getPassiveLabel(id: PassiveId): string {
  return PASSIVE_TEXT[currentLanguage][id].label;
}

export function getUnlockTitle(name: Exclude<WeaponName, 'Laser Beam'>): string {
  return UNLOCK_TEXT[currentLanguage][name].title;
}

export function getUnlockDescription(name: Exclude<WeaponName, 'Laser Beam'>): string {
  return UNLOCK_TEXT[currentLanguage][name].description;
}

export function getUnlockLabel(name: Exclude<WeaponName, 'Laser Beam'>): string {
  return UNLOCK_TEXT[currentLanguage][name].label;
}

export function getWeaponUpgradeTitle(name: WeaponName, level: number): string {
  return currentLanguage === 'zh-CN'
    ? `${getWeaponName(name)} ${level}级`
    : `${getWeaponName(name)} Lv ${level}`;
}

export function getWeaponUpgradeDescription(name: WeaponName): string {
  return UPGRADE_DESCRIPTIONS[currentLanguage][name];
}

export function getWeaponUpgradeLabel(name: WeaponName, level: number): string {
  return currentLanguage === 'zh-CN'
    ? `${getWeaponName(name)} -> ${level}级`
    : `${getWeaponName(name)} -> Lv.${level}`;
}

export function getDoctrineTitle(id: DoctrineId): string {
  return DOCTRINE_TEXT[currentLanguage][id].title;
}

export function getDoctrineShortLabel(id: DoctrineId): string {
  return DOCTRINE_TEXT[currentLanguage][id].shortLabel;
}

export function getDoctrineDescription(id: DoctrineId): string {
  return DOCTRINE_TEXT[currentLanguage][id].description;
}

export function getTagLabel(tag: UpgradeTag): string {
  return TAG_TEXT[currentLanguage][tag];
}

export function formatHullLabel(percent: number): string {
  return currentLanguage === 'zh-CN' ? `船体 ${percent}%` : `HULL ${percent}%`;
}

export function formatStageLabel(stage: number): string {
  return currentLanguage === 'zh-CN' ? `阶段 ${stage}` : `STAGE ${stage}`;
}

export function formatStageClearTitle(stage: number): string {
  return currentLanguage === 'zh-CN' ? `第 ${stage} 阶段通关` : `STAGE ${stage} CLEAR`;
}

export function formatXpLabel(level: number, xp: number, nextXp: number): string {
  return currentLanguage === 'zh-CN'
    ? `${level}级  ${Math.floor(xp)}/${nextXp} 经验`
    : `LV ${level}  ${Math.floor(xp)}/${nextXp} XP`;
}

export function formatHudWeaponLevel(level: number): string {
  return currentLanguage === 'zh-CN' ? `${level}级` : `LV ${level}`;
}

export function formatRerollLabel(remaining: number): string {
  return currentLanguage === 'zh-CN'
    ? `重抽 [R]  剩余 ${remaining} 次`
    : `REROLL [R]  ${remaining} LEFT`;
}

export function formatRestartCountdown(seconds: number): string {
  return currentLanguage === 'zh-CN'
    ? `${seconds.toFixed(1)} 秒后可重开`
    : `Restart in ${seconds.toFixed(1)}s`;
}

export function formatSurvivedStat(time: string): string {
  return currentLanguage === 'zh-CN' ? `生存时间  ${time}` : `Survived  ${time}`;
}

export function formatReachedStageStat(stage: number): string {
  return currentLanguage === 'zh-CN' ? `到达阶段  ${stage}` : `Reached Stage  ${stage}`;
}

export function formatKillsStat(kills: number): string {
  return currentLanguage === 'zh-CN' ? `击败数  ${kills}` : `Kills  ${kills}`;
}

export function formatNextStageStat(stage: number): string {
  return currentLanguage === 'zh-CN' ? `下一阶段  ${stage}` : `Next Stage  ${stage}`;
}

export function formatTotalKillsStat(kills: number): string {
  return currentLanguage === 'zh-CN' ? `总击败数  ${kills}` : `Total Kills  ${kills}`;
}

export function formatLevelReachedStat(level: number): string {
  return currentLanguage === 'zh-CN' ? `达到等级  ${level}` : `Level Reached  ${level}`;
}

export function formatStageEngaged(stage: number): string {
  return currentLanguage === 'zh-CN' ? `第 ${stage} 阶段开始` : `Stage ${stage} engaged`;
}

export function formatDoctrineOnline(id: DoctrineId): string {
  return currentLanguage === 'zh-CN'
    ? `${getDoctrineTitle(id)} 已激活`
    : `${getDoctrineTitle(id)} online`;
}

export function uiFont(size: number, weight: 'normal' | 'bold' = 'normal'): string {
  const family = currentLanguage === 'zh-CN'
    ? '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif'
    : '"SFMono-Regular", Menlo, Consolas, monospace';
  return `${weight} ${size}px ${family}`;
}
