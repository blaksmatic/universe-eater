"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// wx/empty-three.js
var require_empty_three = __commonJS({
  "wx/empty-three.js"(exports, module2) {
    "use strict";
    function StubCtor() {
    }
    StubCtor.prototype = {};
    module2.exports = {
      AmbientLight: StubCtor,
      BoxGeometry: StubCtor,
      BufferGeometry: StubCtor,
      ConeGeometry: StubCtor,
      CylinderGeometry: StubCtor,
      DirectionalLight: StubCtor,
      DodecahedronGeometry: StubCtor,
      Group: StubCtor,
      HemisphereLight: StubCtor,
      IcosahedronGeometry: StubCtor,
      Mesh: StubCtor,
      MeshLambertMaterial: StubCtor,
      Object3D: StubCtor,
      OctahedronGeometry: StubCtor,
      OrthographicCamera: StubCtor,
      Scene: StubCtor,
      WebGLRenderer: StubCtor,
      SRGBColorSpace: "srgb"
    };
  }
});

// src/i18n.ts
var STORAGE_KEY = "universe-eater.language";
var DEFAULT_LANGUAGE = "zh-CN";
var UI_TEXT = {
  "zh-CN": {
    gameTitle: "\u5B87\u5B99\u541E\u566C\u8005",
    languageLabel: "\u8BED\u8A00 / Language",
    armament: "\u6B66\u88C5",
    critical: "\u5371\u9669",
    doctrines: "\u5B66\u8BF4",
    locked: "\u672A\u89E3\u9501",
    titleSubtitle: "\u751F\u5B58 8 \u5206\u949F",
    tapToStart: "\u70B9\u51FB\u5F00\u59CB",
    pressAnyKeyToStart: "\u6309\u4EFB\u610F\u952E\u5F00\u59CB",
    titleHintPrimary: "\u79FB\u52A8\u6C42\u751F  \u2022  \u6B66\u5668\u81EA\u52A8\u5F00\u706B",
    titleHintSecondaryCompact: "\u9636\u6BB5\u8D8A\u6765\u8D8A\u96BE  \u2022  \u6784\u7B51\u4F1A\u5EF6\u7EED",
    titleHintSecondaryWide: "\u9636\u6BB5\u96BE\u5EA6\u4F1A\u53E0\u52A0  \u2022  \u6784\u7B51\u4F1A\u5EF6\u7EED\u5230\u4E0B\u4E00\u9636\u6BB5",
    levelUpTitle: "\u5347\u7EA7",
    levelUpSubtitle: "\u9009\u62E9\u4E0B\u4E00\u9879\u53D8\u5F02",
    tapCardToMutate: "\u70B9\u51FB\u5361\u724C\u8FDB\u884C\u53D8\u5F02",
    keyboardDraftControls: "\u65B9\u5411\u952E\u9009\u62E9  \u2022  Enter \u786E\u8BA4  \u2022  R \u91CD\u62BD",
    rerollSpent: "\u91CD\u62BD\u5DF2\u7528\u5B8C",
    paused: "\u5DF2\u6682\u505C",
    resumePrompt: "\u6309 ESC \u6216\u70B9\u51FB II \u7EE7\u7EED",
    tapToRestart: "\u70B9\u51FB\u91CD\u65B0\u5F00\u59CB",
    pressAnyKeyToRestart: "\u6309\u4EFB\u610F\u952E\u91CD\u65B0\u5F00\u59CB",
    tapToNextStage: "\u70B9\u51FB\u8FDB\u5165\u4E0B\u4E00\u9636\u6BB5",
    pressAnyKeyToNextStage: "\u6309\u4EFB\u610F\u952E\u8FDB\u5165\u4E0B\u4E00\u9636\u6BB5",
    gameOver: "\u6E38\u620F\u7ED3\u675F",
    keepMovingTutorial: "\u6301\u7EED\u79FB\u52A8\uFF0C\u9996\u6B21\u5347\u7EA7\u4F1A\u89E3\u9501\u65B0\u6B66\u5668\u3002",
    draftRerolled: "\u5347\u7EA7\u9009\u9879\u5DF2\u91CD\u62BD"
  },
  en: {
    gameTitle: "Universe Eater",
    languageLabel: "Language / \u8BED\u8A00",
    armament: "ARMAMENT",
    critical: "CRITICAL",
    doctrines: "DOCTRINES",
    locked: "LOCKED",
    titleSubtitle: "SURVIVE 8 MINUTES",
    tapToStart: "Tap to start",
    pressAnyKeyToStart: "Press any key to start",
    titleHintPrimary: "MOVE TO SURVIVE  \u2022  WEAPONS AUTO-FIRE",
    titleHintSecondaryCompact: "STAGES GET HARDER  \u2022  BUILD CARRIES FORWARD",
    titleHintSecondaryWide: "STAGES STACK DIFFICULTY  \u2022  YOUR BUILD CARRIES FORWARD",
    levelUpTitle: "LEVEL UP",
    levelUpSubtitle: "Choose your next mutation",
    tapCardToMutate: "Tap a card to mutate",
    keyboardDraftControls: "Arrow keys select  \u2022  Enter confirms  \u2022  R rerolls",
    rerollSpent: "REROLL SPENT",
    paused: "PAUSED",
    resumePrompt: "Press ESC or tap II to resume",
    tapToRestart: "Tap to restart",
    pressAnyKeyToRestart: "Press any key to restart",
    tapToNextStage: "Tap to enter the next stage",
    pressAnyKeyToNextStage: "Press any key to enter the next stage",
    gameOver: "GAME OVER",
    keepMovingTutorial: "Keep moving. First level-ups unlock new weapons.",
    draftRerolled: "Draft rerolled"
  }
};
var WEAPON_NAMES = {
  "zh-CN": {
    "Laser Beam": "\u6FC0\u5149\u675F",
    "Orbit Shield": "\u73AF\u8F68\u62A4\u76FE",
    "Nova Blast": "\u65B0\u661F\u7206\u53D1",
    "Escort Wing": "\u62A4\u822A\u50DA\u673A"
  },
  en: {
    "Laser Beam": "Laser Beam",
    "Orbit Shield": "Orbit Shield",
    "Nova Blast": "Nova Blast",
    "Escort Wing": "Escort Wing"
  }
};
var PASSIVE_TEXT = {
  "zh-CN": {
    hull: {
      title: "\u5F3A\u5316\u8239\u4F53",
      description: "\u6700\u5927\u8239\u4F53 +25\uFF0C\u5E76\u7ACB\u523B\u4FEE\u590D\u65B0\u589E\u88C5\u7532\u3002",
      label: "\u5F3A\u5316\u8239\u4F53 +25"
    },
    thrusters: {
      title: "\u8D85\u8F7D\u63A8\u8FDB\u5668",
      description: "\u63D0\u9AD8\u79FB\u52A8\u901F\u5EA6\uFF0C\u8BA9\u4F60\u66F4\u5BB9\u6613\u62C9\u626F\u5E76\u51B2\u51FA\u5305\u56F4\u3002",
      label: "\u63A8\u8FDB\u5668 +18"
    },
    nanoforge: {
      title: "\u7EB3\u7C73\u5DE5\u574A",
      description: "\u52A0\u5FEB\u8239\u4F53\u56DE\u590D\uFF0C\u5E76\u5728\u5B89\u88C5\u65F6\u7ACB\u5373\u4FEE\u590D\u4E00\u90E8\u5206\u635F\u4F24\u3002",
      label: "\u5DF2\u5B89\u88C5\u7EB3\u7C73\u5DE5\u574A"
    },
    plating: {
      title: "\u76F8\u4F4D\u88C5\u7532",
      description: "\u964D\u4F4E\u53D7\u5230\u7684\u4F24\u5BB3\uFF0C\u8BA9\u5931\u8BEF\u4EE3\u4EF7\u66F4\u4F4E\uFF0C\u4E5F\u66F4\u5BB9\u6613\u625B\u4F4F\u9996\u9886\u538B\u529B\u3002",
      label: "\u76F8\u4F4D\u88C5\u7532\u5F3A\u5316"
    }
  },
  en: {
    hull: {
      title: "Reinforced Hull",
      description: "Increase maximum hull by 25 and instantly repair the new plating.",
      label: "Reinforced Hull +25"
    },
    thrusters: {
      title: "Overdrive Thrusters",
      description: "Boost movement speed so you can kite wider and break collapsing swarms.",
      label: "Thrusters +18"
    },
    nanoforge: {
      title: "Nanoforge",
      description: "Accelerate hull regeneration and patch yourself up on install.",
      label: "Nanoforge installed"
    },
    plating: {
      title: "Phase Plating",
      description: "Reduce incoming damage so mistakes cost less and boss pressure lands cleaner.",
      label: "Phase Plating hardened"
    }
  }
};
var UNLOCK_TEXT = {
  "zh-CN": {
    "Orbit Shield": {
      title: "\u89E3\u9501 \u73AF\u8F68\u62A4\u76FE",
      description: "\u83B7\u5F97\u73AF\u7ED5\u536B\u661F\uFF0C\u6301\u7EED\u6495\u788E\u9760\u8FD1\u8239\u4F53\u7684\u654C\u4EBA\u3002",
      label: "\u65B0\u6B66\u5668\uFF1A\u73AF\u8F68\u62A4\u76FE"
    },
    "Nova Blast": {
      title: "\u89E3\u9501 \u65B0\u661F\u7206\u53D1",
      description: "\u83B7\u5F97\u5B9A\u65F6\u51B2\u51FB\u6CE2\uFF0C\u5728\u654C\u7FA4\u8D34\u8EAB\u65F6\u6E05\u51FA\u5598\u606F\u7A7A\u95F4\u3002",
      label: "\u65B0\u6B66\u5668\uFF1A\u65B0\u661F\u7206\u53D1"
    },
    "Escort Wing": {
      title: "\u89E3\u9501 \u62A4\u822A\u50DA\u673A",
      description: "\u90E8\u7F72\u62A4\u822A\u50DA\u673A\uFF0C\u5B83\u4F1A\u4F34\u98DE\u5E76\u4EE5\u540C\u6837\u8282\u594F\u53D1\u5C04\u652F\u63F4\u6FC0\u5149\u3002",
      label: "\u65B0\u6B66\u5668\uFF1A\u62A4\u822A\u50DA\u673A"
    }
  },
  en: {
    "Orbit Shield": {
      title: "Unlock Orbit Shield",
      description: "Add rotating satellites that chew through anything close to your hull.",
      label: "New weapon: Orbit Shield"
    },
    "Nova Blast": {
      title: "Unlock Nova Blast",
      description: "Gain a timed shockwave that clears breathing room when swarms collapse in.",
      label: "New weapon: Nova Blast"
    },
    "Escort Wing": {
      title: "Unlock Escort Wing",
      description: "Deploy a wingmate that tracks beside you and fires a support laser at the same cadence.",
      label: "New weapon: Escort Wing"
    }
  }
};
var UPGRADE_DESCRIPTIONS = {
  "zh-CN": {
    "Laser Beam": "\u63D0\u9AD8\u4F24\u5BB3\u3001\u5C04\u7A0B\u548C\u6FC0\u5149\u9891\u7387\u3002",
    "Orbit Shield": "\u63D0\u9AD8\u4F24\u5BB3\u4E0E\u538B\u5236\u8303\u56F4\uFF0C\u5E76\u5728\u5173\u952E\u7B49\u7EA7\u8FFD\u52A0\u536B\u661F\u3002",
    "Nova Blast": "\u6269\u5927\u7206\u70B8\u534A\u5F84\uFF0C\u5E76\u5F3A\u5316\u7206\u53D1\u4F24\u5BB3\u4EE5\u91CD\u7F6E\u5371\u9669\u5C40\u9762\u3002",
    "Escort Wing": "\u5F3A\u5316\u50DA\u673A\u6FC0\u5149\uFF0C\u8BA9\u652F\u63F4\u706B\u529B\u66F4\u731B\uFF0C\u540C\u65F6\u4FDD\u6301\u4E0E\u4F60\u4E3B\u6B66\u5668\u540C\u6B65\u3002"
  },
  en: {
    "Laser Beam": "Higher damage, longer reach, and faster beam cadence.",
    "Orbit Shield": "More damage and wider orbit pressure, with extra satellites at key levels.",
    "Nova Blast": "Bigger detonation radius with a stronger burst to reset dangerous screens.",
    "Escort Wing": "Boost the wingmate beam so its support laser hits harder while keeping pace with your main emitter."
  }
};
var DOCTRINE_TEXT = {
  "zh-CN": {
    bulwark: {
      title: "\u5821\u5792\u534F\u8BAE",
      shortLabel: "\u5821\u5792",
      description: "\u9632\u62A4\u7CFB\u5347\u7EA7\u4F1A\u5F3A\u5316\u6838\u5FC3\u3002\u83B7\u5F97 +20 \u6700\u5927\u8239\u4F53\uFF0C\u5E76\u5EF6\u957F\u63A5\u89E6\u4FDD\u62A4\u65F6\u95F4\u3002"
    },
    slipstream: {
      title: "\u6ED1\u6D41\u5B66\u8BF4",
      shortLabel: "\u6ED1\u6D41",
      description: "\u673A\u52A8\u7CFB\u5347\u7EA7\u4F1A\u52A0\u901F\u6574\u5957\u673A\u4F53\u3002\u83B7\u5F97\u79FB\u52A8\u901F\u5EA6\u5E76\u63D0\u5347\u6B66\u5668\u9891\u7387\u3002"
    },
    "nanite-lattice": {
      title: "\u7EB3\u7C73\u6676\u683C",
      shortLabel: "\u6676\u683C",
      description: "\u953B\u9020\u7CFB\u5347\u7EA7\u4F1A\u5F3A\u5316\u541E\u566C\u8005\u5916\u58F3\u3002\u83B7\u5F97\u66F4\u9AD8\u56DE\u590D\u4E0E\u6B66\u5668\u4F24\u5BB3\u3002"
    },
    annihilation: {
      title: "\u6E6E\u706D\u6A21\u5F0F",
      shortLabel: "\u6E6E\u706D",
      description: "\u706B\u529B\u7CFB\u5347\u7EA7\u4F1A\u9510\u5316\u6BCF\u4E2A\u53D1\u5C04\u5668\u3002\u6240\u6709\u6B66\u5668\u4F24\u5BB3\u66F4\u9AD8\uFF0C\u5FAA\u73AF\u66F4\u5FEB\u3002"
    }
  },
  en: {
    bulwark: {
      title: "Bulwark Protocol",
      shortLabel: "BULWARK",
      description: "Ward upgrades harden the core. Gain +20 max hull and longer contact grace."
    },
    slipstream: {
      title: "Slipstream Doctrine",
      shortLabel: "SLIPSTREAM",
      description: "Surge upgrades accelerate the whole rig. Gain speed and faster weapon cadence."
    },
    "nanite-lattice": {
      title: "Nanite Lattice",
      shortLabel: "LATTICE",
      description: "Forge upgrades reinforce the swarm-eater shell. Gain regen and weapon damage."
    },
    annihilation: {
      title: "Annihilation Pattern",
      shortLabel: "ANNIHILATION",
      description: "Force upgrades sharpen every emitter. Your weapons hit harder and cycle faster."
    }
  }
};
var TAG_TEXT = {
  "zh-CN": {
    force: "\u706B\u529B",
    ward: "\u9632\u62A4",
    surge: "\u673A\u52A8",
    forge: "\u953B\u9020"
  },
  en: {
    force: "FORCE",
    ward: "WARD",
    surge: "SURGE",
    forge: "FORGE"
  }
};
var currentLanguage = readStoredLanguage();
function readStoredLanguage() {
  if (typeof __win === "undefined") return DEFAULT_LANGUAGE;
  try {
    const stored = __win.localStorage.getItem(STORAGE_KEY);
    if (stored === "zh-CN" || stored === "en") {
      return stored;
    }
  } catch (e) {
  }
  return DEFAULT_LANGUAGE;
}
function getLanguage() {
  return currentLanguage;
}
function setLanguage(language) {
  currentLanguage = language;
  if (typeof __win !== "undefined") {
    try {
      __win.localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
    }
  }
  syncDocumentLanguage();
}
function syncDocumentLanguage() {
  if (typeof __doc === "undefined") return;
  __doc.documentElement.lang = currentLanguage;
  __doc.title = getGameTitle();
}
function getGameTitle() {
  return UI_TEXT[currentLanguage].gameTitle;
}
function getGameTitleLines(compact) {
  if (currentLanguage === "zh-CN") {
    return ["\u5B87\u5B99\u541E\u566C\u8005"];
  }
  return compact ? ["UNIVERSE", "EATER"] : ["UNIVERSE EATER"];
}
function getLanguageButtonLabel(language) {
  return language === "zh-CN" ? "\u4E2D\u6587" : "English";
}
function getUiText(key) {
  return UI_TEXT[currentLanguage][key];
}
function getWeaponName(name) {
  return WEAPON_NAMES[currentLanguage][name];
}
function getPassiveTitle(id) {
  return PASSIVE_TEXT[currentLanguage][id].title;
}
function getPassiveDescription(id) {
  return PASSIVE_TEXT[currentLanguage][id].description;
}
function getPassiveLabel(id) {
  return PASSIVE_TEXT[currentLanguage][id].label;
}
function getUnlockTitle(name) {
  return UNLOCK_TEXT[currentLanguage][name].title;
}
function getUnlockDescription(name) {
  return UNLOCK_TEXT[currentLanguage][name].description;
}
function getUnlockLabel(name) {
  return UNLOCK_TEXT[currentLanguage][name].label;
}
function getWeaponUpgradeTitle(name, level) {
  return currentLanguage === "zh-CN" ? `${getWeaponName(name)} ${level}\u7EA7` : `${getWeaponName(name)} Lv ${level}`;
}
function getWeaponUpgradeDescription(name) {
  return UPGRADE_DESCRIPTIONS[currentLanguage][name];
}
function getWeaponUpgradeLabel(name, level) {
  return currentLanguage === "zh-CN" ? `${getWeaponName(name)} -> ${level}\u7EA7` : `${getWeaponName(name)} -> Lv.${level}`;
}
function getDoctrineTitle(id) {
  return DOCTRINE_TEXT[currentLanguage][id].title;
}
function getDoctrineShortLabel(id) {
  return DOCTRINE_TEXT[currentLanguage][id].shortLabel;
}
function getDoctrineDescription(id) {
  return DOCTRINE_TEXT[currentLanguage][id].description;
}
function getTagLabel(tag) {
  return TAG_TEXT[currentLanguage][tag];
}
function formatHullLabel(percent) {
  return currentLanguage === "zh-CN" ? `\u8239\u4F53 ${percent}%` : `HULL ${percent}%`;
}
function formatStageLabel(stage) {
  return currentLanguage === "zh-CN" ? `\u9636\u6BB5 ${stage}` : `STAGE ${stage}`;
}
function formatStageClearTitle(stage) {
  return currentLanguage === "zh-CN" ? `\u7B2C ${stage} \u9636\u6BB5\u901A\u5173` : `STAGE ${stage} CLEAR`;
}
function formatXpLabel(level, xp, nextXp) {
  return currentLanguage === "zh-CN" ? `${level}\u7EA7  ${Math.floor(xp)}/${nextXp} \u7ECF\u9A8C` : `LV ${level}  ${Math.floor(xp)}/${nextXp} XP`;
}
function formatHudWeaponLevel(level) {
  return currentLanguage === "zh-CN" ? `${level}\u7EA7` : `LV ${level}`;
}
function formatRerollLabel(remaining) {
  return currentLanguage === "zh-CN" ? `\u91CD\u62BD [R]  \u5269\u4F59 ${remaining} \u6B21` : `REROLL [R]  ${remaining} LEFT`;
}
function formatRestartCountdown(seconds) {
  return currentLanguage === "zh-CN" ? `${seconds.toFixed(1)} \u79D2\u540E\u53EF\u91CD\u5F00` : `Restart in ${seconds.toFixed(1)}s`;
}
function formatSurvivedStat(time) {
  return currentLanguage === "zh-CN" ? `\u751F\u5B58\u65F6\u95F4  ${time}` : `Survived  ${time}`;
}
function formatReachedStageStat(stage) {
  return currentLanguage === "zh-CN" ? `\u5230\u8FBE\u9636\u6BB5  ${stage}` : `Reached Stage  ${stage}`;
}
function formatKillsStat(kills) {
  return currentLanguage === "zh-CN" ? `\u51FB\u8D25\u6570  ${kills}` : `Kills  ${kills}`;
}
function formatNextStageStat(stage) {
  return currentLanguage === "zh-CN" ? `\u4E0B\u4E00\u9636\u6BB5  ${stage}` : `Next Stage  ${stage}`;
}
function formatTotalKillsStat(kills) {
  return currentLanguage === "zh-CN" ? `\u603B\u51FB\u8D25\u6570  ${kills}` : `Total Kills  ${kills}`;
}
function formatLevelReachedStat(level) {
  return currentLanguage === "zh-CN" ? `\u8FBE\u5230\u7B49\u7EA7  ${level}` : `Level Reached  ${level}`;
}
function formatStageEngaged(stage) {
  return currentLanguage === "zh-CN" ? `\u7B2C ${stage} \u9636\u6BB5\u5F00\u59CB` : `Stage ${stage} engaged`;
}
function formatDoctrineOnline(id) {
  return currentLanguage === "zh-CN" ? `${getDoctrineTitle(id)} \u5DF2\u6FC0\u6D3B` : `${getDoctrineTitle(id)} online`;
}
function uiFont(size, weight = "normal") {
  const family = currentLanguage === "zh-CN" ? '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif' : '"SFMono-Regular", Menlo, Consolas, monospace';
  return `${weight} ${size}px ${family}`;
}

