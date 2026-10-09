const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const engineName = process.env.BROWSER || 'chromium';
const engine = require('playwright')[engineName];
const AxeBuilder = require('@axe-core/playwright').default;
const { mkdir, writeFile } = require('node:fs/promises');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
let browser, server, origin;
const root = path.resolve(__dirname, '..');
before(async () => {
  server = createServer(async (req,res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
    try {
      res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
      res.end(await readFile(file));
    } catch {res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await engine.launch({headless:true, ...(engineName==='chromium' && process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}), ...(engineName==='chromium'?{args:['--no-sandbox']}:{})});
  console.log(`Browser evidence: ${engineName} ${browser.version()}; Playwright ${require('playwright/package.json').version}`);
});
after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve));});

async function pageFor(t, mode='unconfigured', options={}) {
  const context = await browser.newContext({viewport:{width:1280,height:900},...options});
  t.after(()=>context.close());
  const page = await context.newPage();
  const requests=[];
  // Block every non-local request. Provider behavior is simulated in-page;
  // no test payload, even fake data, can reach Formspree or another host.
  await context.route('**/*', route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
  const endpoint = mode==='unconfigured' ? '' : mode==='invalid-config' ? 'https://example.invalid/f/mockonly' : 'https://formspree.io/f/mockonly';
  await page.route('**/estimate-config.js',route=>route.fulfill({contentType:'text/javascript',body:`export const estimateConfig = {endpoint:${JSON.stringify(endpoint)},timeoutMs:${mode==='slow'?5000:60}};`}));
  if (mode!=='unconfigured') {
    await page.addInitScript(({mode})=>{
      window.testRequests=[];
      window.fetch=async (url,options)=>{
        window.testRequests.push({url,payload:JSON.parse(options.body)});
        const response=()=>({ok:true,json:async()=>({ok:true})});
        if (mode==='network') throw new Error('mock offline');
        if (mode==='timeout') return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('aborted'))));
        if (mode==='slow') return new Promise(resolve=>{window.finishSend=()=>resolve(response());});
        if (mode==='retry' && window.testRequests.length===1) return {ok:false,status:422};
        if (mode==='server-error') return {ok:false,status:503};
        if (mode==='rate-limit') return {ok:false,status:429};
        if (mode==='unconfirmed') return {ok:true,json:async()=>({})};
        return response();
      };
    },{mode});
  }
  page.on('request',request=>{if(request.method()==='POST') requests.push(request.url());});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  t.after(()=>{assert.deepEqual(requests,[],'No network POST allowed');assert.deepEqual(errors,[]);});
  await page.goto(origin);
  await page.locator('[data-open-estimate]').first().click();
  return page;
}
async function step(page,number){assert.equal(await page.locator('.form-step.active').getAttribute('data-step'),String(number));}
async function reachContact(page) {
  await page.locator('[name=projectType][value="Custom Shower"]').check();
  await page.locator('#nextBtn').click();
  await page.locator('[name=details]').fill('Test project only');
  await page.locator('#nextBtn').click();
  await page.locator('[name=location]').fill('80015');
  await page.locator('[name=timing]').selectOption({label:'Just researching'});
  await page.locator('#nextBtn').click();
  await page.locator('[name=name]').fill('Test visitor');
  await page.locator('[name=phone]').fill('3035550100');
}
async function errorContains(page,text){await page.waitForFunction(text=>document.querySelector('#formError').textContent.includes(text),text);}

