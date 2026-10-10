/* Focused HTTP delivery and real interaction-event timing, separate from Lighthouse. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const assets=JSON.parse(execFileSync('pwsh',['-NoProfile','-File',path.join(__dirname,'local-wp.ps1'),'eval-file',path.join(__dirname,'media-fixture.php'),'http'],{encoding:'utf8'}));
(async()=>{
 const results=[],queue=[...assets];
 await Promise.all(Array.from({length:6},async()=>{while(queue.length){const asset=queue.shift(),response=await fetch(asset.url,{method:'HEAD'});assert.equal(response.status,200);assert.equal(response.headers.get('content-type').split(';')[0],asset.mime);results.push({...asset,cache:response.headers.get('cache-control'),expires:response.headers.get('expires')});}}));
 const browser=await chromium.launch({channel:'chrome'}),timings=[];
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.addInitScript(()=>{window.oxenEvents=[];new PerformanceObserver(list=>{for(const e of list.getEntries())if(e.interactionId)window.oxenEvents.push({duration:e.duration,id:e.interactionId,name:e.name})}).observe({type:'event',buffered:true,durationThreshold:16});});
  await page.goto('http://localhost:10016',{waitUntil:'networkidle'});
  for(let i=0;i<3;i++)await page.locator('[data-quiz-answer="2"]').click();await page.locator('[data-quiz-restart]').click();
  await page.locator('#annual-profit').fill('100000');await page.locator('.calculator__submit').click();
  for(const i of [1,2,0])await page.locator(`[data-about-detail="${i}"]`).click();await page.waitForTimeout(600);
  timings.push({width,events:await page.evaluate(()=>window.oxenEvents)});await page.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,'screenshots/media-performance/delivery-results.json'),JSON.stringify({resources:results,timings},null,2));
 console.log(`PASS: ${results.length} media URLs return 200 and correct MIME. Interaction event maxima: ${timings.map(t=>`${t.width}px=${Math.max(0,...t.events.map(e=>e.duration))}ms`).join(', ')} (local lab samples, not field INP).`);
})().catch(e=>{console.error(e);process.exitCode=1});
