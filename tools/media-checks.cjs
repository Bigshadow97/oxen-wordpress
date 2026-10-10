/* Deterministic before/after captures plus one consolidated refactor regression. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const baseline=process.argv.includes('--baseline'),capture=process.argv.includes('--capture-only'),folder=path.join(__dirname,'screenshots','media-performance');
let browser;
(async()=>{
 fs.mkdirSync(folder,{recursive:true});browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const geometry=[];
 const widths=(process.argv.find(a=>a.startsWith('--widths='))?.split('=')[1]||'1440,1920,768,390').split(',').map(Number);
 for(const width of widths){
  await page.setViewportSize({width,height:1000});const response=await page.goto('http://localhost:10016',{waitUntil:'networkidle'});assert.equal(response.status(),200);
  // Capture all images for visual comparison; Lighthouse independently measures native loading.
  await page.evaluate(async()=>{await document.fonts.ready;[...document.images].forEach(n=>n.loading='eager');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await Promise.all([...document.images].map(n=>n.decode().catch(()=>{})));document.activeElement.blur();scrollTo({top:0,behavior:'instant'})});
  await page.waitForFunction(()=>[...document.images].every(n=>n.complete));await page.mouse.move(0,0);
  assert.deepEqual(await page.evaluate(()=>[...document.images].filter(n=>!n.naturalWidth).map(n=>n.src)),[],'All images decode');
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,sections:[...document.querySelectorAll('main > section,header#navigation,footer#site-footer')].map(n=>{const r=n.getBoundingClientRect();return {id:n.id,x:r.x,y:r.y,width:r.width,height:r.height}})}));
  geometry.push(layout);assert.equal(layout.scrollWidth,width);await page.screenshot({path:path.join(folder,`${width}-${baseline?'before':'after'}.png`),fullPage:true});
  if(!baseline&&!capture){
   if(width===1440){
    await page.emulateMedia({reducedMotion:'no-preference'});
    const track=page.locator('.partners__track'),sample=()=>track.evaluate(n=>{const a=n.getAnimations()[0],t=a.effect.getTiming();return {time:Number(a.currentTime),duration:t.duration,state:a.playState,easing:t.easing,iterations:t.iterations,width:n.querySelector('.partners__group').getBoundingClientRect().width,trackWidth:n.getBoundingClientRect().width}});
    const first=await sample();assert.equal(first.state,'running');assert.equal(first.easing,'linear');assert.equal(first.iterations,Infinity);assert.ok(Math.abs(first.width/(first.duration/1000)-24)<.01&&Math.abs(first.trackWidth-2*first.width)<.02);
    await page.waitForTimeout(100);assert.ok((await sample()).time>first.time);
    await page.locator('[data-logo-carousel]').focus();await page.waitForTimeout(40);assert.equal((await sample()).state,'paused');
    await page.evaluate(()=>document.activeElement.blur());
    for(const i of [1,2,0,2,1,0]){await page.locator(`[data-about-detail="${i}"]`).dispatchEvent('click');await page.waitForTimeout(40)}
    await page.waitForTimeout(550);assert.equal(await page.locator('[data-about-detail][aria-expanded="true"]').count(),1);assert.equal(await page.locator('[data-about-detail="0"]').getAttribute('aria-expanded'),'true');
    await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await track.evaluate(n=>getComputedStyle(n).animationName),'none');
   }
   assert.equal(await page.locator('header#navigation').count(),1);assert.equal(await page.locator('footer#site-footer').count(),1);
   assert.equal(await page.evaluate(()=>document.querySelectorAll('[data-node-id]').length+[...document.querySelectorAll('[class]')].filter(n=>[...n.classList].some(c=>/^(?:layer|art)-\d+$|^(?:design-layer|art-layer)$/.test(c))).length),0,'No generated markup');
   for(let i=0;i<3;i++)await page.locator('[data-quiz-answer="2"]').click();assert.equal(await page.locator('[data-quiz-result-link]').getAttribute('href'),'#service-2');
   await page.locator('[data-quiz-back]').click();assert.match(await page.locator('#quiz-progress').textContent(),/03/);await page.locator('[data-quiz-answer="2"]').click();await page.locator('[data-quiz-restart]').click();
   await page.locator('#annual-profit').fill('100000');await page.locator('.calculator__submit').click();assert.equal(await page.locator('#tax-owed').textContent(),'$28,000');
   await page.locator('#business-structure').selectOption('sole-trader');assert.equal(await page.locator('#tax-owed').textContent(),'$22,878');
   for(const i of [1,2,0]){await page.locator(`[data-about-detail="${i}"]`).click();assert.equal(await page.locator('[data-about-detail][aria-expanded="true"]').count(),1);assert.equal(await page.locator('dialog[open]').count(),0)}
   for(const i of [2,3]){await page.locator('[data-slider-next]').click();assert.equal(await page.locator('#slider-position').textContent(),`Client story ${i} of 3`)}assert.equal(await page.locator('[data-slider-next]').isVisible(),false);
   for(const i of [2,1]){await page.locator('[data-slider-previous]').click();assert.equal(await page.locator('#slider-position').textContent(),`Client story ${i} of 3`)}assert.equal(await page.locator('[data-slider-previous]').isVisible(),false);
   for(const selector of ['[data-preview-plan="0"]','[data-open-comparison]','[data-open-case-study]','#contact [data-open-contact]']){await page.locator(selector).first().click();assert.equal(await page.locator('dialog[open]').count(),1);await page.keyboard.press('Escape')}
   if(width<1440){await page.locator('.site-header__toggle').click();assert(await page.locator('#mobile-navigation').isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('.site-header__toggle').getAttribute('aria-expanded'),'false')}
  }
 }
 const old=fs.existsSync(path.join(folder,'after.json'))?JSON.parse(fs.readFileSync(path.join(folder,'after.json'))):[];
 const combined=baseline?geometry:[...old.filter(n=>!widths.includes(n.width)),...geometry].sort((a,b)=>b.width-a.width);
 fs.writeFileSync(path.join(folder,baseline?'baseline.json':'after.json'),JSON.stringify(combined,null,2));
 if(!baseline&&!capture){
  const before=JSON.parse(fs.readFileSync(path.join(folder,'baseline.json'))).filter(n=>widths.includes(n.width)).map(n=>({width:n.width,scrollWidth:n.width,sections:n.sections}));
  assert.deepEqual(geometry,before,'Section geometry preserved exactly');
 }
 assert.deepEqual(errors,[]);console.log(capture?'PASS: comparison captures saved; no browser errors.':baseline?'PASS: four baseline captures saved.':`PASS: ${widths.join('/')} layouts, generated-markup removal, shared shell, quiz/Back, calculator, accordion, slider, dialogs, mobile navigation and browser errors.`);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()});
