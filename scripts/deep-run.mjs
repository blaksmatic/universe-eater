// Deep playthrough: full stage-2 loop with a carried-over build.
// Finds late-game issues: difficulty curve, draft starvation, perf, errors.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3456/index.html';
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-gl=angle'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = [];
page.on('pageerror', e => errors.push(`PAGEERROR: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(BASE, { waitUntil: 'load' });
await page.waitForTimeout(1200);
await page.keyboard.press('Space');
await page.waitForTimeout(400);

// Realistic stage-1-end build, then jump to the stage-2 boss and win.
await page.evaluate(() => {
  const rt = window.__universeEater;
  const wm = rt.world.weaponManager;
  wm.addWeapon('orbit'); wm.addWeapon('seeker'); wm.addWeapon('arc');
  wm.getWeapon('Laser Beam').level = 7;
  wm.getWeapon('Orbit Shield').level = 5;
  wm.getWeapon('Seeker Swarm').level = 4;
  wm.getWeapon('Arc Reactor').level = 3;
  const p = rt.world.player;
  p.addMaxHull(100, 100); p.addSpeed(36); p.addCritChance(0.16); p.healOnKill = 1.6;
  rt.game.elapsedTime = 299;
});

// Beat stage-1 boss (up to 150s; kiter circles + dashes)
let won = false;
for (let i = 0; i < 500; i++) {
  await page.evaluate(() => {
    const rt = window.__universeEater;
    if (rt.game.state === 'levelUp') rt.game.chooseDraft(0, rt.world.weaponManager, rt.world.player);
    if (rt.game.state !== 'playing') return;
    const p = rt.world.player;
    rt.world.player.hp = Math.max(rt.world.player.hp, rt.world.player.maxHp * 0.5); // partial godmode
    const b = rt.world.spawner.activeBoss;
    const ang = (Date.now() / 700) % (Math.PI * 2);
    const tx = b ? b.x + Math.cos(ang) * 150 : p.x + Math.cos(ang) * 100;
    const ty = b ? b.y + Math.sin(ang) * 150 : p.y + Math.sin(ang) * 100;
    const dx = tx - p.x, dy = ty - p.y;
    const len = Math.hypot(dx, dy) || 1;
    p.x += (dx / len) * p.speed * 0.06;
    p.y += (dy / len) * p.speed * 0.06;
  });
  await page.waitForTimeout(300);
  const s = await page.evaluate(() => window.__universeEater.game.state);
  if (s === 'victory') { won = true; break; }
  if (s === 'gameOver') break;
}
console.log('stage 1 boss beaten:', won);

if (!won) {
  console.log('boss not beaten in time — dumping state and exiting');
  await page.screenshot({ path: 'test-artifacts/deep-boss-timeout.png' });
  await browser.close();
  process.exit(1);
}

// Advance to stage 2
await page.keyboard.press('Enter');
await page.waitForTimeout(600);
let s2 = await page.evaluate(() => {
  const rt = window.__universeEater;
  return { state: rt.game.state, stage: rt.game.stage, enemies: rt.world.spawner.enemies.length };
});
console.log('stage 2 entered:', JSON.stringify(s2));

// Survive stage 2 with godmode-off (real survival!) but auto-drafts; sample stats.
const t0 = Date.now();
let samples = [];
let death = null;
while (Date.now() - t0 < 420000) {
  await page.evaluate(() => {
    const rt = window.__universeEater;
    if (rt.game.state === 'levelUp') rt.game.chooseDraft(0, rt.world.weaponManager, rt.world.player);
  });
  // Kite: circle strafe around screen center-ish, dash occasionally
  await page.evaluate(() => {
    const rt = window.__universeEater;
    if (rt.game.state !== 'playing') return;
    const p = rt.world.player;
    // Move toward the point furthest from the nearest enemy cluster (simple kite)
    const enemies = rt.world.spawner.enemies;
    let fx = 0, fy = 0;
    for (const e of enemies) {
      const dx = p.x - e.x, dy = p.y - e.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 400 * 400) { fx += dx / (d2 + 1); fy += dy / (d2 + 1); }
    }
    const len = Math.hypot(fx, fy);
    p.x += (len > 0 ? fx / len : 0) * p.speed * 0.05;
    p.y += (len > 0 ? fy / len : 0) * p.speed * 0.05;
  });
  await page.waitForTimeout(280);
  const s = await page.evaluate(() => {
    const rt = window.__universeEater;
    return {
      state: rt.game.state,
      t: Math.round(rt.game.elapsedTime),
      hp: Math.round(rt.world.player.hp),
      maxHp: rt.world.player.maxHp,
      enemies: rt.world.spawner.enemies.length,
      kills: rt.world.player.kills,
      lvl: rt.world.player.level,
      boss: rt.world.spawner.activeBoss ? Math.round(rt.world.spawner.activeBoss.hp / rt.world.spawner.activeBoss.maxHp * 100) : null,
    };
  });
  samples.push(s);
  if (s.state === 'victory') { console.log('STAGE 2 CLEARED at', s.t + 's'); break; }
  if (s.state === 'gameOver') { death = s; console.log('DIED at', s.t + 's:', JSON.stringify(s)); break; }
}

// Summary: hp curve, enemy density, draft cadence
const every20 = samples.filter((_, i) => i % 8 === 0);
console.log('timeline (t, hp, enemies, lvl):');
for (const s of every20) console.log(`  ${s.t}s hp=${s.hp}/${s.maxHp} enemies=${s.enemies} lvl=${s.lvl} boss=${s.boss ?? '-'}%`);
const maxEnemies = Math.max(...samples.map(s => s.enemies));
console.log('max concurrent enemies:', maxEnemies);
const fps = await page.evaluate(() => new Promise(res => {
  let f = 0; const t = performance.now();
  const tick = () => { f++; performance.now() - t < 3000 ? requestAnimationFrame(tick) : res(Math.round(f / ((performance.now() - t) / 1000))); };
  requestAnimationFrame(tick);
}));
console.log('fps at endgame:', fps);
console.log('console errors:', errors.length);
errors.slice(0, 6).forEach(e => console.log('•', e.slice(0, 200)));
await page.screenshot({ path: 'test-artifacts/deep-stage2-end.png' });
await browser.close();
