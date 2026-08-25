import { Point } from './utils';
import { loadSettings } from './storage';

export class Camera {
  x = 0;
  y = 0;
  width: number;
  height: number;

  // Shake state
  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeTimer = 0;
  private shakeOffsetX = 0;
  private shakeOffsetY = 0;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.width = canvasWidth;
    this.height = canvasHeight;
  }

  follow(targetX: number, targetY: number): void {
    this.x = targetX - this.width / 2;
    this.y = targetY - this.height / 2;
  }

  resize(canvasWidth: number, canvasHeight: number): void {
    this.width = canvasWidth;
    this.height = canvasHeight;
  }

  shake(intensity: number, duration: number): void {
    const s = loadSettings();
    if (!s.shakeEnabled || s.reducedMotion) return;
    // Reduced motion halves intensity even if shakeEnabled
    const effectiveIntensity = s.reducedMotion ? intensity * 0.35 : intensity;
    const effectiveDuration = s.reducedMotion ? duration * 0.5 : duration;
    if (effectiveIntensity > this.shakeIntensity) {
      this.shakeIntensity = effectiveIntensity;
      this.shakeDuration = effectiveDuration;
      this.shakeTimer = effectiveDuration;
    }
  }

  updateShake(dt: number): void {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const t = Math.max(0, this.shakeTimer / this.shakeDuration);
      const mag = this.shakeIntensity * t;
      this.shakeOffsetX = (Math.random() * 2 - 1) * mag;
      this.shakeOffsetY = (Math.random() * 2 - 1) * mag;
      if (this.shakeTimer <= 0) {
        this.shakeIntensity = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      }
    }
  }

  worldToScreen(wx: number, wy: number): Point {
    return {
      x: wx - this.x + this.shakeOffsetX,
      y: wy - this.y + this.shakeOffsetY,
    };
  }

  isVisible(wx: number, wy: number, margin = 100): boolean {
    const sx = wx - this.x;
    const sy = wy - this.y;
    return sx > -margin && sx < this.width + margin &&
           sy > -margin && sy < this.height + margin;
  }
}
