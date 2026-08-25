import { DoctrineId, MutatorId, PassiveId, PassiveName, UpgradeTag, WeaponName } from './ids';

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
    titleSubtitle: '在虚空中生存，猎杀看守者',
    tapToStart: '点击开始',
    pressAnyKeyToStart: '按任意键开始',
    titleHintPrimary: '移动求生  •  武器自动开火  •  空格冲刺',
    titleHintPrimaryMobile: '摇杆移动  •  武器自动开火  •  点按闪电冲刺',
    titleHintSecondaryCompact: '击败虚空看守者进入下一阶段',
    titleHintSecondaryWide: '计时结束后看守者降临  •  构筑会延续到下一阶段',
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
    tutorialDashKey: '按空格键冲刺 — 无敌帧可以穿过弹幕',
    tutorialDashTouch: '点击右下角闪电按钮进行冲刺',
    draftRerolled: '升级选项已重抽',
    bossIncoming: '警告：虚空看守者逼近',
    slayPrompt: '击杀看守者！',
    bossDefeated: '看守者已被消灭',
    settingsSection: '设置',
    settingSound: '音效',
    settingMusic: '音乐',
    settingShake: '屏幕震动',
    settingNumbers: '伤害数字',
    toggleOn: '开',
    toggleOff: '关',
    resumeBtn: '继续战斗',
    restartBtn: '重新开始',
    quitBtn: '回到标题',
    currentBuild: '当前构筑',
    newRecord: '新纪录！',
    comboLabel: '连击',
    bestComboStat: '最高连击',
    runsStat: '总场次',
    bestStageStat: '最佳阶段',
    recordsTitle: '战绩档案',
    dashReadyHint: '冲刺就绪',
    versionTag: 'v0.2 ASCENSION',
  },
  en: {
    gameTitle: 'Universe Eater',
    languageLabel: 'Language / 语言',
    armament: 'ARMAMENT',
    critical: 'CRITICAL',
    doctrines: 'DOCTRINES',
    locked: 'LOCKED',
    titleSubtitle: 'SURVIVE THE VOID • SLAY THE WARDEN',
    tapToStart: 'Tap to start',
    pressAnyKeyToStart: 'Press any key to start',
    titleHintPrimary: 'MOVE TO SURVIVE  •  WEAPONS AUTO-FIRE  •  SPACE TO DASH',
    titleHintPrimaryMobile: 'DRAG TO MOVE  •  WEAPONS AUTO-FIRE  •  TAP BOLT TO DASH',
    titleHintSecondaryCompact: 'DEFEAT THE VOID WARDEN TO ADVANCE',
    titleHintSecondaryWide: 'WHEN THE TIMER ENDS THE WARDEN ARRIVES  •  YOUR BUILD CARRIES FORWARD',
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
    tutorialDashKey: 'Press SPACE to dash — i-frames phase through bullets',
    tutorialDashTouch: 'Tap the bolt button (bottom-right) to dash',
    draftRerolled: 'Draft rerolled',
    bossIncoming: 'WARNING: Void Warden approaching',
    slayPrompt: 'SLAY THE WARDEN!',
    bossDefeated: 'WARDEN DESTROYED',
    settingsSection: 'SETTINGS',
    settingSound: 'Sound FX',
    settingMusic: 'Music',
    settingShake: 'Screen shake',
    settingNumbers: 'Damage numbers',
    toggleOn: 'ON',
    toggleOff: 'OFF',
    resumeBtn: 'RESUME',
    restartBtn: 'RESTART RUN',
    quitBtn: 'QUIT TO TITLE',
    currentBuild: 'CURRENT BUILD',
    newRecord: 'NEW RECORD!',
    comboLabel: 'COMBO',
    bestComboStat: 'Best Combo',
    runsStat: 'Runs',
    bestStageStat: 'Best Stage',
    recordsTitle: 'SERVICE RECORD',
    dashReadyHint: 'Dash ready',
    versionTag: 'v0.2 ASCENSION',
  },
} as const;

