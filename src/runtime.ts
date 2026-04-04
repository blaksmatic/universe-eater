import { Game, GameState } from './game';
import { UI } from './ui';
import { consumeAnyTap, consumePauseTap } from './input';
import { GameWorld } from './world';

const CLEAR_COLOR = '#0a0a1a';
const GAME_OVER_RESTART_DELAY_MS = 2500;

export class GameRuntime {
  private readonly ui = new UI();
  private world: GameWorld;
  private game: Game;
  private lastFrameTime = 0;
  private viewportWidth = window.innerWidth;
  private viewportHeight = window.innerHeight;
  private renderScale = 1;
  private restartAllowedAt = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
  ) {
    this.resize();
    this.world = new GameWorld(this.viewportWidth, this.viewportHeight);
    this.game = new Game();
    this.bindEvents();
  }

  start(): void {
    requestAnimationFrame((timestamp) => {
      this.lastFrameTime = timestamp;
      this.frame(timestamp);
    });
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
  }

  private handleResize = (): void => {
    this.resize();
    this.world.resize(this.viewportWidth, this.viewportHeight);
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden && this.game.state === GameState.PLAYING) {
      this.game.state = GameState.PAUSED;
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.game.state === GameState.LEVEL_UP) {
      if (event.key === '1' || event.key === '2' || event.key === '3') {
        this.game.setDraftSelection(Number(event.key) - 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.game.moveDraftSelection(-1);
      } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'ArrowDown' || event.key === 'Tab') {
        event.preventDefault();
        this.game.moveDraftSelection(1);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.game.chooseSelectedDraft(this.world.weaponManager, this.world.player);
      } else if (event.key.toLowerCase() === 'r') {
        this.game.rerollDraft(this.world.weaponManager);
      }
      return;
    }

    if (event.key === 'Escape') {
      if (this.game.state === GameState.PLAYING) {
        this.game.state = GameState.PAUSED;
        return;
      }
      if (this.game.state === GameState.PAUSED) {
        this.game.state = GameState.PLAYING;
        return;
      }
    }

    if (this.game.state === GameState.TITLE) {
      this.game.state = GameState.PLAYING;
      this.restartAllowedAt = 0;
    } else if (this.game.state === GameState.VICTORY && !event.repeat) {
      this.resetRun(GameState.PLAYING);
    } else if (this.game.state === GameState.GAME_OVER && !event.repeat && this.canRestartGameOver()) {
      this.resetRun(GameState.PLAYING);
    }
  };

  private handlePointerDown = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.game.state === GameState.LEVEL_UP) {
      const action = this.ui.getLevelUpActionAt(this.canvas, this.game, x, y);
      if (!action) return;
      if (action.type === 'choice') {
        this.game.setDraftSelection(action.index);
        this.game.chooseDraft(action.index, this.world.weaponManager, this.world.player);
      } else {
        this.game.rerollDraft(this.world.weaponManager);
      }
      return;
    }

    if (this.game.state === GameState.TITLE) {
      this.game.state = GameState.PLAYING;
      this.restartAllowedAt = 0;
    } else if (this.game.state === GameState.VICTORY) {
      this.resetRun(GameState.PLAYING);
    } else if (this.game.state === GameState.GAME_OVER && this.canRestartGameOver()) {
      this.resetRun(GameState.PLAYING);
    }
  };

  private frame = (timestamp: number): void => {
    const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = timestamp;

    this.ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
    this.ctx.fillStyle = CLEAR_COLOR;
    this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

    this.handleTapTransitions();
    this.world.camera.updateShake(dt);
    this.ui.trackState(this.game.state, dt);

    switch (this.game.state) {
      case GameState.TITLE:
        this.world.updateTitle(dt);
        this.world.drawTitle(this.ctx, timestamp / 1000);
        this.ui.drawTitleScreen(this.ctx, this.canvas);
        break;
      case GameState.PLAYING:
        this.updatePlaying(dt);
        if (this.game.state === GameState.PLAYING) {
          this.renderActiveRun(timestamp / 1000);
        } else if (this.game.state === GameState.GAME_OVER) {
          this.world.drawEndBackdrop(this.ctx, timestamp / 1000);
          this.ui.drawGameOver(
            this.ctx,
            this.canvas,
            this.world.player,
            this.game,
            this.canRestartGameOver(),
            this.getGameOverRestartCountdown(),
          );
        } else if (this.game.state === GameState.VICTORY) {
          this.world.drawEndBackdrop(this.ctx, timestamp / 1000);
          this.ui.drawVictory(this.ctx, this.canvas, this.world.player);
        }
        break;
      case GameState.PAUSED:
        this.world.drawPausedScene(this.ctx, timestamp / 1000);
        this.ui.drawHUD(this.ctx, this.canvas, this.game, this.world.player, this.world.weaponManager);
        this.drawPauseOverlay();
        break;
      case GameState.LEVEL_UP:
        this.renderActiveRun(timestamp / 1000);
        this.ui.drawLevelUpDraft(this.ctx, this.canvas, this.game);
        break;
      case GameState.GAME_OVER:
        this.world.drawEndBackdrop(this.ctx, timestamp / 1000);
        this.ui.drawGameOver(
          this.ctx,
          this.canvas,
          this.world.player,
          this.game,
          this.canRestartGameOver(),
          this.getGameOverRestartCountdown(),
        );
        break;
      case GameState.VICTORY:
        this.world.drawEndBackdrop(this.ctx, timestamp / 1000);
        this.ui.drawVictory(this.ctx, this.canvas, this.world.player);
        break;
    }

    requestAnimationFrame(this.frame);
  };

  private updatePlaying(dt: number): void {
    this.game.elapsedTime += dt;
    if (this.game.timeRemaining <= 0) {
      this.game.state = GameState.VICTORY;
      return;
    }

    const result = this.world.updatePlaying(dt, this.game.elapsedTime);
    if (this.world.player.isDead()) {
      this.game.state = GameState.GAME_OVER;
      this.restartAllowedAt = performance.now() + GAME_OVER_RESTART_DELAY_MS;
      this.game.updateNotifications(dt);
      return;
    }

    if (result.levelUps > 0) {
      this.world.triggerLevelUpBlast(result.levelUps);
      if (!this.world.weaponManager.allMaxed()) {
        this.game.queueLevelUps(result.levelUps, this.world.weaponManager);
      }
    }

    this.game.updateNotifications(dt);
  }

  private renderActiveRun(time: number): void {
    this.world.drawPlayfield(this.ctx, time);
    this.ui.drawVignette(this.ctx, this.viewportWidth, this.viewportHeight, this.world.player.hp / this.world.player.maxHp);
    this.world.particles.drawScreenEffects(this.ctx, this.viewportWidth, this.viewportHeight);
    this.ui.drawHUD(this.ctx, this.canvas, this.game, this.world.player, this.world.weaponManager);
    this.ui.drawNotifications(this.ctx, this.canvas, this.game);
  }

  private drawPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.viewportWidth / 2, this.viewportHeight / 2 - 10);
    this.ctx.font = '18px monospace';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fillText('Press ESC or tap II to resume', this.viewportWidth / 2, this.viewportHeight / 2 + 30);
  }

  private handleTapTransitions(): void {
    if (consumePauseTap()) {
      if (this.game.state === GameState.PLAYING) this.game.state = GameState.PAUSED;
      else if (this.game.state === GameState.PAUSED) this.game.state = GameState.PLAYING;
    }

    if (consumeAnyTap()) {
      if (this.game.state === GameState.TITLE) {
        this.game.state = GameState.PLAYING;
        this.restartAllowedAt = 0;
      } else if (this.game.state === GameState.VICTORY) {
        this.resetRun(GameState.PLAYING);
      } else if (this.game.state === GameState.GAME_OVER && this.canRestartGameOver()) {
        this.resetRun(GameState.PLAYING);
      }
    }
  }

  private resetRun(state: GameState): void {
    this.world = new GameWorld(this.viewportWidth, this.viewportHeight);
    this.game = new Game();
    this.game.state = state;
    this.restartAllowedAt = 0;
  }

  private canRestartGameOver(): boolean {
    return performance.now() >= this.restartAllowedAt;
  }

  private getGameOverRestartCountdown(): number {
    return Math.max(0, (this.restartAllowedAt - performance.now()) / 1000);
  }

  private resize(): void {
    this.viewportWidth = Math.round(window.innerWidth);
    this.viewportHeight = Math.round(window.innerHeight);
    this.renderScale = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(this.viewportWidth * this.renderScale);
    this.canvas.height = Math.round(this.viewportHeight * this.renderScale);
    this.canvas.style.width = `${this.viewportWidth}px`;
    this.canvas.style.height = `${this.viewportHeight}px`;
    this.ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
  }
}
