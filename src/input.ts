const keys: Record<string, boolean> = {};

let dashKeyQueued = false;
let dashSuppressUntil = 0;

export function suppressDashFor(ms: number): void {
  dashSuppressUntil = Math.max(dashSuppressUntil, performance.now() + ms);
}

function isLevelUp(): boolean {
  try {
    const r = (window as unknown as { __universeEater?: { game?: { state?: string } } }).__universeEater;
    return r?.game?.state === 'levelUp';
  } catch {
    return false;
  }
}

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (!keys[key]) {
    if (key === ' ' || key === 'shift') {
      if (performance.now() < dashSuppressUntil || isLevelUp()) {
        // Draft confirm etc. — swallow the queued dash
      } else {
        dashKeyQueued = true;
      }
    }
  }
  keys[key] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

export function isKeyDown(key: string): boolean {
  return !!keys[key];
}

// Touch controls
export const touch = {
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
  anyTap: false,
  // Dash button tap
  dashTapped: false,
};

const JOYSTICK_RADIUS = 60;
const DEAD_ZONE = 10;
const TOUCH_UI_MARGIN = 16;
const PAUSE_BUTTON_RADIUS = 25;
const PAUSE_BUTTON_HIT_RADIUS = 34;
const DASH_BUTTON_RADIUS = 32;
const DASH_BUTTON_HIT_RADIUS = 44;

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function isMobile(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isTouchDevice(): boolean {
  return isMobile();
}

function readInset(variableName: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getSafeAreaInsets(): SafeAreaInsets {
  return {
    top: readInset('--safe-area-top'),
    right: readInset('--safe-area-right'),
    bottom: readInset('--safe-area-bottom'),
    left: readInset('--safe-area-left'),
  };
}

export function getTouchUiMargin(): number {
  return TOUCH_UI_MARGIN;
}

export function getPauseButtonLayout(viewportWidth = window.innerWidth): {
  x: number;
  y: number;
  radius: number;
  hitRadius: number;
} {
  const insets = getSafeAreaInsets();
  return {
    x: viewportWidth - insets.right - TOUCH_UI_MARGIN - PAUSE_BUTTON_RADIUS,
    y: insets.top + TOUCH_UI_MARGIN + PAUSE_BUTTON_RADIUS,
    radius: PAUSE_BUTTON_RADIUS,
    hitRadius: PAUSE_BUTTON_HIT_RADIUS,
  };
}

/** Dash button sits above the bottom edge on the right side, thumb-friendly. */
export function getDashButtonLayout(viewportWidth = window.innerWidth, viewportHeight = window.innerHeight): {
  x: number;
  y: number;
  radius: number;
  hitRadius: number;
} {
  const insets = getSafeAreaInsets();
  return {
    x: viewportWidth - insets.right - TOUCH_UI_MARGIN - DASH_BUTTON_RADIUS,
    y: viewportHeight - insets.bottom - TOUCH_UI_MARGIN - DASH_BUTTON_RADIUS,
    radius: DASH_BUTTON_RADIUS,
    hitRadius: DASH_BUTTON_HIT_RADIUS,
  };
}

function isPauseButton(x: number, y: number): boolean {
  const layout = getPauseButtonLayout();
  const dx = x - layout.x;
  const dy = y - layout.y;
  return Math.sqrt(dx * dx + dy * dy) <= layout.hitRadius;
}

function isDashButton(x: number, y: number): boolean {
  const layout = getDashButtonLayout();
  const dx = x - layout.x;
  const dy = y - layout.y;
  return Math.sqrt(dx * dx + dy * dy) <= layout.hitRadius;
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined') return;
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  try {
    nav.vibrate?.(pattern);
  } catch {
    // Vibration API unavailable.
  }
}

function handleTouchStart(e: TouchEvent): void {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];

    if (isPauseButton(t.clientX, t.clientY)) {
      touch.pauseTapped = true;
      continue;
    }

    if (isDashButton(t.clientX, t.clientY)) {
      if (performance.now() < dashSuppressUntil || isLevelUp()) {
        // swallow dash during draft
      } else {
        touch.dashTapped = true;
      }
      vibrate(12);
      continue;
    }

    // Start joystick anywhere (except buttons)
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

function handleTouchMove(e: TouchEvent): void {
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
        touch.dx = (rawDx / dist) * (clamped / JOYSTICK_RADIUS);
        touch.dy = (rawDy / dist) * (clamped / JOYSTICK_RADIUS);
      }
    }
  }
}

function handleTouchEnd(e: TouchEvent): void {
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
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
  document.addEventListener('touchcancel', handleTouchEnd, { passive: false });
}

export function consumePauseTap(): boolean {
  if (touch.pauseTapped) {
    touch.pauseTapped = false;
    return true;
  }
  return false;
}

export function consumeAnyTap(): boolean {
  if (touch.anyTap) {
    touch.anyTap = false;
    return true;
  }
  return false;
}

/**
 * Consume a pending dash request from any source (keyboard or touch).
 * Returns true at most once per physical press.
 */
export function consumeDashRequest(): boolean {
  if (performance.now() < dashSuppressUntil || isLevelUp()) {
    dashKeyQueued = false;
    touch.dashTapped = false;
    return false;
  }
  if (dashKeyQueued) {
    dashKeyQueued = false;
    return true;
  }
  if (touch.dashTapped) {
    touch.dashTapped = false;
    return true;
  }
  return false;
}

export function clearTransientInput(): void {
  dashKeyQueued = false;
  touch.pauseTapped = false;
  touch.anyTap = false;
  touch.dashTapped = false;
}

export function triggerHaptic(pattern: number | number[]): void {
  vibrate(pattern);
}

export const JOYSTICK_DISPLAY_RADIUS = JOYSTICK_RADIUS;
