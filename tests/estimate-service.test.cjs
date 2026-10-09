const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = import('../estimate-service.js');
const config = { endpoint: 'https://formspree.io/f/mockonly', timeoutMs: 20 };

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
    assert.deepEqual(JSON.parse(options.body), payload);
    return {ok:true, json:async()=>({ok:true})};
  });
});
test('HTTP failures, malformed JSON, and ambiguous responses are not success', async () => {
  const {sendEstimate} = await service;
  for (const [response, code] of [
    [{ok:false,status:422},'rejected'], [{ok:false,status:429},'rate-limit'], [{ok:false,status:500},'unconfirmed'],
    [{ok:true,json:async()=>({})},'unconfirmed'],
    [{ok:true,json:async()=>({ok:true,errors:[{message:'no'}]})},'unconfirmed'],
    [{ok:true,json:async()=>{throw new Error('bad JSON')}},'network'],
  ]) await assert.rejects(sendEstimate({},config,async()=>response),{code});
});
test('network failures and timeouts remain distinct and abort transport', async () => {
  const {sendEstimate} = await service;
  await assert.rejects(sendEstimate({},config,async()=>{throw new Error('offline')}),{code:'network'});
  await assert.rejects(sendEstimate({},config,(_url,{signal})=>new Promise((_resolve,reject)=>{
    signal.addEventListener('abort',()=>reject(new Error('aborted')));
  })),{code:'timeout'});
});
