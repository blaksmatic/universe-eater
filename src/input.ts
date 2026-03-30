const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
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
};

const JOYSTICK_RADIUS = 60;
const DEAD_ZONE = 10;

function isMobile(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isTouchDevice(): boolean {
  return isMobile();
}

function isPauseButton(x: number, y: number): boolean {
  // Top-right corner, 50x50 area with some padding
  return x > window.innerWidth - 70 && y < 70;
}

function handleTouchStart(e: TouchEvent): void {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];

    if (isPauseButton(t.clientX, t.clientY)) {
      touch.pauseTapped = true;
      continue;
    }

    // Use left half of screen for joystick
    if (touch.touchId === -1 && t.clientX < window.innerWidth * 0.6) {
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

export const JOYSTICK_DISPLAY_RADIUS = JOYSTICK_RADIUS;
