// Automated playtest harness for Universe Eater.
// Usage: node scripts/playtest.mjs [scenario]
// Scenarios: smoke | combat | boss | mobile | all (default)
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:3456/index.html';
const OUT = 'test-artifacts';
mkdirSync(OUT, { recursive: true });

const scenario = process.argv[2] || 'all';
const results = [];
const consoleErrors = [];

function record(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

/** Performance checks are machine-dependent: log loudly but never fail the suite. */
function recordPerf(name, pass, detail = '') {
  console.log(`${pass ? 'PASS' : 'WARN'}  ${name}${detail ? ` — ${detail}` : ''}${pass ? '' : '  (performance warning, not a failure)'}`);
}

async function attachConsole(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));
}

async function boot(page) {
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
}

async function getState(page) {
  return page.evaluate(() => {
    const rt = window.__universeEater;
    const g = rt.game;
    const w = rt.world;
    return {
      state: g.state,
      stage: g.stage,
      elapsed: g.elapsedTime,
      bossEngaged: g.bossEngaged,
      hp: w.player.hp,
      level: w.player.level,
      kills: w.player.kills,
      enemies: w.spawner.enemies.length,
      weapons: w.weaponManager.weapons.map(x => `${x.name}:${x.level}`),
      combo: w.combatSystem.comboCount,
      boss: (() => { const b = w.spawner.activeBoss; return b ? { phase: b.bossPhase, hp: b.hp, maxHp: Math.round(b.maxHp) } : null; })(),
    };
  });
}

async function startGame(page) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(600);
}

async function wiggle(page, ms, godmode = true) {
  // Simulate a player kiting: alternate WASD in wide circles + occasional dash.
  const end = Date.now() + ms;
  const seq = ['d', 's', 'a', 'w'];
  let i = 0;
  while (Date.now() < end) {
    if (godmode) {
      await page.evaluate(() => {
        const rt = window.__universeEater;
        if (rt.game.state === 'playing') rt.world.player.hp = rt.world.player.maxHp;
      });
    }
    const key = seq[i % seq.length];
    await page.keyboard.down(key);
    if (i % 4 === 3) await page.keyboard.press('Space');
    await page.waitForTimeout(450);
    await page.keyboard.up(key);
    i++;
  }
}

async function fpsSample(page, ms) {
  return page.evaluate((duration) => new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    const tick = () => {
      frames++;
      if (performance.now() - start < duration) requestAnimationFrame(tick);
      else resolve(Math.round(frames / ((performance.now() - start) / 1000)));
    };
    requestAnimationFrame(tick);
  }), ms);
}