// src/upgrades.ts
var DOCTRINES = [
  {
    id: "bulwark",
    title: () => getDoctrineTitle("bulwark"),
    shortLabel: () => getDoctrineShortLabel("bulwark"),
    description: () => getDoctrineDescription("bulwark"),
    thresholdTag: "ward",
    thresholdCount: 2
  },
  {
    id: "slipstream",
    title: () => getDoctrineTitle("slipstream"),
    shortLabel: () => getDoctrineShortLabel("slipstream"),
    description: () => getDoctrineDescription("slipstream"),
    thresholdTag: "surge",
    thresholdCount: 2
  },
  {
    id: "nanite-lattice",
    title: () => getDoctrineTitle("nanite-lattice"),
    shortLabel: () => getDoctrineShortLabel("nanite-lattice"),
    description: () => getDoctrineDescription("nanite-lattice"),
    thresholdTag: "forge",
    thresholdCount: 2
  },
  {
    id: "annihilation",
    title: () => getDoctrineTitle("annihilation"),
    shortLabel: () => getDoctrineShortLabel("annihilation"),
    description: () => getDoctrineDescription("annihilation"),
    thresholdTag: "force",
    thresholdCount: 3
  }
];
function createEmptyTraitCounts() {
  return {
    force: 0,
    ward: 0,
    surge: 0,
    forge: 0
  };
}
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function sampleWithoutReplacement(items, count) {
  return shuffle(items).slice(0, count);
}
function buildPassiveChoices() {
  return [
    {
      id: "passive-hull",
      kind: "passive",
      passiveId: "hull",
      title: () => getPassiveTitle("hull"),
      description: () => getPassiveDescription("hull"),
      label: () => getPassiveLabel("hull"),
      iconName: "Reinforced Hull",
      tags: ["ward"]
    },
    {
      id: "passive-thrusters",
      kind: "passive",
      passiveId: "thrusters",
      title: () => getPassiveTitle("thrusters"),
      description: () => getPassiveDescription("thrusters"),
      label: () => getPassiveLabel("thrusters"),
      iconName: "Overdrive Thrusters",
      tags: ["surge"]
    },
    {
      id: "passive-nanoforge",
      kind: "passive",
      passiveId: "nanoforge",
      title: () => getPassiveTitle("nanoforge"),
      description: () => getPassiveDescription("nanoforge"),
      label: () => getPassiveLabel("nanoforge"),
      iconName: "Nanoforge",
      tags: ["forge"]
    },
    {
      id: "passive-plating",
      kind: "passive",
      passiveId: "plating",
      title: () => getPassiveTitle("plating"),
      description: () => getPassiveDescription("plating"),
      label: () => getPassiveLabel("plating"),
      iconName: "Phase Plating",
      tags: ["ward", "forge"]
    }
  ];
}
function buildUpgradeDraft(wm, upgradeCount) {
  const unlocks = [];
  const upgrades = [];
  const passives = buildPassiveChoices();
  if (!wm.hasWeapon("Orbit Shield")) {
    unlocks.push({
      id: "unlock-orbit",
      kind: "unlock",
      weaponType: "orbit",
      weaponName: "Orbit Shield",
      title: () => getUnlockTitle("Orbit Shield"),
      description: () => getUnlockDescription("Orbit Shield"),
      label: () => getUnlockLabel("Orbit Shield"),
      iconName: "Orbit Shield",
      tags: ["ward"]
    });
  }
  if (!wm.hasWeapon("Nova Blast")) {
    unlocks.push({
      id: "unlock-nova",
      kind: "unlock",
      weaponType: "nova",
      weaponName: "Nova Blast",
      title: () => getUnlockTitle("Nova Blast"),
      description: () => getUnlockDescription("Nova Blast"),
      label: () => getUnlockLabel("Nova Blast"),
      iconName: "Nova Blast",
      tags: ["force", "surge"]
    });
  }
  if (!wm.hasWeapon("Escort Wing")) {
    unlocks.push({
      id: "unlock-escort",
      kind: "unlock",
      weaponType: "escort",
      weaponName: "Escort Wing",
      title: () => getUnlockTitle("Escort Wing"),
      description: () => getUnlockDescription("Escort Wing"),
      label: () => getUnlockLabel("Escort Wing"),
      iconName: "Escort Wing",
      tags: ["force", "surge"]
    });
  }
  for (const weapon of wm.weapons) {
    if (weapon.level >= weapon.maxLevel) continue;
    if (weapon.name === "Laser Beam") {
      upgrades.push({
        id: `upgrade-laser-${weapon.level + 1}`,
        kind: "upgrade",
        weaponName: "Laser Beam",
        title: () => getWeaponUpgradeTitle("Laser Beam", weapon.level + 1),
        description: () => getWeaponUpgradeDescription("Laser Beam"),
        label: () => getWeaponUpgradeLabel("Laser Beam", weapon.level + 1),
        iconName: "Laser Beam",
        tags: ["force", "forge"]
      });
    } else if (weapon.name === "Orbit Shield") {
      upgrades.push({
        id: `upgrade-orbit-${weapon.level + 1}`,
        kind: "upgrade",
        weaponName: "Orbit Shield",
        title: () => getWeaponUpgradeTitle("Orbit Shield", weapon.level + 1),
        description: () => getWeaponUpgradeDescription("Orbit Shield"),
        label: () => getWeaponUpgradeLabel("Orbit Shield", weapon.level + 1),
        iconName: "Orbit Shield",
        tags: ["ward"]
      });
    } else if (weapon.name === "Nova Blast") {
      upgrades.push({
        id: `upgrade-nova-${weapon.level + 1}`,
        kind: "upgrade",
        weaponName: "Nova Blast",
        title: () => getWeaponUpgradeTitle("Nova Blast", weapon.level + 1),
        description: () => getWeaponUpgradeDescription("Nova Blast"),
        label: () => getWeaponUpgradeLabel("Nova Blast", weapon.level + 1),
        iconName: "Nova Blast",
        tags: ["force", "surge"]
      });
    } else if (weapon.name === "Escort Wing") {
      upgrades.push({
        id: `upgrade-escort-${weapon.level + 1}`,
        kind: "upgrade",
        weaponName: "Escort Wing",
        title: () => getWeaponUpgradeTitle("Escort Wing", weapon.level + 1),
        description: () => getWeaponUpgradeDescription("Escort Wing"),
        label: () => getWeaponUpgradeLabel("Escort Wing", weapon.level + 1),
        iconName: "Escort Wing",
        tags: ["force", "surge"]
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
function applyUpgradeChoice(choice, wm, player) {
  if (choice.kind === "unlock") {
    wm.addWeapon(choice.weaponType);
    return;
  }
  if (choice.kind === "passive") {
    switch (choice.passiveId) {
      case "hull":
        player.upgradeHull();
        return;
      case "thrusters":
        player.upgradeThrusters();
        return;
      case "nanoforge":
        player.upgradeNanoforge();
        return;
      case "plating":
        player.upgradePlating();
        return;
    }
  }
  const weapon = wm.getWeapon(choice.weaponName);
  if (weapon) {
    weapon.level++;
  }
}
function getNewDoctrines(traitCounts, unlockedIds) {
  return DOCTRINES.filter((doctrine) => !unlockedIds.includes(doctrine.id) && traitCounts[doctrine.thresholdTag] >= doctrine.thresholdCount);
}
function applyDoctrine(doctrine, wm, player) {
  switch (doctrine.id) {
    case "bulwark":
      player.addMaxHull(20, 20);
      player.increaseContactGrace(0.12);
      return;
    case "slipstream":
      player.addSpeed(20);
      wm.multiplyCooldown(0.9);
      return;
    case "nanite-lattice":
      player.multiplyRegen(1.2, 10);
      wm.multiplyDamage(1.08);
      return;
    case "annihilation":
      wm.multiplyDamage(1.12);
      wm.multiplyCooldown(0.9);
      return;
  }
}

// src/utils.ts
var MAP_WIDTH = 5e4;
var MAP_HEIGHT = 5e4;
var TWO_PI = Math.PI * 2;
function randomRange(min, max) {
  return min + Math.random() * (max - min);
}
function wrapPosition(x, y) {
  let wx = x;
  let wy = y;
  if (wx < 0) wx += MAP_WIDTH;
  if (wx >= MAP_WIDTH) wx -= MAP_WIDTH;
  if (wy < 0) wy += MAP_HEIGHT;
  if (wy >= MAP_HEIGHT) wy -= MAP_HEIGHT;
  return { x: wx, y: wy };
}
function wrappedDelta(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  if (dx > MAP_WIDTH / 2) dx -= MAP_WIDTH;
  if (dx < -MAP_WIDTH / 2) dx += MAP_WIDTH;
  if (dy > MAP_HEIGHT / 2) dy -= MAP_HEIGHT;
  if (dy < -MAP_HEIGHT / 2) dy += MAP_HEIGHT;
  return { x: dx, y: dy };
}
function wrappedDistance(x1, y1, x2, y2) {
  const d = wrappedDelta(x1, y1, x2, y2);
  return Math.sqrt(d.x * d.x + d.y * d.y);
}
function wrappedAngle(x1, y1, x2, y2) {
  const d = wrappedDelta(x1, y1, x2, y2);
  return Math.atan2(d.y, d.x);
}
function parseHexColor(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}
function formatTime(seconds) {
  const t = Math.ceil(seconds);
  const min = Math.floor(t / 60);
  const sec = t % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
function drawSphereShading(ctx2, cx, cy, radius, r, g, b) {
  const hlX = cx - radius * 0.3;
  const hlY = cy - radius * 0.3;
  const grad = ctx2.createRadialGradient(hlX, hlY, radius * 0.1, cx, cy, radius);
  grad.addColorStop(0, `rgba(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)}, 0.25)`);
  grad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.08)`);
  grad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
  ctx2.beginPath();
  ctx2.arc(cx, cy, radius - 1, 0, TWO_PI);
  ctx2.fillStyle = grad;
  ctx2.fill();
}
function tracePoly(ctx2, cx, cy, r, sides, rot) {
  ctx2.beginPath();
  for (let i = 0; i <= sides; i++) {
    const angle = rot + i / sides * TWO_PI;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx2.moveTo(px, py);
    else ctx2.lineTo(px, py);
  }
  ctx2.closePath();
}
function roundedRect(ctx2, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2));
  const right = x + width;
  const bottom = y + height;
  ctx2.moveTo(x + r, y);
  ctx2.lineTo(right - r, y);
  ctx2.quadraticCurveTo(right, y, right, y + r);
  ctx2.lineTo(right, bottom - r);
  ctx2.quadraticCurveTo(right, bottom, right - r, bottom);
  ctx2.lineTo(x + r, bottom);
  ctx2.quadraticCurveTo(x, bottom, x, bottom - r);
  ctx2.lineTo(x, y + r);
  ctx2.quadraticCurveTo(x, y, x + r, y);
  ctx2.closePath();
}
function easeOutBack(t) {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// src/game.ts
var Game = class {
  constructor() {
    this.state = "title" /* TITLE */;
    this.stage = 1;
    this.elapsedTime = 0;
    this.totalElapsedTime = 0;
    this.gameDuration = 480;
    this.notifications = [{
      text: () => getUiText("keepMovingTutorial"),
      timer: 4,
      alpha: 1,
      kind: "info"
    }];
    this.upgradeCount = 0;
    this.pendingLevelUps = 0;
    this.rerollsRemaining = 1;
    this.draftChoices = [];
    this.selectedDraftIndex = 0;
    this.traitCounts = createEmptyTraitCounts();
    this.activeDoctrines = [];
  }
  get timeRemaining() {
    return Math.max(0, this.gameDuration - this.elapsedTime);
  }
  get timeRemainingFormatted() {
    return formatTime(this.timeRemaining);
  }
  advanceStage() {
    this.stage++;
    this.elapsedTime = 0;
    this.state = "playing" /* PLAYING */;
    this.pendingLevelUps = 0;
    this.draftChoices = [];
    this.selectedDraftIndex = 0;
    this.notifications.push({
      text: () => formatStageEngaged(this.stage),
      timer: 2.8,
      alpha: 1,
      kind: "unlock"
    });
  }
  queueLevelUps(count, wm) {
    if (count <= 0) return;
    this.pendingLevelUps += count;
    if (this.state !== "levelUp" /* LEVEL_UP */) {
      this.beginNextDraft(wm);
    }
  }
  beginNextDraft(wm) {
    if (this.pendingLevelUps <= 0) {
      this.draftChoices = [];
      return false;
    }
    const choices = buildUpgradeDraft(wm, this.upgradeCount);
    if (choices.length === 0) {
      this.pendingLevelUps = 0;
      this.draftChoices = [];
      return false;
    }
    this.pendingLevelUps--;
    this.draftChoices = choices;
    this.selectedDraftIndex = 0;
    this.state = "levelUp" /* LEVEL_UP */;
    return true;
  }
  setDraftSelection(index) {
    if (this.draftChoices.length === 0) return;
    this.selectedDraftIndex = Math.max(0, Math.min(index, this.draftChoices.length - 1));
  }
  moveDraftSelection(delta) {
    if (this.draftChoices.length === 0) return;
    const count = this.draftChoices.length;
    this.selectedDraftIndex = (this.selectedDraftIndex + delta + count) % count;
  }
  chooseSelectedDraft(wm, player) {
    return this.chooseDraft(this.selectedDraftIndex, wm, player);
  }
  chooseDraft(index, wm, player) {
    const choice = this.draftChoices[index];
    if (!choice) return false;
    applyUpgradeChoice(choice, wm, player);
    this.registerChoice(choice, wm, player);
    this.upgradeCount++;
    this.pushUpgradeNotification(choice);
    this.draftChoices = [];
    if (!this.beginNextDraft(wm)) {
      this.state = "playing" /* PLAYING */;
    }
    return true;
  }
  rerollDraft(wm) {
    if (this.state !== "levelUp" /* LEVEL_UP */ || this.rerollsRemaining <= 0) return false;
    const choices = buildUpgradeDraft(wm, this.upgradeCount);
    if (choices.length === 0) return false;
    this.rerollsRemaining--;
    this.draftChoices = choices;
    this.selectedDraftIndex = 0;
    this.notifications.push({
      text: () => getUiText("draftRerolled"),
      timer: 1.6,
      alpha: 1,
      kind: "info"
    });
    return true;
  }
  pushUpgradeNotification(choice) {
    this.notifications.push({
      text: choice.label,
      timer: choice.kind === "unlock" ? 3.4 : 2.8,
      alpha: 1,
      kind: choice.kind === "unlock" ? "unlock" : "upgrade"
    });
  }
  registerChoice(choice, wm, player) {
    for (const tag of choice.tags) {
      this.traitCounts[tag]++;
    }
    const doctrines = getNewDoctrines(
      this.traitCounts,
      this.activeDoctrines.map((doctrine) => doctrine.id)
    );
    for (const doctrine of doctrines) {
      applyDoctrine(doctrine, wm, player);
      this.activeDoctrines.push(doctrine);
      this.notifications.push({
        text: () => formatDoctrineOnline(doctrine.id),
        timer: 3.2,
        alpha: 1,
        kind: "unlock"
      });
    }
  }
  updateNotifications(dt) {
    for (const n of this.notifications) {
      n.timer -= dt;
      if (n.timer < 0.5) {
        n.alpha = Math.max(0, n.timer / 0.5);
      }
    }
    this.notifications = this.notifications.filter((n) => n.timer > 0);
  }
};

// src/input.ts
var keys = {};
__win.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});
__win.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});
function isKeyDown(key) {
  return !!keys[key];
}
var touch = {
  active: false,
  dx: 0,
  dy: 0,
  // Joystick state
  touchId: -1,
  centerX: 0,
  centerY: 0,
  // Pause button tap
  pauseTapped: false,
  // Any tap (for starting/restarting)
  anyTap: false
};
var JOYSTICK_RADIUS = 60;
var DEAD_ZONE = 10;
var TOUCH_UI_MARGIN = 16;
var PAUSE_BUTTON_RADIUS = 25;
var PAUSE_BUTTON_HIT_RADIUS = 30;
function isMobile() {
  return "ontouchstart" in __win || __nav.maxTouchPoints > 0;
}
function isTouchDevice() {
  return isMobile();
}
function readInset(variableName) {
  const value = __getComputedStyle(__doc.documentElement).getPropertyValue(variableName).trim();
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
function getSafeAreaInsets() {
  return {
    top: readInset("--safe-area-top"),
    right: readInset("--safe-area-right"),
    bottom: readInset("--safe-area-bottom"),
    left: readInset("--safe-area-left")
  };
}
function getTouchUiMargin() {
  return TOUCH_UI_MARGIN;
}
function getPauseButtonLayout(viewportWidth = __win.innerWidth) {
  const insets = getSafeAreaInsets();
  return {
    x: viewportWidth - insets.right - TOUCH_UI_MARGIN - PAUSE_BUTTON_RADIUS,
    y: insets.top + TOUCH_UI_MARGIN + PAUSE_BUTTON_RADIUS,
    radius: PAUSE_BUTTON_RADIUS,
    hitRadius: PAUSE_BUTTON_HIT_RADIUS
  };
}
function isPauseButton(x, y) {
  const layout = getPauseButtonLayout();
  const dx = x - layout.x;
  const dy = y - layout.y;
  return Math.sqrt(dx * dx + dy * dy) <= layout.hitRadius;
}
function handleTouchStart(e) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (isPauseButton(t.clientX, t.clientY)) {
      touch.pauseTapped = true;
      continue;
    }
    if (touch.touchId === -1) {
      touch.touchId = t.identifier;
      touch.centerX = t.clientX;
      touch.centerY = t.clientY;
      touch.active = true;
      touch.dx = 0;
      touch.dy = 0;
    }
    touch.anyTap = true;
  }
}
function handleTouchMove(e) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (t.identifier === touch.touchId) {
      const rawDx = t.clientX - touch.centerX;
      const rawDy = t.clientY - touch.centerY;
      const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
      if (dist < DEAD_ZONE) {
        touch.dx = 0;
        touch.dy = 0;
      } else {
        const clamped = Math.min(dist, JOYSTICK_RADIUS);
        touch.dx = rawDx / dist * (clamped / JOYSTICK_RADIUS);
        touch.dy = rawDy / dist * (clamped / JOYSTICK_RADIUS);
      }
    }
  }
}
function handleTouchEnd(e) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    if (t.identifier === touch.touchId) {
      touch.touchId = -1;
      touch.active = false;
      touch.dx = 0;
      touch.dy = 0;
    }
  }
}
if (isMobile()) {
  __doc.addEventListener("touchstart", handleTouchStart, { passive: false });
  __doc.addEventListener("touchmove", handleTouchMove, { passive: false });
  __doc.addEventListener("touchend", handleTouchEnd, { passive: false });
  __doc.addEventListener("touchcancel", handleTouchEnd, { passive: false });
}
function consumePauseTap() {
  if (touch.pauseTapped) {
    touch.pauseTapped = false;
    return true;
  }
  return false;
}
function consumeAnyTap() {
  if (touch.anyTap) {
    touch.anyTap = false;
    return true;
  }
  return false;
}
var JOYSTICK_DISPLAY_RADIUS = JOYSTICK_RADIUS;

// src/ui.ts
var WEAPON_SHAPES = {
  "Laser Beam": (ctx2, x, y, s) => {
    ctx2.beginPath();
    ctx2.moveTo(x - s, y);
    ctx2.lineTo(x + s, y);
    ctx2.strokeStyle = "rgba(100, 200, 255, 0.9)";
    ctx2.lineWidth = 2;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.arc(x + s, y, 2, 0, TWO_PI);
    ctx2.fillStyle = "rgba(100, 200, 255, 0.9)";
    ctx2.fill();
  },
  "Orbit Shield": (ctx2, x, y, s) => {
    ctx2.beginPath();
    ctx2.arc(x, y, s * 0.7, 0, TWO_PI);
    ctx2.strokeStyle = "rgba(100, 200, 255, 0.9)";
    ctx2.lineWidth = 1.5;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.arc(x + s * 0.5, y - s * 0.3, 2, 0, TWO_PI);
    ctx2.fillStyle = "rgba(180, 220, 255, 0.9)";
    ctx2.fill();
  },
  "Nova Blast": (ctx2, x, y, s) => {
    ctx2.beginPath();
    ctx2.arc(x, y, s * 0.6, 0, TWO_PI);
    ctx2.strokeStyle = "rgba(255, 160, 60, 0.9)";
    ctx2.lineWidth = 1.5;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.arc(x, y, s * 0.2, 0, TWO_PI);
    ctx2.fillStyle = "rgba(255, 200, 100, 0.9)";
    ctx2.fill();
  },
  "Escort Wing": (ctx2, x, y, s) => {
    ctx2.beginPath();
    ctx2.moveTo(x, y - s);
    ctx2.lineTo(x + s * 0.8, y + s * 0.8);
    ctx2.lineTo(x, y + s * 0.35);
    ctx2.lineTo(x - s * 0.8, y + s * 0.8);
    ctx2.closePath();
    ctx2.strokeStyle = "rgba(120, 255, 220, 0.95)";
    ctx2.lineWidth = 1.5;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(x + s * 0.55, y);
    ctx2.lineTo(x + s * 1.2, y - s * 0.45);
    ctx2.stroke();
  },
  "Reinforced Hull": (ctx2, x, y, s) => {
    ctx2.beginPath();
    roundedRect(ctx2, x - s * 0.7, y - s * 0.85, s * 1.4, s * 1.7, 2);
    ctx2.strokeStyle = "rgba(255, 135, 135, 0.9)";
    ctx2.lineWidth = 1.5;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(x - s * 0.45, y);
    ctx2.lineTo(x + s * 0.45, y);
    ctx2.moveTo(x, y - s * 0.45);
    ctx2.lineTo(x, y + s * 0.45);
    ctx2.stroke();
  },
  "Overdrive Thrusters": (ctx2, x, y, s) => {
    ctx2.beginPath();
    ctx2.moveTo(x - s * 0.9, y + s * 0.5);
    ctx2.lineTo(x, y - s * 0.8);
    ctx2.lineTo(x + s * 0.9, y + s * 0.5);
    ctx2.strokeStyle = "rgba(130, 220, 255, 0.9)";
    ctx2.lineWidth = 1.5;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(x - s * 0.35, y + s * 0.65);
    ctx2.lineTo(x - s * 0.12, y + s * 1.05);
    ctx2.moveTo(x + s * 0.35, y + s * 0.65);
    ctx2.lineTo(x + s * 0.12, y + s * 1.05);
    ctx2.stroke();
  },
  "Nanoforge": (ctx2, x, y, s) => {
    ctx2.beginPath();
    ctx2.arc(x, y, s * 0.65, 0, TWO_PI);
    ctx2.strokeStyle = "rgba(110, 255, 190, 0.9)";
    ctx2.lineWidth = 1.5;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.arc(x, y, s * 0.2, 0, TWO_PI);
    ctx2.fillStyle = "rgba(180, 255, 220, 0.9)";
    ctx2.fill();
    ctx2.beginPath();
    ctx2.moveTo(x - s * 0.9, y);
    ctx2.lineTo(x - s * 0.35, y);
    ctx2.moveTo(x + s * 0.35, y);
    ctx2.lineTo(x + s * 0.9, y);
    ctx2.stroke();
  },
  "Phase Plating": (ctx2, x, y, s) => {
    ctx2.beginPath();
    ctx2.moveTo(x, y - s);
    ctx2.lineTo(x + s * 0.85, y - s * 0.25);
    ctx2.lineTo(x + s * 0.55, y + s);
    ctx2.lineTo(x - s * 0.55, y + s);
    ctx2.lineTo(x - s * 0.85, y - s * 0.25);
    ctx2.closePath();
    ctx2.strokeStyle = "rgba(210, 180, 255, 0.9)";
    ctx2.lineWidth = 1.5;
    ctx2.stroke();
  }
};
var UI = class {
  constructor() {
    // State for animated transitions
    this.stateAge = 0;
    this.lastState = "";
  }
  trackState(stateName, dt) {
    if (stateName !== this.lastState) {
      this.lastState = stateName;
      this.stateAge = 0;
    }
    this.stateAge += dt;
  }
  drawHUD(ctx2, canvas2, game, player, wm) {
    const w = canvas2.clientWidth;
    const h = canvas2.clientHeight;
    const compactHud = w < 500;
    const hpRatio = player.hp / player.maxHp;
    const safe = getSafeAreaInsets();
    const margin = getTouchUiMargin();
    const leftInset = safe.left + margin;
    const rightInset = safe.right + margin;
    const topInset = safe.top + margin;
    const bottomInset = safe.bottom + margin;
    ctx2.save();
    ctx2.textAlign = "center";
    ctx2.font = uiFont(28, "bold");
    const timerText = game.timeRemainingFormatted;
    ctx2.fillStyle = "rgba(100, 200, 255, 0.15)";
    ctx2.fillText(timerText, w / 2, topInset + 24);
    ctx2.fillText(timerText, w / 2, topInset + 24);
    ctx2.fillStyle = "#ffffff";
    ctx2.fillText(timerText, w / 2, topInset + 24);
    ctx2.restore();
    ctx2.textAlign = "left";
    ctx2.font = uiFont(14, "bold");
    ctx2.fillStyle = hpRatio < 0.3 ? "rgba(255, 120, 120, 0.95)" : "rgba(190, 225, 255, 0.85)";
    ctx2.fillText(formatHullLabel(Math.ceil(hpRatio * 100)), leftInset, topInset + 18);
    if (hpRatio < 0.35) {
      ctx2.fillStyle = "rgba(255, 120, 120, 0.65)";
      ctx2.font = uiFont(12);
      ctx2.fillText(getUiText("critical"), leftInset, topInset + 36);
    }
    ctx2.font = uiFont(11);
    ctx2.fillStyle = "rgba(160, 210, 255, 0.58)";
    ctx2.fillText(formatStageLabel(game.stage), leftInset, topInset + 52);
    ctx2.font = uiFont(16);
    ctx2.textAlign = "right";
    ctx2.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx2.fillText(`${player.kills}`, w - rightInset, topInset + 19);
    ctx2.beginPath();
    ctx2.arc(w - rightInset - 35 - ctx2.measureText(`${player.kills}`).width * 0.5, topInset + 14, 5, 0, TWO_PI);
    ctx2.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx2.lineWidth = 1;
    ctx2.stroke();
    if (game.activeDoctrines.length > 0) {
      ctx2.textAlign = "right";
      ctx2.font = uiFont(10, "bold");
      ctx2.fillStyle = "rgba(165, 205, 255, 0.55)";
      ctx2.fillText(getUiText("doctrines"), w - rightInset, topInset + 38);
      ctx2.font = uiFont(11);
      for (let i = 0; i < game.activeDoctrines.length; i++) {
        ctx2.fillStyle = "rgba(230, 240, 255, 0.72)";
        ctx2.fillText(game.activeDoctrines[i].shortLabel(), w - rightInset, topInset + 54 + i * 14);
      }
    }
    const barW = compactHud ? Math.max(160, Math.min(w - leftInset - rightInset - 28, 250)) : Math.max(180, Math.min(w * 0.5, w - leftInset - rightInset - 120));
    const barH = 6;
    const barX = (w - barW) / 2;
    const barY = h - bottomInset - 12;
    const xpRatio = player.xp / player.getXpForNextLevel();
    const barRadius = barH / 2;
    ctx2.beginPath();
    roundedRect(ctx2, barX, barY, barW, barH, barRadius);
    ctx2.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx2.fill();
    if (xpRatio > 0.01) {
      ctx2.save();
      ctx2.beginPath();
      roundedRect(ctx2, barX, barY, barW, barH, barRadius);
      ctx2.clip();
      const fillW = barW * xpRatio;
      const grad = ctx2.createLinearGradient(barX, 0, barX + fillW, 0);
      grad.addColorStop(0, "rgba(80, 180, 255, 0.6)");
      grad.addColorStop(1, "rgba(120, 220, 255, 0.9)");
      ctx2.fillStyle = grad;
      ctx2.fillRect(barX, barY, fillW, barH);
      const edgeX = barX + fillW;
      const glowGrad = ctx2.createRadialGradient(edgeX, barY + barH / 2, 0, edgeX, barY + barH / 2, 15);
      glowGrad.addColorStop(0, "rgba(150, 230, 255, 0.4)");
      glowGrad.addColorStop(1, "rgba(150, 230, 255, 0)");
      ctx2.fillStyle = glowGrad;
      ctx2.fillRect(edgeX - 15, barY - 10, 30, barH + 20);
      ctx2.restore();
    }
    ctx2.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx2.font = uiFont(11);
    ctx2.textAlign = "center";
    ctx2.fillText(formatXpLabel(player.level, player.xp, player.getXpForNextLevel()), w / 2, barY - 6);
    const weaponSlots = [
      { name: "Laser Beam", weapon: wm.getWeapon("Laser Beam") },
      { name: "Orbit Shield", weapon: wm.getWeapon("Orbit Shield") },
      { name: "Nova Blast", weapon: wm.getWeapon("Nova Blast") },
      { name: "Escort Wing", weapon: wm.getWeapon("Escort Wing") }
    ];
    const weaponPanelX = leftInset - 2;
    const weaponPanelW = compactHud ? 230 : 212;
    const weaponPanelH = 24 + weaponSlots.length * 22 + 14;
    const weaponPanelY = Math.max(topInset + 54, barY - weaponPanelH - (compactHud ? 32 : 22));
    ctx2.beginPath();
    roundedRect(ctx2, weaponPanelX, weaponPanelY, weaponPanelW, weaponPanelH, 10);
    ctx2.fillStyle = "rgba(8, 14, 30, 0.55)";
    ctx2.fill();
    ctx2.strokeStyle = "rgba(120, 180, 255, 0.14)";
    ctx2.lineWidth = 1;
    ctx2.stroke();
    ctx2.textAlign = "left";
    ctx2.font = uiFont(11, "bold");
    ctx2.fillStyle = "rgba(160, 210, 255, 0.58)";
    ctx2.fillText(getUiText("armament"), weaponPanelX + 12, weaponPanelY + 18);
    let wy = weaponPanelY + 38;
    for (const slot of weaponSlots) {
      const drawIcon = WEAPON_SHAPES[slot.name];
      if (drawIcon) {
        drawIcon(ctx2, weaponPanelX + 14, wy - 4, 7);
      }
      ctx2.font = uiFont(13);
      if (slot.weapon) {
        ctx2.fillStyle = "rgba(255, 255, 255, 0.74)";
        ctx2.fillText(getWeaponName(slot.name), weaponPanelX + 28, wy);
        ctx2.fillStyle = "rgba(110, 205, 255, 0.95)";
        ctx2.fillText(formatHudWeaponLevel(slot.weapon.level), weaponPanelX + 160, wy);
      } else {
        ctx2.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx2.fillText(getWeaponName(slot.name), weaponPanelX + 28, wy);
        ctx2.fillText(getUiText("locked"), weaponPanelX + 160, wy);
      }
      wy += 22;
    }
    if (isTouchDevice()) {
      this.drawPauseButton(ctx2, canvas2);
      this.drawJoystick(ctx2);
    }
  }
  drawPauseButton(ctx2, canvas2) {
    const layout = getPauseButtonLayout(canvas2.clientWidth);
    const x = layout.x;
    const y = layout.y;
    ctx2.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx2.beginPath();
    ctx2.arc(x, y, layout.radius, 0, TWO_PI);
    ctx2.fill();
    ctx2.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx2.lineWidth = 1;
    ctx2.stroke();
    ctx2.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx2.beginPath();
    roundedRect(ctx2, x - 7, y - 8, 5, 16, 1);
    roundedRect(ctx2, x + 2, y - 8, 5, 16, 1);
    ctx2.fill();
  }
  drawJoystick(ctx2) {
    if (!touch.active) return;
    const cx = touch.centerX;
    const cy = touch.centerY;
    const r = JOYSTICK_DISPLAY_RADIUS;
    ctx2.beginPath();
    ctx2.arc(cx, cy, r, 0, TWO_PI);
    ctx2.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx2.lineWidth = 2;
    ctx2.stroke();
    ctx2.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx2.fill();
    const thumbX = cx + touch.dx * r;
    const thumbY = cy + touch.dy * r;
    const thumbR = 20;
    ctx2.beginPath();
    ctx2.arc(thumbX, thumbY, thumbR, 0, TWO_PI);
    ctx2.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx2.fill();
    ctx2.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx2.lineWidth = 2;
    ctx2.stroke();
  }
  drawTitleScreen(ctx2, canvas2) {
    const w = canvas2.clientWidth;
    const h = canvas2.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const t = this.stateAge;
    const titleAlpha = Math.min(1, t * 2);
    const glowPulse = 0.6 + 0.4 * Math.sin(t * 1.5);
    const titleGrad = ctx2.createRadialGradient(cx, cy - 40, 0, cx, cy - 40, 300);
    titleGrad.addColorStop(0, `rgba(80, 160, 255, ${0.06 * glowPulse * titleAlpha})`);
    titleGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx2.fillStyle = titleGrad;
    ctx2.fillRect(0, 0, w, h);
    ctx2.textAlign = "center";
    const compactTitle = w < 500;
    const titleSize = compactTitle ? Math.max(24, Math.min(34, Math.floor(w * 0.09))) : Math.max(30, Math.min(52, Math.floor(w * 0.13)));
    ctx2.font = uiFont(titleSize, "bold");
    const titleLines = getGameTitleLines(compactTitle);
    if (titleLines.length === 2) {
      ctx2.fillStyle = `rgba(80, 180, 255, ${0.12 * titleAlpha})`;
      ctx2.fillText(titleLines[0], cx, cy - 44);
      ctx2.fillText(titleLines[1], cx, cy - 6);
      ctx2.fillStyle = `rgba(80, 180, 255, ${0.08 * titleAlpha})`;
      ctx2.fillText(titleLines[0], cx + 1, cy - 43);
      ctx2.fillText(titleLines[1], cx + 1, cy - 5);
      ctx2.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
      ctx2.fillText(titleLines[0], cx, cy - 44);
      ctx2.fillText(titleLines[1], cx, cy - 6);
    } else {
      ctx2.fillStyle = `rgba(80, 180, 255, ${0.12 * titleAlpha})`;
      ctx2.fillText(titleLines[0], cx, cy - 30);
      ctx2.fillStyle = `rgba(80, 180, 255, ${0.08 * titleAlpha})`;
      ctx2.fillText(titleLines[0], cx + 1, cy - 29);
      ctx2.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`;
      ctx2.fillText(titleLines[0], cx, cy - 30);
    }
    const subAlpha = Math.max(0, Math.min(1, (t - 0.5) * 2));
    ctx2.font = uiFont(w < 500 ? 12 : 14);
    ctx2.fillStyle = `rgba(100, 180, 255, ${subAlpha * 0.6})`;
    ctx2.fillText(getUiText("titleSubtitle"), cx, cy + Math.max(0, titleSize * 0.55 - 18));
    const promptAlpha = Math.max(0, Math.min(1, (t - 1) * 2));
    const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3));
    ctx2.font = uiFont(w < 500 ? 14 : 16);
    ctx2.fillStyle = `rgba(255, 255, 255, ${promptAlpha * breathe})`;
    const startMsg = isTouchDevice() ? getUiText("tapToStart") : getUiText("pressAnyKeyToStart");
    ctx2.fillText(startMsg, cx, cy + 60);
    const helpAlpha = Math.max(0, Math.min(1, (t - 1.3) * 2));
    ctx2.font = uiFont(w < 500 ? 11 : 13);
    ctx2.fillStyle = `rgba(160, 200, 255, ${helpAlpha * 0.5})`;
    ctx2.fillText(getUiText("titleHintPrimary"), cx, cy + (w < 500 ? 88 : 95));
    if (w < 500) {
      ctx2.fillText(getUiText("titleHintSecondaryCompact"), cx, cy + 106);
    } else {
      ctx2.fillText(getUiText("titleHintSecondaryWide"), cx, cy + 116);
    }
    this.drawLanguageSelector(ctx2, canvas2);
  }
  drawNotifications(ctx2, canvas2, game) {
    const notifications = game.notifications;
    if (notifications.length === 0) return;
    const canvasWidth = canvas2.clientWidth;
    ctx2.textAlign = "center";
    for (let i = 0; i < notifications.length; i++) {
      const n = notifications[i];
      const y = 86 + i * 42;
      const isUnlock = n.kind === "unlock";
      const isUpgrade = n.kind === "upgrade";
      const accent = isUnlock ? { fill: [255, 185, 90], stroke: [255, 205, 120], text: [255, 245, 220] } : isUpgrade ? { fill: [100, 200, 255], stroke: [130, 210, 255], text: [255, 255, 255] } : { fill: [120, 150, 200], stroke: [160, 190, 235], text: [220, 235, 255] };
      let fontSize = isUnlock ? 22 : 18;
      const maxTextWidth = canvasWidth - 70;
      do {
        ctx2.font = uiFont(fontSize, "bold");
        const text = n.text();
        if (ctx2.measureText(text).width <= maxTextWidth || fontSize <= 12) break;
        fontSize--;
      } while (fontSize > 12);
      const textWidth = ctx2.measureText(n.text()).width;
      const pillW = Math.min(canvasWidth - 26, textWidth + (isUnlock ? 42 : 30));
      const pillH = fontSize >= 18 ? isUnlock ? 36 : 30 : 28;
      const pillX = (canvasWidth - pillW) / 2;
      ctx2.fillStyle = `rgba(${accent.fill[0]}, ${accent.fill[1]}, ${accent.fill[2]}, ${0.16 * n.alpha})`;
      ctx2.strokeStyle = `rgba(${accent.stroke[0]}, ${accent.stroke[1]}, ${accent.stroke[2]}, ${0.45 * n.alpha})`;
      ctx2.lineWidth = 1;
      ctx2.beginPath();
      roundedRect(ctx2, pillX, y - pillH / 2 - 4, pillW, pillH, 6);
      ctx2.fill();
      ctx2.stroke();
      ctx2.fillStyle = `rgba(${accent.text[0]}, ${accent.text[1]}, ${accent.text[2]}, ${n.alpha})`;
      ctx2.fillText(n.text(), canvasWidth / 2, y);
    }
  }
  drawLevelUpDraft(ctx2, canvas2, game) {
    const w = canvas2.clientWidth;
    const h = canvas2.clientHeight;
    const layout = this.getLevelUpLayout(canvas2, game);
    ctx2.fillStyle = "rgba(4, 8, 18, 0.68)";
    ctx2.fillRect(0, 0, w, h);
    ctx2.textAlign = "center";
    ctx2.font = uiFont(38, "bold");
    ctx2.fillStyle = "#ffffff";
    ctx2.fillText(getUiText("levelUpTitle"), w / 2, layout.headerY);
    ctx2.font = uiFont(14);
    ctx2.fillStyle = "rgba(180, 215, 255, 0.72)";
    ctx2.fillText(getUiText("levelUpSubtitle"), w / 2, layout.headerY + 28);
    ctx2.font = uiFont(12);
    ctx2.fillStyle = "rgba(180, 215, 255, 0.48)";
    ctx2.fillText(
      isTouchDevice() ? getUiText("tapCardToMutate") : getUiText("keyboardDraftControls"),
      w / 2,
      layout.headerY + 48
    );
    for (let i = 0; i < layout.cards.length; i++) {
      const card = layout.cards[i];
      const choice = game.draftChoices[i];
      if (!choice) continue;
      const isSelected = i === game.selectedDraftIndex;
      ctx2.beginPath();
      roundedRect(ctx2, card.x, card.y, card.width, card.height, 14);
      ctx2.fillStyle = isSelected ? choice.kind === "unlock" ? "rgba(54, 38, 16, 0.94)" : "rgba(20, 28, 54, 0.94)" : choice.kind === "unlock" ? "rgba(40, 30, 14, 0.88)" : "rgba(14, 20, 38, 0.88)";
      ctx2.fill();
      ctx2.strokeStyle = isSelected ? choice.kind === "unlock" ? "rgba(255, 210, 135, 0.9)" : "rgba(170, 220, 255, 0.85)" : choice.kind === "unlock" ? "rgba(255, 195, 110, 0.45)" : "rgba(120, 190, 255, 0.35)";
      ctx2.lineWidth = isSelected ? 2.5 : 1.5;
      ctx2.stroke();
      if (isSelected) {
        ctx2.beginPath();
        roundedRect(ctx2, card.x - 4, card.y - 4, card.width + 8, card.height + 8, 16);
        ctx2.strokeStyle = choice.kind === "unlock" ? "rgba(255, 210, 135, 0.26)" : "rgba(150, 220, 255, 0.22)";
        ctx2.lineWidth = 2;
        ctx2.stroke();
      }
      ctx2.beginPath();
      ctx2.arc(card.x + 30, card.y + 32, 14, 0, TWO_PI);
      ctx2.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx2.fill();
      const drawIcon = WEAPON_SHAPES[choice.iconName];
      if (drawIcon) drawIcon(ctx2, card.x + 30, card.y + 32, 9);
      ctx2.textAlign = "left";
      ctx2.font = uiFont(12, "bold");
      ctx2.fillStyle = choice.kind === "unlock" ? "rgba(255, 210, 135, 0.85)" : "rgba(145, 210, 255, 0.72)";
      ctx2.fillText(`${i + 1}`, card.x + 56, card.y + 20);
      ctx2.font = uiFont(18, "bold");
      ctx2.fillStyle = "#ffffff";
      this.drawWrappedText(ctx2, choice.title(), card.x + 20, card.y + 58, card.width - 40, 22);
      ctx2.font = uiFont(13);
      ctx2.fillStyle = "rgba(215, 228, 245, 0.72)";
      this.drawWrappedText(ctx2, choice.description(), card.x + 20, card.y + 92, card.width - 40, 18);
      let chipX = card.x + 20;
      const chipY = card.y + card.height - 26;
      for (const tag of choice.tags) {
        const label = getTagLabel(tag);
        ctx2.font = uiFont(10, "bold");
        const chipW = ctx2.measureText(label).width + 16;
        ctx2.beginPath();
        roundedRect(ctx2, chipX, chipY, chipW, 18, 9);
        ctx2.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx2.fill();
        ctx2.strokeStyle = "rgba(180, 210, 255, 0.16)";
        ctx2.lineWidth = 1;
        ctx2.stroke();
        ctx2.fillStyle = "rgba(215, 232, 255, 0.82)";
        ctx2.textAlign = "center";
        ctx2.fillText(label, chipX + chipW / 2, chipY + 12);
        chipX += chipW + 8;
      }
    }
    const reroll = layout.rerollButton;
    ctx2.beginPath();
    roundedRect(ctx2, reroll.x, reroll.y, reroll.width, reroll.height, 10);
    const rerollEnabled = game.rerollsRemaining > 0;
    ctx2.fillStyle = rerollEnabled ? "rgba(18, 26, 52, 0.9)" : "rgba(22, 22, 28, 0.82)";
    ctx2.fill();
    ctx2.strokeStyle = rerollEnabled ? "rgba(140, 200, 255, 0.28)" : "rgba(120, 120, 140, 0.16)";
    ctx2.lineWidth = 1;
    ctx2.stroke();
    ctx2.textAlign = "center";
    ctx2.font = uiFont(13, "bold");
    ctx2.fillStyle = rerollEnabled ? "rgba(200, 230, 255, 0.82)" : "rgba(170, 170, 180, 0.55)";
    const rerollLabel = rerollEnabled ? formatRerollLabel(game.rerollsRemaining) : getUiText("rerollSpent");
    ctx2.fillText(rerollLabel, reroll.x + reroll.width / 2, reroll.y + 22);
  }
  getLevelUpActionAt(canvas2, game, x, y) {
    const layout = this.getLevelUpLayout(canvas2, game);
    for (let i = 0; i < layout.cards.length; i++) {
      const card = layout.cards[i];
      if (x >= card.x && x <= card.x + card.width && y >= card.y && y <= card.y + card.height) {
        return { type: "choice", index: i };
      }
    }
    const reroll = layout.rerollButton;
    if (game.rerollsRemaining > 0 && x >= reroll.x && x <= reroll.x + reroll.width && y >= reroll.y && y <= reroll.y + reroll.height) {
      return { type: "reroll" };
    }
    return null;
  }
  drawGameOver(ctx2, canvas2, player, game, canRestart, restartCountdown) {
    const prompt = canRestart ? isTouchDevice() ? getUiText("tapToRestart") : getUiText("pressAnyKeyToRestart") : formatRestartCountdown(restartCountdown);
    this.drawEndScreen(ctx2, canvas2, getUiText("gameOver"), [255, 68, 68], [80, 0, 0], [
      formatSurvivedStat(formatTime(game.totalElapsedTime)),
      formatReachedStageStat(game.stage),
      formatKillsStat(player.kills)
    ], prompt, !canRestart);
  }
  drawVictory(ctx2, canvas2, player, game) {
    this.drawEndScreen(ctx2, canvas2, formatStageClearTitle(game.stage), [68, 255, 136], [80, 60, 0], [
      formatNextStageStat(game.stage + 1),
      formatTotalKillsStat(player.kills),
      formatLevelReachedStat(player.level)
    ], isTouchDevice() ? getUiText("tapToNextStage") : getUiText("pressAnyKeyToNextStage"));
  }
  drawEndScreen(ctx2, canvas2, title, titleColor, vignetteColor, stats, promptText, subduedPrompt = false) {
    const w = canvas2.clientWidth;
    const h = canvas2.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const t = this.stateAge;
    const [tr, tg, tb] = titleColor;
    const [vr, vg, vb] = vignetteColor;
    const dimAlpha = Math.min(0.85, t * 2);
    ctx2.fillStyle = `rgba(0, 0, 0, ${dimAlpha})`;
    ctx2.fillRect(0, 0, w, h);
    const vigGrad = ctx2.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
    vigGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    vigGrad.addColorStop(1, `rgba(${vr}, ${vg}, ${vb}, ${Math.min(0.3, t)})`);
    ctx2.fillStyle = vigGrad;
    ctx2.fillRect(0, 0, w, h);
    const titleScale = easeOutCubic(Math.min(1, t * 3));
    const titleAlpha = Math.min(1, t * 3);
    ctx2.save();
    ctx2.translate(cx, cy - 50);
    ctx2.scale(titleScale, titleScale);
    ctx2.font = uiFont(52, "bold");
    ctx2.textAlign = "center";
    ctx2.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${titleAlpha * 0.15})`;
    ctx2.fillText(title, 0, 0);
    ctx2.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${titleAlpha})`;
    ctx2.fillText(title, 0, 0);
    ctx2.restore();
    ctx2.textAlign = "center";
    ctx2.font = uiFont(18);
    for (let i = 0; i < stats.length; i++) {
      const statAlpha = Math.max(0, Math.min(1, (t - 0.4 - i * 0.2) * 3));
      ctx2.fillStyle = `rgba(255, 255, 255, ${statAlpha * 0.7})`;
      ctx2.fillText(stats[i], cx, cy + 15 + i * 30);
    }
    const promptAlpha = Math.max(0, Math.min(1, (t - 1.2) * 2));
    const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3));
    ctx2.font = uiFont(14);
    ctx2.fillStyle = `rgba(255, 255, 255, ${promptAlpha * (subduedPrompt ? 0.55 : breathe * 0.5)})`;
    ctx2.fillText(promptText, cx, cy + 95);
    this.drawLanguageSelector(ctx2, canvas2);
  }
  drawVignette(ctx2, w, h, hpRatio) {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) * 0.75;
    const baseAlpha = 0.3 + (1 - hpRatio) * 0.35;
    const grad = ctx2.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(1, `rgba(0, 0, 0, ${baseAlpha})`);
    ctx2.fillStyle = grad;
    ctx2.fillRect(0, 0, w, h);
    if (hpRatio < 0.35) {
      const redAlpha = (0.35 - hpRatio) * 0.4;
      const redGrad = ctx2.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
      redGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      redGrad.addColorStop(1, `rgba(150, 0, 0, ${redAlpha})`);
      ctx2.fillStyle = redGrad;
      ctx2.fillRect(0, 0, w, h);
    }
  }
  getLevelUpLayout(canvas2, game) {
    const w = canvas2.clientWidth;
    const h = canvas2.clientHeight;
    const count = Math.max(1, game.draftChoices.length);
    const stacked = w < 900;
    const cards = [];
    let rerollY = 0;
    let headerY = 0;
    if (stacked) {
      const gap = 12;
      const sidePadding = 16;
      const cardWidth = Math.min(360, w - sidePadding * 2);
      const cardHeight = 144;
      const startX = (w - cardWidth) / 2;
      const cardY = Math.max(118, Math.round(h * 0.18));
      headerY = Math.max(70, cardY - 72);
      for (let index = 0; index < count; index++) {
        cards.push({
          x: startX,
          y: cardY + index * (cardHeight + gap),
          width: cardWidth,
          height: cardHeight
        });
      }
      rerollY = cardY + count * (cardHeight + gap) + 6;
    } else {
      const gap = 18;
      const maxCardWidth = 260;
      const cardWidth = Math.min(maxCardWidth, Math.floor((w - 80 - gap * (count - 1)) / count));
      const cardHeight = 204;
      const totalWidth = cardWidth * count + gap * (count - 1);
      const startX = (w - totalWidth) / 2;
      const cardY = Math.max(168, h / 2 - cardHeight / 2 + 24);
      headerY = Math.max(82, cardY - 82);
      for (let index = 0; index < count; index++) {
        cards.push({
          x: startX + index * (cardWidth + gap),
          y: cardY,
          width: cardWidth,
          height: cardHeight
        });
      }
      rerollY = cardY + cardHeight + 20;
    }
    return {
      headerY,
      cards,
      rerollButton: {
        x: (w - 220) / 2,
        y: rerollY,
        width: 220,
        height: 34
      }
    };
  }
  drawLanguageSelector(ctx2, canvas2) {
    const layout = this.getLanguageSelectorLayout(canvas2);
    ctx2.save();
    ctx2.textAlign = "center";
    ctx2.font = uiFont(11, "bold");
    ctx2.fillStyle = "rgba(180, 215, 255, 0.7)";
    ctx2.fillText(getUiText("languageLabel"), canvas2.clientWidth / 2, layout.labelY);
    for (const button of layout.buttons) {
      const active = button.language === getLanguage();
      ctx2.beginPath();
      roundedRect(ctx2, button.x, button.y, button.width, button.height, 10);
      ctx2.fillStyle = active ? "rgba(70, 132, 230, 0.42)" : "rgba(10, 16, 30, 0.72)";
      ctx2.fill();
      ctx2.strokeStyle = active ? "rgba(170, 220, 255, 0.8)" : "rgba(160, 190, 235, 0.22)";
      ctx2.lineWidth = active ? 1.5 : 1;
      ctx2.stroke();
      ctx2.font = uiFont(13, active ? "bold" : "normal");
      ctx2.fillStyle = active ? "#ffffff" : "rgba(215, 228, 245, 0.78)";
      ctx2.fillText(getLanguageButtonLabel(button.language), button.x + button.width / 2, button.y + 21);
    }
    ctx2.restore();
  }
  getLanguageActionAt(canvas2, x, y) {
    const layout = this.getLanguageSelectorLayout(canvas2);
    for (const button of layout.buttons) {
      if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
        return button.language;
      }
    }
    return null;
  }
  getLanguageSelectorLayout(canvas2) {
    const w = canvas2.clientWidth;
    const h = canvas2.clientHeight;
    const safe = getSafeAreaInsets();
    const bottomInset = safe.bottom + getTouchUiMargin();
    const buttonWidth = 112;
    const buttonHeight = 32;
    const gap = 12;
    const totalWidth = buttonWidth * 2 + gap;
    const startX = (w - totalWidth) / 2;
    const y = h - bottomInset - buttonHeight - 12;
    return {
      labelY: y - 10,
      buttons: [
        { language: "zh-CN", x: startX, y, width: buttonWidth, height: buttonHeight },
        { language: "en", x: startX + buttonWidth + gap, y, width: buttonWidth, height: buttonHeight }
      ]
    };
  }
  drawWrappedText(ctx2, text, x, y, maxWidth, lineHeight) {
    const tokens = text.includes(" ") ? text.split(/(\s+)/).filter(Boolean) : Array.from(text);
    let line = "";
    let lineY = y;
    for (const token of tokens) {
      const testLine = `${line}${token}`;
      if (ctx2.measureText(testLine).width > maxWidth && line) {
        ctx2.fillText(line.trimEnd(), x, lineY);
        line = token.trimStart();
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx2.fillText(line.trimEnd(), x, lineY);
    }
  }
};

