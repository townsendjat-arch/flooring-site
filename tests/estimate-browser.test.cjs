const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
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
  browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}), args:['--no-sandbox']});
});
after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve));});

async function pageFor(t, mode='unconfigured', options={}) {
  const page = await browser.newPage({viewport:{width:1280,height:900},...options});
  t.after(()=>page.close());
  const requests=[];
  // Block every non-local request. Provider behavior is simulated in-page;
  // no test payload, even fake data, can reach Formspree or another host.
  await page.route('**/*', route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
  if (mode!=='unconfigured') {
    await page.route('**/estimate-config.js',route=>route.fulfill({contentType:'text/javascript',body:`export const estimateConfig = {endpoint:"https://formspree.io/f/mockonly",timeoutMs:${mode==='slow'?5000:60}};`}));
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
for(const [mode,message] of [['network','could not confirm'],['timeout','timed out'],['unconfirmed','could not confirm'],['server-error','could not confirm']]) {
  test(`${mode} retains inputs and allows retry without false success`,async t=>{
    const page=await pageFor(t,mode);await reachContact(page);await page.locator('#nextBtn').click();
    await errorContains(page,message);await step(page,4);
    assert.equal(await page.locator('[name=name]').inputValue(),'Test visitor');
    assert.equal(await page.locator('#nextBtn').isDisabled(),false);
    assert.equal(await page.locator('#formError').evaluate(el=>el===document.activeElement),true);
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
