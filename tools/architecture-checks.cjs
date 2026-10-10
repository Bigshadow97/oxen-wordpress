/* One focused pass: CMS templates, shared shell, navigation and interaction smoke checks. */
const path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),publicRoot=path.resolve(root,'../../..');
const php=path.join(process.env.APPDATA,'Local/lightning-services/php-8.2.29+0/bin/win64/php.exe');
const cli=path.join(process.env.LOCALAPPDATA,'Programs/Local/resources/extraResources/bin/wp-cli/wp-cli.phar');
const wp=(command,args=[])=>execFileSync(php,['-n','-d','extension_dir='+path.join(path.dirname(php),'ext'),'-d','extension=mysqli','-d','extension=mbstring','-d','mysqli.default_port=10017',cli,'--path='+publicRoot,command,...args],{cwd:root,encoding:'utf8'});
const fixture=mode=>JSON.parse(wp('eval-file',['tools/architecture-fixture.php',mode]));
let browser,edited=false;
(async()=>{
 const config=fixture('inspect');assert.equal(config.php,'8.2.29');assert.equal(config.theme,'oxen');
 assert.equal(config.show_on_front,'page');assert.equal(config.home_status,'publish');assert.equal(config.template,'page-templates/template-oxen-home.php');
 assert.equal(config.available_templates[config.template],'Oxen Homepage');assert.equal(Object.keys(config.locations).length,5);
 wp('eval-file',['tools/configure-wordpress.php']);assert.deepEqual(fixture('inspect'),config,'Setup must be idempotent');
 browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const go=async url=>{const response=await page.goto(url,{waitUntil:'networkidle'});assert.equal(response.status(),200);await page.evaluate(()=>document.fonts.ready)};
 const shell=async()=>{
  assert.equal(await page.locator('header#navigation').count(),1);assert.equal(await page.locator('footer#site-footer').count(),1);
  assert.equal(await page.locator('#oxen-site-js').count(),1);assert.equal(await page.locator('#contact-dialog').count(),1);
  assert.equal(await page.locator('[data-contrast-toggle],.contrast-toggle').count(),0);
  assert.equal(await page.locator('#primary-menu > li').count(),6);assert.equal(await page.locator('#mobile-menu > li').count(),6);
  assert.equal(await page.locator('.site-footer__menu').count(),4);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),page.viewportSize().width);
  assert.equal(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(n=>n.id);return ids.length-new Set(ids).size}),0,'Unique desktop/mobile IDs');
 };
 if(!process.argv.includes('--navigation-only')) {
 await go('http://localhost:10016');await shell();assert.equal(await page.locator('main.oxen-home > section').count(),12);
 // Existing interactions remain intact after moving only the shared handlers.
 for(let i=0;i<3;i++)await page.locator('[data-quiz-answer="2"]').click();
 assert.equal(await page.locator('[data-quiz-result-link]').getAttribute('href'),'#service-2');await page.locator('[data-quiz-restart]').click();
 await page.locator('#annual-profit').fill('100000');await page.locator('.calculator__submit').click();assert.equal(await page.locator('#tax-owed').textContent(),'$28,000');
 for(const i of [1,2,0]){await page.locator(`[data-about-detail="${i}"]`).click();assert.equal(await page.locator('[data-about-detail][aria-expanded="true"]').count(),1)}
 await page.locator('[data-slider-next]').click();assert.equal(await page.locator('#slider-position').textContent(),'Client story 2 of 3');await page.locator('[data-slider-previous]').click();
 for(const selector of ['[data-open-comparison]','[data-preview-plan="0"]']){await page.locator(selector).first().click();assert.equal(await page.locator('dialog[open]').count(),1);await page.keyboard.press('Escape')}
 await page.locator('#primary-menu [data-open-contact]').click();assert.equal(await page.locator('#contact-dialog').evaluate(n=>n.open),true);await page.keyboard.press('Escape');
 await page.setViewportSize({width:1920,height:1000});await shell();
 await go(config.standard_url);await shell();assert.equal(await page.locator('.content-page h1').textContent(),'Sample Page');assert.equal(await page.locator('#oxen-homepage-js').count(),0);
 await page.locator('#primary-menu [data-open-contact]').click();assert.equal(await page.locator('#contact-dialog').evaluate(n=>n.open),true);await page.keyboard.press('Escape');
 await page.locator('[data-open-policy]').click();assert.equal(await page.locator('#policy-dialog').evaluate(n=>n.open),true);await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await shell();await page.locator('.site-header__toggle').click();assert(await page.locator('#mobile-navigation').isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('.site-header__toggle').getAttribute('aria-expanded'),'false');
 }
 if(process.argv.includes('--navigation-only')) {
  await go(config.standard_url);await shell();assert.equal(await page.locator('.content-page h1').textContent(),'Sample Page');assert.equal(await page.locator('#oxen-calculator-js').count(),0);
 }
 edited=true;fixture('edit');await page.setViewportSize({width:390,height:844});await go('http://localhost:10016');
 assert.equal(await page.locator('#primary-menu > li > a').first().textContent(),'Services CMS verification');
 await page.locator('.site-header__toggle').click();await page.locator('#mobile-menu > li > .menu__toggle').click();assert(await page.locator('#mobile-menu .sub-menu').isVisible());
 await page.locator('#mobile-menu .sub-menu a').click();assert.equal(await page.locator('#mobile-navigation').isVisible(),false);
 await page.setViewportSize({width:1440,height:1000});await go('http://localhost:10016');
 const toggle=page.locator('#primary-menu > li > .menu__toggle');await toggle.focus();await page.keyboard.press('Space');assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert(await page.locator('#primary-menu .sub-menu').isVisible());await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 await page.setViewportSize({width:390,height:844});await go('http://localhost:10016');await page.locator('.site-header__toggle').click();await page.locator('#mobile-menu [data-open-contact]').click();assert.equal(await page.locator('#contact-dialog').evaluate(n=>n.open),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.site-header__toggle').evaluate(n=>n===document.activeElement),true,'Hidden mobile opener restores focus to Menu');
 fixture('restore');edited=false;assert.deepEqual(fixture('inspect'),config,'CMS fixture restored');
 assert.deepEqual(errors,[]);console.log(process.argv.includes('--navigation-only')?'PASS: targeted CMS navigation/hierarchy, desktop/mobile submenu keyboard flow and mobile contact focus; menu edits restored.':'PASS: PHP 8.2.29, static Home/template, idempotent setup, five CMS menus, single shared header/footer, standard page, desktop/mobile submenu and contact/policy dialogs, quiz, calculator, accordion, slider and service dialogs. CMS label/hierarchy edits reached frontend and were restored.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(edited)fixture('restore');await browser?.close()});