// src/camera.ts
var Camera = class {
  constructor(canvasWidth, canvasHeight) {
    this.x = 0;
    this.y = 0;
    // Shake state
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.width = canvasWidth;
    this.height = canvasHeight;
  }
  follow(targetX, targetY) {
    this.x = targetX - this.width / 2;
    this.y = targetY - this.height / 2;
  }
  resize(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;
  }
  shake(intensity, duration) {
    if (intensity > this.shakeIntensity) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
      this.shakeTimer = duration;
    }
  }
  updateShake(dt) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const t = Math.max(0, this.shakeTimer / this.shakeDuration);
      const mag = this.shakeIntensity * t;
      this.shakeOffsetX = (Math.random() * 2 - 1) * mag;
      this.shakeOffsetY = (Math.random() * 2 - 1) * mag;
      if (this.shakeTimer <= 0) {
        this.shakeIntensity = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      }
    }
  }
  worldToScreen(wx, wy) {
    return {
      x: wx - this.x + this.shakeOffsetX,
      y: wy - this.y + this.shakeOffsetY
    };
  }
  isVisible(wx, wy, margin = 100) {
    const sx = wx - this.x;
    const sy = wy - this.y;
    return sx > -margin && sx < this.width + margin && sy > -margin && sy < this.height + margin;
  }
};

