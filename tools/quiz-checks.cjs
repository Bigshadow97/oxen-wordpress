/* Focused quiz checks; deliberately does not run the homepage regression suite. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
let browser;
(async () => {
  const folder = path.join(__dirname, 'screenshots/quiz-refinement');
  fs.mkdirSync(folder, {recursive: true});
  browser = await playwright.chromium.launch({channel: 'chrome', headless: true});
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push('HTTP ' + response.status()); });
  await page.goto('http://localhost:10016', {waitUntil: 'networkidle'});
  await page.evaluate(() => document.fonts.ready);
  async function capture(name) {
    await page.evaluate(()=>document.activeElement.blur());
    await page.locator('#quiz').screenshot({path: path.join(folder, name + '.png')});
  }
  if (process.argv.includes('--capture-before')) {
    await capture('before-1440-question-1');
    await page.locator('[data-quiz-answer="2"]').click();
    await page.locator('[data-quiz-answer="2"]').click();
    await capture('before-1440-question-3');
    await browser.close();
    console.log('Captured existing quiz at 1440px; no regression suite run.');
    return;
  }
  async function checkStep(step) {
    const states = await page.locator('[data-quiz-step]').evaluateAll(ns => ns.map(n => ({
      state: n.dataset.state, current: n.getAttribute('aria-current'), number: n.querySelector('.quiz-step-number').textContent,
      image: n.querySelector('img').getAttribute('src'), label: n.getAttribute('aria-label')
    })));
    assert.equal(states.length, 3);
    states.forEach((state, index) => {
      assert.equal(state.state, index < step ? 'completed' : index === step ? 'active' : 'upcoming');
      assert.equal(state.current, index === step ? 'step' : null);
      assert.equal(state.number, String(index + 1));
      assert.match(state.image, index === step ? /ellipse2141\.svg$/ : /ellipse2142\.svg$/);
      assert.match(state.label, new RegExp('Question ' + (index + 1)));
    });
    assert.match(await page.locator('#quiz-progress').textContent(), new RegExp('0' + (step + 1)));
  }
  const report = [];
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({width, height: 1000});
    if (width !== 1440) await page.locator('[data-quiz-restart]').click();
    await checkStep(0);
    await page.locator('#quiz-question').evaluate(n => n.blur());
    await capture(width + '-question-1');
    await page.locator('[data-quiz-answer="1"]').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('[data-quiz-answer="2"]').evaluate(n=>n===document.activeElement), true);
    assert.notEqual(await page.locator('[data-quiz-answer="2"]').evaluate(n => getComputedStyle(n).outlineStyle), 'none');
    await page.keyboard.press('Enter');
    await checkStep(1);
    await page.locator('[data-quiz-answer="2"]').click();
    await checkStep(2);
    await capture(width + '-question-3');
    const geometry = await page.locator('.quiz-widget').evaluate(card => {
      const bounds = n => { const r = n.getBoundingClientRect(); return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}; };
      return {card:bounds(card), answers:[...card.querySelectorAll('.quiz-answer:not([hidden])')].map(n => ({button:bounds(n),label:bounds(n.querySelector('.copy-layer')),scrollWidth:n.scrollWidth,clientWidth:n.clientWidth})),
        progress:[...card.querySelectorAll('[data-quiz-step]')].map(bounds), controls:bounds(card.querySelector('.quiz-controls')), support:bounds(card.querySelector('#quiz-support')),
        supportText:(()=>{const range=document.createRange();range.selectNodeContents(card.querySelector('#quiz-support'));return bounds({getBoundingClientRect:()=>range.getBoundingClientRect()});})(),
        header:bounds(card.querySelector('.quiz-header')), divider:bounds(card.querySelector('.quiz-divider')), question:bounds(card.querySelector('#quiz-question')),
        columns:getComputedStyle(card.querySelector('.quiz-answers')).gridTemplateColumns, scrollWidth:document.documentElement.scrollWidth};
    });
    assert.equal(geometry.scrollWidth, width, 'Page overflow at ' + width);
    assert.equal(geometry.answers.length, 4);
    assert.ok(geometry.header.bottom <= geometry.divider.y + 1 && geometry.divider.y < geometry.question.y && geometry.question.bottom < geometry.answers[0].button.y, 'Header/divider/question order');
    assert.equal(geometry.columns.split(' ').length, 2, 'Four answers must use two columns');
    geometry.answers.forEach(({button,label,scrollWidth,clientWidth}) => {
      assert.ok(label.x >= button.x && label.right <= button.right && label.y >= button.y && label.bottom <= button.bottom, 'Label outside answer at ' + width);
      assert.ok(scrollWidth <= clientWidth + 1, 'Answer text overflow at ' + width);
      assert.ok(button.x >= geometry.card.x && button.right <= geometry.card.right && button.height >= 55);
    });
    const a = geometry.answers.map(n => n.button);
    assert.ok(Math.abs(a[0].y-a[1].y)<1 && Math.abs(a[2].y-a[3].y)<1 && a[2].y>a[0].bottom, 'Balanced 2 by 2 answer rows');
    assert.ok(Math.max(a[2].bottom,a[3].bottom) < geometry.controls.y && geometry.controls.bottom < geometry.supportText.y, 'Answer/Back/support spacing');
    assert.ok(geometry.support.bottom <= geometry.card.bottom && geometry.controls.right <= geometry.card.right);
    assert.ok(geometry.progress.every(n=>Math.abs(n.width-26.637)<.1 && Math.abs(n.height-26.637)<.1), 'Progress circle size');
    report.push({width,...geometry});
    // Back retains both earlier responses and the current answer after a result.
    await page.locator('[data-quiz-back]').click();
    await checkStep(1);
    assert.equal(await page.locator('[data-quiz-answer="2"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-quiz-back]').click();
    await checkStep(0);
    assert.equal(await page.locator('[data-quiz-answer="2"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-quiz-answer="2"]').click();
    await page.locator('[data-quiz-answer="2"]').click();
    await page.locator('[data-quiz-answer="2"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#quiz-question').textContent(), 'Advisory +');
    assert.equal(await page.locator('[data-quiz-result-link]').getAttribute('href'), '#service-2');
    assert.deepEqual(await page.locator('[data-quiz-step]').evaluateAll(ns=>ns.map(n=>n.dataset.state)), ['completed','completed','completed']);
    await capture(width + '-recommendation');
    await page.locator('[data-quiz-back]').click();
    await checkStep(2);
    assert.equal(await page.locator('[data-quiz-answer="2"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-quiz-answer="3"]').click();
    assert.equal(await page.locator('#quiz-question').textContent(), 'Virtual CFO');
    assert.equal(await page.locator('[data-quiz-result-link]').getAttribute('href'), '#service-3');
    assert.deepEqual(errors, []);
    console.log('PASS: quiz progress, Grid, labels, spacing, keyboard, Back, selections and recommendations at ' + width + 'px.');
  }
  fs.writeFileSync(path.join(folder, 'geometry.json'), JSON.stringify(report,null,2));
  await browser.close();
})().catch(async error => { console.error(error); if (browser) await browser.close(); process.exitCode = 1; });
