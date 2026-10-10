/* Focused Why Oxen visual/motion check; no full-site regression loop. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
let browser;
(async()=>{
 const folder=path.join(__dirname,'screenshots','why-motion');fs.mkdirSync(folder,{recursive:true});
 const baseline=process.argv.includes('--baseline'),report=[],errors=[];
 browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://localhost:10016',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const widths=process.argv.find(n=>n.startsWith('--width='))?.split('=')[1].split(',').map(Number)||[1440,1920,768,390];
 for(const width of widths){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.locator('#about').scrollIntoViewIfNeeded();await page.locator('#about img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));
  await page.evaluate(()=>{document.activeElement.blur();scrollTo({top:0,behavior:'instant'})});await page.mouse.move(0,0);
  const layout=await page.locator('#about').evaluate(section=>{
   const rect=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height}};
   return {width:innerWidth,section:rect(section),scrollWidth:document.documentElement.scrollWidth,
    left:[...section.querySelectorAll('.about-copy .copy-layer,.about-team .copy-layer')].map(n=>({node:n.dataset.nodeId,text:n.textContent.trim(),...rect(n)})),
    items:[...section.querySelectorAll('.why-item')].map(n=>({title:n.querySelector('.why-label').textContent,description:n.querySelector('.why-description').textContent,asset:n.querySelector('.why-photo img').src,...rect(n),photo:rect(n.querySelector('.why-photo')),heading:rect(n.querySelector('.why-heading'))}))};
  });
  report.push(layout);
  await page.screenshot({path:path.join(folder,`${width}-${baseline?'before':'after'}.png`),style:'.skip-link:not(:focus) { visibility: hidden; }',fullPage:true,clip:{x:0,y:layout.section.y,width,height:Math.ceil(layout.section.height)}});
  if(!baseline){
   const saved=path.join(folder,'baseline.json');
   if(fs.existsSync(saved)){
    const old=JSON.parse(fs.readFileSync(saved)).find(n=>n.width===width);
    assert.deepEqual(layout.left,old.left,'Figma left-column geometry and content preserved');
    const content=items=>items.map(({title,description,asset})=>({title,description,asset}));
    assert.deepEqual(content(layout.items),content(old.items),'All three original items and image assets preserved');
    assert.deepEqual(layout.items[0].photo,old.items[0].photo,'Original active image geometry preserved');
   }
   assert.equal(layout.scrollWidth,width);
   await page.locator('[data-why-accordion][data-motion-ready]').waitFor();
   await page.evaluate(()=>scrollTo({top:document.querySelector('[data-why-accordion]').getBoundingClientRect().y+scrollY-80,behavior:'instant'}));
   const checkState=async index=>{
    const state=await page.locator('[data-why-accordion]').evaluate(root=>({
     items:[...root.querySelectorAll('.why-item')].map(n=>{
      const b=n.querySelector('.why-toggle'),photo=n.querySelector('.why-photo'),description=n.querySelector('.why-description'),head=b.getBoundingClientRect(),p=photo.getBoundingClientRect(),d=description.getBoundingClientRect();
      return {open:n.classList.contains('is-open'),expanded:b.getAttribute('aria-expanded'),icon:n.querySelector('.why-icon').textContent,
       photoHeight:n.querySelector('.why-image-reveal').getBoundingClientRect().height,descriptionHeight:n.querySelector('.why-panel').getBoundingClientRect().height,
       controls:b.getAttribute('aria-controls').split(/\s+/).map(id=>{const panel=document.getElementById(id);return {exists:!!panel,hidden:panel.getAttribute('aria-hidden'),inert:panel.inert}}),
       imageLoaded:photo.querySelector('img').complete&&photo.querySelector('img').naturalWidth>0,imageAbove:p.bottom<=head.top+.1,copyBelow:d.top>=head.bottom-.1,
       clipping:[...n.querySelectorAll('.why-reveal,.why-photo')].map(n=>getComputedStyle(n).overflow),
       headingVisible:head.height>0,labelFits:n.querySelector('.why-label').getBoundingClientRect().right<=n.querySelector('.why-icon').getBoundingClientRect().left+.1};
     }),dialogs:document.querySelectorAll('dialog[open]').length,overflow:document.documentElement.scrollWidth>innerWidth}));
    assert.equal(state.items.filter(n=>n.open).length,1);assert.equal(state.dialogs,0);assert.equal(state.overflow,false);
    state.items.forEach((n,i)=>{
     assert.equal(n.open,i===index);assert.equal(n.expanded,String(i===index));assert.equal(n.icon,i===index?'−':'+');assert(n.headingVisible&&n.labelFits);
     n.controls.forEach(p=>{assert(p.exists);assert.equal(p.hidden,String(i!==index));assert.equal(p.inert,i!==index)});
     assert(n.clipping.every(value=>value==='clip'));
     if(i===index){assert(n.imageLoaded&&n.imageAbove&&n.copyBelow);assert(n.photoHeight>0&&n.descriptionHeight>0)}else{assert(n.photoHeight<.1&&n.descriptionHeight<.1)}
    });return state;
   };
   await checkState(0);
   const motion=[];
   for(const index of [1,2,0]){
    const previous=index===1?0:index===2?1:2;
    const samples=await page.evaluate(async({index})=>{
     const root=document.querySelector('[data-why-accordion]'),nodes=[...root.querySelectorAll('.why-item')],start=performance.now(),scroll=scrollY,result=[];
     nodes[index].querySelector('button').click();
     while(performance.now()-start<650){
      await new Promise(requestAnimationFrame);result.push({t:performance.now()-start,scroll:scrollY-scroll,
       items:nodes.map(n=>({height:n.getBoundingClientRect().height,photo:n.querySelector('.why-image-reveal').getBoundingClientRect().height,
        opacity:Number(getComputedStyle(n.querySelector('.why-photo')).opacity),transform:getComputedStyle(n.querySelector('.why-photo')).transform,
        transition:getComputedStyle(n.querySelector('.why-image-reveal')).transitionDuration}))});
     }return result;
    },{index});
    const first=samples[0],last=samples.at(-1),startHeight=first.items[previous].photo,endHeight=last.items[index].photo;
    assert(samples.some(s=>s.items[index].photo>1&&s.items[index].photo<endHeight-1),'New image height genuinely interpolates');
    assert(samples.some(s=>s.items[previous].photo>1&&s.items[previous].photo<startHeight-1),'Previous image height genuinely interpolates');
    assert(samples.some(s=>s.items[index].opacity>.05&&s.items[index].opacity<.95),'Image fades');
    assert(samples.some(s=>s.items[index].transform!=='none'&&s.items[index].transform!=='matrix(1, 0, 0, 1, 0, 0)'),'Image slides');
    assert(samples.every(s=>Math.abs(s.scroll)<1),'Switching never scrolls page');
    assert.equal(last.items[index].transition,'0.5s');assert(last.items[previous].photo<.1);
    const state=await checkState(index);motion.push({index,samples,state});
    await page.locator('#about').screenshot({path:path.join(folder,`${width}-item-${index+1}.png`),style:'.skip-link:not(:focus) { visibility: hidden; }'});
   }
   // CSS reverses the currently rendered heights; no delayed callback can reopen an old panel.
   await page.evaluate(async()=>{const b=[...document.querySelectorAll('[data-about-detail]')];for(const i of [1,2,0,2,1,0]){b[i].click();await new Promise(r=>setTimeout(r,45))}});
   await page.waitForTimeout(600);await checkState(0);
   const controls=page.locator('[data-about-detail]');await controls.nth(0).focus();await page.keyboard.press('ArrowDown');
   assert(await controls.nth(1).evaluate(n=>n===document.activeElement&&n.matches(':focus-visible')));await page.keyboard.press('Space');await page.waitForTimeout(600);await checkState(1);
   await page.keyboard.press('Home');await page.keyboard.press('Enter');await page.waitForTimeout(600);await checkState(0);
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.evaluate(()=>document.querySelector('[data-about-detail="2"]').click());await page.waitForTimeout(50);await checkState(2);
   assert(await page.locator('[data-why-accordion] .why-reveal').evaluateAll(ns=>ns.every(n=>n.getAnimations().length===0)),'Reduced motion disables transitions');
   await page.evaluate(()=>document.querySelector('[data-about-detail="0"]').click());await page.waitForTimeout(50);await checkState(0);
   await page.emulateMedia({reducedMotion:'no-preference'});layout.motion=motion;
  }
  console.log(width+'px '+(baseline?'baseline captured':'PASS: 01→02→03→01, 500ms height/fade/slide, rapid clicks, keyboard, reduced motion and original content/left column'));
  fs.writeFileSync(path.join(folder,baseline?'baseline.json':'report.json'),JSON.stringify(report,null,2));
 }
 fs.writeFileSync(path.join(folder,baseline?'baseline.json':'report.json'),JSON.stringify(report,null,2));assert.deepEqual(errors,[]);await browser.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1});
