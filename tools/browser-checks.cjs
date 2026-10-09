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
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
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
  if (process.argv.includes('--blur-variants')) {
    const masks = ['linear-gradient(to bottom,transparent,black)', 'linear-gradient(to bottom,transparent,rgba(0,0,0,.1) 20.681%,rgba(0,0,0,.43) 85.169%)', 'linear-gradient(to bottom,transparent,black 70%)'];
    for (let i=0;i<masks.length;i++) {
      await page.locator('.hero-blur').evaluate((node,mask)=>node.style.maskImage=mask,masks[i]);
      await page.screenshot({path:path.join(folder,'hero-blur-'+i+'.png')});
    }
    await browser.close();return;
  }
  console.log('Page:', await page.title());
  console.log('Fonts:', await page.evaluate(() => [...document.fonts].map(f => ({family:f.family,style:f.style,weight:f.weight,status:f.status}))));
  console.log('Geometry:', await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,sections:[...document.querySelectorAll('.home-section')].map(n=>({id:n.id,y:n.getBoundingClientRect().top+scrollY,height:n.getBoundingClientRect().height}))})));
  if (process.env.OXEN_DIAGNOSTICS) {
    console.log('Stack:', await page.locator('.layer-416,.layer-414,.layer-544,.layer-525').evaluateAll(ns=>ns.map(n=>({class:n.className,z:getComputedStyle(n).zIndex}))));
    console.log('Stylesheets:',await page.evaluate(()=>[...document.styleSheets].map(s=>({href:s.href,rules:s.cssRules.length}))));
    console.log('Styles:', await page.locator('.layer-13,.layer-13 img,.layer-190,.layer-213,.layer-213 img,.layer-9,.layer-10,.layer-5,.layer-264,.layer-273').evaluateAll(nodes => nodes.map(n => { const s=getComputedStyle(n),r=n.getBoundingClientRect();return {class:n.className,tag:n.tagName,x:r.x,y:r.y,w:r.width,h:r.height,display:s.display,position:s.position,width:s.width,height:s.height,grid:s.gridArea,margin:s.margin,mask:s.maskImage,transform:s.transform,background:s.backgroundColor,src:n.src}; })));
    if (process.env.OXEN_DIAGNOSTICS==='only') { await browser.close(); return; }
  }
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('.home-section').count(), 14);
  assert.deepEqual(await page.evaluate(() => [...document.fonts].filter(f=>f.status !== 'loaded').map(f=>f.family)),[]);
  if (process.argv.includes('--axe')) {
    await page.addScriptTag({path:path.join(__dirname,'axe.min.js')});
    for (const mode of ['original','high-contrast']) {
      if (mode==='high-contrast') {
        await page.locator('[data-contrast-toggle]').click();
        await page.waitForFunction(()=>document.documentElement.classList.contains('high-contrast'));
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      }
      const audit=await page.evaluate(async () => axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}));
      fs.writeFileSync(path.join(folder,'accessibility-'+mode+'.json'),JSON.stringify(audit,null,2));
      console.log('Accessibility '+mode+':',JSON.stringify(audit.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,targets:v.nodes.map(n=>n.target)}))));
      if (mode==='high-contrast') assert.deepEqual(audit.violations.map(v=>v.id),[]);
      else assert.deepEqual(audit.violations.filter(v=>v.id !== 'color-contrast').map(v=>v.id),[]);
    }
    await page.locator('[data-contrast-toggle]').click();
    await page.evaluate(()=>localStorage.removeItem('oxen-contrast'));
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
  await page.locator('.calculate-button').click();
  assert.equal(await page.locator('#tax-owed').textContent(), '$28,000');
  await page.locator('#business-structure').selectOption('sole-trader');
  assert.equal(await page.locator('#tax-owed').textContent(), '$22,878');
  await page.locator('#annual-profit').fill('incorrect');
  await page.locator('.calculate-button').click();
  assert.match(await page.locator('#tax-error').textContent(), /valid annual profit/);
  await page.locator('#annual-profit').fill('$ 250,000.00');
  await page.locator('#business-structure').selectOption('company');
  await page.locator('#annual-profit').fill('200000');
  await page.locator('#business-structure').selectOption('partnership');
  assert.equal(await page.locator('.partnership-control').isVisible(),true);
  assert.equal(await page.locator('#tax-owed').textContent(),'$45,755');
  await page.locator('#annual-profit').fill('1300000');
  await page.locator('.calculate-button').click();
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
  assert.equal((await page.locator('#service-2 .layer-593').textContent()).trim(),'Advisory +');
  await page.locator('[data-quiz-restart]').click();
  await page.locator('[data-preview-plan="0"]').first().click();
  assert.equal(await page.locator('#plan-dialog').evaluate(n => n.open), true);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('#plan-dialog').evaluate(n=>n.contains(document.activeElement)),true);
  await page.keyboard.press('Escape');
  await page.locator('[data-open-comparison]').click();
  assert.equal(await page.locator('#comparison-rows tr').count(), 4);
  await page.keyboard.press('Escape');
  const quote = await page.locator('#client-story').textContent();
  await page.locator('[data-slider-next]').click();
  assert.notEqual(await page.locator('#client-story').textContent(), quote);
  await page.locator('[data-slider-previous]').click();
  assert.equal(await page.locator('#client-story').textContent(), quote);
  await page.locator('[data-slider-next]').focus();
  await page.keyboard.press('ArrowRight');
  assert.notEqual(await page.locator('#client-story').textContent(),quote);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#client-story').textContent(),quote);
  await page.locator('[data-about-detail="1"]').click();
  assert.equal(await page.locator('#about-dialog').evaluate(n=>n.open),true);
  await page.keyboard.press('Escape');
  await page.locator('[data-open-policy]').click();
  assert.equal(await page.locator('#policy-dialog').evaluate(n=>n.open),true);
  await page.keyboard.press('Escape');
  for (const width of [1280, 1024, 768, 390, 320]) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(() => scrollTo(0,0));
    await page.screenshot({path:path.join(folder, 'responsive-' + width + '.png'),fullPage:true});
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, 'Horizontal overflow at ' + width);
    if (width < 1200) {
      assert.deepEqual(await page.locator('.stat-card,.service-card,.result-card').evaluateAll(ns=>ns.filter(n=>n.getBoundingClientRect().height < 44).map(n=>n.className)),[],'Collapsed cards at '+width);
      await page.locator('.menu-toggle').click();
      assert.equal(await page.locator('#mobile-navigation').isVisible(),true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#mobile-navigation').isVisible(),false);
      assert.equal(await page.locator('.menu-toggle').evaluate(n=>n===document.activeElement),true);
    }
    if (width === 390 && process.argv.includes('--axe')) {
      await page.locator('[data-contrast-toggle]').click();
      await page.waitForFunction(()=>document.documentElement.classList.contains('high-contrast'));
      const audit = await page.evaluate(async () => axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}));
      fs.writeFileSync(path.join(folder,'accessibility-mobile-high-contrast.json'),JSON.stringify(audit,null,2));
      console.log('Accessibility mobile high contrast:',JSON.stringify(audit.violations.map(v=>({id:v.id,count:v.nodes.length,targets:v.nodes.map(n=>n.target)}))));
      assert.deepEqual(audit.violations.map(v=>v.id),[]);
      await page.locator('[data-contrast-toggle]').click();
    }
  }
  const broken = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src));
  assert.deepEqual(broken,[]);
  assert.deepEqual(errors, []);
  const alias = await context.newPage();
  await alias.goto('http://oxen-development.local:10016', {waitUntil:'networkidle'});
  assert.equal(await alias.locator('.home-section').count(),14);
  console.log('PASS: browser hostname mapping reaches the LocalWP site.');
  await alias.close();
  console.log('PASS: theme render, all 14 sections, fonts, image loads, quiz, service dialogs, comparison, slider, calculator, mobile menu, and viewport overflow checks.');
  await browser.close();
})().catch(async error => { console.error(error); if (browser) await browser.close(); process.exitCode = 1; });
