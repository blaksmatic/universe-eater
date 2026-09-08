import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';

// Real Chromium touch dispatch (including simultaneous fingers), not DOM mocks.
const root = resolve('.');
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, `.${new URL(req.url, 'http://localhost').pathname}`);
    assert.ok(path.startsWith(root));
    res.setHeader('Content-Type', extname(path) === '.js' ? 'text/javascript' : 'text/html');
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
const errors = [];
let checks = 0;
const check = (value, name) => { assert.ok(value, name); checks++; console.log(`PASS ${name}`); };
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    const context = await browser.newContext({ viewport, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await page.waitForFunction(() => window.__universeEater);
    const cdp = await context.newCDPSession(page);
    const finger = (id, x, y) => ({ id, x, y, radiusX: 4, radiusY: 4, force: 1 });
    const dispatch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
    const snapshot = () => page.evaluate(() => {
      const r = window.__universeEater;
      return { state: r.game.state, x: r.world.player.x, y: r.world.player.y, dash: r.world.player.dashCooldownRatio };
    });
    const x = viewport.width * .25, y = viewport.height * .65;
    const titlePosition = await snapshot();
    await dispatch('touchStart', [finger(1, x, y)]);
    await dispatch('touchMove', [finger(1, x + 70, y)]);
    await page.waitForTimeout(120);
    const started = await snapshot();
    await dispatch('touchEnd', []);
    check(started.state === 'playing' && started.dash === 0, 'Title gesture starts without dash');
    check(started.x === titlePosition.x, 'Dragging title gesture does not start movement');
    await page.waitForTimeout(550);
    const before = await snapshot();
    await dispatch('touchStart', [finger(1, x, y)]);
    await dispatch('touchMove', [finger(1, x + 60, y)]);
    await page.waitForTimeout(160);
    check((await snapshot()).x > before.x + 5, 'Touch joystick moves player');
    const dashX = viewport.width - 48, dashY = viewport.height - 48;
    await dispatch('touchStart', [finger(1, x + 60, y), finger(2, dashX, dashY)]);
    await page.waitForTimeout(90);
    check((await snapshot()).dash > 0, 'Second finger dashes while joystick remains held');
    await dispatch('touchEnd', [finger(2, dashX, dashY)]);
    await page.waitForTimeout(350);
    const moving = await snapshot();
    await page.waitForTimeout(120);
    check((await snapshot()).x > moving.x, 'Lifting dash finger preserves joystick');
    await dispatch('touchCancel', []);
    await page.waitForTimeout(80);
    const stopped = await snapshot();
    await page.waitForTimeout(100);
    check((await snapshot()).x === stopped.x, 'Touch cancellation stops movement');
    await page.touchscreen.tap(viewport.width - 41, 41);
    await page.waitForTimeout(60);
    check((await snapshot()).state === 'paused', 'HUD pause pauses');
    await page.touchscreen.tap(viewport.width - 41, 41);
    await page.waitForTimeout(60);
    check((await snapshot()).state === 'playing', 'Same HUD tap resumes exactly once');
    await page.keyboard.down('d');
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    check((await snapshot()).state === 'paused', 'Focus loss pauses gameplay');
    await page.touchscreen.tap(5, viewport.height / 2);
    await page.waitForTimeout(60);
    const resumed = await snapshot();
    await page.waitForTimeout(100);
    check((await snapshot()).x === resumed.x, 'Lost keyup does not leave movement held after resume');
    await page.keyboard.up('d');
    await dispatch('touchStart', [finger(1, x, y)]);
    await dispatch('touchMove', [finger(1, x + 60, y)]);
    await page.waitForTimeout(60);
    await page.setViewportSize({ width: viewport.width - 10, height: viewport.height });
    await page.waitForTimeout(100);
    const resized = await snapshot();
    await page.waitForTimeout(100);
    check((await snapshot()).x === resized.x, 'Resize clears obsolete joystick coordinates');
    await dispatch('touchEnd', []);
    await page.evaluate(() => {
      const r = window.__universeEater;
      r.game.queueLevelUps(1, r.world.weaponManager);
    });
    await page.waitForTimeout(80);
    const card = await page.evaluate(() => {
      const r = window.__universeEater;
      const canvas = document.getElementById('game');
      for (let y = 0; y < innerHeight; y += 5) {
        for (let x = 0; x < innerWidth; x += 5) {
          const action = r.ui.getLevelUpActionAt(canvas, r.game, x, y);
          if (action?.type === 'choice') return { x: x + 8, y: y + 8 };
        }
      }
      throw new Error('No tappable draft card');
    });
    const draftPosition = await snapshot();
    await dispatch('touchStart', [finger(1, card.x, card.y)]);
    await dispatch('touchMove', [finger(1, card.x + 55, card.y)]);
    await page.waitForTimeout(120);
    const chosen = await snapshot();
    check(chosen.state === 'playing', 'Touch selects an upgrade');
    check(chosen.x === draftPosition.x && chosen.y === draftPosition.y, 'Upgrade confirm drag does not carry movement into play');
    await dispatch('touchEnd', []);
    mkdirSync('test-artifacts/mobile-sprint', { recursive: true });
    await page.screenshot({ path: `test-artifacts/mobile-sprint/${viewport.width}x${viewport.height}.png` });
    await context.close();
  }
  check(errors.length === 0, `No browser runtime errors (${errors.join('; ')})`);
  console.log(`${checks} mobile interaction checks passed.`);
} finally {
  await browser.close();
  server.close();
}


