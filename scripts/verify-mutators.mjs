// Verify stage mutators: roll, announce, and affect enemy stats.
import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--enable-gpu'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

await page.goto('http://localhost:3456/index.html', { waitUntil: 'load' });
await page.waitForTimeout(1200);
await page.keyboard.press('Space');
await page.waitForTimeout(400);

// Force stage 3 (guaranteed mutator) via the real advance path.
await page.evaluate(() => {
  const rt = window.__universeEater;
  rt.game.advanceStage(); // stage 2
  rt.world.prepareNextStage(2, rt.game.gameDuration, rt.game.mutators);
  rt.game.advanceStage(); // stage 3
  rt.world.prepareNextStage(3, rt.game.gameDuration, rt.game.mutators);
});
const info = await page.evaluate(() => {
  const rt = window.__universeEater;
  return {
    stage: rt.game.stage,
    mutators: rt.game.mutators,
    notifications: rt.game.notifications.map(n => n.text()),
  };
});
console.log('stage:', info.stage, 'mutators:', info.mutators.join(','));
console.log('notifications:');
info.notifications.forEach(n => console.log('  •', n));

// Let enemies spawn for ~8s and compare HP of a swarmer vs neutral expectation.
await page.waitForTimeout(8000);
const stats = await page.evaluate(() => {
  const rt = window.__universeEater;
  const swarmers = rt.world.spawner.enemies.filter(e => e.type === 'swarmer');
  return {
    count: swarmers.length,
    avgMaxHp: swarmers.length ? swarmers.reduce((s, e) => s + e.maxHp, 0) / swarmers.length : 0,
  };
});
console.log('spawned swarmers:', stats.count, 'avgMaxHp:', stats.avgMaxHp.toFixed(1));
// Stage 3 (+2 difficulty from stage) neutral swarmer: 38*0.5*(1+2*0.42)=~31.9; frenzy*0.85≈27, heavy*1.4≈45, veterans(+2)≈63
console.log('expected ranges: frenzy~27 heavy~45 overdrive~32 shrapnel~32 elites~32 tiny~22 veterans~63');

console.log('console errors:', errors.length);
errors.slice(0, 5).forEach(e => console.log('•', e.slice(0, 200)));
await browser.close();
