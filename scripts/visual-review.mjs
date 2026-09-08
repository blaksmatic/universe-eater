import { chromium } from 'playwright';
const browser=await chromium.launch();
const page=await browser.newPage();
for (const [name,width,height] of [['desktop',1440,900],['phone',390,844],['landscape',844,390]]) {
 await page.setViewportSize({width,height});
 await page.goto('http://localhost:3456');
 await page.waitForTimeout(700);
 await page.screenshot({path:`test-artifacts/redesign-${name}.png`});
}
await browser.close();
