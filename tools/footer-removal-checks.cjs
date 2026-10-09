/* Focused homepage-end check; uses the bundled Playwright runtime. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
let browser;
(async () => {
  const folder = path.join(__dirname, 'screenshots', 'footer-removal');
  fs.mkdirSync(folder, { recursive: true });
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [], report = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const response = await page.goto('http://localhost:10016', { waitUntil: 'networkidle' });
  assert.match((await response.text()).trim(), /<\/body>\s*<\/html>$/i, 'Valid closing document tags');
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('#oxen-homepage-js').count(), 1, 'wp_footer still prints the homepage script');
  for (const width of [1440, 1920, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('#contact img').evaluateAll(ns => Promise.all(ns.map(n => n.decode())));
    await page.evaluate(() => { document.activeElement.blur(); scrollTo(0, 0); });
    await page.mouse.move(0, 0);
    const layout = await page.locator('#contact').evaluate(section => {
      const r = section.getBoundingClientRect();
      return { width: innerWidth, x: r.x, y: r.y, height: r.height, right: r.right, bottom: r.bottom,
        scrollHeight: document.documentElement.scrollHeight, scrollWidth: document.documentElement.scrollWidth,
        lastSection: document.querySelector('.oxen-home').lastElementChild.id,
        content: [...section.querySelectorAll('.copy-layer,.action-link')].map(n => {
          const b = n.getBoundingClientRect(), s = getComputedStyle(n);
          return { node: n.dataset.nodeId, text: n.textContent.trim(), x: b.x, y: b.y, width: b.width, height: b.height,
            font: s.fontFamily, size: s.fontSize, lineHeight: s.lineHeight, color: s.color };
        }) };
    });
    assert.equal(await page.locator('footer,#site-footer,.site-footer-section,[data-open-policy],[data-open-social],#policy-dialog,#social-dialog').count(), 0, 'Footer markup and exclusive dialogs are absent');
    assert.equal(layout.lastSection, 'contact');
    assert(Math.abs(layout.scrollHeight - layout.bottom) < 1, 'No height or whitespace after contact');
    assert.equal(layout.scrollWidth, width); assert.equal(layout.x, 0); assert.equal(layout.right, width);
    assert.equal(await page.locator('#contact a[href="tel:0800640001"]').count(), 1);
    assert(await page.locator('#contact img').evaluateAll(ns => ns.every(n => n.complete && n.naturalWidth > 0)), 'Original contact assets loaded');
    // When local pre-removal evidence exists, verify the entire contact content is unchanged.
    const previousPath = path.join(__dirname, 'screenshots', 'contact', 'report.json');
    if (fs.existsSync(previousPath)) {
      const previous = JSON.parse(fs.readFileSync(previousPath)).find(n => n.width === width);
      assert.deepEqual(layout.content, previous.content, 'Contact geometry, copy and typography preserved');
      assert.equal(layout.y, previous.section.y); assert.equal(layout.height, previous.section.height);
    }
    await page.screenshot({ path: path.join(folder, `${width}-contact.png`), fullPage: true,
      clip: { x: 0, y: layout.y - 60, width, height: Math.floor(layout.height + 60) } });
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.screenshot({ path: path.join(folder, `${width}-page-end.png`) });
    const booking = page.locator('#contact [data-open-contact]');
    await booking.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    assert(await booking.evaluate(n => n.matches(':focus-visible')));
    await page.keyboard.press('Enter'); assert(await page.locator('#contact-dialog').evaluate(n => n.open));
    await page.keyboard.press('Escape'); assert(await booking.evaluate(n => n === document.activeElement));
    report.push(layout); console.log(`PASS ${width}px: footer absent, page ends at intact Contact CTA, wp_footer script and booking keyboard flow work`);
  }
  assert.deepEqual(errors, [], 'No browser errors');
  fs.writeFileSync(path.join(folder, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
})().catch(async e => { console.error(e); if (browser) await browser.close(); process.exitCode = 1; });
