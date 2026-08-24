import { loadSettings, saveSettings } from './storage';

type Ctor<T> = new (...args: never[]) => T;

/**
 * Procedural audio engine — pure WebAudio synthesis, no asset files.
 * Safe to import in non-browser environments (WeChat adapter): every
 * capability is feature-detected and the engine degrades to a no-op.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private musicStarted = false;
  private nextArpTime = 0;
  private arpStep = 0;
  private padNodes: { osc: OscillatorNode; lfo: OscillatorNode }[] = [];

  private lastPlayed: Record<string, number> = {};
  private settings = loadSettings();
  /** 0 = exploration, 1 = boss fight (faster arps + bass pulse). */
  intensity = 0;

  get soundEnabled(): boolean {
    return this.settings.soundEnabled;
  }

  get musicEnabled(): boolean {
    return this.settings.musicEnabled;
  }

  setSoundEnabled(enabled: boolean): void {
    this.settings.soundEnabled = enabled;
    saveSettings(this.settings);
    this.syncGains();
  }

  setMusicEnabled(enabled: boolean): void {
    this.settings.musicEnabled = enabled;
    saveSettings(this.settings);
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    this.syncGains();
  }

  /** Must be called from a user gesture at least once before any sound. */
  unlock(): void {
    const Ctx = this.resolveContextCtor();
    if (!Ctx) return;
    if (!this.ctx) {
      try {
        this.ctx = new Ctx();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.9;
        this.master.connect(this.ctx.destination);

        this.sfxBus = this.ctx.createGain();
        this.sfxBus.gain.value = this.settings.soundEnabled ? 1 : 0;
        this.sfxBus.connect(this.master);

        this.musicBus = this.ctx.createGain();
        this.musicBus.gain.value = this.settings.musicEnabled ? 0.16 : 0;
        this.musicBus.connect(this.master);

        const len = Math.floor(this.ctx.sampleRate * 0.5);
        this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < len; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      } catch {
        this.ctx = null;
        return;
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    if (this.settings.musicEnabled) {
      this.startMusic();
    }
  }

  private resolveContextCtor(): AudioContextCtor | null {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
    return w.AudioContext ?? w.webkitAudioContext ?? null;
  }

  private syncGains(): void {
    if (!this.sfxBus || !this.musicBus || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.sfxBus.gain.setTargetAtTime(this.settings.soundEnabled ? 1 : 0, t, 0.02);
    this.musicBus.gain.setTargetAtTime(this.settings.musicEnabled ? 0.16 : 0, t, 0.08);
  }

  private throttle(key: string, minIntervalMs: number): boolean {
    const now = performance.now();
    const last = this.lastPlayed[key] ?? 0;
    if (now - last < minIntervalMs) return false;
    this.lastPlayed[key] = now;
    return true;
  }

  private tone(opts: {
    type: OscillatorType;
    freqStart: number;
    freqEnd?: number;
    duration: number;
    volume: number;
    delay?: number;
    filterFreq?: number;
  }): void {
    if (!this.ctx || !this.sfxBus || !this.settings.soundEnabled) return;
    const start = this.ctx.currentTime + (opts.delay ?? 0);
    const osc = this.ctx.createOscillator();
    osc.type = opts.type;
    osc.frequency.setValueAtTime(opts.freqStart, start);
    if (opts.freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.freqEnd), start + opts.duration);
    }
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(opts.volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);

    let tail: AudioNode = gain;
    if (opts.filterFreq) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = opts.filterFreq;
      gain.connect(filter);
      tail = filter;
    }
    osc.connect(gain);
    tail.connect(this.sfxBus);
    osc.start(start);
    osc.stop(start + opts.duration + 0.05);
  }

  private noise(opts: {
    duration: number;
    volume: number;
    filterType: BiquadFilterType;
    freqStart: number;
    freqEnd?: number;
    delay?: number;
  }): void {
    if (!this.ctx || !this.sfxBus || !this.noiseBuffer || !this.settings.soundEnabled) return;
    const start = this.ctx.currentTime + (opts.delay ?? 0);
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = opts.filterType;
    filter.frequency.setValueAtTime(opts.freqStart, start);
    if (opts.freqEnd !== undefined) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd), start + opts.duration);
    }
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(opts.volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + opts.duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxBus);
    src.start(start);
    src.stop(start + opts.duration + 0.05);
  }

  // ── SFX library ─────────────────────────────────────────────

  playShoot(): void {
    if (!this.throttle('shoot', 70)) return;
    this.tone({ type: 'square', freqStart: 920, freqEnd: 240, duration: 0.07, volume: 0.05 });
  }

  playMissile(): void {
    if (!this.throttle('missile', 90)) return;
    this.noise({ duration: 0.22, volume: 0.06, filterType: 'bandpass', freqStart: 500, freqEnd: 1600 });
  }

  playExplosion(size = 1): void {
    if (!this.throttle('explosion', 60)) return;
    const vol = Math.min(0.32, 0.12 * size);
    this.noise({ duration: 0.28 + size * 0.1, volume: vol, filterType: 'lowpass', freqStart: 900, freqEnd: 120 });
    this.tone({ type: 'sine', freqStart: 120 * size, freqEnd: 40, duration: 0.25, volume: vol * 0.7 });
  }

  playCrit(): void {
    if (!this.throttle('crit', 120)) return;
    this.tone({ type: 'triangle', freqStart: 1400, freqEnd: 2100, duration: 0.09, volume: 0.09 });
  }

  playPlayerHurt(): void {
    if (!this.throttle('hurt', 150)) return;
    this.tone({ type: 'sawtooth', freqStart: 220, freqEnd: 70, duration: 0.2, volume: 0.14 });
  }

  playDash(): void {
    this.noise({ duration: 0.18, volume: 0.12, filterType: 'highpass', freqStart: 300, freqEnd: 2400 });
  }

  playLevelUp(): void {
    const notes = [523, 659, 784, 1046];
    for (let i = 0; i < notes.length; i++) {
      this.tone({ type: 'square', freqStart: notes[i], duration: 0.12, volume: 0.07, delay: i * 0.08 });
    }
  }

  playPickup(): void {
    if (!this.throttle('pickup', 80)) return;
    this.tone({ type: 'sine', freqStart: 1250, freqEnd: 1900, duration: 0.06, volume: 0.04 });
  }

  playComboMilestone(combo: number): void {
    const base = 600 + Math.min(600, combo * 10);
    this.tone({ type: 'triangle', freqStart: base, freqEnd: base * 1.4, duration: 0.12, volume: 0.08 });
  }

  playBossWarning(): void {
    for (let i = 0; i < 3; i++) {
      this.tone({ type: 'sawtooth', freqStart: 320, freqEnd: 250, duration: 0.3, volume: 0.13, delay: i * 0.45, filterFreq: 900 });
      this.tone({ type: 'sawtooth', freqStart: 242, freqEnd: 190, duration: 0.3, volume: 0.11, delay: i * 0.45 + 0.15, filterFreq: 900 });
    }
  }

  playBossPhase(): void {
    this.tone({ type: 'sawtooth', freqStart: 180, freqEnd: 420, duration: 0.35, volume: 0.12 });
    this.noise({ duration: 0.3, volume: 0.1, filterType: 'lowpass', freqStart: 600, freqEnd: 200 });
  }

  playBossDeath(): void {
    for (let i = 0; i < 4; i++) {
      this.noise({ duration: 0.5, volume: 0.2, filterType: 'lowpass', freqStart: 800 - i * 120, freqEnd: 80, delay: i * 0.16 });
    }
    this.tone({ type: 'sine', freqStart: 300, freqEnd: 30, duration: 1.2, volume: 0.2, delay: 0.1 });
  }

  playVictoryFanfare(): void {
    const notes = [392, 523, 659, 784, 1046];
    for (let i = 0; i < notes.length; i++) {
      this.tone({ type: 'triangle', freqStart: notes[i], duration: 0.22, volume: 0.09, delay: i * 0.11 });
    }
  }

  playGameOverSting(): void {
    const notes = [330, 262, 208, 156];
    for (let i = 0; i < notes.length; i++) {
      this.tone({ type: 'sawtooth', freqStart: notes[i], freqEnd: notes[i] * 0.94, duration: 0.34, volume: 0.09, delay: i * 0.19, filterFreq: 1100 });
    }
  }

  playUiClick(): void {
    this.tone({ type: 'sine', freqStart: 660, duration: 0.05, volume: 0.05 });
  }

  // ── Ambient music ───────────────────────────────────────────

  private startMusic(): void {
    if (!this.ctx || !this.musicBus || this.musicStarted) return;
    this.musicStarted = true;

    // Detuned drone pad (A1 + E2)
    for (const [freq, detune] of [[55, -4], [82.4, 5]] as const) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 220;
      filter.Q.value = 0.8;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.06 + Math.random() * 0.05;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 90;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const padGain = this.ctx.createGain();
      padGain.gain.value = 0.05;
      osc.connect(filter);
      filter.connect(padGain);
      padGain.connect(this.musicBus);
      osc.start();
      lfo.start();
      this.padNodes.push({ osc, lfo });
    }

    this.nextArpTime = this.ctx.currentTime + 0.1;
  }

  private stopMusic(): void {
    for (const node of this.padNodes) {
      try {
        node.osc.stop();
        node.lfo.stop();
      } catch {
        // Already stopped.
      }
    }
    this.padNodes = [];
    this.musicStarted = false;
  }

  /** Call every frame; schedules arpeggio notes slightly ahead of time. */
  updateMusic(): void {
    if (!this.ctx || !this.musicBus || !this.musicStarted || !this.settings.musicEnabled) return;
    const PENTATONIC = [220, 261.6, 293.7, 329.6, 392, 440, 523.2];
    const BASS = [55, 55, 65.4, 73.4];
    const lookahead = 0.25;
    const boss = this.intensity >= 1;
    const stepDur = boss ? 0.185 : 0.24;
    const noteChance = boss ? 0.85 : 0.72;

    while (this.nextArpTime < this.ctx.currentTime + lookahead) {
      if (boss && this.arpStep % 8 === 0) {
        // Driving bass pulse under boss fights.
        const bassOsc = this.ctx.createOscillator();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.value = BASS[Math.floor(this.arpStep / 8) % BASS.length];
        const bassGain = this.ctx.createGain();
        bassGain.gain.setValueAtTime(0, this.nextArpTime);
        bassGain.gain.linearRampToValueAtTime(0.09, this.nextArpTime + 0.02);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, this.nextArpTime + stepDur * 6);
        const bassFilter = this.ctx.createBiquadFilter();
        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 260;
        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.musicBus);
        bassOsc.start(this.nextArpTime);
        bassOsc.stop(this.nextArpTime + stepDur * 7);
      }

      if (Math.random() < noteChance) {
        const octave = Math.random() < (boss ? 0.45 : 0.3) ? 2 : 1;
        const note = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)] * octave;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = note;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, this.nextArpTime);
        gain.gain.linearRampToValueAtTime(boss ? 0.065 : 0.055, this.nextArpTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.nextArpTime + stepDur * 1.8);

        const echoDelay = this.ctx.createDelay(1);
        echoDelay.delayTime.value = stepDur * 3;
        const echoGain = this.ctx.createGain();
        echoGain.gain.value = 0.28;

        osc.connect(gain);
        gain.connect(this.musicBus);
        gain.connect(echoDelay);
        echoDelay.connect(echoGain);
        echoGain.connect(echoDelay);
        echoGain.connect(this.musicBus);

        osc.start(this.nextArpTime);
        osc.stop(this.nextArpTime + stepDur * 2);
      }
      this.nextArpTime += stepDur;
      this.arpStep++;
    }
  }
}

type AudioContextCtor = Ctor<AudioContext>;

export const audio = new AudioEngine();
