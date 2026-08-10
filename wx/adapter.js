// Browser-like shims for the WeChat Mini Game runtime.
//
// We do NOT try to overwrite the native `document` / `window` globals — newer
// WeChat runtimes expose them as real DOM objects with read-only methods that
// can't be redefined. Instead, the WX build uses esbuild `--define` to rewrite
// identifiers like `document` → `__doc` and `window` → `__win` so the game
// code talks to these shim objects directly.

(function () {
  var systemInfo = wx.getSystemInfoSync();
  var screenWidth = systemInfo.windowWidth;
  var screenHeight = systemInfo.windowHeight;
  var pixelRatio = systemInfo.pixelRatio || 1;

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
    Object.defineProperty(canvas, 'clientWidth', { value: screenWidth, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: screenHeight, configurable: true });
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

  var nav = { maxTouchPoints: 5, userAgent: 'wechat-minigame' };

  function gcs() { return { getPropertyValue: function () { return '0'; } }; }

  // Expose shims on the global so the rewritten bundle can reach them.
  GameGlobal.__doc = doc;
  GameGlobal.__win = win;
  GameGlobal.__nav = nav;
  GameGlobal.__getComputedStyle = gcs;

  // ---- Touch event routing ----
  // input.ts listens on document; runtime.ts listens for 'pointerdown' on canvas.
  function buildTouchEvent(type, e) {
    return {
      type: type,
      changedTouches: e.changedTouches || e.touches || [],
      touches: e.touches || [],
      preventDefault: function () {},
      stopPropagation: function () {},
    };
  }
  function firstTouch(e) { return (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]); }

  wx.onTouchStart(function (e) {
    doc.dispatchEvent(buildTouchEvent('touchstart', e));
    var t = firstTouch(e);
    if (t) canvas.dispatchEvent({
      type: 'pointerdown', clientX: t.clientX, clientY: t.clientY,
      preventDefault: function () {}, stopPropagation: function () {},
    });
  });
  wx.onTouchMove(function (e) { doc.dispatchEvent(buildTouchEvent('touchmove', e)); });
  wx.onTouchEnd(function (e) { doc.dispatchEvent(buildTouchEvent('touchend', e)); });
  wx.onTouchCancel(function (e) { doc.dispatchEvent(buildTouchEvent('touchcancel', e)); });

  // ---- Lifecycle ----
  wx.onHide(function () { doc.hidden = true; doc.dispatchEvent({ type: 'visibilitychange' }); });
  wx.onShow(function () { doc.hidden = false; doc.dispatchEvent({ type: 'visibilitychange' }); });
})();
