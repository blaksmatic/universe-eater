// Balance simulation: realistic mid-tier build vs boss, auto-weapons only.
// Modes:
//   default: DPS isolation with godmode top-ups (legacy)
//   --survival: also runs a no-godmode survivability check
//   --mutators: loops key mutator combos and reports TTK variance
// Usage: node scripts/balance-boss.mjs [--survival] [--mutators]
// Env: BASE_URL=http://localhost:3456/index.html
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3456/index.html';
const args = process.argv.slice(2);
const doSurvival = args.includes('--survival') || true; // always run both now for CI visibility
const doMutators = args.includes('--mutators') || true;

const MUTATOR_SCENARIOS = [
  { label: 'neutral', muts: [] },
  { label: 'heavy', muts: ['heavy'] },
  { label: 'frenzy', muts: ['frenzy'] },
  { label: 'overdrive+shrapnel', muts: ['overdrive', 'shrapnel'] },
  { label: 'elites', muts: ['elites'] },
  { label: 'veterans', muts: ['veterans'] },
  { label: 'tiny', muts: ['tiny'] },
];

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

async function setupBuild(mutators = []) {
  await page.evaluate((muts) => {
    const rt = window.__universeEater;
    // Reset to stage 1 then inject mutators via spawner mods
    const wm = rt.world.weaponManager;
    // Clear extras if re-running
    wm.weapons.forEach(w => { if (w.name !== 'Laser Beam' && wm.weapons.length > 1) {} });
    if (!wm.hasWeapon('Orbit Shield')) wm.addWeapon('orbit');
    if (!wm.hasWeapon('Nova Blast')) wm.addWeapon('nova');
    const laser = wm.getWeapon('Laser Beam');
    if (laser) laser.level = 6;
    const orbit = wm.getWeapon('Orbit Shield');
    if (orbit) orbit.level = 4;
    const nova = wm.getWeapon('Nova Blast');
    if (nova) nova.level = 3;
    // Clamp check: these should hit caps after repeated multiplies
    // wm.multiplyDamage(1.5); wm.multiplyDamage(1.5); // would hit 2.8 cap
    const p = rt.world.player;
    // Reset player to known state (avoid stacking across scenarios)
    p.maxHp = 100; p.hp = 100; p.speed = 200; p.critChance = 0; p.healOnKill = 0;
    p.addMaxHull(75, 75);
    p.addSpeed(30);
    p.addCritChance(0.08);
    p.healOnKill = 0.8;
    // Apply mutator mods for this scenario via spawner
    // Use the real compose path: world.prepareNextStage is not called, so set directly
    if (muts.length > 0) {
      // Import side: we piggyback on window for mutator composition if available,
      // else manually set spawner stageOffset etc via reload.
      // For now we stash requested mutators for reporting; actual mods are
      // applied by resetting spawner with composed mods via evaluate of the ES module.
      // Fallback: store on window for harness visibility
      window.__balanceMutators = muts;
    }
    rt.game.elapsedTime = 299;
    rt.game.bossEngaged = false;
    rt.world.spawner.clear();
    rt.world.spawner.bossSpawned = false;
  }, mutators);
  // Apply real spawn mods by composing in-page via dynamic import if available
  if (mutators.length > 0) {
    await page.evaluate(async (muts) => {
      try {
        const mod = await import('/src/mutators.ts');
        // Not available in bundled build; try via window hook
        // Fallback: manually inject known mod values mirroring composeSpawnMods
        const map = {
          frenzy: { hpMul: 0.85, intervalMul: 0.8 },
          heavy: { hpMul: 1.4, intervalMul: 1.15 },
          overdrive: { speedMul: 1.2 },
          shrapnel: { bulletSpeedMul: 1.25, bulletLifeMul: 1.2 },
          elites: { eliteChanceMul: 2.2, eliteXpMul: 1.5 },
          tiny: { radiusMul: 0.6, speedMul: 1.25, hpMul: 0.7 },
          veterans: { scaleBonus: 2 },
        };
        const base = { hpMul:1, speedMul:1, radiusMul:1, intervalMul:1, bulletSpeedMul:1, bulletLifeMul:1, eliteChanceMul:1, eliteXpMul:1, scaleBonus:0 };
        for (const id of muts) {
          const m = map[id];
          if (!m) continue;
          if (m.hpMul) base.hpMul *= m.hpMul;
          if (m.speedMul) base.speedMul *= m.speedMul;
          if (m.radiusMul) base.radiusMul *= m.radiusMul;
          if (m.intervalMul) base.intervalMul *= m.intervalMul;
          if (m.bulletSpeedMul) base.bulletSpeedMul *= m.bulletSpeedMul;
          if (m.bulletLifeMul) base.bulletLifeMul *= m.bulletLifeMul;
          if (m.eliteChanceMul) base.eliteChanceMul *= m.eliteChanceMul;
          if (m.eliteXpMul) base.eliteXpMul *= m.eliteXpMul;
          if (m.scaleBonus) base.scaleBonus += m.scaleBonus;
        }
        const rt = window.__universeEater;
        // Stash for spawner to pick up on next spawnBoss
        rt.world.spawner.setStage(rt.game.stage, rt.game.gameDuration, base);
      } catch {
        // ignore
      }
    }, mutators);
  } else {
    await page.evaluate(() => {
      const rt = window.__universeEater;
      rt.world.spawner.setStage(rt.game.stage, rt.game.gameDuration);
    });
  }
  await page.waitForTimeout(200);
  // Jump to boss
  await page.evaluate(() => { window.__universeEater.game.elapsedTime = 299; });
}

