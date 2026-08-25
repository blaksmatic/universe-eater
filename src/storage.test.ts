import { describe, expect, it, beforeEach } from 'vitest';
import { loadRecords, submitRun } from './storage';

describe('storage - records', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loadRecords returns defaults when empty', () => {
    const r = loadRecords();
    expect(r.bestStage).toBe(1);
    expect(r.bestKills).toBe(0);
    expect(r.runsPlayed).toBe(0);
  });

  it('submitRun increments runsPlayed and sets bests', () => {
    const res1 = submitRun({ stage: 2, kills: 50, level: 5, timeSeconds: 120, combo: 10 });
    expect(res1.newBestStage).toBe(true);
    expect(res1.newBestKills).toBe(true);
    const after1 = loadRecords();
    expect(after1.runsPlayed).toBe(1);
    expect(after1.bestStage).toBe(2);
    expect(after1.bestKills).toBe(50);

    const res2 = submitRun({ stage: 1, kills: 10, level: 2, timeSeconds: 30, combo: 3 });
    expect(res2.newBestStage).toBe(false);
    expect(res2.newBestKills).toBe(false);
    const after2 = loadRecords();
    expect(after2.runsPlayed).toBe(2);
    expect(after2.bestStage).toBe(2); // retains max
  });

  it('bestTime is max timeSeconds', () => {
    submitRun({ stage: 1, kills: 0, level: 1, timeSeconds: 100, combo: 0 });
    submitRun({ stage: 1, kills: 0, level: 1, timeSeconds: 80, combo: 0 });
    expect(loadRecords().bestTimeSeconds).toBe(100);
  });
});
