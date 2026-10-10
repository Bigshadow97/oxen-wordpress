/* Uses the bundled Playwright runtime; no browser dependencies are shipped. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const { chromium } = playwright;
if (process.argv.includes('--diagnostics')) process.env.OXEN_DIAGNOSTICS = 'only';

let browser;
(async () => {
  const folder = path.join(__dirname, 'screenshots');
  fs.mkdirSync(folder, { recursive: true });
  browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--host-resolver-rules=MAP oxen-development.local 127.0.0.1', '--no-proxy-server'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', contrast: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  const layouts = [];
  async function checkLayout(width) {
    const layout = await page.evaluate(() => {
      const bounds = n => { const r=n.getBoundingClientRect(); return {x:r.x,y:r.y+scrollY,width:r.width,height:r.height,right:r.right}; };
      return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,sections:[...document.querySelectorAll('.section')].map(n=>({id:n.id,...bounds(n)})),cards:[...document.querySelectorAll('.service-card')].map(n=>({id:n.id,...bounds(n)})),portrait:bounds(document.querySelector('.hero__portrait')),controls:[...document.querySelectorAll('.service-card .button,.calculator__form .calculator__input,.calculator__form .calculator__submit,.hero__proof > .section__item')].map(n=>({class:n.className,...bounds(n)})),statistics:[...document.querySelectorAll('.stat-card')].map(bounds)};
    });
    assert.equal(layout.scrollWidth,width,'Horizontal overflow at '+width);
    assert.equal(await page.locator('footer,#site-footer,.site-footer').count(),1,'Shared footer rendered once');
    assert.equal(layout.sections.at(-1).id,'site-footer','Homepage ends with reusable footer');
    assert.ok(Math.abs(await page.evaluate(()=>document.documentElement.scrollHeight)-(layout.sections.at(-1).y+layout.sections.at(-1).height))<1,'No whitespace after footer');
    assert.equal(await page.locator('[data-contrast-toggle],.contrast-toggle').count(),0,'No non-Figma footer contrast control');
    for (const section of layout.sections) {
      assert.ok(Math.abs(section.x)<1 && Math.abs(section.right-width)<1,'Section must span viewport: '+section.id+' at '+width);
    }
    for(const control of layout.controls) assert.ok(control.x>=-1 && control.right<=width+1,'Control outside viewport: '+control.class+' at '+width);
    layout.partnerLogos = await page.locator('[data-logo-carousel]').evaluate(carousel=>{
      const r=carousel.getBoundingClientRect(),groups=[...carousel.querySelectorAll('.partners__group')];
      return {groups:groups.length,cloneHidden:groups[1].getAttribute('aria-hidden')==='true'&&groups[1].inert,
        cloneDisplay:getComputedStyle(groups[1]).display,animations:carousel.querySelector('.partners__track').getAnimations().length,
        images:[...groups[0].querySelectorAll('img')].map(n=>{const b=n.getBoundingClientRect();return {alt:n.alt,loaded:n.complete&&n.naturalWidth>0,fit:getComputedStyle(n).objectFit,ratio:b.width/b.height,naturalRatio:n.naturalWidth/n.naturalHeight,inside:b.x>=r.x&&b.right<=r.right+.1&&b.y>=r.y&&b.bottom<=r.bottom+.1};})};
    });
    const logos=layout.partnerLogos;
    assert.equal(logos.groups,2);assert.equal(logos.images.length,6);assert.equal(logos.cloneHidden,true);
    assert.ok(logos.images.every(n=>n.alt&&n.loaded&&n.fit==='contain'&&Math.abs(n.ratio-n.naturalRatio)<.001&&n.inside),'All six original logos remain visible and undistorted in reduced motion at '+width);
    assert.equal(logos.cloneDisplay,'none');assert.equal(logos.animations,0,'Reduced motion disables logo autoplay');
    layout.comparisonCTA = await page.locator('[data-open-comparison]').evaluate(button => {
      const bounds=n=>{const r=n.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width,height:r.height};};
      return {button:bounds(button),display:getComputedStyle(button).display,art:[...button.querySelectorAll('img')].map(n=>({...bounds(n),loaded:n.complete&&n.naturalWidth>0}))};
    });
    const comparison=layout.comparisonCTA;
    // Grid/Flex items blockify inline-flex's outer display; its inner layout stays Flex.
    assert.ok(['flex','inline-flex'].includes(comparison.display),'Comparison CTA layout at '+width);
    assert.equal(comparison.art.length,2,'Comparison icon and underline must belong to the button');
    assert.ok(comparison.art.every(n=>n.loaded&&n.x>=comparison.button.x-1&&n.right<=comparison.button.right+1&&n.height>0),'Comparison artwork hidden or detached at '+width);
    assert.ok(Math.abs(comparison.art[0].width-16)<.1&&Math.abs(comparison.art[0].height-16)<.1&&Math.abs(comparison.art[1].width-224.914)<.1,'Comparison source dimensions at '+width);
    layout.caseStudyDecorations = await page.locator('.case-study').evaluateAll(cards => cards.map(card => {
      const bounds=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
      const frame=card.querySelector('.case-study__frame');
      return {frame:bounds(frame),border:getComputedStyle(frame).borderTopWidth,ruleSizes:getComputedStyle(frame,'::before').backgroundSize,
        corners:[...frame.querySelectorAll('.case-study__corner')].map(n=>({...bounds(n),loaded:n.complete&&n.naturalWidth>0})),
        dividers:[...card.querySelectorAll('.case-study__divider img')].map(n=>({...bounds(n),loaded:n.complete&&n.naturalWidth>0}))};
    }));
    assert.equal(layout.caseStudyDecorations.length,2);
    for(const card of layout.caseStudyDecorations) {
      assert.equal(card.border,'0px','No rounded full-pixel or duplicate case-study border at '+width);
      assert.equal(card.ruleSizes,'100% 0.5px, 100% 0.5px, 0.5px 100%, 0.5px 100%','Original faint frame rules at '+width);
      assert.equal(card.corners.length,4);assert.equal(card.dividers.length,2);
      card.corners.forEach((corner,index)=>{
        const left=index%2===0,top=index<2;
        assert.ok(corner.loaded&&Math.abs(corner.width-7.47656)<.1&&Math.abs(corner.height-7.34527)<.1,'Original corner artwork at '+width);
        assert.ok(Math.abs((left?corner.x:corner.right)-(left?card.frame.x:card.frame.right))<1.2&&Math.abs((top?corner.y:corner.bottom)-(top?card.frame.y:card.frame.bottom))<1.2,'Detached case-study corner at '+width);
      });
      assert.ok(card.dividers.every(line=>line.loaded&&Math.abs(line.width-.5)<.02&&line.height>44),'Missing thin statistic divider at '+width);
      assert.ok(Math.abs(card.dividers[0].y-card.dividers[1].y)<.1&&Math.abs(card.dividers[0].height-card.dividers[1].height)<.1,'Uneven statistic dividers at '+width);
    }
    assert.deepEqual(await page.locator('.service-card .button').evaluateAll(ns=>ns.filter(n=>{const r=n.getBoundingClientRect(),p=n.closest('.service-card').getBoundingClientRect();return r.x<p.x-1 || r.right>p.right+1 || r.bottom>p.bottom+1;}).map(n=>n.className)),[],'Service CTA outside card at '+width);
    if (width!==1440) for(const stat of layout.statistics) assert.ok(stat.width>44 && stat.height>44,'Collapsed statistic at '+width);
    const capture=fs.readFileSync(path.join(folder,width===1440?'desktop-1440.png':'responsive-'+width+'.png'));
    assert.equal(capture.readUInt32BE(16),width,'Screenshot width at '+width);
    const bottom=layout.sections.at(-1).y+layout.sections.at(-1).height;
    assert.ok(capture.readUInt32BE(20)>=Math.floor(bottom),'Screenshot must include complete footer at '+width);
    if (width>=1440) {
      assert.ok(Math.abs(layout.portrait.width/layout.portrait.height-1207.1/773.89)<.002,'Hero portrait aspect ratio at '+width);
      for(let i=1;i<layout.cards.length;i++) assert.ok(layout.cards[i].x>=layout.cards[i-1].right-1,'Service card overlap at '+width);
    }
    if (width>=1440) {
      layout.calculatorPanels = await page.locator('#calculator').evaluate(section=>{
        const bounds=n=>{const r=n.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width,height:r.height};};
        return {formBackground:bounds(section.querySelector('.calculator__form-background')),resultBackground:bounds(section.querySelector('.calculator__results-frame')),horizontalRule:bounds(section.querySelector('.calculator__results-divider img'))};
      });
      const panels=layout.calculatorPanels,overlap=panels.formBackground.right-panels.resultBackground.x;
      assert.ok(overlap>=.98&&overlap<=1.1,'Calculator background seam must be covered without moving panel content at '+width);
      assert.ok(Math.abs(panels.horizontalRule.width-width/3)<.05&&panels.horizontalRule.height>0&&panels.horizontalRule.height<=.51,'Calculator horizontal divider stays unchanged at '+width);
      layout.dividers=await page.locator('.quiz__foundations-divider,.quiz__essentials-divider,.quiz__advisory-divider,.quiz__cfo-divider,.quiz-card__divider,.calculator__results-divider').evaluateAll(ns=>ns.map(n=>{
        const r=n.getBoundingClientRect(),line=n.querySelector('img').getBoundingClientRect();
        return {class:n.className,x:r.x,right:r.right,width:r.width,lineX:line.x,lineRight:line.right,lineWidth:line.width};
      }));
      for(const divider of layout.dividers) assert.ok(Math.abs(divider.lineX-divider.x)<1 && Math.abs(divider.lineRight-divider.right)<1,'SVG divider must fill its fluid container: '+divider.class+' at '+width);
      layout.quizBadge=await page.evaluate(()=>{
        const bounds=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,right:r.right};};
        return {label:bounds('.quiz__advisory-button'),badge:bounds('.layer-375'),text:bounds('.quiz__popular-badge')};
      });
      const {label,badge,text}=layout.quizBadge;
      assert.ok(badge.x>=label.right+8,'Quiz badge overlaps the service label at '+width);
      assert.ok(text.x>=badge.x && text.right<=badge.right,'Quiz badge text outside background at '+width);
    }
    layouts.push(layout);
    fs.writeFileSync(path.join(folder,'full-width-layout.json'),JSON.stringify(layouts,null,2));
  }
  async function checkPartnerMotion() {
    await page.mouse.move(0,0);await page.evaluate(()=>document.activeElement.blur());
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const track=page.locator('.partners__track');
    const sample=()=>track.evaluate(n=>{const a=n.getAnimations()[0],t=a.effect.getTiming();return {time:Number(a.currentTime),duration:t.duration,state:a.playState,easing:t.easing,iterations:t.iterations,width:n.querySelector('.partners__group').getBoundingClientRect().width,trackWidth:n.getBoundingClientRect().width};});
    const before=await sample();assert.equal(before.state,'running');assert.equal(before.easing,'linear');assert.equal(before.iterations,Infinity);
    assert.ok(Math.abs(before.width/(before.duration/1000)-24)<.01&&Math.abs(before.trackWidth-2*before.width)<.02,'Exact cycles at constant logo scrolling speed');
    await page.waitForTimeout(100);assert.ok((await sample()).time>before.time,'Logo autoplay starts without interaction');
    await page.locator('[data-logo-carousel]').focus();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(r)));
    const paused=await sample();assert.equal(paused.state,'paused');await page.waitForTimeout(100);assert.ok(Math.abs((await sample()).time-paused.time)<1,'Focus pauses logos');
    await page.evaluate(()=>document.activeElement.blur());await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  }
  async function checkStoryNavigation() {
    const next=page.locator('[data-slider-next]'),previous=page.locator('[data-slider-previous]');
    assert.equal(await next.count(),1);assert.equal(await previous.count(),1);
    assert.equal((await next.textContent()).trim(),'Next');
    const quote=await page.locator('#client-story').textContent();
    async function checkState(slide) {
      assert.equal(await previous.isVisible(),slide>1);assert.equal(await next.isVisible(),slide<3);
      assert.equal(await page.locator('#slider-position').textContent(),'Client story '+slide+' of 3');
      const layout=await page.locator('.testimonial__navigation').evaluate(n=>{
        const r=n.getBoundingClientRect(),card=n.closest('.testimonial');
        const frame=(innerWidth>=1440?card.querySelector('.testimonial__background'):card).getBoundingClientRect();
        const styles=[...n.querySelectorAll('button')].map(b=>{const s=getComputedStyle(b);return ['fontFamily','fontSize','fontWeight','lineHeight','color','padding','textAlign'].map(k=>s[k]);});
        return {height:r.height,right:r.right,bottom:r.bottom,cardRight:frame.right,cardBottom:frame.bottom,styles};
      });
      assert.equal(layout.height,44);assert.deepEqual(layout.styles[0],layout.styles[1]);
      assert.ok(layout.right<=layout.cardRight+1&&layout.bottom<=layout.cardBottom+1&&layout.cardBottom-layout.bottom<=25,'Navigation stays inside the card bottom-right');
    }
    await checkState(1);await next.focus();await page.keyboard.press('ArrowLeft');await checkState(1);
    await page.keyboard.press('Enter');await checkState(2);
    await next.focus();await page.keyboard.press('Space');await checkState(3);
    assert.equal(await previous.evaluate(n=>n===document.activeElement),true,'Focus transfers from hidden Next');
    await page.keyboard.press('ArrowRight');await checkState(3);
    await previous.click();await checkState(2);
    await previous.focus();await page.keyboard.press('Enter');await checkState(1);
    assert.equal(await next.evaluate(n=>n===document.activeElement),true,'Focus transfers from hidden Previous');
    assert.equal(await page.locator('#client-story').textContent(),quote);
    await page.keyboard.press('ArrowRight');await checkState(2);
    await page.keyboard.press('ArrowLeft');await checkState(1);
  }
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push('HTTP ' + response.status() + ' ' + response.url()); });
  await page.goto(process.env.OXEN_URL || 'http://localhost:10016', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({ path: path.join(folder, 'desktop-1440.png'), fullPage: true });
  await checkLayout(1440);
  await checkPartnerMotion();
  if (process.argv.includes('--blur-variants')) {
    const masks = ['linear-gradient(to bottom,transparent,black)', 'linear-gradient(to bottom,transparent,rgba(0,0,0,.1) 20.681%,rgba(0,0,0,.43) 85.169%)', 'linear-gradient(to bottom,transparent,black 70%)'];
    for (let i=0;i<masks.length;i++) {
      await page.locator('.hero__blur').evaluate((node,mask)=>node.style.maskImage=mask,masks[i]);
      await page.screenshot({path:path.join(folder,'hero-blur-'+i+'.png')});
    }
    await browser.close();return;
  }
  console.log('Page:', await page.title());
  console.log('Fonts:', await page.evaluate(() => [...document.fonts].map(f => ({family:f.family,style:f.style,weight:f.weight,status:f.status}))));
  console.log('Geometry:', await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,sections:[...document.querySelectorAll('.section')].map(n=>({id:n.id,y:n.getBoundingClientRect().top+scrollY,height:n.getBoundingClientRect().height}))})));
  if (process.env.OXEN_DIAGNOSTICS) {
    console.log('Stack:', await page.locator('.testimonials__photo,.testimonials__background,.layer-544,.layer-525').evaluateAll(ns=>ns.map(n=>({class:n.className,z:getComputedStyle(n).zIndex}))));
    console.log('Stylesheets:',await page.evaluate(()=>[...document.styleSheets].map(s=>({href:s.href,rules:s.cssRules.length}))));
    console.log('Styles:', await page.locator('.hero__portrait,.hero__portrait img,.layer-190,.layer-213,.layer-213 img,.hero__canvas,.hero__fade,.statistics__canvas,.statistics__experience-frame,.statistics__capital-label').evaluateAll(nodes => nodes.map(n => { const s=getComputedStyle(n),r=n.getBoundingClientRect();return {class:n.className,tag:n.tagName,x:r.x,y:r.y,w:r.width,h:r.height,display:s.display,position:s.position,width:s.width,height:s.height,grid:s.gridArea,margin:s.margin,mask:s.maskImage,transform:s.transform,background:s.backgroundColor,src:n.src}; })));
    if (process.env.OXEN_DIAGNOSTICS==='only') { await browser.close(); return; }
  }
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('.section').count(), 14);
  assert.deepEqual(await page.evaluate(() => [...document.fonts].filter(f=>f.status !== 'loaded').map(f=>f.family)),[]);
  if (process.argv.includes('--axe')) {
    await page.addScriptTag({path:path.join(__dirname,'axe.min.js')});
    for (const mode of ['default','system-contrast']) {
      if (mode==='system-contrast') {
        await page.emulateMedia({contrast:'more'});
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      }
      const audit=await page.evaluate(async () => axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}));
      fs.writeFileSync(path.join(folder,'accessibility-'+mode+'.json'),JSON.stringify(audit,null,2));
      console.log('Accessibility '+mode+':',JSON.stringify(audit.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,targets:v.nodes.map(n=>n.target)}))));
      if (mode==='system-contrast') assert.deepEqual(audit.violations.map(v=>v.id),[]);
      else assert.deepEqual(audit.violations.filter(v=>v.id !== 'color-contrast').map(v=>v.id),[]);
    }
    await page.emulateMedia({contrast:'no-preference'});
  }
  await page.locator('[data-open-contact]').first().click();
  assert.equal(await page.locator('#contact-dialog').evaluate(n=>n.open),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-open-contact]').first().evaluate(n=>n === document.activeElement),true);
  await page.locator('[data-open-case-study]').click();
  assert.match(await page.locator('#case-dialog-description').textContent(),/12-person manufacturer/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#tax-owed').textContent(), '$70,000');
  await page.locator('#annual-profit').fill('$ 100,000');
  await page.locator('.calculator__submit').click();
  assert.equal(await page.locator('#tax-owed').textContent(), '$28,000');
  await page.locator('#business-structure').selectOption('sole-trader');
  assert.equal(await page.locator('#tax-owed').textContent(), '$22,878');
  await page.locator('#annual-profit').fill('incorrect');
  await page.locator('.calculator__submit').click();
  assert.match(await page.locator('#tax-error').textContent(), /valid annual profit/);
  await page.locator('#annual-profit').fill('$ 250,000.00');
  await page.locator('#business-structure').selectOption('company');
  await page.locator('#annual-profit').fill('200000');
  await page.locator('#business-structure').selectOption('partnership');
  assert.equal(await page.locator('.calculator__partners').isVisible(),true);
  assert.equal(await page.locator('#tax-owed').textContent(),'$45,755');
  await page.locator('#annual-profit').fill('1300000');
  await page.locator('.calculator__submit').click();
  assert.match(await page.locator('#tax-error').textContent(),/cannot be greater/);
  await page.locator('#annual-profit').fill('$ 250,000.00');
  await page.locator('#business-structure').selectOption('company');
  await page.locator('#business-structure').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'annual-revenue');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'annual-profit');
  await page.locator('[data-quiz-answer="2"]').click();
  assert.match(await page.locator('#quiz-progress').textContent(), /02/);
  await page.locator('[data-quiz-back]').click();
  assert.match(await page.locator('#quiz-progress').textContent(),/01/);
  await page.locator('[data-quiz-answer="2"]').click();
  await page.locator('[data-quiz-answer="2"]').click();
  await page.locator('[data-quiz-answer="2"]').click();
  assert.equal(await page.locator('#quiz-question').textContent(), 'Advisory +');
  assert.equal(await page.locator('[data-quiz-result-link]').getAttribute('href'),'#service-2');
  assert.equal((await page.locator('#service-2 .service-card__title--advisory').textContent()).trim(),'Advisory +');
  await page.locator('[data-quiz-restart]').click();
  await page.locator('[data-preview-plan="0"]').first().click();
  assert.equal(await page.locator('#plan-dialog').evaluate(n => n.open), true);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('#plan-dialog').evaluate(n=>n.contains(document.activeElement)),true);
  await page.keyboard.press('Escape');
  await page.locator('[data-open-comparison]').click();
  assert.equal(await page.locator('#comparison-rows tr').count(), 4);
  await page.keyboard.press('Escape');
  await checkStoryNavigation();
  await page.locator('[data-about-detail="1"]').click();
  await page.locator('#why-panel-1').waitFor({state:'visible'});
  assert.equal(await page.locator('.why-accordion__panel[aria-hidden="false"]').count(),1);
  assert.equal(await page.locator('dialog[open]').count(),0);
  await page.locator('[data-about-detail="0"]').click();
  for (const width of [1600, 1920, 2560, 1280, 1024, 768, 390, 320]) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(() => scrollTo(0,0));
    await page.evaluate(() => document.activeElement.blur());
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.screenshot({path:path.join(folder, 'responsive-' + width + '.png'),fullPage:true});
    await checkLayout(width);
    if ([1920,768,390].includes(width)) await checkPartnerMotion();
    if (width>1440) {
      if (width===2560 && process.argv.includes('--axe')) {
        await page.emulateMedia({contrast:'more'});
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const audit=await page.evaluate(async()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}));
        fs.writeFileSync(path.join(folder,'accessibility-wide-system-contrast.json'),JSON.stringify(audit,null,2));
        console.log('Accessibility wide system contrast:',JSON.stringify(audit.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))));
        assert.deepEqual(audit.violations.map(v=>v.id),[]);
        await page.emulateMedia({contrast:'no-preference'});
      }
      await page.locator('[data-preview-plan="0"]').first().click();
      assert.equal(await page.locator('#plan-dialog').evaluate(n=>n.open),true);
      await page.keyboard.press('Escape');
      await page.locator('[data-quiz-answer="1"]').click();
      assert.match(await page.locator('#quiz-progress').textContent(),/02/);
      await page.locator('[data-quiz-back]').click();
      await page.locator('[data-quiz-answer="2"]').click();
      await page.locator('[data-quiz-answer="2"]').click();
      await page.locator('[data-quiz-answer="2"]').click();
      assert.equal(await page.locator('#quiz-question').textContent(),'Advisory +');
      await page.locator('[data-quiz-restart]').click();
      await page.locator('#annual-profit').fill('100000');
      await page.locator('.calculator__submit').click();
      assert.equal(await page.locator('#tax-owed').textContent(),'$28,000');
      await page.locator('#annual-profit').fill('$ 250,000.00');
      await page.locator('.calculator__submit').click();
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, 'Horizontal overflow at ' + width);
    if (width < 1440) {
      if (width === 390) await checkStoryNavigation();
      assert.deepEqual(await page.locator('.stat-card,.service-card,.case-study').evaluateAll(ns=>ns.filter(n=>n.getBoundingClientRect().height < 44).map(n=>n.className)),[],'Collapsed cards at '+width);
      await page.locator('.site-header__toggle').click();
      assert.equal(await page.locator('#mobile-navigation').isVisible(),true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#mobile-navigation').isVisible(),false);
      assert.equal(await page.locator('.site-header__toggle').evaluate(n=>n===document.activeElement),true);
    }
    if (width === 390 && process.argv.includes('--axe')) {
      await page.emulateMedia({contrast:'more'});
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const audit = await page.evaluate(async () => axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}));
      fs.writeFileSync(path.join(folder,'accessibility-mobile-system-contrast.json'),JSON.stringify(audit,null,2));
      console.log('Accessibility mobile system contrast:',JSON.stringify(audit.violations.map(v=>({id:v.id,count:v.nodes.length,targets:v.nodes.map(n=>n.target)}))));
      assert.deepEqual(audit.violations.map(v=>v.id),[]);
      await page.emulateMedia({contrast:'no-preference'});
    }
  }
  const broken = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src));
  assert.deepEqual(broken,[]);
  assert.deepEqual(errors, []);
  const alias = await context.newPage();
  await alias.goto('http://oxen-development.local:10016', {waitUntil:'networkidle'});
  assert.equal(await alias.locator('.section').count(),14);
  console.log('PASS: browser hostname mapping reaches the LocalWP site.');
  await alias.close();
  console.log('PASS: theme render, all 14 sections, fonts, image loads, quiz, service dialogs, comparison, slider, calculator, mobile menu, and viewport overflow checks.');
  await browser.close();
})().catch(async error => { console.error(error); if (browser) await browser.close(); process.exitCode = 1; });
