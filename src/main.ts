import { GameRuntime } from './runtime';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('Universe Eater could not acquire a 2D rendering context.');
}

const runtime = new GameRuntime(canvas, ctx);
runtime.start();
