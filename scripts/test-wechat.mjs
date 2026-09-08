import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Exercise the shipped adapter and bundle in a browser-free Mini Game runtime.
// Canvas calls are mocked: this checks runtime integration, not visual fidelity
// or real-device GPU performance. Run npm run build:wx before this script.
const adapter = readFileSync(new URL('../wx/adapter.js', import.meta.url), 'utf8');
const bundle = readFileSync(new URL('../wx/bundle.js', import.meta.url), 'utf8');

function boot(legacy = false) {
  let now = 0;
  let nextFrame = 0;
  let draws = 0;
  let info = {
    windowWidth: 390, windowHeight: 844, screenWidth: 390, screenHeight: 844,
    pixelRatio: 3,
    safeArea: { top: 47, left: 0, right: 390, bottom: 810, width: 390, height: 763 },
  };
  const callbacks = {};
  const frames = new Map();
  const storage = new Map();
  const warnings = [];
  const canvases = [];
  const offscreenCanvases = [];
  const audioContexts = [];
  const audioStats = { starts: 0, buffers: 0, suspends: 0, resumes: 0 };
  let offscreenBlits = 0;
  if (legacy) delete info.safeArea;
  const makeCanvas = () => {
    const canvas = { width: 0, height: 0 };
    const gradient = { addColorStop() {} };
    const ctx = new Proxy({
      canvas,
      measureText: text => ({ width: String(text).length * 7 }),
      createLinearGradient: () => gradient,
      createRadialGradient: () => gradient,
      createPattern: () => ({}),
      getLineDash: () => [],
      drawImage: source => {
        assert.ok(source && source.width > 0 && source.height > 0);
        if (offscreenCanvases.includes(source)) offscreenBlits++;
        draws++;
      },
    }, {
      get(target, key) {
        if (key in target) return target[key];
        return (...args) => {
          for (const arg of args) {
            if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `Nonfinite canvas ${String(key)} argument`);
          }
          draws++;
        };
      },
    });
    canvas.getContext = type => type === '2d' ? ctx : null;
    return canvas;
  };
  const wx = {
    getSystemInfoSync: () => ({ ...info, platform: 'ios' }),
    createCanvas: () => { const canvas = makeCanvas(); canvases.push(canvas); return canvas; },
    getStorageSync: key => storage.get(key) ?? '',
    setStorageSync: (key, value) => storage.set(key, value),
    removeStorageSync: key => storage.delete(key),
    vibrateShort() {},
  };
  if (!legacy) {
    wx.getWindowInfo = () => info;
    wx.getMenuButtonBoundingClientRect = () => ({ top: 54, bottom: 86, left: 280, right: 380, width: 100, height: 32 });
    wx.createOffscreenCanvas = ({ type, width, height }) => {
      assert.equal(type, '2d');
      const canvas = makeCanvas();
      canvas.width = width;
      canvas.height = height;
      offscreenCanvases.push(canvas);
      return canvas;
    };
    wx.createWebAudioContext = () => {
      const parameter = () => ({ value: 0, setValueAtTime() {}, setTargetAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
      const node = () => ({
        gain: parameter(), frequency: parameter(), detune: parameter(), Q: parameter(), delayTime: parameter(),
        connect(target) { assert.ok(target); return target; }, disconnect() {},
        start() { audioStats.starts++; }, stop() {},
      });
      const audioContext = {
        state: 'suspended', sampleRate: 44100, destination: {},
        get currentTime() { return now / 1000; },
        createGain: node, createOscillator: node, createBiquadFilter: node, createBufferSource: node, createDelay: node,
        createBuffer(channels, length) {
          audioStats.buffers++;
          const buffers = Array.from({ length: channels }, () => new Float32Array(length));
          return { getChannelData: index => buffers[index] };
        },
        suspend() { this.state = 'suspended'; audioStats.suspends++; return Promise.resolve(); },
        resume() { this.state = 'running'; audioStats.resumes++; return Promise.resolve(); },
      };
      audioContexts.push(audioContext);
      return audioContext;
    };
  }
  for (const event of ['TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel', 'Hide', 'Show', 'WindowResize']) {
    wx[`on${event}`] = callback => { callbacks[event] = callback; };
  }
  const context = vm.createContext({
    wx,
    console: { ...console, warn: (...args) => warnings.push(args.map(String).join(' ')) },
    performance: { now: () => now },
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout: () => 0,
    clearTimeout() {},
    module: { exports: {} },
    exports: {},
  });
  context.GameGlobal = context;
  vm.runInContext(adapter, context, { filename: 'wx/adapter.js' });
  vm.runInContext(bundle, context, { filename: 'wx/bundle.js' });
  const runtime = context.__win.__universeEater;
  assert.ok(runtime, 'Bundle exposes a booted runtime');
  const tick = (count = 1) => {
    for (let i = 0; i < count; i++) {
      now += 1000 / 60;
      const pending = [...frames.values()];
      frames.clear();
      assert.ok(pending.length, 'Game continues scheduling animation frames');
      pending.forEach(callback => callback(now));
    }
  };
  const touch = (event, x, y, identifier = 1, nativeXY = false) => {
    const point = nativeXY ? { identifier, x, y } : { identifier, clientX: x, clientY: y };
    callbacks[event]({ changedTouches: [point], touches: event === 'TouchEnd' || event === 'TouchCancel' ? [] : [point] });
  };
  return {
    context, runtime, tick, touch, callbacks, storage, warnings, canvases, offscreenCanvases, audioContexts, audioStats,
    offscreenBlits: () => offscreenBlits,
    draws: () => draws,
    resize: next => { info = next; if (legacy) delete info.safeArea; callbacks.WindowResize({ windowWidth: next.windowWidth, windowHeight: next.windowHeight }); },
  };
}

for (const legacy of [false, true]) {
  const app = boot(legacy);
  const { context, runtime, tick, touch, callbacks } = app;
  tick(3);
  assert.equal(runtime.game.state, 'title');
  assert.ok(app.draws() > 0, 'Title rendered');
  const style = context.__getComputedStyle(context.__doc.documentElement);
  assert.equal(parseFloat(style.getPropertyValue('--safe-area-top')), legacy ? 0 : 90, 'Top inset also clears native menu capsule');
  assert.equal(parseFloat(style.getPropertyValue('--safe-area-bottom')), legacy ? 0 : 34);
  assert.equal(context.__doc.getElementById('game').clientWidth, 390);
  assert.equal(app.canvases.length, 1, 'Only the visible canvas uses wx.createCanvas');
  const cachedSpriteCount = app.offscreenCanvases.length;
  if (legacy) assert.equal(cachedSpriteCount, 0);
  else assert.ok(cachedSpriteCount > 0, 'Background caches sprites through wx offscreen canvas');

  // Use native x/y coordinates for title and joystick; clientX/Y for buttons.
  touch('TouchStart', 195, 422, 1, true);
  touch('TouchEnd', 195, 422, 1, true);
  tick(35);
  assert.equal(runtime.game.state, 'playing', 'Native touch starts the game');
  assert.equal(app.offscreenCanvases.length, cachedSpriteCount, 'Background sprites are reused across frames');
  if (!legacy) {
    assert.ok(app.offscreenBlits() > 0, 'Cached background sprites are drawn');
    assert.equal(app.audioContexts.length, 1, 'Gesture initializes native WebAudio');
    assert.equal(app.audioContexts[0].state, 'running');
    assert.ok(app.audioStats.buffers > 0 && app.audioStats.starts > 0, 'Native audio synthesizes music and noise buffers');
  }
  const player = runtime.world.player;
  const startX = player.x;
  touch('TouchStart', 100, 600, 2, true);
  touch('TouchMove', 160, 600, 2, true);
  tick(10);
  assert.ok(player.x > startX + 10, 'Native touch joystick moves player');
  const dashY = legacy ? 796 : 762;
  touch('TouchStart', 342, dashY, 3);
  tick();
  assert.ok(player.dashCooldownRatio > 0, 'Touch button triggers dash');
  touch('TouchEnd', 342, dashY, 3);
  touch('TouchCancel', 160, 600, 2, true);
  tick(15);
  const stoppedX = player.x;
  tick(4);
  assert.equal(player.x, stoppedX, 'Touch cancel releases joystick');

  callbacks.Hide();
  assert.equal(context.__doc.hidden, true);
  assert.equal(runtime.game.state, 'paused', 'Backgrounding pauses gameplay');
  if (!legacy) {
    assert.equal(app.audioStats.suspends, 1, 'Backgrounding suspends native audio');
    assert.equal(app.audioContexts[0].state, 'suspended');
  }
  const resumesBeforeShow = app.audioStats.resumes;
  callbacks.Show();
  tick();
  assert.equal(context.__doc.hidden, false);
  assert.equal(runtime.game.state, 'paused', 'Returning does not resume unexpectedly');
  if (!legacy) {
    assert.equal(app.audioStats.resumes, resumesBeforeShow + 1, 'Returning resumes native audio context');
    assert.equal(app.audioContexts[0].state, 'running');
  }
  touch('TouchStart', 5, 422, 4);
  touch('TouchEnd', 5, 422, 4);
  tick();
  assert.equal(runtime.game.state, 'playing');
  const pauseY = legacy ? 41 : 131;
  touch('TouchStart', 349, pauseY, 5);
  touch('TouchEnd', 349, pauseY, 5);
  tick();
  assert.equal(runtime.game.state, 'paused', 'Safe-area pause button works');
  touch('TouchStart', 349, pauseY, 6);
  touch('TouchEnd', 349, pauseY, 6);
  tick();
  assert.equal(runtime.game.state, 'playing', 'Tapping paused HUD resumes once without re-pausing');
  tick(35);
  const cleanResumeX = player.x;
  tick(5);
  assert.equal(player.x, cleanResumeX, 'Menu gesture never becomes a held joystick');
  touch('TouchStart', 100, 600, 7, true);
  touch('TouchMove', 160, 600, 7, true);
  tick(3);
  callbacks.Hide();
  callbacks.Show();
  touch('TouchStart', 5, 422, 8);
  touch('TouchEnd', 5, 422, 8);
  tick(2);
  const interruptedX = player.x;
  tick(5);
  assert.equal(player.x, interruptedX, 'Lifecycle cancellation clears active movement');
  runtime.game.state = 'paused';


  app.resize({
    windowWidth: 844, windowHeight: 390, screenWidth: 844, screenHeight: 390,
    pixelRatio: 3,
    safeArea: { top: 0, left: 47, right: 797, bottom: 369, width: 750, height: 369 },
  });
  tick(2);
  assert.equal(context.__win.innerWidth, 844);
  assert.equal(context.__win.innerHeight, 390);
  const canvas = context.__doc.getElementById('game');
  assert.equal(canvas.clientWidth, 844);
  assert.equal(canvas.getBoundingClientRect().height, 390);
  assert.equal(runtime.viewportWidth, 844, 'Resize reaches game runtime');
  assert.equal(parseFloat(context.__getComputedStyle(context.__doc.documentElement).getPropertyValue('--safe-area-left')), legacy ? 0 : 47);

  const localStorage = context.__win.localStorage;
  assert.equal(localStorage.getItem('smoke'), null);
  localStorage.setItem('smoke', '{"score":123}');
  assert.equal(app.storage.get('smoke'), '{"score":123}');
  assert.equal(localStorage.getItem('smoke'), '{"score":123}');
  localStorage.removeItem('smoke');
  assert.equal(localStorage.getItem('smoke'), null);
  const beforeSettings = app.storage.size;
  runtime.ui.applySettingToggle('soundEnabled');
  assert.ok(app.storage.size > beforeSettings, 'Game settings persist through wx storage');
  assert.ok(app.warnings.every(w => w.includes('Three.js entity renderer disabled')), app.warnings.join('\n'));
  assert.equal(app.canvases.length, 1, 'Offscreen graphics never create another visible canvas');
  console.log(`PASS WeChat ${legacy ? 'legacy getSystemInfoSync / no safe area, audio or offscreen' : 'getWindowInfo / native audio, capsule and offscreen cache'}: boot, render, native touch, dash, cancel, pause, lifecycle, resize, safe area, storage`);
}
