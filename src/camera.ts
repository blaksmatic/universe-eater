import { Point } from './utils';

export class Camera {
  x = 0;
  y = 0;
  width: number;
  height: number;

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

  worldToScreen(wx: number, wy: number): Point {
    return { x: wx - this.x, y: wy - this.y };
  }

  isVisible(wx: number, wy: number, margin = 100): boolean {
    const sx = wx - this.x;
    const sy = wy - this.y;
    return sx > -margin && sx < this.width + margin &&
           sy > -margin && sy < this.height + margin;
  }
}
