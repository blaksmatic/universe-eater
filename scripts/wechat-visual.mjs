import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
mkdirSync('test-artifacts',{recursive:true});
const browser=await chromium.launch({args:['--enable-gpu','--use-gl=angle','--ignore-gpu-blocklist']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<style>html,body{margin:0;background:#070b16;overflow:hidden}canvas{display:block}</style>');
 await page.evaluate(()=>{
  const callbacks={};window.wxCallbacks=callbacks;window.GameGlobal=window;
  const info={windowWidth:390,windowHeight:844,pixelRatio:2,safeArea:{top:47,left:0,right:390,bottom:810}};
  window.wx={getWindowInfo:()=>info,getMenuButtonBoundingClientRect:()=>({height:32,bottom:79}),
   createCanvas:()=>{const c=document.createElement('canvas');document.body.append(c);return c;},
   createOffscreenCanvas:({width,height})=>new OffscreenCanvas(width,height),
   getStorageSync:()=>'',setStorageSync:()=>{},removeStorageSync:()=>{},
   createWebAudioContext:()=>new AudioContext(),vibrateShort:()=>{}};
  for(const name of ['TouchStart','TouchMove','TouchEnd','TouchCancel','Hide','Show','WindowResize'])wx['on'+name]=cb=>callbacks[name]=cb;
 });
 await page.addScriptTag({content:readFileSync('wx/adapter.js','utf8')});
 await page.addScriptTag({content:readFileSync('wx/bundle.js','utf8')});
 await page.waitForTimeout(500);
 await page.screenshot({path:'test-artifacts/wechat-title.png'});
 await page.evaluate(()=>{
  const p={identifier:1,clientX:190,clientY:420};
  wxCallbacks.TouchStart({changedTouches:[p],touches:[p]});
  wxCallbacks.TouchEnd({changedTouches:[p],touches:[]});
 });
 await page.waitForTimeout(4000);
 await page.screenshot({path:'test-artifacts/wechat-play.png'});
 console.log(JSON.stringify({errors,state:await page.evaluate(()=>__win.__universeEater.game.state)}));
 if(errors.length)process.exitCode=1;
}finally{await browser.close();}