// src/player.ts
var LEVEL_XP_SCALE = 0.7;
var Player = class {
  constructor() {
    this.x = MAP_WIDTH / 2;
    this.y = MAP_HEIGHT / 2;
    this.radius = 15;
    this.speed = 200;
    this.maxHp = 100;
    this.hp = 100;
    this.regenRate = 0.01;
    this.damageTakenMultiplier = 1;
    this.xp = 0;
    this.level = 1;
    this.kills = 0;
    this.ripples = [];
    this.hurtTimer = 0;
    this.contactCooldown = 0;
    this.hurtDuration = 0.22;
    this.contactGraceDuration = 0.35;
  }
  getXpForNextLevel() {
    return Math.max(1, Math.floor(8 * Math.pow(1.35, this.level - 1) * LEVEL_XP_SCALE));
  }
  addXp(amount) {
    this.xp += amount;
    if (this.xp >= this.getXpForNextLevel()) {
      this.xp -= this.getXpForNextLevel();
      this.level++;
      return true;
    }
    return false;
  }
  takeDamage(amount) {
    const adjustedAmount = amount * this.damageTakenMultiplier;
    if (adjustedAmount <= 0) return false;
    this.hp = Math.max(0, this.hp - adjustedAmount);
    this.hurtTimer = Math.max(this.hurtTimer, this.hurtDuration);
    return true;
  }
  takeContactHit(amount) {
    if (this.contactCooldown > 0) return false;
    const tookDamage = this.takeDamage(amount);
    if (tookDamage) {
      this.contactCooldown = this.contactGraceDuration;
    }
    return tookDamage;
  }
  isDead() {
    return this.hp <= 0;
  }
  get hurtRatio() {
    return Math.min(1, this.hurtTimer / this.hurtDuration);
  }
  addRipple(angle) {
    this.ripples.push({ angle, age: 0, duration: 0.4 });
  }
  updateRipples(dt) {
    for (const r of this.ripples) r.age += dt;
    this.ripples = this.ripples.filter((r) => r.age < r.duration);
  }
  regenerate(dt) {
    if (this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * this.regenRate * dt);
    }
  }
  addMaxHull(amount, repairAmount = amount) {
    this.maxHp += amount;
    this.hp = Math.min(this.maxHp, this.hp + repairAmount);
  }
  addSpeed(amount) {
    this.speed += amount;
  }
  multiplyRegen(multiplier, repairAmount = 0) {
    this.regenRate *= multiplier;
    if (repairAmount > 0) {
      this.hp = Math.min(this.maxHp, this.hp + repairAmount);
    }
  }
  multiplyDamageTaken(multiplier) {
    this.damageTakenMultiplier *= multiplier;
  }
  increaseContactGrace(amount) {
    this.contactGraceDuration += amount;
  }
  upgradeHull() {
    this.addMaxHull(25, 25);
  }
  upgradeThrusters() {
    this.addSpeed(18);
  }
  upgradeNanoforge() {
    this.multiplyRegen(1.4, 12);
  }
  upgradePlating() {
    this.multiplyDamageTaken(0.88);
  }
  update(dt) {
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.contactCooldown = Math.max(0, this.contactCooldown - dt);
    let dx = 0;
    let dy = 0;
    if (touch.active) {
      dx = touch.dx;
      dy = touch.dy;
    } else {
      if (isKeyDown("w") || isKeyDown("arrowup")) dy -= 1;
      if (isKeyDown("s") || isKeyDown("arrowdown")) dy += 1;
      if (isKeyDown("a") || isKeyDown("arrowleft")) dx -= 1;
      if (isKeyDown("d") || isKeyDown("arrowright")) dx += 1;
      if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
      }
    }
    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;
    const wrapped = wrapPosition(this.x, this.y);
    this.x = wrapped.x;
    this.y = wrapped.y;
  }
  draw(ctx2, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    this.drawBody(ctx2, screen.x, screen.y);
    this.drawEffects(ctx2, camera);
  }
  drawEffects(ctx2, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const hpRatio = this.hp / this.maxHp;
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, this.radius, 0, TWO_PI);
    ctx2.strokeStyle = "#4488ff";
    ctx2.lineWidth = 2;
    ctx2.stroke();
    if (this.hurtTimer > 0) {
      const hurtAlpha = this.hurtRatio;
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.radius + 10, 0, TWO_PI);
      ctx2.strokeStyle = `rgba(255, 90, 90, ${0.18 + hurtAlpha * 0.2})`;
      ctx2.lineWidth = 8;
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.radius + 3, 0, TWO_PI);
      ctx2.strokeStyle = `rgba(255, 240, 240, ${0.25 + hurtAlpha * 0.35})`;
      ctx2.lineWidth = 2;
      ctx2.stroke();
    }
    if (hpRatio > 0) {
      const arcRadius = this.radius + 5;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + TWO_PI * hpRatio;
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, arcRadius, startAngle, endAngle);
      const r = Math.round(60 + (1 - hpRatio) * 195);
      const g = Math.round(180 * hpRatio);
      const b = Math.round(255 * hpRatio);
      ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
      ctx2.lineWidth = 6;
      ctx2.lineCap = "round";
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, arcRadius, startAngle, endAngle);
      ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
      ctx2.lineWidth = 2;
      ctx2.lineCap = "round";
      ctx2.stroke();
    }
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, this.radius + 4, 0, TWO_PI);
    ctx2.strokeStyle = `rgba(68, 136, 255, ${0.1 + hpRatio * 0.2})`;
    ctx2.lineWidth = 3;
    ctx2.stroke();
    for (const ripple of this.ripples) {
      const t = ripple.age / ripple.duration;
      const alpha = 0.6 * (1 - t);
      const spread = Math.PI * 0.4 * (1 + t * 0.5);
      const rippleR = this.radius + 2 + t * 12;
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, rippleR, ripple.angle - spread / 2, ripple.angle + spread / 2);
      ctx2.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
      ctx2.lineWidth = 2.5 * (1 - t);
      ctx2.stroke();
      const rippleR2 = this.radius + 2 + t * 18;
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, rippleR2, ripple.angle - spread * 0.3, ripple.angle + spread * 0.3);
      ctx2.strokeStyle = `rgba(150, 210, 255, ${alpha * 0.5})`;
      ctx2.lineWidth = 1.5 * (1 - t);
      ctx2.stroke();
    }
  }
  drawBody(ctx2, x, y) {
    const hpRatio = this.hp / this.maxHp;
    ctx2.beginPath();
    ctx2.arc(x, y, this.radius - 1, 0, TWO_PI);
    ctx2.fillStyle = `rgba(20, 50, 100, ${0.3 + hpRatio * 0.4})`;
    ctx2.fill();
    drawSphereShading(ctx2, x, y, this.radius, 60, 120, 255);
  }
};

// src/background.ts
var PARALLAX_FACTORS = [0.2, 0.5, 0.8];
function createStar(layer) {
  return {
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    layer,
    size: layer === 0 ? randomRange(0.5, 1) : layer === 1 ? randomRange(1, 2) : randomRange(1.5, 3),
    brightness: randomRange(0.3, 1),
    twinkleSpeed: randomRange(0.5, 2),
    twinkleOffset: Math.random() * TWO_PI
  };
}
function createNebula() {
  const colors = [
    [100, 50, 150],
    [50, 80, 180],
    [150, 50, 100],
    [40, 100, 160]
  ];
  return {
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    radius: randomRange(200, 600),
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: randomRange(0.03, 0.08)
  };
}
function createDust() {
  return {
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    size: randomRange(0.5, 1.5),
    alpha: randomRange(0.1, 0.3),
    vx: randomRange(-5, 5),
    vy: randomRange(-5, 5)
  };
}
var Background = class {
  constructor() {
    this.stars = [];
    this.nebulae = [];
    this.dust = [];
    this.driftIntensity = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    for (let i = 0; i < 300; i++) this.stars.push(createStar(0));
    for (let i = 0; i < 150; i++) this.stars.push(createStar(1));
    for (let i = 0; i < 80; i++) this.stars.push(createStar(2));
    for (let i = 0; i < 6; i++) this.nebulae.push(createNebula());
    for (let i = 0; i < 50; i++) this.dust.push(createDust());
  }
  update(dt, playerSpeed = 0, vx = 0, vy = 0) {
    const targetDrift = playerSpeed < 10 ? 1 : 0;
    const rampSpeed = 3;
    this.driftIntensity += (targetDrift - this.driftIntensity) * Math.min(1, rampSpeed * dt);
    const smoothing = Math.min(1, 8 * dt);
    this.velocityX += (vx - this.velocityX) * smoothing;
    this.velocityY += (vy - this.velocityY) * smoothing;
    for (const d of this.dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.x < 0) d.x += MAP_WIDTH;
      if (d.x >= MAP_WIDTH) d.x -= MAP_WIDTH;
      if (d.y < 0) d.y += MAP_HEIGHT;
      if (d.y >= MAP_HEIGHT) d.y -= MAP_HEIGHT;
    }
  }
  draw(ctx2, camera, time) {
    for (const n of this.nebulae) {
      const px = n.x - camera.x * 0.3;
      const py = n.y - camera.y * 0.3;
      const gradient = ctx2.createRadialGradient(px, py, 0, px, py, n.radius);
      gradient.addColorStop(0, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${n.alpha})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx2.fillStyle = gradient;
      ctx2.fillRect(px - n.radius, py - n.radius, n.radius * 2, n.radius * 2);
    }
    const parallaxFactors = PARALLAX_FACTORS;
    const cx = camera.width / 2;
    const cy = camera.height / 2;
    const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    const streakFactors = [0, 0.03, 0.07];
    for (const star of this.stars) {
      const factor = parallaxFactors[star.layer];
      const sx = star.x - camera.x * factor;
      const sy = star.y - camera.y * factor;
      let screenX = (sx % camera.width + camera.width) % camera.width;
      let screenY = (sy % camera.height + camera.height) % camera.height;
      const offX = (screenX - cx) / cx;
      const offY = (screenY - cy) / cy;
      const edgeDist = Math.sqrt(offX * offX + offY * offY);
      const perspScale = 1 + edgeDist * 0.075 * (star.layer * 0.5);
      const drawSize = star.size * perspScale;
      if (this.driftIntensity > 0.01) {
        const driftFactor = [5, 12, 20][star.layer];
        const oscillation = Math.sin(time * 0.4) * 0.5 + 0.5;
        screenX += offX * driftFactor * oscillation * this.driftIntensity;
        screenY += offY * driftFactor * oscillation * this.driftIntensity;
      }
      const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * twinkle;
      const dofAlpha = star.layer === 0 ? alpha * 0.5 : alpha;
      if (star.layer === 2 && star.size > 2) {
        const glowR = drawSize * 3;
        const glow = ctx2.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowR);
        glow.addColorStop(0, `rgba(200, 220, 255, ${dofAlpha * 0.3})`);
        glow.addColorStop(1, "rgba(200, 220, 255, 0)");
        ctx2.fillStyle = glow;
        ctx2.beginPath();
        ctx2.arc(screenX, screenY, glowR, 0, TWO_PI);
        ctx2.fill();
      }
      const streakLen = speed * streakFactors[star.layer];
      if (streakLen > 1) {
        const nx = this.velocityX / speed;
        const ny = this.velocityY / speed;
        ctx2.beginPath();
        ctx2.moveTo(screenX - nx * streakLen, screenY - ny * streakLen);
        ctx2.lineTo(screenX + nx * streakLen, screenY + ny * streakLen);
        ctx2.strokeStyle = `rgba(255, 255, 255, ${dofAlpha * 0.7})`;
        ctx2.lineWidth = drawSize * 0.8;
        ctx2.lineCap = "round";
        ctx2.stroke();
      } else {
        ctx2.fillStyle = `rgba(255, 255, 255, ${dofAlpha})`;
        ctx2.beginPath();
        ctx2.arc(screenX, screenY, drawSize, 0, TWO_PI);
        ctx2.fill();
      }
    }
    for (const d of this.dust) {
      const screen = camera.worldToScreen(d.x, d.y);
      if (screen.x < -10 || screen.x > camera.width + 10 || screen.y < -10 || screen.y > camera.height + 10) continue;
      ctx2.fillStyle = `rgba(180, 200, 255, ${d.alpha})`;
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, d.size, 0, TWO_PI);
      ctx2.fill();
    }
  }
  drawWrapZone(ctx2, camera) {
    const padding = 200;
    if (camera.x < padding) {
      const w = padding - camera.x;
      const gradient = ctx2.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "rgba(30, 0, 60, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx2.fillStyle = gradient;
      ctx2.fillRect(0, 0, w, camera.height);
    }
    if (camera.x + camera.width > MAP_WIDTH - padding) {
      const start = Math.max(0, camera.width - (camera.x + camera.width - (MAP_WIDTH - padding)));
      const gradient = ctx2.createLinearGradient(camera.width, 0, start, 0);
      gradient.addColorStop(0, "rgba(30, 0, 60, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx2.fillStyle = gradient;
      ctx2.fillRect(start, 0, camera.width - start, camera.height);
    }
    if (camera.y < padding) {
      const h = padding - camera.y;
      const gradient = ctx2.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, "rgba(30, 0, 60, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx2.fillStyle = gradient;
      ctx2.fillRect(0, 0, camera.width, h);
    }
    if (camera.y + camera.height > MAP_HEIGHT - padding) {
      const start = Math.max(0, camera.height - (camera.y + camera.height - (MAP_HEIGHT - padding)));
      const gradient = ctx2.createLinearGradient(0, camera.height, 0, start);
      gradient.addColorStop(0, "rgba(30, 0, 60, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx2.fillStyle = gradient;
      ctx2.fillRect(0, start, camera.width, camera.height - start);
    }
  }
};

// src/geometry.ts
var NEON = [
  [0, 255, 255],
  // cyan
  [255, 0, 128],
  // hot pink
  [128, 0, 255],
  // purple
  [0, 128, 255],
  // electric blue
  [0, 255, 160]
  // neon green
];
var RING_DEFS = [
  { sides: 6, radius: 180, speed: 0.15, color: 0, alpha: 0.045 },
  { sides: 4, radius: 300, speed: -0.1, color: 1, alpha: 0.035 },
  { sides: 8, radius: 420, speed: 0.07, color: 3, alpha: 0.028 },
  { sides: 3, radius: 550, speed: -0.18, color: 2, alpha: 0.022 },
  { sides: 5, radius: 700, speed: 0.12, color: 4, alpha: 0.02 },
  { sides: 10, radius: 900, speed: -0.04, color: 0, alpha: 0.016 }
];
var NUM_RADIALS = 24;
var RADIAL_MAX_LEN = 1200;
var GRID_SPACING = 250;
var GRID_PARALLAX = 0.12;
var GRID_WAVE_SEGMENTS = 10;
var GRID_WAVE_AMP = 6;
var BackgroundGeometry = class {
  constructor() {
    this.shapes = [];
    for (let i = 0; i < 30; i++) {
      this.shapes.push({
        x: randomRange(-3e3, 3e3),
        y: randomRange(-3e3, 3e3),
        sides: [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)],
        radius: randomRange(40, 180),
        rotation: Math.random() * TWO_PI,
        rotSpeed: randomRange(-0.2, 0.2),
        color: Math.floor(Math.random() * NEON.length),
        alpha: randomRange(0.015, 0.04),
        pulsePhase: Math.random() * TWO_PI,
        parallax: randomRange(0.05, 0.25)
      });
    }
  }
  update(dt) {
    for (const s of this.shapes) {
      s.rotation += s.rotSpeed * dt;
    }
  }
  draw(ctx2, camera, time, playerX, playerY) {
    this.drawGrid(ctx2, camera, time);
    this.drawRadials(ctx2, camera, time, playerX, playerY);
    this.drawFloatingShapes(ctx2, camera, time);
    this.drawRings(ctx2, camera, time, playerX, playerY);
  }
  // ── Grid: wavy neon lines with glow ───────────────────────────
  drawGrid(ctx2, camera, time) {
    const sp = GRID_SPACING;
    const offX = camera.x * GRID_PARALLAX % sp;
    const offY = camera.y * GRID_PARALLAX % sp;
    const pulse = 0.6 + 0.4 * Math.sin(time * 0.3);
    const baseAlpha = 0.024 * pulse;
    const [r, g, b] = NEON[3];
    ctx2.lineWidth = 5;
    ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha * 0.3})`;
    this.traceGridPaths(ctx2, camera, sp, offX, offY, time);
    ctx2.stroke();
    ctx2.lineWidth = 1;
    ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha})`;
    this.traceGridPaths(ctx2, camera, sp, offX, offY, time);
    ctx2.stroke();
    ctx2.fillStyle = `rgba(${r + 50}, ${g + 70}, ${b}, ${baseAlpha * 1.8})`;
    for (let gx = -offX - sp; gx <= camera.width + sp; gx += sp) {
      for (let gy = -offY - sp; gy <= camera.height + sp; gy += sp) {
        const wx = gx + Math.sin(gy * 8e-3 + time * 0.4) * GRID_WAVE_AMP;
        const wy = gy + Math.sin(gx * 8e-3 + time * 0.35) * GRID_WAVE_AMP;
        ctx2.beginPath();
        ctx2.arc(wx, wy, 1.8, 0, TWO_PI);
        ctx2.fill();
      }
    }
  }
  traceGridPaths(ctx2, camera, sp, offX, offY, time) {
    const segs = GRID_WAVE_SEGMENTS;
    const amp = GRID_WAVE_AMP;
    ctx2.beginPath();
    for (let gx = -offX - sp; gx <= camera.width + sp; gx += sp) {
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const y = t * camera.height;
        const wx = gx + Math.sin(y * 8e-3 + time * 0.4) * amp;
        if (s === 0) ctx2.moveTo(wx, y);
        else ctx2.lineTo(wx, y);
      }
    }
    for (let gy = -offY - sp; gy <= camera.height + sp; gy += sp) {
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const x = t * camera.width;
        const wy = gy + Math.sin(x * 8e-3 + time * 0.35) * amp;
        if (s === 0) ctx2.moveTo(x, wy);
        else ctx2.lineTo(x, wy);
      }
    }
  }
  // ── Radial light rays from player ─────────────────────────────
  drawRadials(ctx2, camera, time, px, py) {
    const screen = camera.worldToScreen(px, py);
    const cx = screen.x;
    const cy = screen.y;
    const baseRot = time * 0.05;
    ctx2.lineWidth = 1.5;
    ctx2.lineCap = "round";
    for (let i = 0; i < NUM_RADIALS; i++) {
      const angle = baseRot + i / NUM_RADIALS * TWO_PI;
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.8 + i * 0.5);
      const len = RADIAL_MAX_LEN * (0.5 + 0.5 * pulse);
      const alpha = 0.015 * pulse;
      const ex = cx + Math.cos(angle) * len;
      const ey = cy + Math.sin(angle) * len;
      ctx2.beginPath();
      ctx2.moveTo(cx, cy);
      ctx2.lineTo(ex, ey);
      ctx2.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
      ctx2.stroke();
    }
  }
  // ── Floating wireframe shapes with parallax ───────────────────
  drawFloatingShapes(ctx2, camera, time) {
    for (const s of this.shapes) {
      const sx = s.x - camera.x * s.parallax;
      const sy = s.y - camera.y * s.parallax;
      const padW = camera.width + 400;
      const padH = camera.height + 400;
      const screenX = (sx % padW + padW) % padW - 200;
      const screenY = (sy % padH + padH) % padH - 200;
      const pulse = 1 + 0.15 * Math.sin(time * 0.8 + s.pulsePhase);
      const r = s.radius * pulse;
      const [cr, cg, cb] = NEON[s.color];
      const alpha = s.alpha * (0.7 + 0.3 * Math.sin(time * 0.5 + s.pulsePhase));
      this.drawNeonPoly(ctx2, screenX, screenY, r, s.sides, s.rotation, cr, cg, cb, alpha, 4);
    }
  }
  // ── Concentric rotating polygon rings around player ───────────
  drawRings(ctx2, camera, time, px, py) {
    const screen = camera.worldToScreen(px, py);
    const cx = screen.x;
    const cy = screen.y;
    for (const ring of RING_DEFS) {
      const breathe = 1 + 0.08 * Math.sin(time * 0.6 + ring.radius * 0.01);
      const r = ring.radius * breathe;
      const rot = time * ring.speed;
      const [cr, cg, cb] = NEON[ring.color];
      const a = ring.alpha * (0.7 + 0.3 * Math.sin(time * 0.4 + ring.radius * 5e-3));
      this.drawNeonPoly(ctx2, cx, cy, r, ring.sides, rot, cr, cg, cb, a, 3);
    }
  }
  // ── Helpers ───────────────────────────────────────────────────
  drawNeonPoly(ctx2, cx, cy, r, sides, rot, cr, cg, cb, alpha, glowWidth) {
    ctx2.lineWidth = glowWidth;
    ctx2.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.35})`;
    tracePoly(ctx2, cx, cy, r, sides, rot);
    ctx2.stroke();
    ctx2.lineWidth = 1;
    ctx2.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
    tracePoly(ctx2, cx, cy, r, sides, rot);
    ctx2.stroke();
    ctx2.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 1.8})`;
    for (let i = 0; i < sides; i++) {
      const a = rot + i / sides * TWO_PI;
      ctx2.beginPath();
      ctx2.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 0, TWO_PI);
      ctx2.fill();
    }
  }
};

