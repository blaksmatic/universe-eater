// Mobile UX audit: screenshots + interactions on phone-sized viewports.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:3456/index.html';
const OUT = 'test-artifacts/mobile';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--enable-gpu', '--use-gl=angle'] });
const errors = [];

async function makeDevice(w, h) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h, deviceScaleFactor: 2 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`${w}x${h}: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`${w}x${h}: ${m.text()}`); });
  return { ctx, page };
}

async function start(page) {
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1300);
  await page.touchscreen.tap(200, 400);
  await page.waitForTimeout(500);
}

async function queueDraft(page) {
  await page.evaluate(() => window.__universeEater.game.queueLevelUps(1, window.__universeEater.world.weaponManager));
  await page.waitForTimeout(400);
}

// ── Portrait phone (iPhone SE-ish)
{
  const { ctx, page } = await makeDevice(375, 667);
  await start(page);
  await page.screenshot({ path: `${OUT}/p-title.png` });

  // Draft portrait
  await queueDraft(page);
  await page.screenshot({ path: `${OUT}/p-draft.png` });
  // Tap the middle card (verify tap-to-choose works on touch)
  const state = await page.evaluate(() => window.__universeEater.game.state);
  if (state === 'levelUp') {
    await page.touchscreen.tap(187, 320);
    await page.waitForTimeout(400);
  }
  const after = await page.evaluate(() => window.__universeEater.game.state);
  console.log(`portrait draft tap: levelUp -> ${after} ${after === 'playing' ? 'PASS' : 'FAIL'}`);

  // Pause portrait
  await page.evaluate(() => { window.__universeEater.game.state = 'paused'; });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/p-pause.png` });

  // Toggle a setting via tap (row hitbox math is canvas-internal; covered by
  // qa-edge on desktop — here we just capture the portrait pause layout).
  await page.touchscreen.tap(187, 240);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/p-pause-after-tap.png` });
  await ctx.close();
}

// ── Landscape phone (short viewport)
{
  const { ctx, page } = await makeDevice(667, 375);
  await start(page);
  await page.screenshot({ path: `${OUT}/l-title.png` });

  await queueDraft(page);
  await page.screenshot({ path: `${OUT}/l-draft.png` });
  const st = await page.evaluate(() => window.__universeEater.game.state);
  if (st === 'levelUp') {
    await page.touchscreen.tap(333, 200);
    await page.waitForTimeout(400);
  }
  const after = await page.evaluate(() => window.__universeEater.game.state);
  console.log(`landscape draft tap: levelUp -> ${after} ${after === 'playing' ? 'PASS' : 'FAIL'}`);

  await page.evaluate(() => { window.__universeEater.game.state = 'paused'; });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/l-pause.png` });

  // Game over landscape (hp below zero so the regen tick can't rescue)
  await page.evaluate(() => {
    const rt = window.__universeEater;
    rt.game.state = 'playing';
    rt.world.player.hp = -1;
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/l-gameover.png` });
  const endState = await page.evaluate(() => window.__universeEater.game.state);
  console.log(`landscape death -> ${endState} ${endState === 'gameOver' ? 'PASS' : 'FAIL'}`);
  await ctx.close();
}

console.log(`console errors: ${errors.length}`);
errors.slice(0, 8).forEach(e => console.log('•', e.slice(0, 220)));
await browser.close();
