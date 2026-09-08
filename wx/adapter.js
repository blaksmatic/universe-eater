// Browser-like shims for the WeChat Mini Game runtime.
//
// We do NOT try to overwrite the native `document` / `window` globals — newer
// WeChat runtimes expose them as real DOM objects with read-only methods that
// can't be redefined. Instead, the WX build uses esbuild `--define` to rewrite
// identifiers like `document` → `__doc` and `window` → `__win` so the game
// code talks to these shim objects directly.

(function () {
  function readWindowInfo() {
    if (typeof wx.getWindowInfo === 'function') return wx.getWindowInfo();
    return wx.getSystemInfoSync();
  }
  var systemInfo = readWindowInfo();
  var screenWidth = systemInfo.windowWidth;
  var screenHeight = systemInfo.windowHeight;
  var pixelRatio = systemInfo.pixelRatio || 1;
  var menuBottom = 0;
  function refreshMenuBounds() {
    menuBottom = 0;
    if (typeof wx.getMenuButtonBoundingClientRect !== 'function') return;
    try {
      var menu = wx.getMenuButtonBoundingClientRect();
      if (menu && menu.height > 0) menuBottom = menu.bottom + 4;
    } catch (_) {}
  }
  refreshMenuBounds();

  var canvas = wx.createCanvas();
  canvas.width = Math.round(screenWidth * pixelRatio);
  canvas.height = Math.round(screenHeight * pixelRatio);

  function makeListenable(target) {
    var listeners = {};
    target.addEventListener = function (type, fn) {
      (listeners[type] || (listeners[type] = [])).push(fn);
    };
    target.removeEventListener = function (type, fn) {
      var arr = listeners[type]; if (!arr) return;
      var i = arr.indexOf(fn); if (i >= 0) arr.splice(i, 1);
    };
    target.dispatchEvent = function (evt) {
      var arr = listeners[evt.type]; if (!arr) return;
      for (var i = 0; i < arr.length; i++) arr[i](evt);
    };
    return target;
  }

  // ---- Canvas augmentation (canvas is its own object — safe to extend) ----
  if (!canvas.style) canvas.style = {};
  try {
    canvas.style.width = screenWidth + 'px';
    canvas.style.height = screenHeight + 'px';
  } catch (_) {}
  // Browser Canvas exposes clientWidth/clientHeight, but wx.createCanvas()
  // does not on some iOS runtimes. UI layout code uses CSS-pixel dimensions,
  // so expose the logical viewport size separately from the backing buffer.
  try {
    Object.defineProperty(canvas, 'clientWidth', { get: function () { return screenWidth; }, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { get: function () { return screenHeight; }, configurable: true });
  } catch (_) {
    canvas.clientWidth = screenWidth;
    canvas.clientHeight = screenHeight;
  }
  canvas.getBoundingClientRect = function () {
    return { left: 0, top: 0, right: screenWidth, bottom: screenHeight, width: screenWidth, height: screenHeight };
  };
  makeListenable(canvas);

  // ---- Shim document ----
  var doc = {
    hidden: false,
    title: '',
    documentElement: { lang: 'zh-CN', style: {} },
    getElementById: function (id) { return id === 'game' ? canvas : null; },
  };
  makeListenable(doc);

  // ---- Shim window ----
  var win = {
    innerWidth: screenWidth,
    innerHeight: screenHeight,
    devicePixelRatio: pixelRatio,
    ontouchstart: null,
    matchMedia: function (query) {
      return { matches: query.indexOf('pointer: coarse') >= 0, media: query,
        addEventListener: function () {}, removeEventListener: function () {} };
    },
    localStorage: {
      getItem: function (key) {
        try { var v = wx.getStorageSync(key); return v === '' ? null : v; } catch (_) { return null; }
      },
      setItem: function (key, value) { try { wx.setStorageSync(key, value); } catch (_) {} },
      removeItem: function (key) { try { wx.removeStorageSync(key); } catch (_) {} },
    },
    performance: GameGlobal.performance || { now: function () { return Date.now(); } },
    requestAnimationFrame: GameGlobal.requestAnimationFrame || function (cb) { return setTimeout(function () { cb(Date.now()); }, 16); },
    cancelAnimationFrame: GameGlobal.cancelAnimationFrame || clearTimeout,
  };
  makeListenable(win);

  var nav = { maxTouchPoints: 5, userAgent: 'wechat-minigame', vibrate: function () {
    if (typeof wx.vibrateShort === 'function') wx.vibrateShort({ type: 'light', fail: function () {} });
    return true;
  } };

  function gcs() { return { getPropertyValue: function (name) {
    var safe = systemInfo.safeArea;
    var screenTop = systemInfo.screenTop || 0;
    var inset = 0;
    if (safe) {
      if (name === '--safe-area-top') inset = safe.top - screenTop;
      if (name === '--safe-area-left') inset = safe.left;
      if (name === '--safe-area-right') inset = screenWidth - safe.right;
      if (name === '--safe-area-bottom') inset = screenHeight - (safe.bottom - screenTop);
    }
    // Keep game controls below WeChat's native menu capsule as well as the notch.
    if (name === '--safe-area-top' && menuBottom) inset = Math.max(inset, menuBottom - screenTop);
    return Math.max(0, inset || 0) + 'px';
  } }; }

  // Reuse the game's procedural WebAudio engine when the native API is available.
  var audioContexts = [];
  if (typeof wx.createWebAudioContext === 'function') {
    win.AudioContext = function () {
      var context = wx.createWebAudioContext();
      audioContexts.push(context);
      return context;
    };
  }

  function suspendAudio() {
    audioContexts.forEach(function (context) {
      try { Promise.resolve(context.suspend()).catch(function () {}); } catch (_) {}
    });
  }
  function resumeAudio() {
    audioContexts.forEach(function (context) {
      try { Promise.resolve(context.resume()).catch(function () {}); } catch (_) {}
    });
  }

  // Expose shims on the global so the rewritten bundle can reach them.
  GameGlobal.__doc = doc;
  GameGlobal.__win = win;
  GameGlobal.__nav = nav;
  GameGlobal.__getComputedStyle = gcs;

  // ---- Touch event routing ----
  // input.ts listens on document; runtime.ts listens for 'pointerdown' on canvas.
  var activeTouches = [];
  function normalizeTouch(t) {
    return {
      identifier: t.identifier,
      clientX: typeof t.clientX === 'number' ? t.clientX : t.x,
      clientY: typeof t.clientY === 'number' ? t.clientY : t.y,
    };
  }
  function buildTouchEvent(type, e) {
    return {
      type: type,
      changedTouches: (e.changedTouches || e.touches || []).map(normalizeTouch),
      touches: (e.touches || []).map(normalizeTouch),
      preventDefault: function () {},
      stopPropagation: function () {},
    };
  }
  function firstTouch(e) { return (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]); }

  wx.onTouchStart(function (e) {
    activeTouches = e.touches || e.changedTouches || [];
    var t = firstTouch(e);
    if (t) canvas.dispatchEvent({
      type: 'pointerdown', pointerType: 'touch', clientX: normalizeTouch(t).clientX, clientY: normalizeTouch(t).clientY,
      preventDefault: function () {}, stopPropagation: function () {},
    });
    // Match browser ordering so menu taps cannot leak into gameplay controls.
    doc.dispatchEvent(buildTouchEvent('touchstart', e));
  });
  wx.onTouchMove(function (e) { activeTouches = e.touches || activeTouches; doc.dispatchEvent(buildTouchEvent('touchmove', e)); });
  wx.onTouchEnd(function (e) { activeTouches = e.touches || []; doc.dispatchEvent(buildTouchEvent('touchend', e)); });
  wx.onTouchCancel(function (e) { activeTouches = e.touches || []; doc.dispatchEvent(buildTouchEvent('touchcancel', e)); });

  function cancelTouches() {
    doc.dispatchEvent(buildTouchEvent('touchcancel', { changedTouches: activeTouches, touches: [] }));
    activeTouches = [];
  }

  if (typeof wx.onWindowResize === 'function') wx.onWindowResize(function (event) {
    cancelTouches();
    systemInfo = readWindowInfo();
    refreshMenuBounds();
    screenWidth = event.windowWidth || systemInfo.windowWidth;
    screenHeight = event.windowHeight || systemInfo.windowHeight;
    win.innerWidth = screenWidth;
    win.innerHeight = screenHeight;
    win.devicePixelRatio = systemInfo.pixelRatio || pixelRatio;
    win.dispatchEvent({ type: 'resize' });
  });

  // ---- Lifecycle ----
  wx.onHide(function () { cancelTouches(); suspendAudio(); doc.hidden = true; doc.dispatchEvent({ type: 'visibilitychange' }); });
  wx.onShow(function () { resumeAudio(); doc.hidden = false; doc.dispatchEvent({ type: 'visibilitychange' }); });
})();
