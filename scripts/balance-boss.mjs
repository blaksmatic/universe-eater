// Balance simulation: realistic mid-tier build vs boss, auto-weapons only.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3456/index.html';

const browser = await chromium.launch({
  args: ['--enable-gpu', '--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(BASE, { waitUntil: 'load' });
await page.waitForTimeout(1200);
await page.keyboard.press('Space');
await page.waitForTimeout(500);

// Realistic stage-1-end build: laser 6, orbit 4, nova 3 + some passives.
await page.evaluate(() => {
  const rt = window.__universeEater;
  const wm = rt.world.weaponManager;
  wm.addWeapon('orbit'); wm.addWeapon('nova');
  wm.getWeapon('Laser Beam').level = 6;
  wm.getWeapon('Orbit Shield').level = 4;
  wm.getWeapon('Nova Blast').level = 3;
  const p = rt.world.player;
  p.addMaxHull(75, 75);
  p.addSpeed(30);
  p.addCritChance(0.08);
  p.healOnKill = 0.8;
});

// Jump to boss.
await page.evaluate(() => { window.__universeEater.game.elapsedTime = 299; });

let engaged = false;
for (let i = 0; i < 24; i++) {
  await page.waitForTimeout(500);
  engaged = await page.evaluate(() => window.__universeEater.game.bossEngaged);
  if (engaged) break;
}

// Kite close with periodic godmode top-ups; auto-pick drafts; measure time-to-kill.
const t0 = Date.now();
let killed = false;
let samples = [];
while (Date.now() - t0 < 240000) {
  await page.evaluate(() => {
    const rt = window.__universeEater;
    if (rt.game.state === 'levelUp') {
      rt.game.chooseDraft(0, rt.world.weaponManager, rt.world.player);
    }
    if (rt.game.state !== 'playing') return;
    rt.world.player.hp = rt.world.player.maxHp; // isolate DPS question from survival
    const b = rt.world.spawner.activeBoss;
    if (b) {
      // Hug the boss at ~130px like a real player would.
      const p = rt.world.player;
      const ang = (Date.now() / 700) % (Math.PI * 2);
      p.x = b.x + Math.cos(ang) * 130;
      p.y = b.y + Math.sin(ang) * 130;
    }
  });
  await page.waitForTimeout(250);
  const s = await page.evaluate(() => {
    const rt = window.__universeEater;
    const b = rt.world.spawner.activeBoss;
    return {
      state: rt.game.state,
      bossHp: b ? Math.round(b.hp) : 0,
      bossMax: b ? Math.round(b.maxHp) : 0,
      phase: b ? b.bossPhase : 0,
      playerHp: Math.round(rt.world.player.hp),
    };
  });
  samples.push(s);
  if (s.state === 'victory' || (!s.bossHp && samples.length > 4)) { killed = true; break; }
}

const elapsedS = (Date.now() - t0) / 1000;
const first = samples.find(s => s.bossHp > 0);
const last = samples[samples.length - 1];
console.log(`boss engaged: ${engaged}`);
console.log(`time-to-kill: ${killed ? elapsedS.toFixed(1) + 's' : 'NOT KILLED in 240s'}`);
console.log(`final: ${JSON.stringify(last)}`);
if (first && last && killed) {
  const dps = (first.bossMax - last.bossHp) / Math.max(1, elapsedS);
  console.log(`effective DPS vs boss: ~${Math.round(first.bossMax / elapsedS)} (kill time ${elapsedS.toFixed(0)}s)`);
}
// Phase timeline
let prevPhase = 0;
for (const s of samples) {
  if (s.phase !== prevPhase) { console.log(`phase ${s.phase} at ${((Date.now() - t0) / 1000).toFixed(1)}s (hp ${s.bossHp}/${s.bossMax})`); prevPhase = s.phase; }
}
console.log(`console errors: ${errors.length}`);
errors.slice(0, 5).forEach(e => console.log('•', e.slice(0, 200)));

await browser.close();