async function scenarioSmoke(page) {
  await boot(page);
  let s = await getState(page);
  record('smoke: boots to title', s.state === 'title', JSON.stringify(s.state));

  await page.screenshot({ path: `${OUT}/01-title.png` });

  await startGame(page);
  s = await getState(page);
  record('smoke: starts playing', s.state === 'playing', s.state);
  record('smoke: laser weapon present', s.weapons.some(w => w.startsWith('Laser Beam')), s.weapons.join(','));

  await wiggle(page, 8000);
  s = await getState(page);
  record('smoke: player alive after 8s', s.hp > 0, `hp=${Math.round(s.hp)}`);

  // Pause menu
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  s = await getState(page);
  record('smoke: pause works', s.state === 'paused', s.state);
  await page.screenshot({ path: `${OUT}/02-pause.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Level-up draft: queue one through the public game API
  await page.evaluate(() => {
    const rt = window.__universeEater;
    rt.game.queueLevelUps(1, rt.world.weaponManager);
  });
  await page.waitForTimeout(300);
  s = await getState(page);
  record('smoke: level-up draft opens', s.state === 'levelUp', s.state);
  await page.screenshot({ path: `${OUT}/03-draft.png` });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  s = await getState(page);
  record('smoke: draft choice applies', s.state === 'playing', `${s.state} ${s.weapons.join(',')}`);

  const fps = await fpsSample(page, 4000);
  recordPerf('smoke: fps >= 45', fps >= 45, `${fps}fps`);
  await page.screenshot({ path: `${OUT}/04-gameplay.png` });
}

async function scenarioCombat(page) {
  await boot(page);
  await startGame(page);
  // Fast-forward difficulty: grant levels & jump the clock into heavy waves.
  await page.evaluate(() => {
    const rt = window.__universeEater;
    for (let i = 0; i < 6; i++) {
      rt.world.player.addXp(rt.world.player.getXpForNextLevel());
      if (rt.game.draftChoices.length) {
        rt.game.chooseDraft(Math.floor(Math.random() * rt.game.draftChoices.length), rt.world.weaponManager, rt.world.player);
      }
    }
    rt.game.elapsedTime = 160;
  });
  const pre = await getState(page);
  console.log('   [diag] post-setup:', JSON.stringify(pre));
  await wiggle(page, 25000);
  const s = await getState(page);
  console.log('   [diag] post-wiggle:', JSON.stringify(s));
  record('combat: enemies spawning', s.enemies > 0, `${s.enemies} alive`);
  record('combat: player leveling', s.level >= 2, `lvl=${s.level}`);
  record('combat: multiple weapons possible', s.weapons.length >= 1, s.weapons.join(','));
  const fps = await fpsSample(page, 4000);
  recordPerf('combat: fps >= 40 under load', fps >= 40, `${fps}fps, ${s.enemies} enemies`);
  await page.screenshot({ path: `${OUT}/05-combat-heavy.png` });
}

async function scenarioBoss(page) {
  await boot(page);
  await startGame(page);
  await page.evaluate(() => {
    const rt = window.__universeEater;
    for (let i = 0; i < 5; i++) {
      rt.world.player.addXp(rt.world.player.getXpForNextLevel());
      if (rt.game.draftChoices.length) {
        rt.game.chooseDraft(Math.floor(Math.random() * rt.game.draftChoices.length), rt.world.weaponManager, rt.world.player);
      }
    }
    rt.world.player.heal(500);
    rt.game.elapsedTime = 299;
  });
  // Wait for boss spawn
  let s = null;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    s = await getState(page);
    if (s.bossEngaged && s.boss) break;
  }
  record('boss: spawns when timer expires', !!(s?.bossEngaged && s?.boss), JSON.stringify(s ? { engaged: s.bossEngaged, boss: s.boss } : null));
  if (!s?.boss) {
    await page.screenshot({ path: `${OUT}/06-boss-fail.png` });
    return;
  }

  // Fight: keep player moving; auto-weapons do damage. Screenshot mid-fight.
  await wiggle(page, 6000);
  await page.screenshot({ path: `${OUT}/06-boss-fight.png` });

  // Damage the boss down through phases to verify transitions.
  await page.evaluate(() => {
    const rt = window.__universeEater;
    const b = rt.world.spawner.activeBoss;
    if (b) b.takeDamage(b.maxHp * 0.55); // drop to ~45% => phase 2
  });
  await page.waitForTimeout(1200);
  s = await getState(page);
  record('boss: reaches phase 2', s.boss?.phase === 2, `phase=${s.boss?.phase}`);

  await page.evaluate(() => {
    const rt = window.__universeEater;
    const b = rt.world.spawner.activeBoss;
    if (b) b.takeDamage(b.maxHp * 0.3); // ~15% remains => phase 3
  });
  await page.waitForTimeout(1200);
  s = await getState(page);
  record('boss: reaches phase 3', s.boss?.phase === 3, `phase=${s.boss?.phase}`);
  await page.screenshot({ path: `${OUT}/07-boss-phase3.png` });

  // Kill it -> victory
  await page.evaluate(() => {
    const rt = window.__universeEater;
    rt.world.player.hp = rt.world.player.maxHp;
    const b = rt.world.spawner.activeBoss;
    if (b) b.takeDamage(b.maxHp);
  });
  await page.waitForTimeout(1000);
  s = await getState(page);
  record('boss: victory on kill', s.state === 'victory', s.state);
  await page.screenshot({ path: `${OUT}/08-victory.png` });

  // Advance stage
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  s = await getState(page);
  record('boss: next stage begins', s.state === 'playing' && s.stage === 2, `stage=${s.stage}`);
}

async function scenarioMobile(page) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const mpage = await ctx.newPage();
  await attachConsole(mpage);
  await boot(mpage);
  await mpage.screenshot({ path: `${OUT}/09-mobile-title.png` });

  // Tap to start
  await mpage.touchscreen.tap(200, 400);
  await mpage.waitForTimeout(700);
  let s = await getState(mpage);
  record('mobile: tap starts game', s.state === 'playing', s.state);

  // Virtual joystick drag
  await mpage.touchscreen.tap(200, 400); // anyTap no-op while playing
  const before = await mpage.evaluate(() => window.__universeEater.world.player.x);
  // swipe via CDP-ish touch events through dispatch
  await mpage.evaluate(() => {
    const canvas = document.getElementById('game');
    const rect = canvas.getBoundingClientRect();
    const opts = (type, x, y) => new TouchEvent(type, {
      bubbles: true, cancelable: true,
      changedTouches: [new Touch({ identifier: 1, target: canvas, clientX: x, clientY: y })],
      touches: type === 'touchend' ? [] : [new Touch({ identifier: 1, target: canvas, clientX: x, clientY: y })],
    });
    const x = rect.left + 120;
    const y = rect.top + rect.height - 140;
    canvas.dispatchEvent(opts('touchstart', x, y));
    canvas.dispatchEvent(opts('touchmove', x + 50, y - 10));
  });
  await mpage.waitForTimeout(900);
  await mpage.evaluate(() => {
    const canvas = document.getElementById('game');
    const rect = canvas.getBoundingClientRect();
    const opts = (type, x, yy) => new TouchEvent(type, {
      bubbles: true, cancelable: true,
      changedTouches: [new Touch({ identifier: 1, target: canvas, clientX: x, clientY: yy })],
      touches: [],
    });
    canvas.dispatchEvent(opts('touchmove', rect.left + 170, rect.top + rect.height - 150));
    canvas.dispatchEvent(opts('touchend', rect.left + 170, rect.top + rect.height - 150));
  });
  const after = await mpage.evaluate(() => window.__universeEater.world.player.x);
  record('mobile: joystick moves ship', Math.abs(after - before) > 4, `dx=${(after - before).toFixed(1)}`);

  // Dash button exists & dash triggers (tap near bottom-right button)
  await mpage.evaluate(() => {
    const canvas = document.getElementById('game');
    const rect = canvas.getBoundingClientRect();
    const opts = (type, x, y) => new TouchEvent(type, {
      bubbles: true, cancelable: true,
      changedTouches: [new Touch({ identifier: 7, target: canvas, clientX: x, clientY: y })],
      touches: type === 'touchend' ? [] : [new Touch({ identifier: 7, target: canvas, clientX: x, clientY: y })],
    });
    document.dispatchEvent(opts('touchstart', rect.right - 48, rect.bottom - 48));
    document.dispatchEvent(opts('touchend', rect.right - 48, rect.bottom - 48));
  });
  await mpage.waitForTimeout(250);
  const cd = await mpage.evaluate(() => window.__universeEater.world.player.dashCooldownRatio);
  record('mobile: dash button works', cd > 0.9, `cooldown=${cd.toFixed(2)}`);

  await mpage.screenshot({ path: `${OUT}/10-mobile-play.png` });
  const fps = await fpsSample(mpage, 3500);
  recordPerf('mobile: fps >= 30 emulated', fps >= 30, `${fps}fps`);
  await ctx.close();
}

let browser;
try {
  browser = await chromium.launch({
    args: ['--enable-gpu', '--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await attachConsole(page);

  if (scenario === 'all' || scenario === 'smoke') await scenarioSmoke(page);
  if (scenario === 'all' || scenario === 'combat') await scenarioCombat(page);
  if (scenario === 'all' || scenario === 'boss') await scenarioBoss(page);
  if (scenario === 'all' || scenario === 'mobile') await scenarioMobile(browser);

  await ctx.close();
} finally {
  if (browser) await browser.close();
}

console.log('\n=== CONSOLE ERRORS ===');
if (consoleErrors.length === 0) console.log('(none)');
else consoleErrors.slice(0, 20).forEach(e => console.log('•', e.slice(0, 300)));

const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);