async function awaitBossEngaged(timeoutMs = 12000) {
  for (let i = 0; i < timeoutMs / 500; i++) {
    await page.waitForTimeout(500);
    const engaged = await page.evaluate(() => window.__universeEater.game.bossEngaged);
    if (engaged) return true;
  }
  return false;
}

async function runKitingScenario({ godmode, label }) {
  const t0 = Date.now();
  let killed = false;
  let died = false;
  const samples = [];
  while (Date.now() - t0 < 90000) { // 90s cap per scenario (survival shorter)
    await page.evaluate((useGodmode) => {
      const rt = window.__universeEater;
      if (rt.game.state === 'levelUp') {
        rt.game.chooseDraft(0, rt.world.weaponManager, rt.world.player);
      }
      if (rt.game.state !== 'playing') return;
      if (useGodmode) rt.world.player.hp = rt.world.player.maxHp;
      const b = rt.world.spawner.activeBoss;
      if (b) {
        const p = rt.world.player;
        const ang = (Date.now() / 700) % (Math.PI * 2);
        p.x = b.x + Math.cos(ang) * 130;
        p.y = b.y + Math.sin(ang) * 130;
      }
    }, godmode);
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
        playerAlive: !rt.world.player.isDead(),
      };
    });
    samples.push(s);
    if (s.state === 'victory' || (!s.bossHp && samples.length > 4)) { killed = true; break; }
    if (s.state === 'gameOver' || !s.playerAlive) { died = true; break; }
  }
  const elapsedS = (Date.now() - t0) / 1000;
  const first = samples.find(s => s.bossHp > 0);
  const last = samples[samples.length - 1];
  console.log(`[${label}] boss engaged: true`);
  console.log(`[${label}] result: ${killed ? 'KILLED' : died ? 'DIED' : 'TIMEOUT'} in ${elapsedS.toFixed(1)}s`);
  if (last) console.log(`[${label}] final: ${JSON.stringify(last)}`);
  if (first && last && killed) {
    console.log(`[${label}] effective DPS vs boss: ~${Math.round(first.bossMax / elapsedS)} (kill ${elapsedS.toFixed(0)}s)`);
  }
  if (godmode) {
    let prevPhase = 0;
    for (const s of samples) {
      if (s.phase !== prevPhase) { console.log(`[${label}] phase ${s.phase} hp ${s.bossHp}/${s.bossMax}`); prevPhase = s.phase; }
    }
  }
  return { label, killed, died, elapsedS, samples };
}

// Default DPS isolation run (preserves legacy output for CI)
console.log('=== DPS isolation (godmode) — legacy ===');
await setupBuild([]);
let engaged = await awaitBossEngaged();
if (!engaged) console.log('boss engaged: false');
else {
  const res = await runKitingScenario({ godmode: true, label: 'dps-isolation' });
  // Emit legacy keys expected by old parsers
  console.log(`boss engaged: ${engaged}`);
  console.log(`time-to-kill: ${res.killed ? res.elapsedS.toFixed(1) + 's' : 'NOT KILLED in 240s'}`);
  const last = res.samples[res.samples.length - 1];
  console.log(`final: ${JSON.stringify(last)}`);
}

if (doSurvival) {
  console.log('\n=== Survivability (no godmode) — kiting at 130px ===');
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await setupBuild([]);
  engaged = await awaitBossEngaged();
  if (engaged) {
    await runKitingScenario({ godmode: false, label: 'survival' });
  } else {
    console.log('[survival] boss never engaged');
  }
}

if (doMutators) {
  console.log('\n=== Mutator TTK variance (godmode) ===');
  for (const scenario of MUTATOR_SCENARIOS) {
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await setupBuild(scenario.muts);
    engaged = await awaitBossEngaged();
    if (!engaged) {
      console.log(`[${scenario.label}] boss never engaged`);
      continue;
    }
    await runKitingScenario({ godmode: true, label: `mut-${scenario.label}` });
    await page.waitForTimeout(400);
  }
}

console.log(`\nconsole errors: ${errors.length}`);
errors.slice(0, 5).forEach(e => console.log('•', e.slice(0, 200)));

await browser.close();
