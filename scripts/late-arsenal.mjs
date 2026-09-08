import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('test-artifacts', { recursive: true });
const browser = await chromium.launch({ args: ['--enable-gpu', '--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'] });
try {
 const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 await page.goto('http://localhost:3456');
 await page.keyboard.press('Space');
 await page.evaluate(() => {
  const {game,world}=window.__universeEater;
  for (const id of ['orbit','nova','escort','seeker','arc','singularity']) world.weaponManager.addWeapon(id);
  for (const weapon of world.weaponManager.weapons) weapon.level=10;
  world.player.level=40;
  world.player.hp=world.player.maxHp=100000;
  game.elapsedTime=480;
  game.notifications=[];
  game.scheduled=[];
  const Ctor=world.spawner.spawnBoss(world.player.x,world.player.y).constructor;
  world.spawner.clear();
  for(let i=0;i<45;i++) {
   const a=i*2.39996, r=120+(i%8)*48;
   const enemy=new Ctor(['sentinel','titan','stalker'][i%3],world.player.x+Math.cos(a)*r,world.player.y+Math.sin(a)*r);
   enemy.hp=enemy.maxHp=100000;
   world.spawner.enemies.push(enemy);
  }
 });
 await page.waitForTimeout(2200);
 await page.screenshot({path:'test-artifacts/late-arsenal.png'});
 const fps=await page.evaluate(()=>new Promise(resolve=>{
  let n=0; const start=performance.now();
  function frame(){n++;if(performance.now()-start<3000) requestAnimationFrame(frame);else resolve(Math.round(n*1000/(performance.now()-start)));}requestAnimationFrame(frame);
 }));
 console.log(JSON.stringify({fps,errors}));
 if(errors.length) process.exitCode=1;
} finally { await browser.close(); }
