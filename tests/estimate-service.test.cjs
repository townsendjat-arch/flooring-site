const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = import('../estimate-service.js');
const config = { endpoint: 'https://formspree.io/f/mockonly', timeoutMs: 20 };

test('candidate config and replacement form work without rebuilding and never use real transport', async () => {
  const {sendEstimate,isConfigured}=await service;
  const {estimateConfig}=await import('../estimate-config.js');
  assert.equal(isConfigured(estimateConfig.endpoint),true);
  assert.equal(estimateConfig.timeoutMs,15000);
  assert.equal(Object.isFrozen(estimateConfig),true);
  for (const selected of [estimateConfig,{...estimateConfig,endpoint:'https://formspree.io/f/replacementtest'}]) {
    let calls=0;
    await sendEstimate({name:'Synthetic test only'},selected,async(url)=>{
      calls+=1;
      assert.equal(url,selected.endpoint);
      return new Response(JSON.stringify({next:'/thanks'}));
    });
    assert.equal(calls,1);
  }
});

test('empty, legacy, non-HTTPS, and unexpected destinations cannot transmit', async () => {
  const {sendEstimate} = await service;
  for (const endpoint of ['', 'https://formspree.io/person@example.invalid', 'http://formspree.io/f/mockonly', 'https://evil.invalid/f/test', 'https://formspree.io/f/mockonly?x=1']) {
    let called = false;
    await assert.rejects(sendEstimate({}, {...config, endpoint}, () => {called = true;}), {code:'unconfigured'});
    assert.equal(called, false);
  }
});
test('success uses JSON with credentials omitted and explicit acceptance', async () => {
  const {sendEstimate} = await service;
  const payload = {name:'Test visitor', contactPreference:'Text'};
  await sendEstimate(payload, config, async (url, options) => {
    assert.equal(url, config.endpoint);
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    assert.equal(options.referrerPolicy, 'strict-origin-when-cross-origin');
    assert.deepEqual(options.headers, {'Accept':'application/json','Content-Type':'application/json'});
    assert.deepEqual(JSON.parse(options.body), payload);
    return {ok:true, json:async()=>({ok:true})};
  });
});
test('current Formspree raw success fixture is accepted without following next', async () => {
  const {sendEstimate} = await service;
  // From Formspree's core.test.ts at 3148bfbf06ed1738c618e160684d73a885d4237a.
  // This is the raw response body fed to res.json(), not an SDK result object.
  const body = {next:'test-redirect-url'};
  let calls = 0;
  const result = await sendEstimate({}, config, async () => {
    calls += 1;
    return new Response(JSON.stringify(body), {status:200});
  });
  assert.deepEqual(result, body);
  assert.equal(calls, 1, 'No redirect or follow-up request');
});
test('HTTP failures, malformed JSON, and ambiguous responses are not success', async () => {
  const {sendEstimate} = await service;
  for (const [response, code] of [
    [{ok:false,status:400},'rejected'], [{ok:false,status:403},'rejected'],
    [{ok:false,status:404},'rejected'], [{ok:false,status:422},'rejected'],
    [{ok:false,status:429},'rate-limit'], [{ok:false,status:500},'unconfirmed'],
    [{ok:true,json:async()=>({})},'unconfirmed'],
    [{ok:true,json:async()=>({ok:true,errors:[{message:'no'}]})},'unconfirmed'],
    [{ok:true,json:async()=>{throw new Error('bad JSON')}},'unconfirmed'],
  ]) await assert.rejects(sendEstimate({},config,async()=>response),{code});
});
test('contradictory errors and malformed success bodies fail closed', async () => {
  const {sendEstimate} = await service;
  const bodies = [null, [], true, 'accepted', {}, {ok:false}, {ok:'true'},
    {next:42}, {next:''}, {next:'   '}, {ok:false,next:'test-redirect-url'},
    {ok:true,next:null}, {ok:true,error:'rejected'}, {ok:true,error:''},
    {ok:true,errors:'invalid'}, {ok:true,errors:null}, {ok:true,errors:{}},
    {next:'test-redirect-url',errors:[{field:'email',code:'TYPE_EMAIL',message:'Invalid email'}]},
    {next:'test-redirect-url',error:'CAPTCHA validation failed'}];
  for (const body of bodies) {
    await assert.rejects(sendEstimate({},config,async()=>new Response(JSON.stringify(body))), {code:'unconfirmed'}, JSON.stringify(body));
  }
});
test('documented provider validation errors never produce success or an automatic retry', async () => {
  const {sendEstimate} = await service;
  for (const code of ['INACTIVE','BLOCKED','FORM_NOT_FOUND','REQUIRED_FIELD_MISSING','REQUIRED_FIELD_EMPTY','TYPE_EMAIL']) {
    let calls = 0;
    await assert.rejects(sendEstimate({},config,async()=>{
      calls += 1;
      return new Response(JSON.stringify({errors:[{code,message:'Test provider rejection'}]}), {status:422});
    }), {code:'rejected'});
    assert.equal(calls,1);
  }
});
test('network failures and timeouts remain distinct and abort transport', async () => {
  const {sendEstimate} = await service;
  await assert.rejects(sendEstimate({},config,async()=>{throw new Error('offline')}),{code:'network'});
  await assert.rejects(sendEstimate({},config,(_url,{signal})=>new Promise((_resolve,reject)=>{
    signal.addEventListener('abort',()=>reject(new Error('aborted')));
  })),{code:'timeout'});
});
