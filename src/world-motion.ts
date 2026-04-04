import { Player } from './player';

export class WorldMotionTracker {
  private prevPlayerX: number;
  private prevPlayerY: number;
  private playerSpeed = 0;
  private playerVx = 0;
  private playerVy = 0;

  constructor(player: Player) {
    this.prevPlayerX = player.x;
    this.prevPlayerY = player.y;
  }

  get speed(): number {
    return this.playerSpeed;
  }

  get vx(): number {
    return this.playerVx;
  }

  get vy(): number {
    return this.playerVy;
  }

  sample(player: Player, dt: number): void {
    if (dt > 0) {
      const dx = player.x - this.prevPlayerX;
      const dy = player.y - this.prevPlayerY;
      this.playerVx = dx / dt;
      this.playerVy = dy / dt;
      this.playerSpeed = Math.sqrt(this.playerVx * this.playerVx + this.playerVy * this.playerVy);
    }

    this.prevPlayerX = player.x;
    this.prevPlayerY = player.y;
  }

  reset(player: Player): void {
    this.prevPlayerX = player.x;
    this.prevPlayerY = player.y;
    this.playerSpeed = 0;
    this.playerVx = 0;
    this.playerVy = 0;
  }
}