// src/enemies.ts
var CHARGE_SPEED = 500;
var SPAWN_DURATION = 0.3;
var HIT_FLASH_DURATION = 0.08;
var ENEMY_HP_SCALE = 0.5;
var ENEMY_TYPES = {
  swarmer: {
    baseRadius: 10,
    radiusVariation: 4,
    speed: 150,
    baseHp: 38,
    color: [255, 60, 60],
    outlineColor: "#ff3c3c",
    xpDrop: 1,
    damageMultiplier: 1
  },
  drifter: {
    baseRadius: 20,
    radiusVariation: 6,
    speed: 80,
    baseHp: 100,
    color: [255, 160, 40],
    outlineColor: "#ffa028",
    xpDrop: 3,
    damageMultiplier: 1.5
  },
  titan: {
    baseRadius: 40,
    radiusVariation: 10,
    speed: 40,
    baseHp: 300,
    color: [160, 60, 255],
    outlineColor: "#a03cff",
    xpDrop: 8,
    damageMultiplier: 2
  },
  overlord: {
    baseRadius: 55,
    radiusVariation: 10,
    speed: 60,
    baseHp: 800,
    color: [200, 20, 40],
    outlineColor: "#c81428",
    xpDrop: 15,
    damageMultiplier: 2.5
  }
};
var Enemy = class {
  constructor(type, x, y, stage = 1) {
    this.dead = false;
    this.rotation = 0;
    this.summonTimer = 0;
    this.canSummon = false;
    this.shootTimer = 0;
    this.projectiles = [];
    this.chargeTimer = 0;
    this.isCharging = false;
    this.chargeVx = 0;
    this.chargeVy = 0;
    this.chargeDuration = 0;
    // Visual state
    this.spawnAge = 0;
    this.hitFlash = 0;
    this.innerRotation = 0;
    const config = ENEMY_TYPES[type];
    const difficulty = Math.max(0, stage - 1);
    const hpScale = 1 + difficulty * 0.42;
    const speedScale = 1 + difficulty * 0.07;
    const damageScale = 1 + difficulty * 0.1;
    const xpScale = 1 + difficulty * 0.18;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = config.baseRadius + randomRange(-config.radiusVariation / 2, config.radiusVariation / 2);
    const sizeRatio = this.radius / config.baseRadius;
    this.maxHp = config.baseHp * sizeRatio * hpScale * ENEMY_HP_SCALE;
    this.hp = this.maxHp;
    this.speed = config.speed * speedScale;
    this.color = config.color;
    this.outlineColor = config.outlineColor;
    this.xpDrop = Math.max(1, Math.round(config.xpDrop * xpScale));
    this.damageMultiplier = config.damageMultiplier * damageScale;
    this.spikeCount = type === "swarmer" ? Math.floor(randomRange(5, 8)) : 6;
    this.wobblePhase = Math.random() * TWO_PI;
    if (type === "overlord") {
      this.summonTimer = Math.max(1.6, 3 - difficulty * 0.16);
      this.shootTimer = Math.max(1.1, 2 - difficulty * 0.12);
    }
    if (type === "drifter") {
      this.chargeTimer = randomRange(
        Math.max(1.8, 3 - difficulty * 0.2),
        Math.max(3.8, 6 - difficulty * 0.25)
      );
    }
  }
  update(dt, playerX, playerY) {
    this.spawnAge += dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.innerRotation += dt * (this.type === "titan" ? 0.4 : 1.2);
    const angle = wrappedAngle(this.x, this.y, playerX, playerY);
    if (this.type === "drifter") {
      if (this.isCharging) {
        this.chargeDuration -= dt;
        this.x += this.chargeVx * dt;
        this.y += this.chargeVy * dt;
        if (this.chargeDuration <= 0) {
          this.isCharging = false;
          this.chargeTimer = randomRange(3, 6);
        }
      } else {
        this.chargeTimer -= dt;
        if (this.chargeTimer <= 0 && wrappedDistance(this.x, this.y, playerX, playerY) < 600) {
          this.isCharging = true;
          this.chargeDuration = 0.6;
          this.chargeVx = Math.cos(angle) * CHARGE_SPEED;
          this.chargeVy = Math.sin(angle) * CHARGE_SPEED;
        } else {
          this.x += Math.cos(angle) * this.speed * dt;
          this.y += Math.sin(angle) * this.speed * dt;
        }
      }
    } else {
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;
    }
    const wrapped = wrapPosition(this.x, this.y);
    this.x = wrapped.x;
    this.y = wrapped.y;
    if (this.type === "overlord") {
      this.rotation += 0.5 * dt;
      this.summonTimer -= dt;
      if (this.summonTimer <= 0) {
        this.summonTimer = 3;
        this.canSummon = true;
      }
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.shootTimer = 1.5;
        const projSpeed = 250;
        const spread = 0.15;
        for (let i = -1; i <= 1; i++) {
          const a = angle + i * spread;
          this.projectiles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(a) * projSpeed,
            vy: Math.sin(a) * projSpeed,
            lifetime: 3,
            radius: 4
          });
        }
      }
    }
    if (this.projectiles.length > 0) {
      for (const p of this.projectiles) {
        const wrappedProjectile = wrapPosition(p.x + p.vx * dt, p.y + p.vy * dt);
        p.x = wrappedProjectile.x;
        p.y = wrappedProjectile.y;
        p.lifetime -= dt;
      }
      this.projectiles = this.projectiles.filter((p) => p.lifetime > 0);
    }
  }
  takeDamage(amount) {
    this.hp -= amount;
    this.hitFlash = HIT_FLASH_DURATION;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
    }
  }
  consumeSummon() {
    if (this.canSummon) {
      this.canSummon = false;
      return true;
    }
    return false;
  }
  draw(ctx2, camera, time) {
    const screen = camera.worldToScreen(this.x, this.y);
    const spawnT = Math.min(1, this.spawnAge / SPAWN_DURATION);
    const scale = easeOutBack(spawnT);
    const drawRadius = this.radius * scale;
    if (drawRadius < 0.5) return;
    this.drawProjectiles(ctx2, camera);
    ctx2.save();
    ctx2.translate(screen.x, screen.y);
    ctx2.scale(scale, scale);
    if (this.type === "drifter" && this.isCharging) {
      this.drawChargeTrail(ctx2);
    }
    switch (this.type) {
      case "swarmer":
        this.drawSwarmer(ctx2, time);
        break;
      case "drifter":
        this.drawDrifter(ctx2, time);
        break;
      case "titan":
        this.drawTitan(ctx2, time);
        break;
      case "overlord":
        this.drawOverlord(ctx2, time);
        break;
    }
    if (this.hitFlash > 0) {
      const flashAlpha = 0.35 * (this.hitFlash / HIT_FLASH_DURATION);
      ctx2.beginPath();
      ctx2.arc(0, 0, this.radius * 0.9, 0, TWO_PI);
      ctx2.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx2.fill();
    }
    if (spawnT < 1) {
      const ringAlpha = 0.25 * (1 - spawnT);
      const ringR = this.radius * (1 + spawnT * 0.5);
      ctx2.beginPath();
      ctx2.arc(0, 0, ringR, 0, TWO_PI);
      ctx2.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
      ctx2.lineWidth = 1.5;
      ctx2.stroke();
    }
    ctx2.restore();
  }
  // ── Swarmer: jagged spiky star with pulsing core ──────────────
  drawSwarmer(ctx2, time) {
    const r = this.radius;
    const [cr, cg, cb] = this.color;
    const wobble = Math.sin(time * 2.5 + this.wobblePhase) * 0.08;
    const rot = time * 1.5 + this.wobblePhase;
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.8 + this.wobblePhase);
    ctx2.beginPath();
    ctx2.arc(0, 0, r * 0.5 * (0.9 + pulse * 0.2), 0, TWO_PI);
    ctx2.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.1 + pulse * 0.06})`;
    ctx2.fill();
    ctx2.beginPath();
    for (let i = 0; i < this.spikeCount * 2; i++) {
      const angle = rot + i / (this.spikeCount * 2) * TWO_PI;
      const isOuter = i % 2 === 0;
      const spikeR = isOuter ? r * (1 + wobble) : r * 0.55;
      const px = Math.cos(angle) * spikeR;
      const py = Math.sin(angle) * spikeR;
      if (i === 0) ctx2.moveTo(px, py);
      else ctx2.lineTo(px, py);
    }
    ctx2.closePath();
    ctx2.strokeStyle = this.outlineColor;
    ctx2.lineWidth = 2;
    ctx2.stroke();
    this.drawHpFill(ctx2, r, cr, cg, cb);
  }
  // ── Drifter: hexagon with inner rotating ring ─────────────────
  drawDrifter(ctx2, time) {
    const r = this.radius;
    const [cr, cg, cb] = this.color;
    if (!this.isCharging && this.chargeTimer < 1) {
      const urgency = 1 - this.chargeTimer;
      ctx2.beginPath();
      ctx2.arc(0, 0, r * 1.3, 0, TWO_PI);
      ctx2.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${urgency * 0.15})`;
      ctx2.fill();
    }
    tracePoly(ctx2, 0, 0, r, 6, 0);
    ctx2.strokeStyle = this.outlineColor;
    ctx2.lineWidth = 2;
    ctx2.stroke();
    this.drawHpFill(ctx2, r, cr, cg, cb);
    const innerR = r * 0.5;
    const innerPulse = 0.8 + 0.2 * Math.sin(time * 2);
    tracePoly(ctx2, 0, 0, innerR * innerPulse, 6, this.innerRotation);
    ctx2.strokeStyle = `rgba(255, 255, 255, 0.3)`;
    ctx2.lineWidth = 1;
    ctx2.stroke();
    drawSphereShading(ctx2, 0, 0, r, cr, cg, cb);
  }
  // ── Titan: concentric rotating rings ──────────────────────────
  drawTitan(ctx2, time) {
    const r = this.radius;
    const [cr, cg, cb] = this.color;
    ctx2.globalAlpha = 0.06;
    for (let i = 0; i < 8; i++) {
      const angle = this.innerRotation * 0.3 + i / 8 * TWO_PI;
      const lineR = r * 2.2;
      ctx2.beginPath();
      ctx2.moveTo(Math.cos(angle) * r * 1.1, Math.sin(angle) * r * 1.1);
      ctx2.lineTo(Math.cos(angle) * lineR, Math.sin(angle) * lineR);
      ctx2.strokeStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx2.lineWidth = 1.5;
      ctx2.stroke();
    }
    ctx2.globalAlpha = 1;
    ctx2.beginPath();
    ctx2.arc(0, 0, r * 1.25, 0, TWO_PI);
    ctx2.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.12)`;
    ctx2.lineWidth = 1;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.arc(0, 0, r * 1.1, 0, TWO_PI);
    ctx2.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.2)`;
    ctx2.lineWidth = 1;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.arc(0, 0, r, 0, TWO_PI);
    ctx2.strokeStyle = this.outlineColor;
    ctx2.lineWidth = 2.5;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.arc(0, 0, r - 1, 0, TWO_PI);
    this.drawHpFill(ctx2, r, cr, cg, cb);
    const innerR = r * 0.55;
    const segments = 5;
    const segGap = 0.2;
    const segArc = TWO_PI / segments - segGap;
    ctx2.lineWidth = 2;
    ctx2.strokeStyle = `rgba(255, 255, 255, 0.25)`;
    for (let i = 0; i < segments; i++) {
      const startAngle = this.innerRotation + i / segments * TWO_PI;
      ctx2.beginPath();
      ctx2.arc(0, 0, innerR, startAngle, startAngle + segArc);
      ctx2.stroke();
    }
    const eyePulse = 0.6 + 0.4 * Math.sin(time * 1.5);
    const eyeR = r * 0.15 * eyePulse;
    const eyeGrad = ctx2.createRadialGradient(0, 0, 0, 0, 0, eyeR * 3);
    eyeGrad.addColorStop(0, `rgba(255, 255, 255, ${0.4 * eyePulse})`);
    eyeGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx2.fillStyle = eyeGrad;
    ctx2.beginPath();
    ctx2.arc(0, 0, eyeR * 3, 0, TWO_PI);
    ctx2.fill();
    drawSphereShading(ctx2, 0, 0, r, cr, cg, cb);
  }
  // ── Overlord: rotating square with glow (mostly preserved) ────
  drawOverlord(ctx2, time) {
    const side = this.radius * 2;
    const [cr, cg, cb] = this.color;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.5);
    const glowSize = this.radius + 10 + pulse * 8;
    ctx2.save();
    ctx2.rotate(this.rotation);
    const gradient = ctx2.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, glowSize * 1.4);
    gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.25 + pulse * 0.15})`);
    gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
    ctx2.fillStyle = gradient;
    ctx2.fillRect(-glowSize * 1.4, -glowSize * 1.4, glowSize * 2.8, glowSize * 2.8);
    ctx2.strokeStyle = this.outlineColor;
    ctx2.lineWidth = 3;
    ctx2.strokeRect(-side / 2, -side / 2, side, side);
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio > 0) {
      const innerSide = side - 2;
      ctx2.beginPath();
      ctx2.rect(-innerSide / 2, -innerSide / 2, innerSide, innerSide);
      ctx2.save();
      ctx2.clip();
      const fillTop = -this.radius + 1 + innerSide * (1 - hpRatio);
      ctx2.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx2.fillRect(-innerSide / 2, fillTop, innerSide, innerSide);
      ctx2.restore();
    }
    const innerSize = this.radius * 0.5;
    const innerPulse = 0.8 + 0.2 * Math.sin(time * 3);
    ctx2.beginPath();
    ctx2.moveTo(0, -innerSize * innerPulse);
    ctx2.lineTo(innerSize * innerPulse, 0);
    ctx2.lineTo(0, innerSize * innerPulse);
    ctx2.lineTo(-innerSize * innerPulse, 0);
    ctx2.closePath();
    ctx2.strokeStyle = `rgba(255, 200, 200, 0.25)`;
    ctx2.lineWidth = 1;
    ctx2.stroke();
    ctx2.restore();
  }
  // ── Shared helpers ────────────────────────────────────────────
  drawProjectiles(ctx2, camera) {
    for (const p of this.projectiles) {
      const ps = camera.worldToScreen(p.x, p.y);
      const glow = ctx2.createRadialGradient(ps.x, ps.y, 0, ps.x, ps.y, p.radius * 3);
      glow.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      glow.addColorStop(0.4, "rgba(255, 200, 200, 0.3)");
      glow.addColorStop(1, "rgba(255, 100, 100, 0)");
      ctx2.beginPath();
      ctx2.arc(ps.x, ps.y, p.radius * 3, 0, TWO_PI);
      ctx2.fillStyle = glow;
      ctx2.fill();
      ctx2.beginPath();
      ctx2.arc(ps.x, ps.y, p.radius, 0, TWO_PI);
      ctx2.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx2.fill();
    }
  }
  drawChargeTrail(ctx2) {
    const trailLen = 20;
    const nx = -this.chargeVx / CHARGE_SPEED;
    const ny = -this.chargeVy / CHARGE_SPEED;
    for (let i = 1; i <= 4; i++) {
      const tx = nx * trailLen * i;
      const ty = ny * trailLen * i;
      ctx2.beginPath();
      ctx2.arc(tx, ty, this.radius * (1 - i * 0.15), 0, TWO_PI);
      ctx2.fillStyle = `rgba(255, 160, 40, ${0.15 - i * 0.03})`;
      ctx2.fill();
    }
  }
  drawHpFill(ctx2, r, cr, cg, cb) {
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio > 0) {
      ctx2.save();
      ctx2.clip();
      const fillTop = r - r * 2 * hpRatio;
      ctx2.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx2.fillRect(-r * 1.2, fillTop, r * 2.4, r * 2.4);
      ctx2.restore();
    }
  }
};
var EnemySpawner = class {
  constructor() {
    this.enemies = [];
    this.spawnTimer = -2.2;
    this.stage = 1;
  }
  setStage(stage) {
    this.stage = Math.max(1, stage);
  }
  clear() {
    this.enemies = [];
    this.spawnTimer = -Math.max(1.1, 2.2 - (this.stage - 1) * 0.18);
  }
  getSpawnConfig(elapsed) {
    const difficulty = this.stage - 1;
    const effectiveElapsed = elapsed + difficulty * 75;
    let spawnInterval;
    let types;
    if (effectiveElapsed < 20) {
      spawnInterval = 1.4;
      types = [{ type: "swarmer", weight: 1 }];
    } else if (effectiveElapsed < 45) {
      spawnInterval = 1;
      types = [{ type: "swarmer", weight: 1 }];
    } else if (effectiveElapsed < 90) {
      spawnInterval = 0.8;
      types = [{ type: "swarmer", weight: 3 }, { type: "drifter", weight: 1 }];
    } else {
      const minute = effectiveElapsed / 60;
      if (minute < 2) {
        spawnInterval = 0.7;
        types = [{ type: "swarmer", weight: 3 }, { type: "drifter", weight: 1.25 }];
      } else if (minute < 2.5) {
        spawnInterval = 0.65;
        types = [{ type: "swarmer", weight: 3 }, { type: "drifter", weight: 2 }, { type: "titan", weight: 0.35 }];
      } else if (minute < 3) {
        spawnInterval = 0.45;
        types = [{ type: "swarmer", weight: 3 }, { type: "drifter", weight: 2 }, { type: "titan", weight: 0.5 }, { type: "overlord", weight: 0.3 }];
      } else {
        spawnInterval = 0.3;
        types = [{ type: "swarmer", weight: 2 }, { type: "drifter", weight: 2 }, { type: "titan", weight: 1.5 }, { type: "overlord", weight: 0.8 }];
      }
    }
    const paceScale = 1 + difficulty * 0.12;
    const scaledTypes = types.map(({ type, weight }) => ({
      type,
      weight: this.scaleSpawnWeight(type, weight)
    }));
    return {
      spawnInterval: Math.max(0.18, spawnInterval / paceScale),
      types: scaledTypes
    };
  }
  scaleSpawnWeight(type, baseWeight) {
    const difficulty = this.stage - 1;
    switch (type) {
      case "swarmer":
        return baseWeight * (1 + difficulty * 0.06);
      case "drifter":
        return baseWeight * (1 + difficulty * 0.14);
      case "titan":
        return baseWeight * (1 + difficulty * 0.22);
      case "overlord":
        return baseWeight * (1 + difficulty * 0.28);
    }
  }
  pickType(types) {
    const total = types.reduce((s, t) => s + t.weight, 0);
    let roll = Math.random() * total;
    for (const t of types) {
      roll -= t.weight;
      if (roll <= 0) return t.type;
    }
    return types[0].type;
  }
  getSwarmerCount(elapsed) {
    const effectiveElapsed = elapsed + (this.stage - 1) * 50;
    const extra = Math.floor((this.stage - 1) / 2);
    if (effectiveElapsed < 20) return Math.floor(randomRange(1, 3)) + extra;
    if (effectiveElapsed < 45) return Math.floor(randomRange(2, 4)) + extra;
    if (effectiveElapsed < 120) return Math.floor(randomRange(2, 5)) + extra;
    return Math.floor(randomRange(3, 6)) + extra;
  }
  spawnEnemy(type, camera, elapsed) {
    const margin = elapsed < 45 ? 140 : 100;
    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch (side) {
      case 0:
        x = camera.x + Math.random() * camera.width;
        y = camera.y - margin - Math.random() * 100;
        break;
      case 1:
        x = camera.x + Math.random() * camera.width;
        y = camera.y + camera.height + margin + Math.random() * 100;
        break;
      case 2:
        x = camera.x - margin - Math.random() * 100;
        y = camera.y + Math.random() * camera.height;
        break;
      default:
        x = camera.x + camera.width + margin + Math.random() * 100;
        y = camera.y + Math.random() * camera.height;
        break;
    }
    const pos = wrapPosition(x, y);
    if (type === "swarmer") {
      const count = this.getSwarmerCount(elapsed);
      for (let i = 0; i < count; i++) {
        const gp = wrapPosition(pos.x + randomRange(-40, 40), pos.y + randomRange(-40, 40));
        this.enemies.push(new Enemy("swarmer", gp.x, gp.y, this.stage));
      }
    } else if (type === "drifter" && elapsed > 75 && Math.random() < Math.min(0.7, 0.35 + (this.stage - 1) * 0.06)) {
      this.enemies.push(new Enemy("drifter", pos.x, pos.y, this.stage));
      const dp = wrapPosition(pos.x + randomRange(-30, 30), pos.y + randomRange(-30, 30));
      this.enemies.push(new Enemy("drifter", dp.x, dp.y, this.stage));
    } else {
      this.enemies.push(new Enemy(type, pos.x, pos.y, this.stage));
    }
  }
  update(dt, elapsed, playerX, playerY, camera) {
    const config = this.getSpawnConfig(elapsed);
    this.spawnTimer += dt;
    if (this.spawnTimer >= config.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy(this.pickType(config.types), camera, elapsed);
    }
    for (const enemy of this.enemies) {
      enemy.update(dt, playerX, playerY);
    }
    for (const overlord of this.enemies) {
      if (!overlord.consumeSummon()) continue;
      const count = Math.floor(randomRange(2, 4));
      for (let i = 0; i < count; i++) {
        const sp = wrapPosition(
          overlord.x + randomRange(-80, 80),
          overlord.y + randomRange(-80, 80)
        );
        this.enemies.push(new Enemy("swarmer", sp.x, sp.y, this.stage));
      }
    }
  }
  removeDead() {
    this.enemies = this.enemies.filter((e) => !e.dead);
  }
  draw(ctx2, camera, time) {
    for (const enemy of this.enemies) {
      if (camera.isVisible(enemy.x, enemy.y, enemy.radius + 50)) {
        enemy.draw(ctx2, camera, time);
      }
    }
  }
  drawProjectiles(ctx2, camera) {
    for (const enemy of this.enemies) {
      if (camera.isVisible(enemy.x, enemy.y, enemy.radius + 80)) {
        enemy.drawProjectiles(ctx2, camera);
      }
    }
  }
};

// src/particles.ts
var MAX_PARTICLES = 500;
var DeathParticle = class {
  constructor(x, y, radius, outlineColor, lifetime = 1) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.lifetime = lifetime;
    this.elapsed = 0;
    this.done = false;
    this.vy = -40 - Math.random() * 30;
    this.wobbleSpeed = 2 + Math.random() * 3;
    this.wobbleAmp = 5 + Math.random() * 10;
    this.wobbleOffset = Math.random() * TWO_PI;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
      return;
    }
    this.y += this.vy * dt;
    this.x += Math.sin(this.elapsed * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmp * dt;
  }
  draw(ctx2, camera) {
    const alpha = 1 - this.elapsed / this.lifetime;
    const screen = camera.worldToScreen(this.x, this.y);
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, this.radius, 0, TWO_PI);
    ctx2.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    ctx2.lineWidth = 2;
    ctx2.stroke();
  }
};
var SparkParticle = class {
  constructor(x, y, outlineColor, speed) {
    this.x = x;
    this.y = y;
    this.elapsed = 0;
    this.done = false;
    const angle = Math.random() * TWO_PI;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.size = 1 + Math.random() * 2;
    this.lifetime = 0.4 + Math.random() * 0.5;
    this.prevX = x;
    this.prevY = y;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
      return;
    }
    this.prevX = this.x;
    this.prevY = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.96;
    this.vy *= 0.96;
  }
  draw(ctx2, camera) {
    const t = this.elapsed / this.lifetime;
    const alpha = 1 - t;
    const s1 = camera.worldToScreen(this.prevX, this.prevY);
    const s2 = camera.worldToScreen(this.x, this.y);
    ctx2.beginPath();
    ctx2.moveTo(s1.x, s1.y);
    ctx2.lineTo(s2.x, s2.y);
    ctx2.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha * 0.6})`;
    ctx2.lineWidth = this.size;
    ctx2.lineCap = "round";
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.arc(s2.x, s2.y, this.size * 0.8, 0, TWO_PI);
    ctx2.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx2.fill();
  }
};
var DebrisParticle = class {
  constructor(x, y, outlineColor, enemyRadius) {
    this.x = x;
    this.y = y;
    this.elapsed = 0;
    this.done = false;
    const angle = Math.random() * TWO_PI;
    const speed = 60 + Math.random() * 120;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.size = 2 + Math.random() * (enemyRadius * 0.15);
    this.lifetime = 0.6 + Math.random() * 0.6;
    this.rotation = Math.random() * TWO_PI;
    this.rotSpeed = (Math.random() - 0.5) * 12;
    this.sides = Math.random() < 0.5 ? 3 : 4;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotSpeed * dt;
    this.vx *= 0.97;
    this.vy *= 0.97;
  }
  draw(ctx2, camera) {
    const t = this.elapsed / this.lifetime;
    const alpha = 1 - t * t;
    const screen = camera.worldToScreen(this.x, this.y);
    ctx2.save();
    ctx2.translate(screen.x, screen.y);
    ctx2.rotate(this.rotation);
    ctx2.beginPath();
    for (let i = 0; i <= this.sides; i++) {
      const a = i / this.sides * TWO_PI;
      const px = Math.cos(a) * this.size;
      const py = Math.sin(a) * this.size;
      if (i === 0) ctx2.moveTo(px, py);
      else ctx2.lineTo(px, py);
    }
    ctx2.closePath();
    ctx2.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha * 0.7})`;
    ctx2.fill();
    ctx2.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
    ctx2.lineWidth = 1;
    ctx2.stroke();
    ctx2.restore();
  }
};
var GlowPool = class {
  constructor(x, y, outlineColor, enemyRadius) {
    this.x = x;
    this.y = y;
    this.elapsed = 0;
    this.done = false;
    this.maxRadius = enemyRadius * 1.5;
    this.lifetime = 0.8 + Math.random() * 0.4;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
    }
  }
  draw(ctx2, camera) {
    const t = this.elapsed / this.lifetime;
    const r = this.maxRadius * Math.min(1, t * 3);
    const alpha = 0.15 * (1 - t);
    const screen = camera.worldToScreen(this.x, this.y);
    const grad = ctx2.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, r);
    grad.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx2.fillStyle = grad;
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, r, 0, TWO_PI);
    ctx2.fill();
  }
};
var XpOrb = class {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.elapsed = 0;
    this.lifetime = 0.6;
    this.done = false;
    const angle = Math.random() * TWO_PI;
    this.vx = Math.cos(angle) * 80;
    this.vy = Math.sin(angle) * 80;
    this.size = 2 + Math.random() * 2;
  }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
      return;
    }
    const t = this.elapsed / this.lifetime;
    const homingStrength = t * t * 800;
    const toTargetAngle = wrappedAngle(this.x, this.y, this.targetX, this.targetY);
    this.vx += Math.cos(toTargetAngle) * homingStrength * dt;
    this.vy += Math.sin(toTargetAngle) * homingStrength * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
  draw(ctx2, camera) {
    const t = this.elapsed / this.lifetime;
    const alpha = t < 0.8 ? 1 : (1 - t) * 5;
    const screen = camera.worldToScreen(this.x, this.y);
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, this.size * 3, 0, TWO_PI);
    ctx2.fillStyle = `rgba(255, 220, 80, ${alpha * 0.2})`;
    ctx2.fill();
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, this.size, 0, TWO_PI);
    ctx2.fillStyle = `rgba(255, 240, 150, ${alpha * 0.9})`;
    ctx2.fill();
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, this.size * 0.4, 0, TWO_PI);
    ctx2.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx2.fill();
  }
};
var ExplosionParticle = class {
  constructor(x, y, outlineColor) {
    this.x = x;
    this.y = y;
    this.elapsed = 0;
    this.gravity = 60;
    this.done = false;
    const angle = Math.random() * TWO_PI;
    const speed = 100 + Math.random() * 150;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.particleRadius = 1 + Math.random() * 2;
    this.lifetime = 0.5 + Math.random() * 0.3;
    [this.r, this.g, this.b] = parseHexColor(outlineColor);
  }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
  }
  draw(ctx2, camera) {
    const alpha = 1 - this.elapsed / this.lifetime;
    const screen = camera.worldToScreen(this.x, this.y);
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, this.particleRadius, 0, TWO_PI);
    ctx2.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    ctx2.fill();
  }
};
var FlashParticle = class {
  constructor(x, y, maxRadius) {
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this.elapsed = 0;
    this.lifetime = 0.2;
    this.done = false;
  }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.lifetime) {
      this.done = true;
    }
  }
  draw(ctx2, camera) {
    const t = this.elapsed / this.lifetime;
    const currentRadius = this.maxRadius * 2 * t;
    const alpha = 0.4 * (1 - t);
    const screen = camera.worldToScreen(this.x, this.y);
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, currentRadius, 0, TWO_PI);
    ctx2.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx2.fill();
  }
};
var ScreenFlash = class {
  constructor(r, g, b, maxAlpha, duration) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.maxAlpha = maxAlpha;
    this.duration = duration;
    this.elapsed = 0;
    this.done = false;
  }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.done = true;
    }
  }
  draw(ctx2, width, height) {
    const t = this.elapsed / this.duration;
    const alpha = this.maxAlpha * (1 - t);
    ctx2.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`;
    ctx2.fillRect(0, 0, width, height);
  }
};
var DamageVignette = class {
  constructor(duration, intensity) {
    this.duration = duration;
    this.intensity = intensity;
    this.elapsed = 0;
    this.done = false;
  }
  update(dt) {
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.done = true;
    }
  }
  draw(ctx2, width, height) {
    const t = this.elapsed / this.duration;
    const alpha = this.intensity * (1 - t);
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(width, height) * 0.7;
    const grad = ctx2.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
    grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    grad.addColorStop(1, `rgba(200, 0, 0, ${alpha})`);
    ctx2.fillStyle = grad;
    ctx2.fillRect(0, 0, width, height);
  }
};
var ParticleSystem = class {
  constructor() {
    this.particles = [];
    this.screenEffects = [];
  }
  getParticleLoadScale() {
    const load = this.particles.length / MAX_PARTICLES;
    if (load >= 0.85) return 0.35;
    if (load >= 0.65) return 0.5;
    if (load >= 0.45) return 0.7;
    return 1;
  }
  emitParticle(factory) {
    if (this.particles.length >= MAX_PARTICLES) return;
    this.particles.push(factory());
  }
  emitBurst(count, factory) {
    const allowed = Math.max(0, Math.min(count, MAX_PARTICLES - this.particles.length));
    for (let i = 0; i < allowed; i++) {
      this.particles.push(factory());
    }
  }
  clear() {
    this.particles = [];
    this.screenEffects = [];
  }
  spawnDeath(x, y, radius, outlineColor) {
    if (this.particles.length >= MAX_PARTICLES) return;
    const loadScale = this.getParticleLoadScale();
    this.emitParticle(() => new DeathParticle(x, y, radius, outlineColor));
    const burstCount = Math.max(4, Math.round((8 + Math.floor(Math.random() * 8)) * loadScale));
    this.emitBurst(burstCount, () => new ExplosionParticle(x, y, outlineColor));
    const sparkCount = Math.max(3, Math.round((6 + radius * 0.3) * loadScale));
    this.emitBurst(sparkCount, () => new SparkParticle(x, y, outlineColor, 120 + Math.random() * 180));
    const debrisCount = Math.max(2, Math.round((4 + radius * 0.15) * loadScale));
    this.emitBurst(debrisCount, () => new DebrisParticle(x, y, outlineColor, radius));
    this.emitParticle(() => new GlowPool(x, y, outlineColor, radius));
    if (radius > 25) {
      this.emitParticle(() => new FlashParticle(x, y, radius));
    }
  }
  spawnXpOrbs(x, y, playerX, playerY, count) {
    if (count <= 0 || this.particles.length >= MAX_PARTICLES) return;
    const orbCount = Math.max(1, Math.round(count * this.getParticleLoadScale()));
    this.emitBurst(orbCount, () => new XpOrb(x, y, playerX, playerY));
  }
  spawnFlash(x, y, radius) {
    this.emitParticle(() => new FlashParticle(x, y, radius));
  }
  addScreenFlash(r, g, b, alpha, duration) {
    this.screenEffects.push(new ScreenFlash(r, g, b, alpha, duration));
  }
  addDamageVignette(duration, intensity) {
    this.screenEffects.push(new DamageVignette(duration, intensity));
  }
  update(dt) {
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter((p) => !p.done);
    for (const e of this.screenEffects) e.update(dt);
    this.screenEffects = this.screenEffects.filter((e) => !e.done);
  }
  draw(ctx2, camera) {
    for (const p of this.particles) p.draw(ctx2, camera);
  }
  drawScreenEffects(ctx2, width, height) {
    for (const e of this.screenEffects) e.draw(ctx2, width, height);
  }
};