const WEAPON_NAMES: Record<Language, Record<WeaponName, string>> = {
  'zh-CN': {
    'Laser Beam': '激光束',
    'Orbit Shield': '环轨护盾',
    'Nova Blast': '新星爆发',
    'Escort Wing': '护航僚机',
    'Seeker Swarm': '寻的飞弹',
    'Arc Reactor': '电弧核心',
    'Singularity': '奇点发生器',
  },
  en: {
    'Laser Beam': 'Laser Beam',
    'Orbit Shield': 'Orbit Shield',
    'Nova Blast': 'Nova Blast',
    'Escort Wing': 'Escort Wing',
    'Seeker Swarm': 'Seeker Swarm',
    'Arc Reactor': 'Arc Reactor',
    'Singularity': 'Singularity',
  },
};

const PASSIVE_NAMES: Record<Language, Record<PassiveName, string>> = {
  'zh-CN': {
    'Reinforced Hull': '强化船体',
    'Overdrive Thrusters': '超载推进器',
    'Nanoforge': '纳米工坊',
    'Phase Plating': '相位装甲',
    'Targeting CPU': '瞄准核心',
    'Overclock Core': '超频核心',
    'Vampiric Nanites': '吸血纳米体',
    'XP Amplifier': '经验放大器',
  },
  en: {
    'Reinforced Hull': 'Reinforced Hull',
    'Overdrive Thrusters': 'Overdrive Thrusters',
    'Nanoforge': 'Nanoforge',
    'Phase Plating': 'Phase Plating',
    'Targeting CPU': 'Targeting CPU',
    'Overclock Core': 'Overclock Core',
    'Vampiric Nanites': 'Vampiric Nanites',
    'XP Amplifier': 'XP Amplifier',
  },
};

const PASSIVE_TEXT: Record<Language, Record<PassiveId, { title: string; description: string; label: string }>> = {
  'zh-CN': {
    hull: {
      title: '强化船体',
      description: '最大船体 +25',
      label: '强化船体 +25',
    },
    thrusters: {
      title: '超载推进器',
      description: '移动速度 +18',
      label: '推进器 +18',
    },
    nanoforge: {
      title: '纳米工坊',
      description: '船体回复 +40%，安装时回复 12',
      label: '已安装纳米工坊',
    },
    plating: {
      title: '相位装甲',
      description: '受到伤害 -12%',
      label: '相位装甲强化',
    },
    targeting: {
      title: '瞄准核心',
      description: '暴击率 +8%，暴击伤害 ×2',
      label: '瞄准核心 +8% 暴击',
    },
    overclock: {
      title: '超频核心',
      description: '武器冷却 -7%',
      label: '全武器冷却 -7%',
    },
    vampiric: {
      title: '吸血纳米体',
      description: '击杀回复 0.8 船体',
      label: '击杀回复 +0.8',
    },
    amplifier: {
      title: '经验放大器',
      description: '经验 +12%',
      label: '经验获取 +12%',
    },
  },
  en: {
    hull: {
      title: 'Reinforced Hull',
      description: 'Max hull +25',
      label: 'Reinforced Hull +25',
    },
    thrusters: {
      title: 'Overdrive Thrusters',
      description: 'Move speed +18',
      label: 'Thrusters +18',
    },
    nanoforge: {
      title: 'Nanoforge',
      description: 'Hull regen +40%, heal 12 on install',
      label: 'Nanoforge installed',
    },
    plating: {
      title: 'Phase Plating',
      description: 'Incoming damage -12%',
      label: 'Phase Plating hardened',
    },
    targeting: {
      title: 'Targeting CPU',
      description: 'Crit chance +8%, crit damage ×2',
      label: 'Targeting CPU +8% crit',
    },
    overclock: {
      title: 'Overclock Core',
      description: 'Weapon cooldown -7%',
      label: 'All cooldowns -7%',
    },
    vampiric: {
      title: 'Vampiric Nanites',
      description: 'Heal 0.8 on kill',
      label: 'Heal on kill +0.8',
    },
    amplifier: {
      title: 'XP Amplifier',
      description: 'XP +12%',
      label: 'XP gain +12%',
    },
  },
};

