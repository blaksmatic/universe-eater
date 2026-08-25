export type ParticleQuality = 'high' | 'medium' | 'low';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  shakeEnabled: boolean;
  damageNumbersEnabled: boolean;
  particleQuality: ParticleQuality;
  reducedMotion: boolean;
}

export interface RunRecord {
  stage: number;
  kills: number;
  level: number;
  timeSeconds: number;
  combo: number;
}

export interface PersistentRecords {
  bestStage: number;
  bestKills: number;
  bestLevel: number;
  bestTimeSeconds: number;
  bestCombo: number;
  runsPlayed: number;
}

export interface RecordUpdateResult {
  newBestStage: boolean;
  newBestKills: boolean;
  newBestLevel: boolean;
  newBestTime: boolean;
  newBestCombo: boolean;
}

const SETTINGS_KEY = 'universe-eater.settings.v1';
const RECORDS_KEY = 'universe-eater.records.v1';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  shakeEnabled: true,
  damageNumbersEnabled: true,
  particleQuality: 'high',
  reducedMotion: false,
};

const DEFAULT_RECORDS: PersistentRecords = {
  bestStage: 1,
  bestKills: 0,
  bestLevel: 1,
  bestTimeSeconds: 0,
  bestCombo: 0,
  runsPlayed: 0,
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string): Partial<T> | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<T>;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode); settings stay session-only.
  }
}

let settingsCache: GameSettings | null = null;

/** Returns the live settings object; mutate it and call saveSettings(). */
export function loadSettings(): GameSettings {
  if (!settingsCache) {
    const stored = readJson<GameSettings>(SETTINGS_KEY);
    const merged = { ...DEFAULT_SETTINGS, ...stored } as GameSettings;
    // First-visit accessibility: honour OS prefers-reduced-motion if not explicitly stored.
    if (stored?.reducedMotion === undefined && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          merged.reducedMotion = true;
          merged.shakeEnabled = false;
          if (merged.particleQuality === 'high') merged.particleQuality = 'medium';
        }
      } catch {
        // ignore
      }
    }
    // Migrate old saves that lack new keys
    if ((merged as unknown as { particleQuality?: unknown }).particleQuality === undefined) merged.particleQuality = 'high';
    if ((merged as unknown as { reducedMotion?: unknown }).reducedMotion === undefined) merged.reducedMotion = false;
    settingsCache = merged;
  }
  return settingsCache;
}

export function saveSettings(settings: GameSettings): void {
  settingsCache = settings;
  writeJson(SETTINGS_KEY, settings);
}

export function loadRecords(): PersistentRecords {
  const stored = readJson<PersistentRecords>(RECORDS_KEY);
  return { ...DEFAULT_RECORDS, ...stored };
}

/**
 * Merge a finished run into the persistent records.
 * Returns which fields set new personal bests.
 */
export function submitRun(record: RunRecord): RecordUpdateResult {
  const records = loadRecords();
  const result: RecordUpdateResult = {
    newBestStage: record.stage > records.bestStage,
    newBestKills: record.kills > records.bestKills,
    newBestLevel: record.level > records.bestLevel,
    newBestTime: record.timeSeconds > records.bestTimeSeconds,
    newBestCombo: record.combo > records.bestCombo,
  };

  const next: PersistentRecords = {
    bestStage: Math.max(records.bestStage, record.stage),
    bestKills: Math.max(records.bestKills, record.kills),
    bestLevel: Math.max(records.bestLevel, record.level),
    bestTimeSeconds: Math.max(records.bestTimeSeconds, record.timeSeconds),
    bestCombo: Math.max(records.bestCombo, record.combo),
    runsPlayed: records.runsPlayed + 1,
  };
  writeJson(RECORDS_KEY, next);
  return result;
}