// src/weapons.ts
var LASER_COLORS = {
  glow: "80, 160, 255",
  glowAlphaBoost: 0,
  midStart: [100, 180, 255],
  midEnd: [255, 200, 255],
  coreStart: [255, 220, 240],
  coreEnd: [255, 255, 255],
  impactOuter: "rgba(80, 160, 255, 0)",
  impactMid: "rgba(100, 200, 255, 0.5)",
  originOuter: "rgba(80, 150, 255, VAR)",
  originInner: "rgba(210, 235, 255, VAR)"
};
var ESCORT_COLORS = {
  glow: "120, 255, 220",
  glowAlphaBoost: 0.06,
  midStart: [110, 255, 220],
  midEnd: [200, 255, 245],
  coreStart: [220, 255, 245],
  coreEnd: [255, 255, 255],
  impactOuter: "rgba(80, 255, 220, 0)",
  impactMid: "rgba(110, 255, 225, 0.45)",
  originOuter: "rgba(90, 255, 220, VAR)",
  originInner: "rgba(230, 255, 245, VAR)"
};
function computeLaserStats(level) {
  return {
    damage: 8 + level * 4,
    cooldown: Math.max(0.15, 0.8 - level * 0.065),
    duration: 0.1 + level * 0.01,
    range: 200 + level * 40,
    width: 1 + level * 0.8,
    glowAlpha: 0.1 + level * 0.06,
    particleCount: Math.floor(level / 3)
  };
}
function getNearestEnemy(originX, originY, enemies, range) {
  let nearest = null;
  let nearestDist = Infinity;
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dist = wrappedDistance(originX, originY, enemy.x, enemy.y);
    if (dist < range && dist < nearestDist) {
      nearestDist = dist;
      nearest = enemy;
    }
  }
  return nearest;
}
function applyBeamDamage(originX, originY, targetX, targetY, enemies, damage, range, width) {
  const angle = wrappedAngle(originX, originY, targetX, targetY);
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dist = wrappedDistance(originX, originY, enemy.x, enemy.y);
    if (dist > range) continue;
    const eAngle = wrappedAngle(originX, originY, enemy.x, enemy.y);
    const diff = Math.abs(eAngle - angle);
    const normDiff = Math.min(diff, TWO_PI - diff);
    if (dist * Math.sin(normDiff) < enemy.radius + width) {
      enemy.takeDamage(damage);
    }
  }
}
function drawBeam(ctx2, camera, originWorldX, originWorldY, originRadius, targetWorldX, targetWorldY, stats, time, level, colors) {
  const screen = camera.worldToScreen(originWorldX, originWorldY);
  const delta = wrappedDelta(originWorldX, originWorldY, targetWorldX, targetWorldY);
  const endX = screen.x + delta.x;
  const endY = screen.y + delta.y;
  const beamAngle = Math.atan2(delta.y, delta.x);
  const originX = screen.x + Math.cos(beamAngle) * originRadius;
  const originY = screen.y + Math.sin(beamAngle) * originRadius;
  const beamLength = Math.max(0, Math.sqrt(delta.x * delta.x + delta.y * delta.y) - originRadius);
  const perpX = -Math.sin(beamAngle);
  const perpY = Math.cos(beamAngle);
  const amplitude = 0.5 + level * 0.6;
  const frequency = 3.5;
  const waveSpeed = 8;
  const segments = 20;
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const along = t * beamLength;
    const wave = Math.sin(t * frequency * TWO_PI + time * waveSpeed) * amplitude;
    points.push({
      x: originX + Math.cos(beamAngle) * along + perpX * wave,
      y: originY + Math.sin(beamAngle) * along + perpY * wave
    });
  }
  const drawWavyPath = () => {
    ctx2.beginPath();
    ctx2.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= segments; i++) ctx2.lineTo(points[i].x, points[i].y);
  };
  ctx2.lineJoin = "round";
  ctx2.lineCap = "round";
  if (level >= 3) {
    drawWavyPath();
    ctx2.strokeStyle = `rgba(${colors.glow}, ${stats.glowAlpha + colors.glowAlphaBoost})`;
    ctx2.lineWidth = stats.width * 5;
    ctx2.stroke();
  }
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const taper = 1 - t * 0.5;
    const r = Math.round(colors.midStart[0] + (colors.midEnd[0] - colors.midStart[0]) * t);
    const g = Math.round(colors.midStart[1] + (colors.midEnd[1] - colors.midStart[1]) * t);
    const b = Math.round(colors.midStart[2] + (colors.midEnd[2] - colors.midStart[2]) * t);
    ctx2.beginPath();
    ctx2.moveTo(points[i].x, points[i].y);
    ctx2.lineTo(points[i + 1].x, points[i + 1].y);
    ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.35 + stats.glowAlpha})`;
    ctx2.lineWidth = stats.width * 2.5 * taper;
    ctx2.stroke();
  }
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const taper = 1 - t * 0.6;
    const r = Math.round(colors.coreStart[0] + (colors.coreEnd[0] - colors.coreStart[0]) * t);
    const g = Math.round(colors.coreStart[1] + (colors.coreEnd[1] - colors.coreStart[1]) * t);
    const b = Math.round(colors.coreStart[2] + (colors.coreEnd[2] - colors.coreStart[2]) * t);
    ctx2.beginPath();
    ctx2.moveTo(points[i].x, points[i].y);
    ctx2.lineTo(points[i + 1].x, points[i + 1].y);
    ctx2.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.95)`;
    ctx2.lineWidth = stats.width * taper;
    ctx2.stroke();
  }
  const flashRadius = stats.width * 3 + 4;
  const flashGrad = ctx2.createRadialGradient(endX, endY, 0, endX, endY, flashRadius * 2.5);
  flashGrad.addColorStop(0, "rgba(230, 255, 255, 0.9)");
  flashGrad.addColorStop(0.4, colors.impactMid);
  flashGrad.addColorStop(1, colors.impactOuter);
  ctx2.beginPath();
  ctx2.arc(endX, endY, flashRadius * 2.5, 0, TWO_PI);
  ctx2.fillStyle = flashGrad;
  ctx2.fill();
  ctx2.beginPath();
  ctx2.arc(endX, endY, flashRadius * 0.5, 0, TWO_PI);
  ctx2.fillStyle = "rgba(240, 255, 255, 0.95)";
  ctx2.fill();
  if (level >= 5) {
    const orbPulse = 0.6 + 0.4 * Math.sin(time * 12);
    const orbRadius = stats.width * 2.5 * orbPulse;
    const orbGrad = ctx2.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, orbRadius * 3);
    orbGrad.addColorStop(0, colors.originOuter.replace("VAR", `${0.8 * orbPulse}`));
    orbGrad.addColorStop(0.5, colors.originOuter.replace("VAR", `${0.4 * orbPulse}`));
    orbGrad.addColorStop(1, colors.impactOuter);
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, orbRadius * 3, 0, TWO_PI);
    ctx2.fillStyle = orbGrad;
    ctx2.fill();
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, orbRadius, 0, TWO_PI);
    ctx2.fillStyle = colors.originInner.replace("VAR", `${0.9 * orbPulse}`);
    ctx2.fill();
  }
  for (let i = 0; i < stats.particleCount; i++) {
    const t = Math.random();
    const segIdx = Math.floor(t * segments);
    const px = points[segIdx].x + (Math.random() - 0.5) * stats.width * 3;
    const py = points[segIdx].y + (Math.random() - 0.5) * stats.width * 3;
    ctx2.fillStyle = `rgba(220, 255, 255, ${0.5 + Math.random() * 0.5})`;
    ctx2.beginPath();
    ctx2.arc(px, py, Math.random() * 2, 0, TWO_PI);
    ctx2.fill();
  }
}
var LaserBeam = class {
  constructor() {
    this.name = "Laser Beam";
    this.level = 1;
    this.maxLevel = 10;
    this.cooldownTimer = 0;
    this.firingTimer = 0;
    this.isFiring = false;
    this.targetX = 0;
    this.targetY = 0;
    this.time = 0;
    this.cachedStats = this.computeStats();
    this.cachedLevel = 1;
  }
  computeStats() {
    return computeLaserStats(this.level);
  }
  getStats() {
    if (this.level !== this.cachedLevel) {
      this.cachedStats = this.computeStats();
      this.cachedLevel = this.level;
    }
    return this.cachedStats;
  }
  update(dt, playerX, playerY, enemies, modifiers) {
    const stats = this.getStats();
    const damage = stats.damage * modifiers.damageMultiplier;
    const cooldown = stats.cooldown * modifiers.cooldownMultiplier;
    this.time += dt;
    if (this.isFiring) {
      this.firingTimer -= dt;
      if (this.firingTimer <= 0) this.isFiring = false;
    }
    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0 && !this.isFiring) {
      const nearest = getNearestEnemy(playerX, playerY, enemies, stats.range);
      if (nearest) {
        this.isFiring = true;
        this.firingTimer = stats.duration;
        this.cooldownTimer = cooldown;
        this.targetX = nearest.x;
        this.targetY = nearest.y;
        const angle = wrappedAngle(playerX, playerY, nearest.x, nearest.y);
        if (this.onFire) this.onFire(angle);
        applyBeamDamage(playerX, playerY, nearest.x, nearest.y, enemies, damage, stats.range, stats.width);
      }
    }
  }
  draw(ctx2, camera, playerX, playerY, playerRadius) {
    if (!this.isFiring) return;
    const stats = this.getStats();
    drawBeam(
      ctx2,
      camera,
      playerX,
      playerY,
      playerRadius,
      this.targetX,
      this.targetY,
      stats,
      this.time,
      this.level,
      LASER_COLORS
    );
  }
};
var EscortWing = class {
  constructor() {
    this.name = "Escort Wing";
    this.level = 1;
    this.maxLevel = 10;
    this.cooldownTimer = 0;
    this.firingTimer = 0;
    this.isFiring = false;
    this.targetX = 0;
    this.targetY = 0;
    this.time = 0;
    this.facingAngle = 0;
    this.cachedStats = this.computeStats();
    this.cachedLevel = 1;
  }
  computeStats() {
    const base = computeLaserStats(this.level);
    return __spreadProps(__spreadValues({}, base), {
      damage: base.damage * 0.7,
      width: Math.max(1.1, base.width * 0.82),
      glowAlpha: base.glowAlpha + 0.03,
      orbitRadius: 28 + this.level * 2.5,
      craftRadius: 8 + this.level * 0.35
    });
  }
  getStats() {
    if (this.level !== this.cachedLevel) {
      this.cachedStats = this.computeStats();
      this.cachedLevel = this.level;
    }
    return this.cachedStats;
  }
  getEscortPosition(playerX, playerY) {
    const stats = this.getStats();
    const angle = this.time * 1.4;
    return {
      x: playerX + Math.cos(angle) * stats.orbitRadius,
      y: playerY + Math.sin(angle * 1.15) * stats.orbitRadius * 0.6 - 20
    };
  }
  update(dt, playerX, playerY, enemies, modifiers) {
    const stats = this.getStats();
    const damage = stats.damage * modifiers.damageMultiplier;
    const cooldown = stats.cooldown * modifiers.cooldownMultiplier;
    this.time += dt;
    const escort = this.getEscortPosition(playerX, playerY);
    const aimTarget = this.isFiring ? { x: this.targetX, y: this.targetY } : getNearestEnemy(escort.x, escort.y, enemies, stats.range);
    if (aimTarget) {
      this.facingAngle = wrappedAngle(escort.x, escort.y, aimTarget.x, aimTarget.y) + Math.PI / 2;
    }
    if (this.isFiring) {
      this.firingTimer -= dt;
      if (this.firingTimer <= 0) this.isFiring = false;
    }
    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0 && !this.isFiring) {
      const nearest = getNearestEnemy(escort.x, escort.y, enemies, stats.range);
      if (nearest) {
        this.isFiring = true;
        this.firingTimer = stats.duration;
        this.cooldownTimer = cooldown;
        this.targetX = nearest.x;
        this.targetY = nearest.y;
        this.facingAngle = wrappedAngle(escort.x, escort.y, nearest.x, nearest.y) + Math.PI / 2;
        applyBeamDamage(escort.x, escort.y, nearest.x, nearest.y, enemies, damage, stats.range, stats.width);
      }
    }
  }
  draw(ctx2, camera, playerX, playerY, _playerRadius) {
    const stats = this.getStats();
    const escort = this.getEscortPosition(playerX, playerY);
    const screen = camera.worldToScreen(escort.x, escort.y);
    ctx2.save();
    ctx2.translate(screen.x, screen.y);
    ctx2.rotate(this.facingAngle);
    ctx2.beginPath();
    ctx2.arc(0, 0, stats.craftRadius * 2.2, 0, TWO_PI);
    ctx2.fillStyle = "rgba(90, 255, 220, 0.12)";
    ctx2.fill();
    ctx2.beginPath();
    ctx2.moveTo(0, -stats.craftRadius * 1.4);
    ctx2.lineTo(stats.craftRadius * 0.95, stats.craftRadius * 1.1);
    ctx2.lineTo(0, stats.craftRadius * 0.5);
    ctx2.lineTo(-stats.craftRadius * 0.95, stats.craftRadius * 1.1);
    ctx2.closePath();
    ctx2.fillStyle = "rgba(150, 255, 235, 0.9)";
    ctx2.fill();
    ctx2.beginPath();
    ctx2.moveTo(0, -stats.craftRadius * 0.6);
    ctx2.lineTo(stats.craftRadius * 0.45, stats.craftRadius * 0.35);
    ctx2.lineTo(-stats.craftRadius * 0.45, stats.craftRadius * 0.35);
    ctx2.closePath();
    ctx2.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx2.fill();
    ctx2.beginPath();
    ctx2.moveTo(-stats.craftRadius * 1.4, stats.craftRadius * 0.2);
    ctx2.lineTo(-stats.craftRadius * 2.1, stats.craftRadius * 1.15);
    ctx2.moveTo(stats.craftRadius * 1.4, stats.craftRadius * 0.2);
    ctx2.lineTo(stats.craftRadius * 2.1, stats.craftRadius * 1.15);
    ctx2.strokeStyle = "rgba(110, 255, 225, 0.75)";
    ctx2.lineWidth = 1.5;
    ctx2.stroke();
    ctx2.restore();
    if (!this.isFiring) return;
    drawBeam(
      ctx2,
      camera,
      escort.x,
      escort.y,
      stats.craftRadius * 0.8,
      this.targetX,
      this.targetY,
      stats,
      this.time,
      this.level,
      ESCORT_COLORS
    );
  }
};
var OrbitShield = class {
  constructor() {
    this.name = "Orbit Shield";
    this.level = 1;
    this.maxLevel = 10;
    this.angle = 0;
    this.cachedStats = this.computeStats();
    this.cachedLevel = 1;
  }
  computeStats() {
    const lvl = this.level;
    return {
      damage: 8 + lvl * 5,
      orbitRadius: 70 + lvl * 18,
      projectileCount: 2 + Math.floor(lvl / 2),
      hitRadius: 12 + lvl * 3,
      drawRadius: 5 + lvl * 1,
      rotationSpeed: 2 + lvl * 0.3,
      trailLength: Math.floor(lvl / 2),
      glowAlpha: 0.1 + lvl * 0.05
    };
  }
  getStats() {
    if (this.level !== this.cachedLevel) {
      this.cachedStats = this.computeStats();
      this.cachedLevel = this.level;
    }
    return this.cachedStats;
  }
  update(dt, playerX, playerY, enemies, modifiers) {
    const stats = this.getStats();
    const damage = stats.damage * modifiers.damageMultiplier;
    this.angle += stats.rotationSpeed * dt;
    for (let i = 0; i < stats.projectileCount; i++) {
      const a = this.angle + TWO_PI / stats.projectileCount * i;
      const px = playerX + Math.cos(a) * stats.orbitRadius;
      const py = playerY + Math.sin(a) * stats.orbitRadius;
      for (const enemy of enemies) {
        if (enemy.dead) continue;
        if (wrappedDistance(px, py, enemy.x, enemy.y) < stats.hitRadius + enemy.radius) {
          enemy.takeDamage(damage * dt * 10);
        }
      }
    }
  }
  draw(ctx2, camera, playerX, playerY, _playerRadius) {
    const stats = this.getStats();
    const screen = camera.worldToScreen(playerX, playerY);
    for (let i = 0; i < stats.projectileCount; i++) {
      const a = this.angle + TWO_PI / stats.projectileCount * i;
      const px = screen.x + Math.cos(a) * stats.orbitRadius;
      const py = screen.y + Math.sin(a) * stats.orbitRadius;
      for (let t = 1; t <= stats.trailLength; t++) {
        const ta = a - t * 0.15;
        const tx = screen.x + Math.cos(ta) * stats.orbitRadius;
        const ty = screen.y + Math.sin(ta) * stats.orbitRadius;
        ctx2.beginPath();
        ctx2.arc(tx, ty, stats.drawRadius * 0.7, 0, TWO_PI);
        ctx2.fillStyle = `rgba(100, 200, 255, ${(1 - t / (stats.trailLength + 1)) * 0.4})`;
        ctx2.fill();
      }
      ctx2.beginPath();
      ctx2.arc(px, py, stats.drawRadius * 2.5, 0, TWO_PI);
      ctx2.fillStyle = `rgba(80, 160, 255, ${stats.glowAlpha})`;
      ctx2.fill();
      ctx2.beginPath();
      ctx2.arc(px, py, stats.drawRadius, 0, TWO_PI);
      ctx2.fillStyle = "rgba(180, 220, 255, 0.9)";
      ctx2.fill();
      ctx2.beginPath();
      ctx2.arc(px, py, stats.drawRadius * 0.4, 0, TWO_PI);
      ctx2.fillStyle = "#ffffff";
      ctx2.fill();
    }
    if (this.level >= 5) {
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, stats.orbitRadius, 0, TWO_PI);
      ctx2.strokeStyle = "rgba(80, 160, 255, 0.08)";
      ctx2.lineWidth = 1;
      ctx2.stroke();
    }
  }
};
var NovaBlast = class {
  constructor() {
    this.name = "Nova Blast";
    this.level = 1;
    this.maxLevel = 10;
    this.cooldownTimer = 0;
    this.blastRadius = 0;
    this.isBlasting = false;
    this.hasDealtDamage = false;
    this.cachedStats = this.computeStats();
    this.cachedLevel = 1;
  }
  computeStats() {
    const lvl = this.level;
    return {
      damage: 15 + lvl * 8,
      cooldown: Math.max(1.5, 4 - lvl * 0.25),
      maxRadius: 80 + lvl * 25,
      expandSpeed: 300 + lvl * 50,
      ringWidth: 2 + lvl * 0.8,
      debrisCount: Math.floor(lvl / 2),
      innerGlow: lvl >= 4,
      shockwave: lvl >= 7
    };
  }
  getStats() {
    if (this.level !== this.cachedLevel) {
      this.cachedStats = this.computeStats();
      this.cachedLevel = this.level;
    }
    return this.cachedStats;
  }
  update(dt, playerX, playerY, enemies, modifiers) {
    const stats = this.getStats();
    const damage = stats.damage * modifiers.damageMultiplier;
    const cooldown = stats.cooldown * modifiers.cooldownMultiplier;
    if (this.isBlasting) {
      this.blastRadius += stats.expandSpeed * dt;
      if (!this.hasDealtDamage) {
        for (const enemy of enemies) {
          if (enemy.dead) continue;
          if (wrappedDistance(playerX, playerY, enemy.x, enemy.y) < stats.maxRadius) {
            enemy.takeDamage(damage);
          }
        }
        this.hasDealtDamage = true;
      }
      if (this.blastRadius >= stats.maxRadius) {
        this.isBlasting = false;
        this.blastRadius = 0;
      }
    }
    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0 && !this.isBlasting) {
      this.isBlasting = true;
      this.cooldownTimer = cooldown;
      this.blastRadius = 0;
      this.hasDealtDamage = false;
    }
  }
  draw(ctx2, camera, playerX, playerY, _playerRadius) {
    if (!this.isBlasting) return;
    const stats = this.getStats();
    const screen = camera.worldToScreen(playerX, playerY);
    const progress = this.blastRadius / stats.maxRadius;
    const alpha = 1 - progress;
    if (stats.innerGlow) {
      const gradient = ctx2.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, this.blastRadius);
      gradient.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.15})`);
      gradient.addColorStop(1, "rgba(255, 200, 100, 0)");
      ctx2.fillStyle = gradient;
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.blastRadius, 0, TWO_PI);
      ctx2.fill();
    }
    if (stats.shockwave) {
      ctx2.beginPath();
      ctx2.arc(screen.x, screen.y, this.blastRadius * 1.05, 0, TWO_PI);
      ctx2.strokeStyle = `rgba(255, 220, 150, ${alpha * 0.3})`;
      ctx2.lineWidth = stats.ringWidth * 0.5;
      ctx2.stroke();
    }
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, this.blastRadius, 0, TWO_PI);
    ctx2.strokeStyle = `rgba(255, 180, 80, ${alpha})`;
    ctx2.lineWidth = stats.ringWidth;
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.arc(screen.x, screen.y, this.blastRadius, 0, TWO_PI);
    ctx2.strokeStyle = `rgba(255, 150, 50, ${alpha * 0.3})`;
    ctx2.lineWidth = stats.ringWidth * 3;
    ctx2.stroke();
    for (let i = 0; i < stats.debrisCount; i++) {
      const angle = TWO_PI / stats.debrisCount * i + progress * 2;
      const dx = screen.x + Math.cos(angle) * this.blastRadius;
      const dy = screen.y + Math.sin(angle) * this.blastRadius;
      ctx2.fillStyle = `rgba(255, 200, 100, ${alpha})`;
      ctx2.beginPath();
      ctx2.arc(dx, dy, 2 + this.level * 0.3, 0, TWO_PI);
      ctx2.fill();
    }
  }
};
var WeaponManager = class {
  constructor() {
    this.weapons = [];
    this.modifiers = {
      damageMultiplier: 1,
      cooldownMultiplier: 1
    };
    this.laser = new LaserBeam();
    this.weapons.push(this.laser);
  }
  setOnLaserFire(cb) {
    this.laser.onFire = cb;
  }
  addWeapon(type) {
    if (type === "orbit" && !this.hasWeapon("Orbit Shield")) {
      this.weapons.push(new OrbitShield());
    } else if (type === "nova" && !this.hasWeapon("Nova Blast")) {
      this.weapons.push(new NovaBlast());
    } else if (type === "escort" && !this.hasWeapon("Escort Wing")) {
      this.weapons.push(new EscortWing());
    }
  }
  hasWeapon(name) {
    return this.weapons.some((w) => w.name === name);
  }
  getWeapon(name) {
    return this.weapons.find((w) => w.name === name);
  }
  multiplyDamage(multiplier) {
    this.modifiers.damageMultiplier *= multiplier;
  }
  multiplyCooldown(multiplier) {
    this.modifiers.cooldownMultiplier *= multiplier;
  }
  allMaxed() {
    return this.weapons.length === 4 && this.weapons.every((w) => w.level >= w.maxLevel);
  }
  update(dt, playerX, playerY, enemies) {
    for (const weapon of this.weapons) weapon.update(dt, playerX, playerY, enemies, this.modifiers);
  }
  draw(ctx2, camera, playerX, playerY, playerRadius) {
    for (const weapon of this.weapons) weapon.draw(ctx2, camera, playerX, playerY, playerRadius);
  }
};

// src/world-combat.ts
var CONTACT_HIT_DAMAGE = 9;
var PROJECTILE_DAMAGE = 8;
var SHARP_HIT_THRESHOLD = 0.5;
var MAX_SHAKE = 5;
var BIG_KILL_RADIUS = 35;
var MAX_XP_ORBS = 6;
var LEVEL_UP_BLAST_RADIUS = 260;
var LEVEL_UP_BLAST_DAMAGE = 120;
var WorldCombatSystem = class {
  constructor(player, spawner, particles, camera) {
    this.player = player;
    this.spawner = spawner;
    this.particles = particles;
    this.camera = camera;
  }
  applyCollisions() {
    const hpBefore = this.player.hp;
    for (const enemy of this.spawner.enemies) {
      if (enemy.dead) continue;
      if (wrappedDistance(this.player.x, this.player.y, enemy.x, enemy.y) < this.player.radius + enemy.radius) {
        this.player.takeContactHit(CONTACT_HIT_DAMAGE * enemy.damageMultiplier);
      }
      for (const projectile of enemy.projectiles) {
        if (wrappedDistance(this.player.x, this.player.y, projectile.x, projectile.y) < this.player.radius + projectile.radius) {
          this.player.takeDamage(PROJECTILE_DAMAGE);
          projectile.lifetime = 0;
        }
      }
    }
    const damageTaken = hpBefore - this.player.hp;
    if (damageTaken > 0) {
      const shakeStrength = damageTaken > SHARP_HIT_THRESHOLD ? Math.min(MAX_SHAKE, damageTaken * 0.2) : Math.min(2, damageTaken * 0.35);
      this.camera.shake(shakeStrength, 0.12);
      this.particles.addDamageVignette(0.2, Math.min(0.28, 0.07 + damageTaken * 0.012));
    }
  }
  consumeDefeatedEnemies() {
    let levelUps = 0;
    for (const enemy of this.spawner.enemies) {
      if (!enemy.dead) continue;
      this.particles.spawnDeath(enemy.x, enemy.y, enemy.radius, enemy.outlineColor);
      this.particles.spawnXpOrbs(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y,
        Math.min(MAX_XP_ORBS, Math.ceil(enemy.xpDrop * 0.7))
      );
      this.player.kills++;
      if (enemy.radius > BIG_KILL_RADIUS) {
        this.camera.shake(enemy.radius * 0.08, 0.15);
      }
      if (this.player.addXp(enemy.xpDrop)) {
        levelUps++;
      }
    }
    return levelUps;
  }
  triggerLevelUpBlast(levelUps) {
    if (levelUps <= 0) return;
    const radius = LEVEL_UP_BLAST_RADIUS + (levelUps - 1) * 50;
    const damage = LEVEL_UP_BLAST_DAMAGE + (levelUps - 1) * 35;
    for (const enemy of this.spawner.enemies) {
      if (enemy.dead) continue;
      const distance = wrappedDistance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > radius + enemy.radius) continue;
      const falloff = 1 - Math.min(0.7, distance / radius * 0.7);
      enemy.takeDamage(damage * falloff);
      for (const projectile of enemy.projectiles) {
        if (wrappedDistance(this.player.x, this.player.y, projectile.x, projectile.y) <= radius) {
          projectile.lifetime = 0;
        }
      }
    }
    this.camera.shake(Math.min(8, 4 + levelUps * 1.4), 0.18);
    this.particles.spawnFlash(this.player.x, this.player.y, radius * 0.22);
    this.particles.addScreenFlash(120, 200, 255, 0.12, 0.18);
  }
};

// src/world-motion.ts
var WorldMotionTracker = class {
  constructor(player) {
    this.playerSpeed = 0;
    this.playerVx = 0;
    this.playerVy = 0;
    this.prevPlayerX = player.x;
    this.prevPlayerY = player.y;
  }
  get speed() {
    return this.playerSpeed;
  }
  get vx() {
    return this.playerVx;
  }
  get vy() {
    return this.playerVy;
  }
  sample(player, dt) {
    if (dt > 0) {
      const dx = player.x - this.prevPlayerX;
      const dy = player.y - this.prevPlayerY;
      this.playerVx = dx / dt;
      this.playerVy = dy / dt;
      this.playerSpeed = Math.sqrt(this.playerVx * this.playerVx + this.playerVy * this.playerVy);
    }
    this.prevPlayerX = player.x;
    this.prevPlayerY = player.y;
  }
  reset(player) {
    this.prevPlayerX = player.x;
    this.prevPlayerY = player.y;
    this.playerSpeed = 0;
    this.playerVx = 0;
    this.playerVy = 0;
  }
};

// src/world-renderer.ts
var WorldRenderer = class {
  constructor(deps) {
    this.deps = deps;
  }
  drawTitle(ctx2, time) {
    this.deps.background.draw(ctx2, this.deps.camera, time);
    this.deps.geometry.draw(
      ctx2,
      this.deps.camera,
      time,
      this.deps.camera.x + this.deps.camera.width / 2,
      this.deps.camera.y + this.deps.camera.height / 2
    );
  }
  drawPlayfield(ctx2, time, renderEntityBodies = true) {
    this.deps.background.draw(ctx2, this.deps.camera, time);
    this.deps.geometry.draw(ctx2, this.deps.camera, time, this.deps.player.x, this.deps.player.y);
    if (renderEntityBodies) {
      this.deps.spawner.draw(ctx2, this.deps.camera, time);
    } else {
      this.deps.spawner.drawProjectiles(ctx2, this.deps.camera);
    }
    this.deps.particles.draw(ctx2, this.deps.camera);
    this.deps.weaponManager.draw(ctx2, this.deps.camera, this.deps.player.x, this.deps.player.y, this.deps.player.radius);
    if (renderEntityBodies) {
      this.deps.player.draw(ctx2, this.deps.camera);
    } else {
      this.deps.player.drawEffects(ctx2, this.deps.camera);
    }
    this.deps.background.drawWrapZone(ctx2, this.deps.camera);
  }
  drawPausedScene(ctx2, time, renderEntityBodies = true) {
    this.deps.background.draw(ctx2, this.deps.camera, time);
    this.deps.geometry.draw(ctx2, this.deps.camera, time, this.deps.player.x, this.deps.player.y);
    if (renderEntityBodies) {
      this.deps.spawner.draw(ctx2, this.deps.camera, time);
    } else {
      this.deps.spawner.drawProjectiles(ctx2, this.deps.camera);
    }
    this.deps.weaponManager.draw(ctx2, this.deps.camera, this.deps.player.x, this.deps.player.y, this.deps.player.radius);
    if (renderEntityBodies) {
      this.deps.player.draw(ctx2, this.deps.camera);
    } else {
      this.deps.player.drawEffects(ctx2, this.deps.camera);
    }
    this.deps.background.drawWrapZone(ctx2, this.deps.camera);
  }
  drawEndBackdrop(ctx2, time) {
    this.deps.background.draw(ctx2, this.deps.camera, time);
    this.deps.geometry.draw(ctx2, this.deps.camera, time, this.deps.player.x, this.deps.player.y);
  }
};

// src/world.ts
var GameWorld = class {
  constructor(width, height) {
    this.camera = new Camera(width, height);
    this.player = new Player();
    this.background = new Background();
    this.geometry = new BackgroundGeometry();
    this.spawner = new EnemySpawner();
    this.spawner.setStage(1);
    this.particles = new ParticleSystem();
    this.weaponManager = new WeaponManager();
    this.weaponManager.setOnLaserFire((angle) => this.player.addRipple(angle));
    this.combat = new WorldCombatSystem(this.player, this.spawner, this.particles, this.camera);
    this.motion = new WorldMotionTracker(this.player);
    this.renderer = new WorldRenderer({
      background: this.background,
      camera: this.camera,
      geometry: this.geometry,
      particles: this.particles,
      player: this.player,
      spawner: this.spawner,
      weaponManager: this.weaponManager
    });
  }
  resize(width, height) {
    this.camera.resize(width, height);
  }
  updateTitle(dt) {
    this.motion.sample(this.player, dt);
    this.background.update(dt, this.motion.speed, this.motion.vx, this.motion.vy);
    this.geometry.update(dt);
  }
  updatePlaying(dt, elapsedTime) {
    this.player.update(dt);
    this.player.regenerate(dt);
    this.motion.sample(this.player, dt);
    this.camera.follow(this.player.x, this.player.y);
    this.background.update(dt, this.motion.speed, this.motion.vx, this.motion.vy);
    this.geometry.update(dt);
    this.spawner.update(dt, elapsedTime, this.player.x, this.player.y, this.camera);
    this.combat.applyCollisions();
    this.weaponManager.update(dt, this.player.x, this.player.y, this.spawner.enemies);
    this.player.updateRipples(dt);
    const levelUps = this.combat.consumeDefeatedEnemies();
    this.spawner.removeDead();
    this.particles.update(dt);
    return { levelUps };
  }
  drawTitle(ctx2, time) {
    this.renderer.drawTitle(ctx2, time);
  }
  drawPlayfield(ctx2, time, renderEntityBodies = true) {
    this.renderer.drawPlayfield(ctx2, time, renderEntityBodies);
  }
  drawPausedScene(ctx2, time, renderEntityBodies = true) {
    this.renderer.drawPausedScene(ctx2, time, renderEntityBodies);
  }
  drawEndBackdrop(ctx2, time) {
    this.renderer.drawEndBackdrop(ctx2, time);
  }
  prepareNextStage(stage) {
    this.spawner.setStage(stage);
    this.spawner.clear();
    this.particles.clear();
    this.camera.follow(this.player.x, this.player.y);
    this.motion.reset(this.player);
  }
  triggerLevelUpBlast(levelUps) {
    this.combat.triggerLevelUpBlast(levelUps);
  }
};

// src/three-view.ts
var THREE = __toESM(require_empty_three());
var BASE_CLEAR_COLOR = 461590;
var PLAYER_BASE_RADIUS = 15;
var REDUCED_DETAIL_ENTER_THRESHOLD = 24;
var REDUCED_DETAIL_EXIT_THRESHOLD = 16;
var REDUCED_PIXEL_RATIO_THRESHOLD = 18;
var HEAVY_PIXEL_RATIO_THRESHOLD = 30;
var BASE_RADII = {
  swarmer: 10,
  drifter: 20,
  titan: 40,
  overlord: 55
};
var GEOMETRY = {
  playerShell: new THREE.DodecahedronGeometry(15, 0),
  playerCore: new THREE.IcosahedronGeometry(9, 0),
  playerFin: new THREE.BoxGeometry(5.5, 16, 1.8),
  swarmerThorax: new THREE.DodecahedronGeometry(7.8, 0),
  swarmerAbdomen: new THREE.OctahedronGeometry(6.2, 0),
  swarmerHead: new THREE.OctahedronGeometry(4.1, 0),
  swarmerWing: new THREE.BoxGeometry(8.8, 1.1, 5.8),
  swarmerStinger: new THREE.ConeGeometry(1.8, 6.5, 4),
  swarmerLeg: new THREE.ConeGeometry(1.2, 7, 4),
  drifterMantle: new THREE.IcosahedronGeometry(18, 0),
  drifterCore: new THREE.OctahedronGeometry(6.4, 0),
  drifterTentacle: new THREE.CylinderGeometry(1.2, 2.9, 18, 5),
  drifterFrill: new THREE.ConeGeometry(2.8, 10, 4),
  titanHull: new THREE.IcosahedronGeometry(31, 0),
  titanCrust: new THREE.DodecahedronGeometry(11, 0),
  titanSpire: new THREE.ConeGeometry(5.2, 18, 4),
  titanCore: new THREE.OctahedronGeometry(8.5, 0),
  overlordThorax: new THREE.CylinderGeometry(16, 20, 13, 6),
  overlordAbdomen: new THREE.DodecahedronGeometry(15, 0),
  overlordWing: new THREE.BoxGeometry(10, 25, 3.5),
  overlordHorn: new THREE.ConeGeometry(3.5, 12, 4),
  overlordPod: new THREE.DodecahedronGeometry(5.5, 0),
  overlordCore: new THREE.OctahedronGeometry(9, 0)
};
function makeMaterial(color, emissive = color) {
  return new THREE.MeshLambertMaterial({
    color,
    emissive,
    emissiveIntensity: 0.18,
    flatShading: true
  });
}
function varyMaterial(material, hueShift, lightnessShift) {
  material.color.offsetHSL(hueShift, 0, lightnessShift);
  material.emissive.copy(material.color).multiplyScalar(0.5);
}
function createMesh(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.matrixAutoUpdate = true;
  return mesh;
}
function isMobileLikeViewport() {
  return __win.innerWidth < 900 || __win.matchMedia("(pointer: coarse)").matches;
}
function createEnemyPool() {
  return {
    swarmer: [],
    drifter: [],
    titan: [],
    overlord: []
  };
}
var ThreeEntityRenderer = class {
  constructor(overlayCanvas) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1e3);
    this.enemyVisuals = /* @__PURE__ */ new Map();
    this.enemyPools = {
      full: createEnemyPool(),
      lite: createEnemyPool()
    };
    this.currentDevicePixelRatio = 1;
    this.currentPixelRatio = 1;
    this.detailMode = "full";
    this.width = 1;
    this.height = 1;
    var _a;
    const compactQuality = isMobileLikeViewport();
    this.basePixelRatioCap = compactQuality ? 1.35 : 1.85;
    this.renderer = new THREE.WebGLRenderer({
      antialias: !compactQuality,
      alpha: false,
      powerPreference: "high-performance",
      precision: "mediump",
      stencil: false,
      depth: true
    });
    this.renderer.setClearColor(BASE_CLEAR_COLOR, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.id = "playfield-3d";
    this.renderer.domElement.style.position = "fixed";
    this.renderer.domElement.style.inset = "0";
    this.renderer.domElement.style.width = "100vw";
    this.renderer.domElement.style.height = "100vh";
    this.renderer.domElement.style.zIndex = "0";
    this.renderer.domElement.style.pointerEvents = "none";
    overlayCanvas.style.position = "fixed";
    overlayCanvas.style.inset = "0";
    overlayCanvas.style.zIndex = "1";
    overlayCanvas.style.background = "transparent";
    const parent = (_a = overlayCanvas.parentElement) != null ? _a : __doc.body;
    parent.insertBefore(this.renderer.domElement, overlayCanvas);
    this.scene.add(new THREE.AmbientLight(9086463, 1.1));
    const hemi = new THREE.HemisphereLight(10408191, 1119515, 0.9);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(14741247, 1.9);
    key.position.set(-0.5, 0.8, 1.3);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(16762517, 0.6);
    fill.position.set(0.85, -0.5, 1);
    this.scene.add(fill);
    this.playerVisual = this.createPlayerVisual();
    this.scene.add(this.playerVisual.group);
  }
  resize(width, height, dpr) {
    this.width = width;
    this.height = height;
    this.currentDevicePixelRatio = dpr;
    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.position.set(0, 0, 400);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    this.updatePixelRatio(1);
    this.renderer.setSize(width, height, false);
  }
  render(world, time) {
    var _a;
    this.applyAdaptiveQuality((_a = world == null ? void 0 : world.spawner.enemies.length) != null ? _a : 0);
    if (!world) {
      this.playerVisual.group.visible = false;
      for (const visual of this.enemyVisuals.values()) {
        visual.group.visible = false;
      }
      this.renderer.render(this.scene, this.camera);
      return;
    }
    this.syncPlayer(world, time);
    this.syncEnemies(world, time);
    this.renderer.render(this.scene, this.camera);
  }
  syncPlayer(world, time) {
    const player = world.player;
    const screen = world.camera.worldToScreen(player.x, player.y);
    const root = this.playerVisual.group;
    root.visible = true;
    root.position.set(screen.x - this.width / 2, this.height / 2 - screen.y, 10);
    root.scale.setScalar(player.radius / PLAYER_BASE_RADIUS);
    root.rotation.z = time * 0.18;
    const pulse = 1 + Math.sin(time * 2.8) * 0.08;
    this.playerVisual.core.rotation.y = time * 1.4;
    this.playerVisual.core.rotation.x = time * 0.8;
    this.playerVisual.core.scale.setScalar(pulse);
    for (let i = 0; i < this.playerVisual.fins.length; i++) {
      const fin = this.playerVisual.fins[i];
      fin.rotation.z = i / this.playerVisual.fins.length * Math.PI * 2 + time * 0.42;
      fin.rotation.x = 0.34 + Math.sin(time * 2 + i) * 0.16;
    }
    this.playerVisual.shell.material.emissiveIntensity = 0.18 + player.hurtRatio * 0.65;
    this.playerVisual.core.material.emissiveIntensity = 0.36 + player.hurtRatio * 0.55;
  }
  syncEnemies(world, time) {
    const active = new Set(world.spawner.enemies);
    for (const [enemy, visual] of this.enemyVisuals) {
      if (!active.has(enemy)) {
        this.releaseEnemyVisual(enemy, visual);
      }
    }
    for (const enemy of world.spawner.enemies) {
      let visual = this.enemyVisuals.get(enemy);
      if (!visual) {
        visual = this.acquireEnemyVisual(enemy.type);
        this.enemyVisuals.set(enemy, visual);
      }
      this.updateEnemyVisual(enemy, visual, world, time);
    }
  }
  acquireEnemyVisual(type) {
    const pooled = this.enemyPools[this.detailMode][type].pop();
    if (pooled) {
      pooled.group.visible = true;
      return pooled;
    }
    const visual = this.createEnemyVisual(type, this.detailMode);
    this.scene.add(visual.group);
    return visual;
  }
  releaseEnemyVisual(enemy, visual) {
    visual.group.visible = false;
    this.enemyVisuals.delete(enemy);
    this.enemyPools[visual.detail][visual.type].push(visual);
  }
  updateEnemyVisual(enemy, visual, world, time) {
    const visible = world.camera.isVisible(enemy.x, enemy.y, enemy.radius + 120);
    visual.group.visible = visible;
    if (!visible) return;
    const screen = world.camera.worldToScreen(enemy.x, enemy.y);
    visual.group.position.set(screen.x - this.width / 2, this.height / 2 - screen.y, 0);
    visual.group.scale.setScalar(enemy.radius / BASE_RADII[enemy.type]);
    const seed = visual.seed;
    const bob = Math.sin(time * 1.8 + seed * 6.1) * 2.4;
    const wobble = Math.sin(time * 2.4 + seed * 4.7) * 0.1;
    const chaseRotation = -wrappedAngle(enemy.x, enemy.y, world.player.x, world.player.y) + Math.PI / 2;
    const baseRotation = enemy.type === "swarmer" ? chaseRotation : time * (enemy.type === "drifter" ? 0.56 : enemy.type === "titan" ? 0.22 : 0.3) + seed * Math.PI;
    visual.group.position.z = enemy.type === "overlord" ? 4 + bob * 0.3 : bob;
    visual.group.rotation.z = baseRotation;
    visual.group.rotation.x = enemy.type === "overlord" ? 0.12 : 0.18 + wobble * 0.22;
    visual.group.rotation.y = enemy.type === "titan" ? 0.12 + wobble * 0.18 : wobble * 0.14;
    const lowHealth = 1 - enemy.hp / enemy.maxHp;
    for (const material of visual.materials) {
      material.emissiveIntensity = 0.14 + lowHealth * 0.32;
    }
    const parts = visual.group.userData;
    if (parts.wings) {
      for (let i = 0; i < parts.wings.length; i++) {
        parts.wings[i].rotation.x = 0.32 + Math.sin(time * 8 + seed * 5 + i) * 0.2;
      }
    }
    if (parts.legs) {
      for (let i = 0; i < parts.legs.length; i++) {
        parts.legs[i].rotation.z = parts.legs[i].userData.baseRotation + Math.sin(time * 6 + seed * 7 + i) * 0.18;
      }
    }
    if (parts.tentacles) {
      for (let i = 0; i < parts.tentacles.length; i++) {
        parts.tentacles[i].rotation.z = parts.tentacles[i].userData.baseRotation + Math.sin(time * 3 + seed * 3 + i) * 0.28;
        parts.tentacles[i].rotation.x = 0.26 + Math.sin(time * 2.2 + i + seed) * 0.12;
      }
    }
    if (parts.petals) {
      for (let i = 0; i < parts.petals.length; i++) {
        parts.petals[i].rotation.z = i / parts.petals.length * Math.PI * 2 + time * 0.28 + seed;
        parts.petals[i].rotation.x = 0.62 + Math.sin(time * 1.6 + i + seed) * 0.12;
      }
    }
    if (parts.crown) {
      for (let i = 0; i < parts.crown.length; i++) {
        parts.crown[i].rotation.z = parts.crown[i].userData.baseRotation + time * 0.16;
      }
    }
    if (parts.pods) {
      for (let i = 0; i < parts.pods.length; i++) {
        parts.pods[i].position.y = parts.pods[i].userData.baseY + Math.sin(time * 2 + seed * 4 + i) * 1.8;
      }
    }
    if (parts.core) {
      const pulse = 0.94 + Math.sin(time * 2.4 + seed * 6.3) * 0.09;
      parts.core.scale.setScalar(pulse);
    }
  }
  createPlayerVisual() {
    const root = new THREE.Group();
    const shell = createMesh(GEOMETRY.playerShell, makeMaterial(3108351, 5939455));
    shell.scale.set(1.08, 0.95, 0.8);
    root.add(shell);
    const core = createMesh(GEOMETRY.playerCore, makeMaterial(10476031, 9358335));
    root.add(core);
    const fins = [];
    for (let i = 0; i < 3; i++) {
      const fin = createMesh(GEOMETRY.playerFin, makeMaterial(6200831, 8241407));
      fin.position.set(0, 0, -3.5);
      root.add(fin);
      fins.push(fin);
    }
    return { group: root, shell, core, fins };
  }
  applyAdaptiveQuality(enemyCount) {
    const nextDetailMode = this.detailMode === "full" ? enemyCount >= REDUCED_DETAIL_ENTER_THRESHOLD ? "lite" : "full" : enemyCount <= REDUCED_DETAIL_EXIT_THRESHOLD ? "full" : "lite";
    if (nextDetailMode !== this.detailMode) {
      this.detailMode = nextDetailMode;
      this.recycleActiveEnemyVisuals();
    }
    const pixelRatioScale = enemyCount >= HEAVY_PIXEL_RATIO_THRESHOLD ? 0.62 : enemyCount >= REDUCED_PIXEL_RATIO_THRESHOLD ? 0.8 : 1;
    this.updatePixelRatio(pixelRatioScale);
  }
  updatePixelRatio(scale) {
    const target = Math.min(this.currentDevicePixelRatio, this.basePixelRatioCap * scale);
    if (Math.abs(target - this.currentPixelRatio) < 0.02) return;
    this.currentPixelRatio = target;
    this.renderer.setPixelRatio(target);
    this.renderer.setSize(this.width, this.height, false);
  }
  recycleActiveEnemyVisuals() {
    const activeVisuals = Array.from(this.enemyVisuals.entries());
    this.enemyVisuals.clear();
    for (const [, visual] of activeVisuals) {
      visual.group.visible = false;
      this.enemyPools[visual.detail][visual.type].push(visual);
    }
  }
  createEnemyVisual(type, detail) {
    const seed = Math.random();
    switch (type) {
      case "swarmer":
        return detail === "lite" ? this.createLiteSwarmerVisual(seed) : this.createSwarmerVisual(seed);
      case "drifter":
        return detail === "lite" ? this.createLiteDrifterVisual(seed) : this.createDrifterVisual(seed);
      case "titan":
        return detail === "lite" ? this.createLiteTitanVisual(seed) : this.createTitanVisual(seed);
      case "overlord":
        return detail === "lite" ? this.createLiteOverlordVisual(seed) : this.createOverlordVisual(seed);
    }
  }
  createSwarmerVisual(seed) {
    const root = new THREE.Group();
    const materials = [];
    const thoraxMat = makeMaterial(9325616, 16741447);
    varyMaterial(thoraxMat, (seed - 0.5) * 0.06, (seed - 0.5) * 0.08);
    const thorax = createMesh(GEOMETRY.swarmerThorax, thoraxMat);
    thorax.scale.set(1.12, 0.9, 0.82);
    root.add(thorax);
    materials.push(thoraxMat);
    const abdomenMat = makeMaterial(13206843, 16757327);
    varyMaterial(abdomenMat, (seed - 0.5) * 0.05, 0.04);
    const abdomen = createMesh(GEOMETRY.swarmerAbdomen, abdomenMat);
    abdomen.position.set(0, 8.2, -0.8);
    abdomen.scale.set(0.95, 1.2, 0.82);
    root.add(abdomen);
    materials.push(abdomenMat);
    const headMat = makeMaterial(5321773, 12412758);
    const head = createMesh(GEOMETRY.swarmerHead, headMat);
    head.position.set(0, -8.8, 1.8);
    head.scale.set(0.85, 1.1, 0.85);
    root.add(head);
    materials.push(headMat);
    const wingMat = makeMaterial(13819627, 12900607);
    wingMat.transparent = true;
    wingMat.opacity = 0.76;
    const wings = [];
    for (const side of [-1, 1]) {
      const wing = createMesh(GEOMETRY.swarmerWing, wingMat);
      wing.position.set(side * 8.7, -1.8, 1.8);
      wing.rotation.z = side * 0.5;
      root.add(wing);
      wings.push(wing);
    }
    materials.push(wingMat);
    const legMat = makeMaterial(4007453, 7619899);
    const legs = [];
    for (let i = 0; i < 3; i++) {
      const legAngle = -0.8 + i * 0.8;
      for (const side of [-1, 1]) {
        const leg = createMesh(GEOMETRY.swarmerLeg, legMat);
        leg.position.set(side * (5.5 + i * 1.4), i * 2.5 - 1.5, -2.6);
        leg.rotation.x = 1.1;
        leg.rotation.z = side * (1.1 + legAngle * 0.25);
        leg.userData.baseRotation = leg.rotation.z;
        root.add(leg);
        legs.push(leg);
      }
    }
    materials.push(legMat);
    const stingerMat = makeMaterial(2496021, 9388600);
    const stinger = createMesh(GEOMETRY.swarmerStinger, stingerMat);
    stinger.position.set(0, 15, -0.2);
    stinger.rotation.z = Math.PI;
    root.add(stinger);
    materials.push(stingerMat);
    root.userData = { wings, legs };
    return { type: "swarmer", detail: "full", group: root, materials, seed };
  }
  createDrifterVisual(seed) {
    const root = new THREE.Group();
    const materials = [];
    const mantleMat = makeMaterial(3829093, 6932411);
    varyMaterial(mantleMat, (seed - 0.5) * 0.08, 0.03);
    const mantle = createMesh(GEOMETRY.drifterMantle, mantleMat);
    mantle.scale.set(1.14, 0.84, 0.78);
    root.add(mantle);
    materials.push(mantleMat);
    const coreMat = makeMaterial(11993079, 12124145);
    const core = createMesh(GEOMETRY.drifterCore, coreMat);
    core.position.set(0, -1.5, 5.8);
    root.add(core);
    materials.push(coreMat);
    const frillMat = makeMaterial(6263435, 10348765);
    const petals = [];
    for (let i = 0; i < 5; i++) {
      const frill = createMesh(GEOMETRY.drifterFrill, frillMat);
      frill.position.set(0, 2, -4);
      frill.rotation.x = 0.75;
      root.add(frill);
      petals.push(frill);
    }
    materials.push(frillMat);
    const tentacleMat = makeMaterial(4679007, 8969166);
    const tentacles = [];
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI * 0.82 + i / 5 * Math.PI * 1.64;
      const tentacle = createMesh(GEOMETRY.drifterTentacle, tentacleMat);
      tentacle.position.set(Math.cos(angle) * 10.5, 14 + Math.sin(angle) * 2.4, -3.4);
      tentacle.rotation.z = angle + Math.PI;
      tentacle.rotation.x = 0.25;
      tentacle.userData.baseRotation = tentacle.rotation.z;
      root.add(tentacle);
      tentacles.push(tentacle);
    }
    materials.push(tentacleMat);
    root.userData = { tentacles, petals, core };
    return { type: "drifter", detail: "full", group: root, materials, seed };
  }
  createTitanVisual(seed) {
    const root = new THREE.Group();
    const materials = [];
    const hullMat = makeMaterial(6249074, 11112447);
    varyMaterial(hullMat, (seed - 0.5) * 0.05, (seed - 0.5) * 0.06);
    const hull = createMesh(GEOMETRY.titanHull, hullMat);
    hull.scale.set(1.08, 0.96, 0.88);
    root.add(hull);
    materials.push(hullMat);
    const coreMat = makeMaterial(16247039, 15778559);
    const core = createMesh(GEOMETRY.titanCore, coreMat);
    core.position.set(0, -1, 10);
    root.add(core);
    materials.push(coreMat);
    const spireMat = makeMaterial(4142423, 10125030);
    const petals = [];
    for (let i = 0; i < 7; i++) {
      const spire = createMesh(GEOMETRY.titanSpire, spireMat);
      spire.position.set(0, 0, -7.5);
      spire.rotation.x = 0.56;
      root.add(spire);
      petals.push(spire);
    }
    materials.push(spireMat);
    const crustMat = makeMaterial(7890057, 13017343);
    for (let i = 0; i < 3; i++) {
      const crust = createMesh(GEOMETRY.titanCrust, crustMat);
      crust.position.set((i - 1) * 10, i === 1 ? -8 : 7, 5 - i * 3);
      crust.scale.set(0.65, 0.5, 0.5);
      crust.rotation.set(0.2 * i, 0.3 + i * 0.2, i * 0.4);
      root.add(crust);
    }
    materials.push(crustMat);
    root.userData = { petals, core };
    return { type: "titan", detail: "full", group: root, materials, seed };
  }
  createOverlordVisual(seed) {
    const root = new THREE.Group();
    const materials = [];
    const thoraxMat = makeMaterial(6305322, 14835526);
    varyMaterial(thoraxMat, (seed - 0.5) * 0.03, 0.02);
    const thorax = createMesh(GEOMETRY.overlordThorax, thoraxMat);
    thorax.rotation.z = Math.PI / 6;
    thorax.scale.set(1, 1, 0.7);
    root.add(thorax);
    materials.push(thoraxMat);
    const abdomenMat = makeMaterial(10312752, 16752465);
    const abdomen = createMesh(GEOMETRY.overlordAbdomen, abdomenMat);
    abdomen.position.set(0, 16, -3);
    abdomen.scale.set(1.1, 1.35, 0.75);
    root.add(abdomen);
    materials.push(abdomenMat);
    const coreMat = makeMaterial(16766878, 16759405);
    const core = createMesh(GEOMETRY.overlordCore, coreMat);
    core.position.set(0, -1, 9.2);
    root.add(core);
    materials.push(coreMat);
    const wingMat = makeMaterial(7160117, 12803918);
    const wings = [];
    for (const side of [-1, 1]) {
      const wing = createMesh(GEOMETRY.overlordWing, wingMat);
      wing.position.set(side * 18.5, -1, -1.5);
      wing.rotation.z = side * 0.38;
      wing.rotation.x = 0.32;
      root.add(wing);
      wings.push(wing);
    }
    materials.push(wingMat);
    const hornMat = makeMaterial(2758933, 9255474);
    const crown = [];
    for (let i = 0; i < 5; i++) {
      const horn = createMesh(GEOMETRY.overlordHorn, hornMat);
      horn.position.set(0, -16, 3);
      horn.rotation.x = 0.18;
      horn.userData.baseRotation = i / 5 * Math.PI * 2;
      horn.rotation.z = horn.userData.baseRotation;
      root.add(horn);
      crown.push(horn);
    }
    materials.push(hornMat);
    const podMat = makeMaterial(8273198, 16743248);
    const pods = [];
    for (const side of [-1, 1]) {
      const pod = createMesh(GEOMETRY.overlordPod, podMat);
      pod.position.set(side * 11, 19, 1);
      pod.scale.set(0.75, 1, 0.72);
      pod.userData.baseY = pod.position.y;
      root.add(pod);
      pods.push(pod);
    }
    materials.push(podMat);
    root.userData = { wings, crown, pods, core };
    return { type: "overlord", detail: "full", group: root, materials, seed };
  }
  createLiteSwarmerVisual(seed) {
    const root = new THREE.Group();
    const materials = [];
    const thoraxMat = makeMaterial(9325616, 16741447);
    varyMaterial(thoraxMat, (seed - 0.5) * 0.06, (seed - 0.5) * 0.08);
    const thorax = createMesh(GEOMETRY.swarmerThorax, thoraxMat);
    thorax.scale.set(1.16, 0.92, 0.82);
    root.add(thorax);
    materials.push(thoraxMat);
    const abdomenMat = makeMaterial(13206843, 16757327);
    const abdomen = createMesh(GEOMETRY.swarmerAbdomen, abdomenMat);
    abdomen.position.set(0, 8.4, -0.6);
    abdomen.scale.set(0.92, 1.15, 0.82);
    root.add(abdomen);
    materials.push(abdomenMat);
    const wingMat = makeMaterial(13819627, 12900607);
    wingMat.transparent = true;
    wingMat.opacity = 0.64;
    const wings = [];
    for (const side of [-1, 1]) {
      const wing = createMesh(GEOMETRY.swarmerWing, wingMat);
      wing.position.set(side * 7.6, -0.8, 1.5);
      wing.rotation.z = side * 0.46;
      wing.scale.set(0.82, 0.82, 0.82);
      root.add(wing);
      wings.push(wing);
    }
    materials.push(wingMat);
    root.userData = { wings };
    return { type: "swarmer", detail: "lite", group: root, materials, seed };
  }
  createLiteDrifterVisual(seed) {
    const root = new THREE.Group();
    const materials = [];
    const mantleMat = makeMaterial(3829093, 6932411);
    varyMaterial(mantleMat, (seed - 0.5) * 0.08, 0.03);
    const mantle = createMesh(GEOMETRY.drifterMantle, mantleMat);
    mantle.scale.set(1.08, 0.8, 0.74);
    root.add(mantle);
    materials.push(mantleMat);
    const coreMat = makeMaterial(11993079, 12124145);
    const core = createMesh(GEOMETRY.drifterCore, coreMat);
    core.position.set(0, -1.4, 5.2);
    root.add(core);
    materials.push(coreMat);
    const tentacleMat = makeMaterial(4679007, 8969166);
    const tentacles = [];
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI * 0.72 + i / 2 * Math.PI * 1.44;
      const tentacle = createMesh(GEOMETRY.drifterTentacle, tentacleMat);
      tentacle.position.set(Math.cos(angle) * 9.5, 12.5 + Math.sin(angle) * 1.6, -2.8);
      tentacle.rotation.z = angle + Math.PI;
      tentacle.rotation.x = 0.22;
      tentacle.scale.set(0.9, 0.8, 0.9);
      tentacle.userData.baseRotation = tentacle.rotation.z;
      root.add(tentacle);
      tentacles.push(tentacle);
    }
    materials.push(tentacleMat);
    root.userData = { tentacles, core };
    return { type: "drifter", detail: "lite", group: root, materials, seed };
  }
  createLiteTitanVisual(seed) {
    const root = new THREE.Group();
    const materials = [];
    const hullMat = makeMaterial(6249074, 11112447);
    varyMaterial(hullMat, (seed - 0.5) * 0.05, (seed - 0.5) * 0.06);
    const hull = createMesh(GEOMETRY.titanHull, hullMat);
    hull.scale.set(1.02, 0.9, 0.82);
    root.add(hull);
    materials.push(hullMat);
    const coreMat = makeMaterial(16247039, 15778559);
    const core = createMesh(GEOMETRY.titanCore, coreMat);
    core.position.set(0, -1, 8.6);
    root.add(core);
    materials.push(coreMat);
    const petals = [];
    const spireMat = makeMaterial(4142423, 10125030);
    for (let i = 0; i < 3; i++) {
      const spire = createMesh(GEOMETRY.titanSpire, spireMat);
      spire.position.set(0, 0, -7);
      spire.rotation.x = 0.52;
      spire.scale.set(0.85, 0.85, 0.85);
      root.add(spire);
      petals.push(spire);
    }
    materials.push(spireMat);
    root.userData = { petals, core };
    return { type: "titan", detail: "lite", group: root, materials, seed };
  }
  createLiteOverlordVisual(seed) {
    const root = new THREE.Group();
    const materials = [];
    const thoraxMat = makeMaterial(6305322, 14835526);
    varyMaterial(thoraxMat, (seed - 0.5) * 0.03, 0.02);
    const thorax = createMesh(GEOMETRY.overlordThorax, thoraxMat);
    thorax.rotation.z = Math.PI / 6;
    thorax.scale.set(1, 1, 0.66);
    root.add(thorax);
    materials.push(thoraxMat);
    const abdomenMat = makeMaterial(10312752, 16752465);
    const abdomen = createMesh(GEOMETRY.overlordAbdomen, abdomenMat);
    abdomen.position.set(0, 15, -2.4);
    abdomen.scale.set(1.05, 1.28, 0.72);
    root.add(abdomen);
    materials.push(abdomenMat);
    const coreMat = makeMaterial(16766878, 16759405);
    const core = createMesh(GEOMETRY.overlordCore, coreMat);
    core.position.set(0, -1, 8.8);
    root.add(core);
    materials.push(coreMat);
    const wingMat = makeMaterial(7160117, 12803918);
    const wings = [];
    for (const side of [-1, 1]) {
      const wing = createMesh(GEOMETRY.overlordWing, wingMat);
      wing.position.set(side * 17, 0, -1.2);
      wing.rotation.z = side * 0.34;
      wing.rotation.x = 0.24;
      wing.scale.set(0.9, 0.9, 0.86);
      root.add(wing);
      wings.push(wing);
    }
    materials.push(wingMat);
    root.userData = { wings, core };
    return { type: "overlord", detail: "lite", group: root, materials, seed };
  }
};

// src/runtime.ts
var CLEAR_COLOR = "#0a0a1a";
var GAME_OVER_RESTART_DELAY_MS = 2500;
var GameRuntime = class {
  constructor(canvas2, ctx2) {
    this.canvas = canvas2;
    this.ctx = ctx2;
    this.ui = new UI();
    this.lastFrameTime = 0;
    this.viewportWidth = __win.innerWidth;
    this.viewportHeight = __win.innerHeight;
    this.renderScale = 1;
    this.restartAllowedAt = 0;
    this.handleResize = () => {
      var _a;
      this.resize();
      this.world.resize(this.viewportWidth, this.viewportHeight);
      (_a = this.entityRenderer) == null ? void 0 : _a.resize(this.viewportWidth, this.viewportHeight, this.renderScale);
    };
    this.handleVisibilityChange = () => {
      if (__doc.hidden && this.game.state === "playing" /* PLAYING */) {
        this.game.state = "paused" /* PAUSED */;
      }
    };
    this.handleKeyDown = (event) => {
      if (this.game.state === "levelUp" /* LEVEL_UP */) {
        if (event.key === "1" || event.key === "2" || event.key === "3") {
          this.game.setDraftSelection(Number(event.key) - 1);
        } else if (event.key === "ArrowLeft" || event.key === "a" || event.key === "ArrowUp") {
          event.preventDefault();
          this.game.moveDraftSelection(-1);
        } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "ArrowDown" || event.key === "Tab") {
          event.preventDefault();
          this.game.moveDraftSelection(1);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.game.chooseSelectedDraft(this.world.weaponManager, this.world.player);
        } else if (event.key.toLowerCase() === "r") {
          this.game.rerollDraft(this.world.weaponManager);
        }
        return;
      }
      if (event.key === "Escape") {
        if (this.game.state === "playing" /* PLAYING */) {
          this.game.state = "paused" /* PAUSED */;
          return;
        }
        if (this.game.state === "paused" /* PAUSED */) {
          this.game.state = "playing" /* PLAYING */;
          return;
        }
      }
      if (this.game.state === "title" /* TITLE */) {
        this.game.state = "playing" /* PLAYING */;
        this.restartAllowedAt = 0;
      } else if (this.game.state === "victory" /* VICTORY */ && !event.repeat) {
        this.advanceStage();
      } else if (this.game.state === "gameOver" /* GAME_OVER */ && !event.repeat && this.canRestartGameOver()) {
        this.resetRun("playing" /* PLAYING */);
      }
    };
    this.handlePointerDown = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (this.game.state !== "playing" /* PLAYING */ && this.game.state !== "levelUp" /* LEVEL_UP */) {
        const language = this.ui.getLanguageActionAt(this.canvas, x, y);
        if (language) {
          setLanguage(language);
          return;
        }
      }
      if (this.game.state === "levelUp" /* LEVEL_UP */) {
        const action = this.ui.getLevelUpActionAt(this.canvas, this.game, x, y);
        if (!action) return;
        if (action.type === "choice") {
          this.game.setDraftSelection(action.index);
          this.game.chooseDraft(action.index, this.world.weaponManager, this.world.player);
        } else {
          this.game.rerollDraft(this.world.weaponManager);
        }
        return;
      }
      if (this.game.state === "title" /* TITLE */) {
        this.game.state = "playing" /* PLAYING */;
        this.restartAllowedAt = 0;
      } else if (this.game.state === "victory" /* VICTORY */) {
        this.advanceStage();
      } else if (this.game.state === "gameOver" /* GAME_OVER */ && this.canRestartGameOver()) {
        this.resetRun("playing" /* PLAYING */);
      }
    };
    this.frame = (timestamp) => {
      var _a, _b, _c, _d, _e, _f;
      const dt = Math.min((timestamp - this.lastFrameTime) / 1e3, 0.05);
      this.lastFrameTime = timestamp;
      this.ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
      if (this.entityRenderer) {
        this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);
      } else {
        this.ctx.fillStyle = CLEAR_COLOR;
        this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
      }
      this.handleTapTransitions();
      this.world.camera.updateShake(dt);
      this.ui.trackState(this.game.state, dt);
      switch (this.game.state) {
        case "title" /* TITLE */:
          (_a = this.entityRenderer) == null ? void 0 : _a.render(null, timestamp / 1e3);
          this.world.updateTitle(dt);
          this.world.drawTitle(this.ctx, timestamp / 1e3);
          this.ui.drawTitleScreen(this.ctx, this.canvas);
          break;
        case "playing" /* PLAYING */:
          this.updatePlaying(dt);
          if (this.game.state === "playing" /* PLAYING */) {
            this.renderActiveRun(timestamp / 1e3);
          } else if (this.game.state === "gameOver" /* GAME_OVER */) {
            (_b = this.entityRenderer) == null ? void 0 : _b.render(null, timestamp / 1e3);
            this.world.drawEndBackdrop(this.ctx, timestamp / 1e3);
            this.ui.drawGameOver(
              this.ctx,
              this.canvas,
              this.world.player,
              this.game,
              this.canRestartGameOver(),
              this.getGameOverRestartCountdown()
            );
          } else if (this.game.state === "victory" /* VICTORY */) {
            (_c = this.entityRenderer) == null ? void 0 : _c.render(null, timestamp / 1e3);
            this.world.drawEndBackdrop(this.ctx, timestamp / 1e3);
            this.ui.drawVictory(this.ctx, this.canvas, this.world.player, this.game);
          }
          break;
        case "paused" /* PAUSED */:
          (_d = this.entityRenderer) == null ? void 0 : _d.render(this.world, timestamp / 1e3);
          this.world.drawPausedScene(this.ctx, timestamp / 1e3, !this.entityRenderer);
          this.ui.drawHUD(this.ctx, this.canvas, this.game, this.world.player, this.world.weaponManager);
          this.drawPauseOverlay();
          break;
        case "levelUp" /* LEVEL_UP */:
          this.renderActiveRun(timestamp / 1e3);
          this.ui.drawLevelUpDraft(this.ctx, this.canvas, this.game);
          break;
        case "gameOver" /* GAME_OVER */:
          (_e = this.entityRenderer) == null ? void 0 : _e.render(null, timestamp / 1e3);
          this.world.drawEndBackdrop(this.ctx, timestamp / 1e3);
          this.ui.drawGameOver(
            this.ctx,
            this.canvas,
            this.world.player,
            this.game,
            this.canRestartGameOver(),
            this.getGameOverRestartCountdown()
          );
          break;
        case "victory" /* VICTORY */:
          (_f = this.entityRenderer) == null ? void 0 : _f.render(null, timestamp / 1e3);
          this.world.drawEndBackdrop(this.ctx, timestamp / 1e3);
          this.ui.drawVictory(this.ctx, this.canvas, this.world.player, this.game);
          break;
      }
      requestAnimationFrame(this.frame);
    };
    this.resize();
    this.world = new GameWorld(this.viewportWidth, this.viewportHeight);
    this.game = new Game();
    try {
      this.entityRenderer = new ThreeEntityRenderer(this.canvas);
      this.entityRenderer.resize(this.viewportWidth, this.viewportHeight, this.renderScale);
    } catch (error) {
      console.warn("Three.js entity renderer disabled; falling back to 2D bodies.", error);
    }
    this.bindEvents();
  }
  start() {
    requestAnimationFrame((timestamp) => {
      this.lastFrameTime = timestamp;
      this.frame(timestamp);
    });
  }
  bindEvents() {
    __win.addEventListener("resize", this.handleResize);
    __win.addEventListener("keydown", this.handleKeyDown);
    __doc.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
  }
  updatePlaying(dt) {
    this.game.elapsedTime += dt;
    this.game.totalElapsedTime += dt;
    if (this.game.timeRemaining <= 0) {
      this.game.state = "victory" /* VICTORY */;
      return;
    }
    const result = this.world.updatePlaying(dt, this.game.elapsedTime);
    if (this.world.player.isDead()) {
      this.game.state = "gameOver" /* GAME_OVER */;
      this.restartAllowedAt = performance.now() + GAME_OVER_RESTART_DELAY_MS;
      this.game.updateNotifications(dt);
      return;
    }
    if (result.levelUps > 0) {
      this.world.triggerLevelUpBlast(result.levelUps);
      if (!this.world.weaponManager.allMaxed()) {
        this.game.queueLevelUps(result.levelUps, this.world.weaponManager);
      }
    }
    this.game.updateNotifications(dt);
  }
  renderActiveRun(time) {
    var _a;
    (_a = this.entityRenderer) == null ? void 0 : _a.render(this.world, time);
    this.world.drawPlayfield(this.ctx, time, !this.entityRenderer);
    this.ui.drawVignette(this.ctx, this.viewportWidth, this.viewportHeight, this.world.player.hp / this.world.player.maxHp);
    this.world.particles.drawScreenEffects(this.ctx, this.viewportWidth, this.viewportHeight);
    this.ui.drawHUD(this.ctx, this.canvas, this.game, this.world.player, this.world.weaponManager);
    this.ui.drawNotifications(this.ctx, this.canvas, this.game);
  }
  drawPauseOverlay() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = uiFont(48, "bold");
    this.ctx.textAlign = "center";
    this.ctx.fillText(getUiText("paused"), this.viewportWidth / 2, this.viewportHeight / 2 - 10);
    this.ctx.font = uiFont(18);
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    this.ctx.fillText(getUiText("resumePrompt"), this.viewportWidth / 2, this.viewportHeight / 2 + 30);
    this.ui.drawLanguageSelector(this.ctx, this.canvas);
  }
  handleTapTransitions() {
    if (consumePauseTap()) {
      if (this.game.state === "playing" /* PLAYING */) this.game.state = "paused" /* PAUSED */;
      else if (this.game.state === "paused" /* PAUSED */) this.game.state = "playing" /* PLAYING */;
    }
    if (consumeAnyTap()) {
      if (this.game.state === "title" /* TITLE */) {
        this.game.state = "playing" /* PLAYING */;
        this.restartAllowedAt = 0;
      } else if (this.game.state === "victory" /* VICTORY */) {
        this.advanceStage();
      } else if (this.game.state === "gameOver" /* GAME_OVER */ && this.canRestartGameOver()) {
        this.resetRun("playing" /* PLAYING */);
      }
    }
  }
  resetRun(state) {
    this.world = new GameWorld(this.viewportWidth, this.viewportHeight);
    this.game = new Game();
    this.game.state = state;
    this.restartAllowedAt = 0;
  }
  advanceStage() {
    this.game.advanceStage();
    this.world.prepareNextStage(this.game.stage);
    this.restartAllowedAt = 0;
  }
  canRestartGameOver() {
    return performance.now() >= this.restartAllowedAt;
  }
  getGameOverRestartCountdown() {
    return Math.max(0, (this.restartAllowedAt - performance.now()) / 1e3);
  }
  resize() {
    this.viewportWidth = Math.round(__win.innerWidth);
    this.viewportHeight = Math.round(__win.innerHeight);
    this.renderScale = Math.min(__win.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.viewportWidth * this.renderScale);
    this.canvas.height = Math.round(this.viewportHeight * this.renderScale);
    this.canvas.style.width = `${this.viewportWidth}px`;
    this.canvas.style.height = `${this.viewportHeight}px`;
    this.ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
  }
};

// src/main.ts
var canvas = __doc.getElementById("game");
var ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Universe Eater could not acquire a 2D rendering context.");
}
syncDocumentLanguage();
var runtime = new GameRuntime(canvas, ctx);
runtime.start();