const UNLOCK_TEXT: Record<Language, Record<Exclude<WeaponName, 'Laser Beam'>, { title: string; description: string; label: string }>> = {
  'zh-CN': {
    'Orbit Shield': {
      title: '解锁 环轨护盾',
      description: '环绕卫星',
      label: '新武器：环轨护盾',
    },
    'Nova Blast': {
      title: '解锁 新星爆发',
      description: '定时冲击波',
      label: '新武器：新星爆发',
    },
    'Escort Wing': {
      title: '解锁 护航僚机',
      description: '僚机支援激光',
      label: '新武器：护航僚机',
    },
    'Seeker Swarm': {
      title: '解锁 寻的飞弹',
      description: '追踪飞弹，范围爆炸',
      label: '新武器：寻的飞弹',
    },
    'Arc Reactor': {
      title: '解锁 电弧核心',
      description: '链式闪电，跳跃传导',
      label: '新武器：电弧核心',
    },
    Singularity: {
      title: '解锁 奇点发生器',
      description: '奇点牵引',
      label: '新武器：奇点发生器',
    },
  },
  en: {
    'Orbit Shield': {
      title: 'Unlock Orbit Shield',
      description: 'Rotating satellites',
      label: 'New weapon: Orbit Shield',
    },
    'Nova Blast': {
      title: 'Unlock Nova Blast',
      description: 'Timed shockwave',
      label: 'New weapon: Nova Blast',
    },
    'Escort Wing': {
      title: 'Unlock Escort Wing',
      description: 'Wingmate support laser',
      label: 'New weapon: Escort Wing',
    },
    'Seeker Swarm': {
      title: 'Unlock Seeker Swarm',
      description: 'Homing missiles, AoE blast',
      label: 'New weapon: Seeker Swarm',
    },
    'Arc Reactor': {
      title: 'Unlock Arc Reactor',
      description: 'Chain lightning',
      label: 'New weapon: Arc Reactor',
    },
    Singularity: {
      title: 'Unlock Singularity',
      description: 'Gravity well',
      label: 'New weapon: Singularity',
    },
  },
};

const UPGRADE_DESCRIPTIONS: Record<Language, Record<WeaponName, string>> = {
  'zh-CN': {
    'Laser Beam': '伤害、射程、频率提升',
    'Orbit Shield': '伤害、范围提升，关键等级 +卫星',
    'Nova Blast': '爆炸半径、伤害提升',
    'Escort Wing': '僚机伤害提升，与主武器同步',
    'Seeker Swarm': '飞弹数量、装填、爆炸范围提升',
    'Arc Reactor': '跳跃次数、伤害提升',
    Singularity: '引力、持续时间、湮灭伤害提升',
  },
  en: {
    'Laser Beam': 'Damage, range, cadence up',
    'Orbit Shield': 'Damage, range up, +satellite at key levels',
    'Nova Blast': 'Blast radius, damage up',
    'Escort Wing': 'Wingmate damage up, synced cadence',
    'Seeker Swarm': 'Missile count, reload, blast up',
    'Arc Reactor': 'Jumps, damage up',
    Singularity: 'Pull, duration, collapse damage up',
  },
};

