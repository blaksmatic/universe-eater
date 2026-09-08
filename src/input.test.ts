import { beforeEach, describe, expect, it } from 'vitest';
import { clearTransientInput, consumeDashRequest, consumeMenuTouch, isKeyDown, releaseAllInput, touch } from './input';

function sendTouch(type: string, points: { identifier: number; clientX: number; clientY: number }[]) {
  const event = new Event(type, { cancelable: true });
  Object.defineProperty(event, 'changedTouches', { value: points });
  document.dispatchEvent(event);
}
const point = (identifier: number, clientX: number, clientY: number) => ({ identifier, clientX, clientY });

beforeEach(() => {
  releaseAllInput();
  (window as unknown as { __universeEater: unknown }).__universeEater = { game: { state: 'playing' } };
});

describe('interruption-safe controls', () => {
  it('releases held keys and queued dash when focus is lost', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(isKeyDown('d')).toBe(true);
    window.dispatchEvent(new Event('blur'));
    expect(isKeyDown('d')).toBe(false);
    expect(consumeDashRequest()).toBe(false);
  });

  it('does not turn a repeated held confirm key into a fresh dash', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true }));
    expect(consumeDashRequest()).toBe(false);
  });

  it('keeps joystick ownership when another finger lifts', () => {
    sendTouch('touchstart', [point(1, 100, 300)]);
    sendTouch('touchmove', [point(1, 160, 300)]);
    expect(touch.dx).toBe(1);
    sendTouch('touchstart', [point(2, 300, 300)]);
    sendTouch('touchend', [point(2, 300, 300)]);
    expect(touch.touchId).toBe(1);
    expect(touch.dx).toBe(1);
    sendTouch('touchend', [point(1, 160, 300)]);
    expect(touch.active).toBe(false);
  });

  it('consumes a menu gesture without creating a joystick after returning to play', () => {
    consumeMenuTouch();
    sendTouch('touchstart', [point(1, 100, 300)]);
    sendTouch('touchmove', [point(1, 160, 300)]);
    expect(touch.active).toBe(false);
    sendTouch('touchstart', [point(2, 100, 300)]);
    expect(touch.active).toBe(true);
  });

  it('releases obsolete joystick coordinates on resize and clears pending taps', () => {
    sendTouch('touchstart', [point(1, 100, 300)]);
    sendTouch('touchmove', [point(1, 160, 300)]);
    touch.dashTapped = true;
    window.dispatchEvent(new Event('resize'));
    expect(touch.dx).toBe(0);
    expect(touch.touchId).toBe(-1);
    expect(consumeDashRequest()).toBe(false);
  });

  it('never starts movement behind a paused menu', () => {
    (window as unknown as { __universeEater: unknown }).__universeEater = { game: { state: 'paused' } };
    sendTouch('touchstart', [point(1, 100, 300)]);
    expect(touch.active).toBe(false);
    clearTransientInput();
  });
});