for (const viewport of [{width:1280,height:900},{width:375,height:812}]) {
  test(`${viewport.width}px: unavailable notice is first, visible on open, and offers existing contact links`,async t=>{
    const page=await pageFor(t,'unconfigured',{viewport});
    const notice=page.locator('#formAvailability');
    assert.equal(await notice.isVisible(),true);
    assert.match(await notice.textContent(),/Online requests are not available yet/);
    assert.equal(await notice.locator('a').nth(0).getAttribute('href'),'tel:+13033568421');
    assert.equal(await notice.locator('a').nth(1).getAttribute('href'),'sms:+13033568421');
    assert.equal(await notice.evaluate(el=>Boolean(el.compareDocumentPosition(document.querySelector('.form-step')) & Node.DOCUMENT_POSITION_FOLLOWING)),true);
    assert.equal(await notice.evaluate(el=>{
      const bounds=el.getBoundingClientRect(), dialog=document.querySelector('#estimateDialog').getBoundingClientRect();
      return bounds.top>=Math.max(0,dialog.top) && bounds.bottom<=Math.min(innerHeight,dialog.bottom);
    }),true,'The full notice must be in view before filling any fields');
    assert.equal(await notice.evaluate(el=>el===document.activeElement),true);
    assert.match(await page.locator('#estimateDialog').getAttribute('aria-describedby'),/formAvailability/);
    await page.keyboard.press('Tab');
    assert.equal(await notice.locator('a').nth(0).evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Tab');
    assert.equal(await notice.locator('a').nth(1).evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await notice.locator('a').nth(0).evaluate(el=>el===document.activeElement),true);
    await page.locator('#estimateDialog').evaluate(el=>{el.scrollTop=el.scrollHeight;});
    await page.keyboard.press('Escape');
    await page.locator('[data-open-estimate]').first().click();
    assert.equal(await notice.isVisible(),true);
    assert.equal(await notice.evaluate(el=>el===document.activeElement),true);
    assert.equal(await notice.evaluate(el=>{
      const bounds=el.getBoundingClientRect(), dialog=document.querySelector('#estimateDialog').getBoundingClientRect();
      return bounds.top>=Math.max(0,dialog.top) && bounds.bottom<=Math.min(innerHeight,dialog.bottom);
    }),true,'Reopening must bring the full notice back into view');
  });
  test(`${viewport.width}px: valid mocked configuration hides notice and retains contact alternatives`,async t=>{
    const page=await pageFor(t,'success',{viewport});
    assert.equal(await page.locator('#formAvailability').isHidden(),true);
    assert.equal(await page.locator('#estimateDialog').getAttribute('aria-describedby'),'estimateIntro');
    assert.equal(await page.locator('.form-contact a[href="tel:+13033568421"]').count(),1);
    assert.equal(await page.locator('.form-contact a[href="sms:+13033568421"]').count(),1);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('[name=projectType]').first().evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('#closeEstimate').evaluate(el=>el===document.activeElement),true);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#estimateDialog').evaluate(el=>el.open),false);
  });
}
test('invalid configuration keeps the early notice and cannot submit',async t=>{
  const page=await pageFor(t,'invalid-config');
  assert.equal(await page.locator('#formAvailability').isVisible(),true);
  await reachContact(page);await page.locator('#nextBtn').click();
  await errorContains(page,'Nothing was sent');await step(page,4);
  assert.equal(await page.evaluate(()=>testRequests.length),0);
});

