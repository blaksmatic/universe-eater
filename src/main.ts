import { GameRuntime } from './runtime';
import { syncDocumentLanguage } from './i18n';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('Universe Eater could not acquire a 2D rendering context.');
}

syncDocumentLanguage();

const runtime = new GameRuntime(canvas, ctx);
runtime.start();
