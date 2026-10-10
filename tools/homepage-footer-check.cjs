/* Focused homepage-footer verification; no full-site regression or page alterations. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
(async () => {
  const folder = path.join(__dirname, 'screenshots/homepage-footer');
  fs.mkdirSync(folder, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
    const session = await page.context().newCDPSession(page);
    await session.send('Network.enable');
    await session.send('Network.setCacheDisabled', { cacheDisabled: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const results = [];
    for (const width of [1440, 1920, 390]) {
      await page.setViewportSize({ width, height: 800 });
      const response = await page.goto('http://localhost:10016', { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      const html = await response.text();
      assert.ok(!html.includes('<footer') && !html.includes('id="site-footer"'), 'Footer markup absent from server HTML');
      assert.equal(await page.locator('footer, #site-footer, .site-footer').count(), 0);
      assert.equal(await page.locator('#oxen-site-js').count(), 1, 'wp_footer scripts still render');
      assert.equal(await page.locator('#contact-dialog').count(), 1);
      await page.evaluate(async () => { await document.fonts.ready; scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); });
      await page.locator('#contact').waitFor({ state: 'visible' });
      await page.waitForTimeout(100);
      const geometry = await page.evaluate(() => {
        const contact = document.querySelector('#contact');
        const rect = contact.getBoundingClientRect();
        return {
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          lastSection: document.querySelector('main > section:last-child')?.id,
          documentBottom: document.documentElement.scrollHeight,
          contactBottom: rect.bottom + scrollY,
          visibleAfterMain: [...document.querySelector('#main-content').nextElementSibling?.parentElement.children || []]
            .filter(node => node !== document.querySelector('#main-content') && node !== document.querySelector('header') && node.getBoundingClientRect().top + scrollY >= rect.bottom + scrollY && node.getBoundingClientRect().height > 0)
            .map(node => node.tagName),
        };
      });
      assert.equal(geometry.lastSection, 'contact');
      assert.equal(geometry.scrollWidth, width);
      assert.ok(Math.abs(geometry.documentBottom - geometry.contactBottom) <= 1, 'No blank space after Contact');
      assert.deepEqual(geometry.visibleAfterMain, [], 'No visible section after Contact');
      results.push(geometry);
      if (width === 1440) {
        await page.screenshot({ path: path.join(folder, 'homepage-bottom-1440.png') });
        await page.locator('#contact [data-open-contact]').first().click();
        assert.equal(await page.locator('#contact-dialog').evaluate(node => node.open), true);
        await page.keyboard.press('Escape');
      }
    }
    await page.goto('http://localhost:10016/sample-page/', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('footer#site-footer').count(), 1);
    assert.equal(await page.locator('.site-footer__menu').count(), 4);
    await page.locator('#site-footer').scrollIntoViewIfNeeded();
    assert.ok(await page.locator('#site-footer').isVisible());
    assert.equal(await page.locator('#oxen-site-js').count(), 1);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(folder, 'verification.json'), JSON.stringify({ homepage: results, standardFooter: true, cacheDisabled: true, browserErrors: errors }, null, 2));
    console.log('PASS: homepage footer absent in HTML/DOM at 1440/1920/390; Contact ends the document; wp_footer and CTA work; standard-page footer retained; screenshot saved.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