test('required choices, Enter progression, textarea newline, close/Escape preserve inputs and focus',async t=>{
  const page=await pageFor(t);
  await page.locator('#nextBtn').click();await step(page,1);
  assert.equal(await page.locator('[name=projectType]').first().getAttribute('aria-invalid'),'true');
  await page.locator('[name=projectType][value="Flooring"]').check();
  await page.locator('[name=projectType][value="Flooring"]').press('Enter');await step(page,2);
  await page.locator('[name=details]').fill('Saved details');await page.locator('[name=details]').press('Enter');await step(page,2);
  await page.locator('#closeEstimate').click();assert.equal(await page.locator('#estimateDialog').evaluate(el=>el.open),false);
  assert.equal(await page.locator('[data-open-estimate]').first().evaluate(el=>el===document.activeElement),true);
  await page.locator('[data-open-estimate]').first().click();await step(page,2);
  assert.equal(await page.locator('[name=details]').inputValue(),'Saved details\n');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#estimateDialog').evaluate(el=>el.open),false);
  assert.equal(await page.locator('input[type=file]').count(),0);
});
test('optional email is validated; email preference requires email; text/call require phone',async t=>{
  const page=await pageFor(t);await reachContact(page);
  await page.locator('[name=email]').fill('not-an-email');await page.locator('#nextBtn').click();await step(page,4);
  assert.equal(await page.locator('[name=email]').getAttribute('aria-invalid'),'true');
  await page.locator('[name=email]').fill('');await page.locator('[name=contactPreference][value=Email]').check();
  await page.locator('[name=phone]').fill('');await page.locator('#nextBtn').click();
  assert.equal(await page.locator('[name=email]').evaluate(el=>el.required),true);
  await page.locator('[name=email]').fill('visitor@example.invalid');await page.locator('#nextBtn').click();
  await errorContains(page,'Nothing was sent');await step(page,4);
  await page.locator('[name=contactPreference][value="Phone call"]').check();await page.locator('#nextBtn').click();
  assert.equal(await page.locator('[name=phone]').getAttribute('aria-invalid'),'true');
});
test('unconfigured adapter fails closed and preserves form after retry and back',async t=>{
  const page=await pageFor(t);await reachContact(page);await page.locator('#nextBtn').click();
  await errorContains(page,'Nothing was sent');assert.equal(await page.locator('[name=name]').inputValue(),'Test visitor');
  await page.locator('#backBtn').click();await step(page,3);await page.locator('#nextBtn').click();await step(page,4);
  await page.locator('#nextBtn').click();await errorContains(page,'Nothing was sent');
});
test('success, duplicate submits, closing during send, confirmation focus and reset',async t=>{
  const page=await pageFor(t,'slow');await reachContact(page);
  await page.locator('#nextBtn').click();
  assert.equal(await page.locator('#nextBtn').isDisabled(),true);
  await page.locator('#estimateForm').evaluate(form=>{form.requestSubmit();form.requestSubmit();});
  assert.equal(await page.evaluate(()=>testRequests.length),1);
  await page.locator('#closeEstimate').click();await page.locator('[data-open-estimate]').first().click();
  assert.equal(await page.locator('#nextBtn').isDisabled(),true);
  await page.evaluate(()=>finishSend());await page.waitForSelector('[data-step="5"].active');await step(page,5);
  assert.equal(await page.locator('[data-step="5"]').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.evaluate(()=>testRequests.length),1);
  const payload=await page.evaluate(()=>testRequests[0].payload);
  assert.equal(payload.phone,'3035550100');assert.equal(payload._gotcha,'');assert.equal('photos' in payload,false);
  await page.locator('#doneEstimate').click();await page.locator('[data-open-estimate]').first().click();await step(page,5);
  await page.locator('#newEstimate').click();await step(page,1);assert.equal(await page.locator('[name=name]').inputValue(),'');
});
for(const [mode,message] of [['network','could not confirm'],['timeout','timed out'],['unconfirmed','could not confirm'],['server-error','could not confirm'],['rate-limit','service is busy']]) {
  test(`${mode} retains inputs and allows retry without false success`,async t=>{
    const page=await pageFor(t,mode);await reachContact(page);await page.locator('#nextBtn').click();
    await errorContains(page,message);await step(page,4);
    assert.equal(await page.locator('[name=name]').inputValue(),'Test visitor');
    assert.equal(await page.locator('#nextBtn').isDisabled(),false);
    assert.equal(await page.locator('#formError').evaluate(el=>el===document.activeElement),true);
    await page.locator('#nextBtn').click();await errorContains(page,message);await step(page,4);
    assert.equal(await page.evaluate(()=>testRequests.length),2);
    assert.equal(await page.locator('[name=name]').inputValue(),'Test visitor');
  });
}
test('provider rejection permits one deliberate retry and then success',async t=>{
  const page=await pageFor(t,'retry');await reachContact(page);await page.locator('#nextBtn').click();
  await errorContains(page,'did not accept');await step(page,4);await page.locator('#nextBtn').click();
  await page.waitForSelector('[data-step="5"].active');assert.equal(await page.evaluate(()=>testRequests.length),2);
});
test('mobile viewport has no horizontal form overflow and shows close and submit controls',async t=>{
  const page=await pageFor(t,'unconfigured',{viewport:{width:375,height:812}});await reachContact(page);
  assert.equal(await page.locator('#estimateDialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
  assert.equal(await page.locator('#closeEstimate').isVisible(),true);assert.equal(await page.locator('#nextBtn').isVisible(),true);
});

test('a different project card reopens step one with the new choice and preserves details',async t=>{
  const page=await pageFor(t);
  await page.locator('[name=projectType][value="Flooring"]').check();
  await page.locator('#nextBtn').click();
  await page.locator('[name=details]').fill('Keep these draft details');
  await page.locator('#closeEstimate').click();
  await page.locator('[data-project="Custom Shower"]').first().click();
  await step(page,1);
  assert.equal(await page.locator('[name=projectType][value="Custom Shower"]').isChecked(),true);
  await page.locator('#nextBtn').click();
  assert.equal(await page.locator('[name=details]').inputValue(),'Keep these draft details');
});

test('all project cards and generic estimate buttons open and return keyboard focus',async t=>{
  const page=await pageFor(t);
  await page.keyboard.press('Escape');
  const triggers=page.locator('[data-open-estimate], [data-project]');
  for(let index=0;index<await triggers.count();index+=1){
    const trigger=triggers.nth(index);
    await trigger.click();await step(page,1);
    const project=await trigger.getAttribute('data-project');
    if(project) assert.equal(await page.locator(`[name=projectType][value="${project}"]`).isChecked(),true);
    await page.keyboard.press('Escape');
    assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
  }
});
test('whitespace is rejected and a provided optional phone remains validated',async t=>{
  const page=await pageFor(t,'success');await reachContact(page);
  await page.locator('[name=name]').fill('   ');await page.locator('#nextBtn').click();
  assert.equal(await page.locator('[name=name]').getAttribute('aria-invalid'),'true');
  await page.locator('[name=name]').fill('Test visitor');
  await page.locator('[name=contactPreference][value=Email]').check();
  await page.locator('[name=email]').fill('visitor@example.invalid');
  await page.locator('[name=phone]').fill('123');await page.locator('#nextBtn').click();
  assert.equal(await page.locator('[name=phone]').getAttribute('aria-invalid'),'true');
  assert.equal(await page.evaluate(()=>testRequests.length),0);
  await page.locator('[name=phone]').fill('');await page.locator('#nextBtn').click();
  await page.waitForSelector('[data-step="5"].active');
  const payload=await page.evaluate(()=>testRequests[0].payload);
  assert.equal(payload.contactPreference,'Email');assert.equal('phone' in payload,false);
});
test('mobile rejection, close/reopen, retry and confirmation preserve draft and prevent duplicate completion',async t=>{
  const page=await pageFor(t,'retry',{viewport:{width:375,height:812}});await reachContact(page);
  await page.locator('#nextBtn').click();await errorContains(page,'did not accept');
  await page.locator('#closeEstimate').click();await page.locator('[data-open-estimate]').first().click();await step(page,4);
  assert.equal(await page.locator('[name=name]').inputValue(),'Test visitor');
  await page.locator('#nextBtn').click();await page.waitForSelector('[data-step="5"].active');
  await page.locator('#estimateForm').evaluate(form=>form.requestSubmit());
  assert.equal(await page.evaluate(()=>testRequests.length),2);
  assert.equal(await page.locator('#estimateDialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true);
  await page.locator('#newEstimate').click();await step(page,1);
  assert.equal(await page.locator('[name=name]').inputValue(),'');
});

// Review artifacts contain only this local synthetic form: no traces, cookies,
// account data, provider requests, or unrelated pages. Viewport screenshots are
// evidence for visual review, not an automated pixel-diff or device certification.
const reviewRoot = process.env.REVIEW_ARTIFACTS;
async function captureForm(page, name) {
  if (!reviewRoot) return;
  await mkdir(reviewRoot,{recursive:true});
  const dialog=page.locator('#estimateDialog');
  const capture=async suffix=>{
    const box=await dialog.boundingBox();
    const viewport=page.viewportSize();
    await page.screenshot({path:path.join(reviewRoot,`${name}-${suffix}.png`),
      clip:{x:Math.max(0,box.x),y:Math.max(0,box.y),width:Math.min(box.width,viewport.width-box.x),height:Math.min(box.height,viewport.height-box.y)},animations:'disabled'});
  };
  await dialog.evaluate(el=>el.scrollTop=0);
  await capture('top');
  if(await dialog.evaluate(el=>el.scrollHeight>el.clientHeight+2)) {
    // Overlapping vertical slices make every part inspectable without changing layout.
    const height=await dialog.evaluate(el=>el.clientHeight);
    const total=await dialog.evaluate(el=>el.scrollHeight);
    for(let y=Math.floor(height*.8),i=1;y<total;y+=Math.floor(height*.8),i++) {
      await dialog.evaluate((el,y)=>el.scrollTop=y,y);
      await capture(`scroll-${i}`);
      if(y+height>=total) break;
    }
  }
}
async function scanForm(page, name) {
  const dialog=page.locator('#estimateDialog');
  const position=await dialog.evaluate(el=>({top:el.scrollTop,height:el.clientHeight,total:el.scrollHeight}));
  const results=[];
  for(let y=0;y<position.total;y+=Math.max(1,Math.floor(position.height*.8))) {
    await dialog.evaluate((el,y)=>el.scrollTop=y,y);
    results.push(await new AxeBuilder({page}).include('#estimateDialog')
      .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze());
    if(y+position.height>=position.total)break;
  }
  await dialog.evaluate((el,y)=>el.scrollTop=y,position.top);
  const key=(rule,node)=>rule.id+JSON.stringify(node.target);
  const passed=new Set(results.flatMap(r=>r.passes.flatMap(rule=>rule.nodes.map(node=>key(rule,node)))));
  const violations=new Map();const incomplete=new Map();
  for(const result of results) {
    for(const rule of result.violations)for(const node of rule.nodes)violations.set(key(rule,node),{id:rule.id,impact:rule.impact,help:rule.help,target:node.target,summary:node.failureSummary});
    for(const rule of result.incomplete)for(const node of rule.nodes)if(!passed.has(key(rule,node)))incomplete.set(key(rule,node),{id:rule.id,target:node.target,summary:node.failureSummary});
  }
  const summary={state:name,engine:engineName,scrollPositions:results.length,violations:[...violations.values()],incomplete:[...incomplete.values()]};
  if(reviewRoot){await mkdir(reviewRoot,{recursive:true});await writeFile(path.join(reviewRoot,`${name}-axe.json`),JSON.stringify(summary,null,2));}
  return summary;
}

async function assertReflow(page) {
  assert.equal(await page.locator('#estimateDialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'Dialog must not scroll horizontally');
  const outside=await page.locator('#estimateForm').evaluate(form=>{
    const d=form.closest('dialog').getBoundingClientRect();
    return [...form.querySelectorAll('input:not([type=radio]),select,textarea,button,fieldset,legend,.choice-card,.form-error,.form-availability')]
      .filter(el=>el.getClientRects().length&&!el.closest('.form-honeypot'))
      .filter(el=>{const r=el.getBoundingClientRect();return r.left<d.left-1||r.right>d.right+1;})
      .map(el=>el.id||el.name||el.tagName);
  });
  assert.deepEqual(outside,[],'Controls and messages must fit the dialog');
}
for (const configuration of [
  {name:'desktop',viewport:{width:1280,height:900}},
  {name:'mobile',viewport:{width:375,height:812},hasTouch:true},
  {name:'narrow-reflow',viewport:{width:320,height:640}},
  {name:'landscape',viewport:{width:812,height:375},hasTouch:true},
  {name:'text-200-percent',viewport:{width:640,height:900},textScale:true},
]) {
  test(`${configuration.name}: rendered states, accessibility scan and responsive reflow`,async t=>{
    const {name,textScale,...options}=configuration;
    const page=await pageFor(t,'retry',options);
    // CSS root-font enlargement is a text-resize stress test, not native browser zoom.
    if(textScale) await page.addStyleTag({content:':root{font-size:200%}'});
    const scans=[];const layoutFailures=[];
    const review=async state=>{
      await captureForm(page,`${name}-${state}`);
      scans.push(await scanForm(page,`${name}-${state}`));
      try{await assertReflow(page);}catch(error){layoutFailures.push({state,message:error.message});}
    };
    await review('step-1');
    await page.locator('[name=projectType][value="Custom Shower"]').check();
    await page.locator('#nextBtn').click();await review('step-2');
    await page.locator('[name=details]').fill('Synthetic review project only.');
    await page.locator('#nextBtn').click();await review('step-3');
    await page.locator('[name=location]').fill('80015');
    await page.locator('[name=timing]').selectOption({label:'Just researching'});
    await page.locator('#nextBtn').click();await review('step-4');
    await page.locator('[name=name]').fill('Test visitor');
    await page.locator('[name=phone]').fill('123');
    await page.locator('#nextBtn').click();await review('validation');
    await page.locator('[name=phone]').fill('3035550100');
    await page.locator('#nextBtn').click();await errorContains(page,'did not accept');await review('rejected');
    await page.locator('#nextBtn').click();await page.waitForSelector('[data-step="5"].active');await review('success');
    const unavailable=await pageFor(t,'unconfigured',options);
    if(textScale) await unavailable.addStyleTag({content:':root{font-size:200%}'});
    await captureForm(unavailable,`${name}-unconfigured`);scans.push(await scanForm(unavailable,`${name}-unconfigured`));
    try{await assertReflow(unavailable);}catch(error){layoutFailures.push({state:'unconfigured',message:error.message});}
    assert.deepEqual(layoutFailures,[]);
    assert.deepEqual(scans.flatMap(s=>s.violations.map(v=>({state:s.state,...v}))),[],'No automatically detected WCAG A/AA violations in scanned form states');
  });
}

test('keyboard-only choice, full modal tab cycle, focus on steps and Back',async t=>{
  const page=await pageFor(t,'success');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('[name=projectType]').first().evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('[name=projectType][value="Bathroom Tile"]').isChecked(),true);
  await page.keyboard.press('Enter');await step(page,2);
  assert.equal(await page.locator('[data-step="2"]').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('[name=details]').evaluate(el=>el===document.activeElement),true);
  await page.locator('#backBtn').click();await step(page,1);
  assert.equal(await page.locator('[data-step="1"]').evaluate(el=>el===document.activeElement),true);
  // Native dialogs can visit browser chrome at a cycle boundary. Check that
  // repeated forward/reverse traversal reaches modal controls, never page links.
  const visits=[];
  for(const direction of ['Tab','Shift+Tab']) {
    await page.locator('#nextBtn').focus();
    const seen=new Set();
    for(let i=0;i<12;i++) {
      await page.keyboard.press(direction);
      const active=await page.evaluate(()=>({id:document.activeElement.id,name:document.activeElement.name,tag:document.activeElement.tagName,inDialog:!!document.activeElement.closest('#estimateDialog'),hasFocus:document.hasFocus()}));
      visits.push(active);
      assert.ok(active.inDialog||(active.tag==='BODY'&&!active.hasFocus),JSON.stringify(active));
      seen.add(active.id);
    }
    assert.ok(seen.has('closeEstimate')&&seen.has('nextBtn'),JSON.stringify(visits));
  }
  const snapshot=await page.locator('#estimateDialog').ariaSnapshot();
  assert.match(snapshot,/dialog "Tell us about your project/);
  assert.match(snapshot,/group "What kind of project is this/);
  assert.doesNotMatch(snapshot,/textbox "Your name/,'Hidden steps must not be exposed');
});

test('persistent specific validation is associated with the invalid control',async t=>{
  const page=await pageFor(t,'success');await reachContact(page);
  await page.locator('[name=phone]').fill('123');await page.locator('#nextBtn').click();
  const phone=page.locator('[name=phone]');
  assert.equal(await phone.evaluate(el=>el===document.activeElement),true);
  const described=await phone.getAttribute('aria-describedby');
  assert.ok(described,'Invalid field needs a persistent associated explanation');
  const message=await page.locator('#'+described.split(' ').at(-1)).textContent();
  assert.match(message,/10 to 15 digits/);
  await phone.fill('3035550100');
  assert.notEqual(await phone.getAttribute('aria-invalid'),'true');
});

test('mobile form controls offer 44px targets and visible focus, respecting reduced-motion preference',async t=>{
  const page=await pageFor(t,'success',{viewport:{width:375,height:812},hasTouch:true,reducedMotion:'reduce'});
  for(const selector of ['#closeEstimate','.choice-card','#nextBtn']) {
    for(const box of await page.locator(selector).evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height};}))) {
      assert.ok(box.width>=44&&box.height>=44,`${selector} must have a 44px target; got ${JSON.stringify(box)}`);
    }
  }
  await page.locator('.choice-card').first().tap();await page.locator('#nextBtn').tap();
  await page.keyboard.press('Tab');
  const focus=await page.locator('[name=details]').evaluate(el=>{const s=getComputedStyle(el);return {style:s.outlineStyle,width:s.outlineWidth,color:s.outlineColor};});
  assert.notEqual(focus.style,'none');assert.ok(parseFloat(focus.width)>=2);
  assert.equal(await page.locator('#progressBar').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
});

test('selecting a radio clears stale invalid state for the whole choice group',async t=>{
  const page=await pageFor(t,'success');
  await page.locator('#nextBtn').click();
  assert.equal(await page.locator('[name=projectType][aria-invalid=true]').count(),8);
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('[name=projectType]:checked').count(),1);
  assert.equal(await page.locator('[name=projectType][aria-invalid=true]').count(),0);
  assert.equal(await page.locator('#fieldError-projectType').isHidden(),true);
});

test('location and timing errors persist beside fields and clear on correction',async t=>{
  const page=await pageFor(t,'success');
  await page.locator('[name=projectType]').first().check();
  await page.locator('#nextBtn').click();await page.locator('#nextBtn').click();
  await page.locator('#nextBtn').click();await step(page,3);
  assert.equal(await page.locator('[name=location]').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('#fieldError-location').isVisible(),true);
  assert.equal(await page.locator('#fieldError-timing').isVisible(),true);
  await page.locator('[name=location]').fill('80015');
  assert.equal(await page.locator('#fieldError-location').isHidden(),true);
  assert.equal(await page.locator('#fieldError-timing').isVisible(),true);
  await page.locator('#nextBtn').click();
  assert.equal(await page.locator('[name=timing]').evaluate(el=>el===document.activeElement),true);
  await page.locator('[name=timing]').selectOption({label:'Just researching'});
  await page.locator('#nextBtn').click();await step(page,4);
});

test('field and focus boundaries meet 3:1 and placeholder text meets 4.5:1 contrast',async t=>{
  const page=await pageFor(t);
  const contrast=async(selector,property,background,pseudo=null)=>page.locator(selector).evaluate((el,{property,background,pseudo})=>{
    const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
    const light=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const a=light(rgb(getComputedStyle(el,pseudo)[property])),b=light(rgb(background));
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  },{property,background,pseudo});
  assert.ok(await contrast('#formAvailability','outlineColor','rgb(255, 247, 232)')>=3);
  await page.locator('[name=projectType]').first().check();await page.locator('#nextBtn').click();
  await page.keyboard.press('Tab');
  assert.ok(await contrast('[name=details]','outlineColor','rgb(255, 255, 255)')>=3);
  assert.ok(await contrast('[name=details]','borderTopColor','rgb(255, 255, 255)')>=3);
  for(const name of ['details','location','spaceNote']) {
    assert.ok(await contrast(`[name=${name}]`,'color','rgb(255, 255, 255)','::placeholder')>=4.5);
    assert.equal(await page.locator(`[name=${name}]`).evaluate(el=>getComputedStyle(el,'::placeholder').opacity),'1');
  }
});

test('keyboard focus can reach every contact control inside a short viewport',async t=>{
  const page=await pageFor(t,'success',{viewport:{width:812,height:375}});await reachContact(page);
  await page.locator('#closeEstimate').focus();
  const visited=new Set();
  for(let i=0;i<18;i++){
    await page.keyboard.press('Tab');
    if(await page.evaluate(()=>document.activeElement===document.body&&!document.hasFocus()))continue;
    await page.waitForFunction(()=>{const el=document.activeElement,r=el.getBoundingClientRect(),d=document.querySelector('#estimateDialog').getBoundingClientRect();return r.top>=Math.max(0,d.top)-1&&r.bottom<=Math.min(innerHeight,d.bottom)+1;},null,{timeout:3000});
    const active=await page.evaluate(()=>{
      const el=document.activeElement,r=el.getBoundingClientRect(),d=document.querySelector('#estimateDialog').getBoundingClientRect();
      return {key:el.name||el.id,inDialog:!!el.closest('#estimateDialog'),onScreen:r.top>=Math.max(0,d.top)-1&&r.bottom<=Math.min(innerHeight,d.bottom)+1};
    });
    assert.equal(active.inDialog,true,'Keyboard focus remains in the modal');
    assert.equal(active.onScreen,true,`${active.key} must scroll into view`);
    visited.add(active.key);
  }
  for(const key of ['name','phone','email','contactPreference','backBtn','nextBtn','closeEstimate'])assert.ok(visited.has(key),key);
});

test('no-JavaScript fallback keeps direct contact available without an enabled send button',async t=>{
  const page=await browser.newPage({javaScriptEnabled:false});t.after(()=>page.close());
  await page.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
  await page.goto(origin);
  assert.equal(await page.locator('noscript a[href="tel:+13033568421"]').isVisible(),true);
  assert.equal(await page.locator('noscript a[href="sms:+13033568421"]').isVisible(),true);
  assert.equal(await page.locator('#nextBtn').isDisabled(),true);
});
