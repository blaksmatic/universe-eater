// Edge-case QA harness for Universe Eater.
// Usage: node scripts/qa-edge.mjs [scenario]
// Scenarios: restart | pauseboss | language | settings | maxed | splitter | bomber | all (default)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:3456/index.html';
const OUT = 'test-artifacts';
mkdirSync(OUT, { recursive: true });

const only = process.argv[2] || 'all';
const results = [];
const consoleErrors = [];
let currentScenario = '';

function record(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` -- ${detail}` : ''}`);
}

async function attachConsole(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push({ scenario: currentScenario, text: msg.text() });
  });
  page.on('pageerror', (err) => consoleErrors.push({ scenario: currentScenario, text: `PAGEERROR: ${err.message}` }));
}

// Fresh boot with cleared storage so language/settings start from defaults.
async function bootFresh(page) {
  await page.goto(BASE, { waitUntil: 'load' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1200);
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
      pendingLevelUps: g.pendingLevelUps,
      draftChoices: g.draftChoices.length,
      draftKinds: g.draftChoices.map(c => c.kind),
      hp: w.player.hp,
      maxHp: w.player.maxHp,
      level: w.player.level,
      kills: w.player.kills,
      enemies: w.spawner.enemies.length,
      swarmers: w.spawner.enemies.filter(e => e.type === 'swarmer').length,
      splitters: w.spawner.enemies.filter(e => e.type === 'splitter').length,
      bombers: w.spawner.enemies.filter(e => e.type === 'bomber').length,
      allMaxed: w.weaponManager.allMaxed(),
      weapons: w.weaponManager.weapons.map(x => `${x.name}:${x.level}`),
      boss: (() => { const b = w.spawner.activeBoss; return b ? { phase: b.bossPhase, hp: Math.round(b.hp), maxHp: Math.round(b.maxHp) } : null; })(),
    };
  });
}

async function startGame(page) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(600);
}

async function wiggle(page, ms, godmode = true) {
  // Kite in wide circles; optionally top HP up each step so we never die incidentally.
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
    await page.waitForTimeout(450);
    await page.keyboard.up(key);
    i++;
  }
}

async function dumpState(page, label) {
  const s = await getState(page);
  console.log(`   [diag:${label}] ${JSON.stringify(s)}`);
  return s;
}

// ── Scenario 1: rapid restart after death ──────────────────────

async function scenarioRestart(page) {
  currentScenario = 'rapid-restart';
  await bootFresh(page);
  await startGame(page);

  // Build a swarm, then drop to 1 HP and stand still until contact kills us.
  await wiggle(page, 6000, true);
  await page.evaluate(() => {
    const rt = window.__universeEater;
    rt.world.player.hp = 1;
  });
  let died = false;
  for (let i = 0; i < 48; i++) {
    await page.waitForTimeout(250);
    const s = await getState(page);
    if (s.state === 'gameOver') { died = true; break; }
    if (s.state !== 'playing') break;
  }
  if (!died) await dumpState(page, 'no-death');
  record('restart: hp=1 death detected -> gameOver', died, await getState(page).then(s => s.state));
  await page.screenshot({ path: `${OUT}/qa-edge-01-gameover.png` });
  if (!died) return;

  // Hammer Space/Enter. Restart is gated ~2.5s after death, so early presses
  // must be ignored; the first accepted press yields a brand-new run.
  const deathAt = Date.now();
  let presses = 0;
  let restartedAtMs = -1;
  const deadline = deathAt + 9000;
  while (Date.now() < deadline) {
    await page.keyboard.press(presses % 2 === 0 ? 'Space' : 'Enter');
    presses++;
    await page.waitForTimeout(180);
    const s = await getState(page);
    if (s.state === 'playing') { restartedAtMs = Date.now() - deathAt; break; }
    if (s.state !== 'gameOver') break;
  }
  record('restart: rapid keys produce a new run', restartedAtMs >= 0, `after ${presses} presses, ${restartedAtMs}ms post-death`);

  const s = await getState(page);
  const fresh = s.state === 'playing' && s.stage === 1 && s.kills === 0 && s.level === 1;
  if (!fresh) await dumpState(page, 'not-fresh');
  record('restart: fresh run is clean (stage 1, kills 0)', fresh, `stage=${s.stage} kills=${s.kills} lvl=${s.level}`);
  await page.screenshot({ path: `${OUT}/qa-edge-02-restarted.png` });
}

// ── Scenario 2: pause/unpause mid-boss-fight ────────────────────

async function scenarioPauseDuringBoss(page) {
  currentScenario = 'pause-during-boss';
  await bootFresh(page);
  await startGame(page);
  await page.evaluate(() => {
    const rt = window.__universeEater;
    rt.world.player.heal(9999);
    rt.game.elapsedTime = 298;
  });

  let engaged = null;
  const end = Date.now() + 20000;
  while (Date.now() < end) {
    await page.evaluate(() => {
      const rt = window.__universeEater;
      if (rt.game.state === 'playing') rt.world.player.hp = rt.world.player.maxHp;
    });
    await page.keyboard.down('d');
    await page.waitForTimeout(450);
    await page.keyboard.up('d');
    engaged = await getState(page);
    if (engaged.bossEngaged && engaged.boss) break;
  }
  record('pauseboss: boss engages near timer expiry', !!(engaged?.bossEngaged && engaged?.boss),
    JSON.stringify(engaged ? { engaged: engaged.bossEngaged, boss: engaged.boss, state: engaged.state } : null));
  if (!engaged?.boss) {
    await page.screenshot({ path: `${OUT}/qa-edge-03-boss-noappear.png` });
    return;
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  let s = await getState(page);
  record('pauseboss: Escape pauses during fight', s.state === 'paused', `state=${s.state}`);
  record('pauseboss: boss preserved while paused', !!s.boss, JSON.stringify(s.boss));
  await page.screenshot({ path: `${OUT}/qa-edge-04-boss-paused.png` });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  s = await getState(page);
  record('pauseboss: Escape resumes fight', s.state === 'playing', `state=${s.state}`);
  record('pauseboss: boss still fighting after resume', !!s.boss, JSON.stringify(s.boss));

  // A couple of seconds of combat to prove the fight truly continued.
  await wiggle(page, 2000, true);
  s = await getState(page);
  record('pauseboss: still alive & fighting after resume', s.state === 'playing' && !!s.boss && s.hp > 0,
    `hp=${Math.round(s.hp)} boss=${JSON.stringify(s.boss)}`);
}

// ── Scenario 3: language switch on title screen ─────────────────

async function clickLanguageButton(page, lang) {
  // Mirrors UI.getLanguageSelectorLayout: margin 16, 112x32 buttons, gap 12.
  return page.evaluate((target) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bw = 112, bh = 32, gap = 12, margin = 16;
    const startX = (w - (bw * 2 + gap)) / 2;
    const yTop = h - margin - bh - 12;
    const cx = target === 'zh-CN' ? startX + bw / 2 : startX + bw + gap + bw / 2;
    return { x: cx, y: yTop + bh / 2 };
  }, lang).then(({ x, y }) => page.mouse.click(x, y));
}

async function scenarioLanguageSwitch(page) {
  currentScenario = 'language-switch';
  await bootFresh(page);
  const t0 = await page.title();
  let s = await getState(page);
  record('language: boots at zh-CN title', s.state === 'title' && t0 === '宇宙吞噬者', `state=${s.state} title="${t0}"`);
  await page.screenshot({ path: `${OUT}/qa-edge-05-title-zh.png` });

  await clickLanguageButton(page, 'en');
  await page.waitForTimeout(400);
  const tEn = await page.title();
  const storedLang = await page.evaluate(() => localStorage.getItem('universe-eater.language'));
  s = await getState(page);
  record('language: English button switches title', tEn === 'Universe Eater', `title="${tEn}" stored=${storedLang} state=${s.state}`);
  await page.screenshot({ path: `${OUT}/qa-edge-06-title-en.png` });

  await clickLanguageButton(page, 'zh-CN');
  await page.waitForTimeout(400);
  const tZh = await page.title();
  const storedZh = await page.evaluate(() => localStorage.getItem('universe-eater.language'));
  s = await getState(page);
  record('language: 中文 button switches back', tZh === '宇宙吞噬者', `title="${tZh}" stored=${storedZh} state=${s.state}`);
  record('language: clicks never started a run', s.state === 'title', `state=${s.state}`);
}

// ── Scenario 4: settings persistence across reload ──────────────

async function scenarioSettingsPersistence(page) {
  currentScenario = 'settings-persistence';
  await bootFresh(page);

  const readSettings = () => page.evaluate(() => {
    const raw = localStorage.getItem('universe-eater.settings.v1');
    return raw ? JSON.parse(raw) : null;
  });

  const before = await readSettings();
  const beforeSound = before ? before.soundEnabled : true;

  await startGame(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  let s = await getState(page);
  record('settings: pause menu open', s.state === 'paused', `state=${s.state}`);

// First settings row (Sound FX) -- mirrors UI.getPauseMenuLayout.
  const row = await page.evaluate(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const compact = h < 620;
    const panelWidth = Math.min(520, w - 36);
    const panelX = (w - panelWidth) / 2;
    const rowHeight = compact ? 26 : 30;

    // Flow positions before the global panelY shift:
    const resumeTop = compact ? 44 + 12 : 58 + 12;
    const resumeH = compact ? 38 : 44;
    const rowsTop = compact
      ? resumeTop + resumeH + 30                       // 2×2 grid top
      : resumeTop + resumeH + 34;                      // list top
    const rowsEnd = compact
      ? rowsTop + 2 * (rowHeight + 10)
      : rowsTop + 4 * 36;
    const buildLabelY = rowsEnd + (compact ? 12 : 6);
    const buildIconY = buildLabelY + (compact ? 18 : 22);
    const bottomH = compact ? 32 : 38;
    const bottomY = buildIconY + (compact ? 24 : 30);
    const panelHeight = bottomY + bottomH + (compact ? 22 : 30);
    const panelY = Math.max(compact ? 34 : 56, (h - panelHeight) / 2 - 10);

    const rowX = panelX + 28;
    const rowW = compact ? (panelWidth - 56 - 10) / 2 : panelWidth - 56;
    return { x: rowX + rowW / 2, y: rowsTop + panelY + rowHeight / 2 };
  });
  await page.mouse.click(row.x, row.y);
  await page.waitForTimeout(400);

  const after1 = await readSettings();
  const flippedOnce = !!after1 && after1.soundEnabled === !beforeSound;
  s = await getState(page);
  record('settings: row click flips soundEnabled in storage', flippedOnce,
    `before=${beforeSound} after=${after1 ? after1.soundEnabled : 'null'} state=${s.state}`);
  if (!flippedOnce) {
    await dumpState(page, 'toggle-miss');
    await page.screenshot({ path: `${OUT}/qa-edge-07-settings-clickmiss.png` });
    return;
  }

  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const after2 = await readSettings();
  record('settings: value survives reload', !!after2 && after2.soundEnabled === !beforeSound,
    `stored=${after2 ? after2.soundEnabled : 'null'} expected=${!beforeSound}`);

  await startGame(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  s = await getState(page);
  record('settings: pause menu renders persisted state', s.state === 'paused', `state=${s.state}`);
  await page.screenshot({ path: `${OUT}/qa-edge-08-settings-persisted.png` });
}

// ── Scenario 5: all weapons maxed / allMaxed path ────────────────

async function scenarioAllWeaponsMaxed(page) {
  currentScenario = 'weapons-all-maxed';
  await bootFresh(page);
  await startGame(page);

  await page.evaluate(() => {
    const rt = window.__universeEater;
    const wm = rt.world.weaponManager;
    for (const id of ['orbit', 'nova', 'escort', 'seeker', 'arc', 'singularity']) wm.addWeapon(id);
    for (const w of wm.weapons) w.level = w.maxLevel;
  });
  const s0 = await getState(page);
  record('maxed: 7 weapons owned, all at max level', s0.weapons.length === 7 && s0.allMaxed, s0.weapons.join(','));

  // Game path: runtime.ts gates queueLevelUps behind allMaxed().
  await page.evaluate(() => {
    const rt = window.__universeEater;
    const wm = rt.world.weaponManager;
    if (!wm.allMaxed()) rt.game.queueLevelUps(1, wm);
  });
  await page.waitForTimeout(500);
  const s1 = await getState(page);
  record('maxed: allMaxed gate keeps state playing (game path)',
    s1.state === 'playing' && s1.draftChoices === 0 && s1.pendingLevelUps === 0,
    `state=${s1.state} drafts=${s1.draftChoices} pending=${s1.pendingLevelUps}`);

  // Raw call as specified in the QA plan (bypasses the runtime gate).
  await page.evaluate(() => {
    const rt = window.__universeEater;
    rt.game.queueLevelUps(1, rt.world.weaponManager);
  });
    await page.waitForTimeout(500);
    const s2 = await getState(page);
  // With all weapons maxed, a queued level-up still offers a draft -- but it
    // must consist ONLY of passives (they remain useful by design). The draft
    // is fully suppressed only when passives are stack-capped as well.
    const choicesArePassives = s2.state === 'levelUp' && s2.draftKinds?.every(k => k === 'passive');
    record('maxed: draft offers only passives when weapons maxed',
      choicesArePassives,
      `state=${s2.state} drafts=${s2.draftChoices} kinds=${(s2.draftKinds || []).join(',')}`);
  if (s2.state !== 'playing') {
    await dumpState(page, 'raw-call-opened-draft');
    await page.screenshot({ path: `${OUT}/qa-edge-09-maxed-draft.png` });
    await page.keyboard.press('Enter'); // consume whatever opened, leave clean state
    await page.waitForTimeout(400);
  }
}

// ── Scenario 6: splitter death spawns shards ─────────────────────

async function scenarioSplitter(page) {
  currentScenario = 'splitter-splits';
  await bootFresh(page);
  await startGame(page);
  await page.evaluate(() => {
    const rt = window.__universeEater;
    rt.game.elapsedTime = 100; // splitters enter the spawn pool at t>=90
  });

  let saw = null;
  const end = Date.now() + 35000;
  while (Date.now() < end) {
    await page.evaluate(() => {
      const rt = window.__universeEater;
      if (rt.game.state === 'playing') rt.world.player.hp = rt.world.player.maxHp;
    });
    await page.keyboard.down('d');
    await page.waitForTimeout(450);
    await page.keyboard.up('d');
    // Auto-pick any draft so the wait loop never stalls on level-up screens.
    await page.evaluate(() => {
      const rt = window.__universeEater;
      if (rt.game.state === 'levelUp' && rt.game.draftChoices.length) {
        rt.game.chooseDraft(0, rt.world.weaponManager, rt.world.player);
      }
    });
    const s = await getState(page);
    if (s.splitters > 0) { saw = s; break; }
    if (s.state !== 'playing') break;
  }
  record('splitter: appears once in pool', !!saw, saw ? `t=${saw.elapsed.toFixed(0)}s splitters=${saw.splitters}` : 'none within 35s');
  if (!saw) {
    await page.screenshot({ path: `${OUT}/qa-edge-10-splitter-none.png` });
    return;
  }

  const preCount = saw.enemies;
  const preSplitters = saw.splitters;
  await page.evaluate(() => {
    const rt = window.__universeEater;
    rt.world.spawner.enemies.filter(e => e.type === 'splitter').forEach(e => e.takeDamage(99999));
  });
  await page.waitForTimeout(700); // allow consume frame + shard spawn

  const post = await getState(page);
  // Shards: 3 swarmers per splitter (src/enemies.ts:1049). Net gain vs the
  // removed splitters should be positive even with concurrent weapon kills.
  const netGain = post.enemies - (preCount - preSplitters);
  const ok = netGain >= Math.ceil(preSplitters * 0.5);
  record('splitter: death spawns shards (count grows)', ok,
    `pre=${preCount} killed=${preSplitters} post=${post.enemies} netGain=${netGain} splittersLeft=${post.splitters}`);
  await page.screenshot({ path: `${OUT}/qa-edge-11-splitter-shards.png` });
}

// ── Scenario 7: bomber proximity fuse & detonation ───────────────

async function scenarioBomber(page) {
  currentScenario = 'bomber-fuse';
  await bootFresh(page);
  await startGame(page);
  await page.evaluate(() => {
    const rt = window.__universeEater;
    rt.game.elapsedTime = 160; // bombers active from t>=150 band onward
    rt.world.player.heal(9999);
  });

  let found = false;
  const end = Date.now() + 35000;
  while (Date.now() < end) {
    await page.evaluate(() => {
      const rt = window.__universeEater;
      if (rt.game.state === 'playing') rt.world.player.hp = Math.min(rt.world.player.maxHp, rt.world.player.hp + 40);
    });
    // High-frequency sampling: bombers rush the player and self-destruct fast,
    // so slow polling misses them.
    for (let i = 0; i < 5; i++) {
      const seen = await page.evaluate(() => {
        const rt = window.__universeEater;
        if (rt.game.state !== 'playing') return -1;
        return rt.world.spawner.enemies.filter(e => e.type === 'bomber').length;
      });
      if (seen > 0) { found = true; break; }
      if (seen === -1) break;
      await page.waitForTimeout(110);
    }
    if (found) break;
    await page.keyboard.down('d');
    await page.waitForTimeout(300);
    await page.keyboard.up('d');
    const s = await getState(page);
    if (s.state === 'levelUp') {
      await page.evaluate(() => {
        const rt = window.__universeEater;
        if (rt.game.draftChoices.length) rt.game.chooseDraft(0, rt.world.weaponManager, rt.world.player);
      });
    }
    if (s.state !== 'playing') break;
  }
  record('bomber: spawns once active', found, found ? 'bomber observed in field' : 'none within 35s');
  if (!found) {
    await page.screenshot({ path: `${OUT}/qa-edge-12-bomber-none.png` });
    return;
  }

  // Teleport it beside the player (<150px arms the fuse) and watch 2.4s.
  await page.evaluate(() => {
    const rt = window.__universeEater;
    const b = rt.world.spawner.enemies.find(e => e.type === 'bomber');
    window.__qaBomber = b;
    b.x = rt.world.player.x + 100;
    b.y = rt.world.player.y;
  });
  const hpBefore = (await getState(page)).hp;
  const samples = [];
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(160);
    const sample = await page.evaluate(() => {
      const rt = window.__universeEater;
      const b = window.__qaBomber;
      return {
        state: rt.game.state,
        hp: rt.world.player.hp,
        refExists: !!b,
        refDead: b ? b.dead : null,
        stillListed: b ? rt.world.spawner.enemies.includes(b) : false,
        projectiles: b ? b.projectiles.length : -1,
        fuseRatio: b ? b.fuseRatio : -1,
      };
    });
    samples.push(sample);
    if (sample.refDead || sample.state !== 'playing') break;
  }

  const exploded = samples.some(s => s.refDead === true);
  const sawProjectiles = samples.some(s => s.projectiles > 0);
  const damaged = samples.some(s => s.hp < hpBefore);
  const died = samples.some(s => s.state === 'gameOver');
  const last = samples[samples.length - 1];
  record('bomber: proximity fuse detonates it', exploded,
    `fusePeak=${Math.max(...samples.map(s => s.fuseRatio)).toFixed(2)} dead=${exploded}`);
  record('bomber: blast effects near player (damage or projectile ring)', (damaged || sawProjectiles || died),
    `hp ${Math.round(hpBefore)}->${Math.round(last.hp)} projectilesSeen=${sawProjectiles}${died ? ' PLAYER_DIED' : ''}`);
  await page.screenshot({ path: `${OUT}/qa-edge-13-bomber-aftermath.png` });
}

// ── Runner ───────────────────────────────────────────────────────

let browser;
try {
  browser = await chromium.launch({
    args: ['--enable-gpu', '--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await attachConsole(page);

  const run = {
    restart: scenarioRestart,
    pauseboss: scenarioPauseDuringBoss,
    language: scenarioLanguageSwitch,
    settings: scenarioSettingsPersistence,
    maxed: scenarioAllWeaponsMaxed,
    splitter: scenarioSplitter,
    bomber: scenarioBomber,
  };

  if (only === 'all') {
    for (const fn of Object.values(run)) await fn(page);
  } else if (run[only]) {
    await run[only](page);
  } else {
    console.error(`Unknown scenario '${only}'. Options: ${Object.keys(run).join(' | ')} | all`);
    process.exit(2);
  }

  await ctx.close();
} finally {
  if (browser) await browser.close();
}

console.log('\n=== CONSOLE ERRORS (all scenarios) ===');
if (consoleErrors.length === 0) console.log('(none)');
    else consoleErrors.slice(0, 30).forEach(e => console.log(`[${e.scenario}] ${e.text.slice(0, 300)}`));

const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
console.log('\n=== SUMMARY ===');
    for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name} -- ${r.detail}`);
process.exit(failed.length > 0 ? 1 : 0);
