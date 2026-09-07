import test from 'node:test';
import assert from 'node:assert/strict';
import { readPaymentResponse } from './payment-response.js';
test('empty and HTML responses produce a useful server error', async () => {
  for (const body of ['', '<html>Error</html>']) {
    await assert.rejects(readPaymentResponse(new Response(body, { status: 500 })), /payment server/);
  }
});
test('API errors are preserved and missing checkout links rejected', async () => {
  await assert.rejects(readPaymentResponse(new Response(JSON.stringify({error:'Configure Safepay'}), {status:503})), /Configure Safepay/);
  await assert.rejects(readPaymentResponse(new Response('{}')), /valid checkout link/);
});
test('valid checkout link is returned', async () => {
  assert.equal((await readPaymentResponse(new Response('{"url":"https://sandbox.api.getsafepay.com/checkout/"}'))).url, 'https://sandbox.api.getsafepay.com/checkout/');
});
