import { describe, expect, it } from 'vitest';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  TWO_PI,
  clamp,
  circlesOverlap,
  distance,
  easeOutBack,
  formatTime,
  wrapPosition,
  wrappedAngle,
  wrappedDelta,
  wrappedDistance,
} from './utils';

describe('utils - toroidal map', () => {
  it('wrapPosition wraps negative and overflow', () => {
    expect(wrapPosition(-10, -20)).toEqual({ x: MAP_WIDTH - 10, y: MAP_HEIGHT - 20 });
    expect(wrapPosition(MAP_WIDTH + 5, MAP_HEIGHT + 7)).toEqual({ x: 5, y: 7 });
    expect(wrapPosition(MAP_WIDTH / 2, MAP_HEIGHT / 2)).toEqual({ x: 25000, y: 25000 });
  });

  it('wrappedDelta picks shortest path across seam', () => {
    // From near right edge to near left edge should go +20 via wrap, not -49980
    const d = wrappedDelta(MAP_WIDTH - 10, 100, 10, 100);
    expect(d.x).toBe(20);
    expect(d.y).toBe(0);

    const d2 = wrappedDelta(10, 10, MAP_WIDTH - 10, 10);
    expect(d2.x).toBe(-20);
  });

  it('wrappedDistance respects toroidal shortest path', () => {
    // Points on opposite edges are close via wrap
    const dist = wrappedDistance(MAP_WIDTH - 5, 0, 5, 0);
    expect(dist).toBe(10);
    // Same point distance 0
    expect(wrappedDistance(100, 100, 100, 100)).toBe(0);
  });

  it('wrappedAngle complements wrappedDelta', () => {
    const angleEast = wrappedAngle(0, 0, 100, 0);
    expect(angleEast).toBeCloseTo(0);

    const angleWest = wrappedAngle(100, 0, 0, 0);
    // Should be PI (or -PI) via shortest path
    expect(Math.abs(angleWest)).toBeCloseTo(Math.PI);

    // Wrapped angle across seam should still point east (short way +20)
    const wrappedEast = wrappedAngle(MAP_WIDTH - 10, 0, 10, 0);
    expect(wrappedEast).toBeCloseTo(0);
  });

  it('TWO_PI is 2*PI', () => {
    expect(TWO_PI).toBeCloseTo(Math.PI * 2);
  });
});

describe('utils - helpers', () => {
  it('formatTime ceils and pads', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(65.1)).toBe('1:06'); // ceil
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(300)).toBe('5:00');
  });

  it('clamp', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('distance and circlesOverlap', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
    expect(circlesOverlap(0, 0, 10, 5, 0, 10)).toBe(true);
    expect(circlesOverlap(0, 0, 10, 25, 0, 10)).toBe(false);
  });

  it('easeOutBack at boundaries', () => {
    expect(easeOutBack(0)).toBeCloseTo(0);
    expect(easeOutBack(1)).toBeCloseTo(1);
    // Overshoot in middle
    expect(easeOutBack(0.5)).toBeGreaterThan(0.5);
  });
});