const DOCTRINE_TEXT: Record<Language, Record<DoctrineId, { title: string; shortLabel: string; description: string }>> = {
  'zh-CN': {
    bulwark: {
      title: '堡垒协议',
      shortLabel: '堡垒',
      description: '+20 最大船体，接触无敌 +0.12s',
    },
    slipstream: {
      title: '滑流学说',
      shortLabel: '滑流',
      description: '移动速度 +20，武器冷却 -10%',
    },
    'nanite-lattice': {
      title: '纳米晶格',
      shortLabel: '晶格',
      description: '回复 +20%，武器伤害 +8%',
    },
    annihilation: {
      title: '湮灭模式',
      shortLabel: '湮灭',
      description: '武器伤害 +12%，冷却 -10%',
    },
  },
  en: {
    bulwark: {
      title: 'Bulwark Protocol',
      shortLabel: 'BULWARK',
      description: '+20 max hull, contact grace +0.12s',
    },
    slipstream: {
      title: 'Slipstream Doctrine',
      shortLabel: 'SLIPSTREAM',
      description: 'Move speed +20, cooldown -10%',
    },
    'nanite-lattice': {
      title: 'Nanite Lattice',
      shortLabel: 'LATTICE',
      description: 'Regen +20%, damage +8%',
    },
    annihilation: {
      title: 'Annihilation Pattern',
      shortLabel: 'ANNIHILATION',
      description: 'Damage +12%, cooldown -10%',
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

const MUTATOR_TEXT: Record<Language, Record<MutatorId, { name: string; short: string; desc: string }>> = {
  'zh-CN': {
    frenzy: {
      name: '虫群狂潮',
      short: '狂潮',
      desc: '刷怪更快，但敌人更脆弱。',
    },
    heavy: {
      name: '重甲压境',
      short: '重甲',
      desc: '敌人更肉，出怪更慢。带上穿透火力。',
    },
    overdrive: {
      name: '过载领域',
      short: '过载',
      desc: '所有敌人移速提高 20%。保持走位！',
    },
    shrapnel: {
      name: '弹幕风暴',
      short: '弹幕',
      desc: '敌方子弹更快更久。冲刺穿过弹幕缝隙。',
    },
    elites: {
      name: '精锐猎场',
      short: '精锐',
      desc: '精锐出现率大增，掉落也更多。高风险高回报。',
    },
    tiny: {
      name: '微缩虫群',
      short: '微缩',
      desc: '敌人更小更快更脆。别眨眼。',
    },
    veterans: {
      name: '老兵登场',
      short: '老兵',
      desc: '敌人按更高难度等级强化。尊重前辈。',
    },
  },
  en: {
    frenzy: {
      name: 'Swarm Frenzy',
      short: 'FRENZY',
      desc: 'Faster spawns, but frailer enemies.',
    },
    heavy: {
      name: 'Heavy Mantle',
      short: 'HEAVY',
      desc: 'Tougher enemies, slower waves. Bring piercing fire.',
    },
    overdrive: {
      name: 'Overdrive Field',
      short: 'OVERDRIVE',
      desc: 'All enemies move 20% faster. Keep moving!',
    },
    shrapnel: {
      name: 'Shrapnel Storm',
      short: 'SHRAPNEL',
      desc: 'Enemy bullets fly faster and last longer. Dash through the gaps.',
    },
    elites: {
      name: 'Elite Hunt',
      short: 'ELITE',
      desc: 'Elites everywhere — and they pay far better. High risk, high reward.',
    },
    tiny: {
      name: 'Tiny Terrors',
      short: 'TINY',
      desc: 'Enemies shrink, speed up, and go fragile. Blink and they swarm.',
    },
    veterans: {
      name: 'Veteran Corps',
      short: 'VETERAN',
      desc: 'Enemies scale two difficulty levels higher. Respect your elders.',
    },
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

export function getMutatorName(id: MutatorId): string {
  return MUTATOR_TEXT[currentLanguage][id].name;
}

export function getMutatorShort(id: MutatorId): string {
  return MUTATOR_TEXT[currentLanguage][id].short;
}

export function getMutatorDesc(id: MutatorId): string {
  return MUTATOR_TEXT[currentLanguage][id].desc;
}

export function formatStageMutators(stage: number): string {
  return currentLanguage === 'zh-CN' ? `阶段 ${stage} 环境修正` : `STAGE ${stage} MUTATORS`;
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

export function formatBossTitle(stage: number): string {
  return currentLanguage === 'zh-CN' ? `虚空看守者 Mk.${stage}` : `VOID WARDEN Mk.${stage}`;
}

export function formatCombo(combo: number): string {
  return currentLanguage === 'zh-CN' ? `${combo} 连击` : `${combo} COMBO`;
}

export function formatLockedCount(count: number): string {
  return currentLanguage === 'zh-CN' ? `未解锁武器 ×${count}` : `${count} LOCKED`;
}

export function uiFont(size: number, weight: 'normal' | 'bold' = 'normal'): string {
  const family = currentLanguage === 'zh-CN'
    ? '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif'
    : '"SFMono-Regular", Menlo, Consolas, monospace';
  return `${weight} ${size}px ${family}`;
}
