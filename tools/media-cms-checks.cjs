/* Native media/editor, reversible assignment and shared standard-page verification. */
const path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..');
const fixture=mode=>JSON.parse(execFileSync('pwsh',['-NoProfile','-File',path.join(__dirname,'local-wp.ps1'),'eval-file',path.join(__dirname,'media-fixture.php'),mode],{cwd:root,encoding:'utf8'}));
let browser,changed=false;
(async()=>{
 const initial=fixture('inspect');assert.equal(initial.fields,89);assert.equal(initial.attachments,88);assert.deepEqual(initial.broken,[]);assert.equal(initial.svg_upload_allowed,false);assert.equal(initial.template,'page-templates/template-oxen-home.php');assert.equal(initial.static_home,'page');
 browser=await chromium.launch({channel:'chrome'});const context=await browser.newContext(),page=await context.newPage();
 const auth=fixture('auth');await context.addCookies(auth.cookies);
 await page.goto(`http://localhost:10016/wp-admin/post.php?post=${auth.home}&action=edit`,{waitUntil:'domcontentloaded'});
 await page.locator('.oxen-media-field').first().waitFor({state:'attached',timeout:60000});
 const pane=page.getByRole('button',{name:'Meta Boxes',exact:true});
 if(await pane.getAttribute('aria-expanded')==='false'){await pane.focus();await pane.press('Enter');}
 const box=page.locator('#oxen-home-media');
 if(await box.locator('.inside').evaluate(n=>getComputedStyle(n).display)==='none')await box.locator('.handlediv').click();
 assert.equal(await page.locator('.oxen-media-field').count(),89);assert.equal(await page.locator('#oxen-media-admin-js').count(),1);
 await page.locator('.oxen-media-choose').first().click();await page.locator('.media-modal').waitFor();assert(await page.locator('.media-modal').isVisible());
 await page.keyboard.press('Escape');
 changed=true;const replaced=fixture('replace');assert.ok(!Object.hasOwn(replaced.custom,'invalid_key'));assert.ok(!Object.hasOwn(replaced.custom,'site_logo'));assert.notEqual(replaced.portrait_url,initial.portrait_url);
 await page.goto('http://localhost:10016',{waitUntil:'networkidle'});assert.equal(await page.locator('.hero__portrait-image').getAttribute('src'),replaced.portrait_url);
 fixture('restore');changed=false;
 await context.clearCookies();await page.goto('http://localhost:10016/?page_id=2',{waitUntil:'networkidle'});
 assert.equal(await page.locator('header#navigation').count(),1);assert.equal(await page.locator('footer#site-footer').count(),1);assert.equal(await page.locator('#oxen-calculator-js').count(),0);assert.equal(await page.locator('img[src*="/uploads/"]').count()>0,true);
 const restored=fixture('inspect');assert.equal(restored.portrait_url,initial.portrait_url);assert.deepEqual(restored.custom,initial.custom);
 console.log('PASS: 88 complete attachments, 89 secure fields, SVG uploads disabled, native picker, saved replacement reaches frontend, invalid IDs rejected, assignments/session restored, shared standard-page shell.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{fixture('restore');await browser?.close()});
