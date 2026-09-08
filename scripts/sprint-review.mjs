import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
mkdirSync('test-artifacts',{recursive:true});
const browser=await chromium.launch({args:['--enable-gpu','--use-gl=angle','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3456');await page.keyboard.press('Space');
 await page.evaluate(()=>{const r=window.__universeEater; r.game.elapsedTime=114; r.world.player.hp=100000;});
 await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>window.__universeEater.world.spawner.stageDuration),600);
 await page.evaluate(()=>window.__universeEater.game.elapsedTime=120.1);
 await page.waitForTimeout(100);
 assert.ok(await page.evaluate(()=>window.__universeEater.world.spawner.enemies.some(e=>e.type==='stalker'&&e.isElite)));
 await page.screenshot({path:'test-artifacts/sprint-encounter.png'});
 for(const [name,width,height] of [['phone',390,844],['landscape',667,375]]){
  await page.setViewportSize({width,height});
  await page.evaluate(()=>{const r=window.__universeEater;r.game.state='playing';r.world.player.hp=1;r.world.player.postHitInvuln=0;r.world.player.takeDamage(9,{enemy:'lancer',kind:'contact',x:r.world.player.x+50,y:r.world.player.y});r.game.state='gameOver';});
  await page.waitForTimeout(1400);
  assert.equal(await page.evaluate(()=>window.__universeEater.game.state),'gameOver');
  await page.screenshot({path:`test-artifacts/sprint-death-${name}.png`});
 }
 assert.deepEqual(errors,[]);console.log('PASS integrated 600s pacing, elite encounter, death recap renders, no runtime errors');
}finally{await browser.close();}
