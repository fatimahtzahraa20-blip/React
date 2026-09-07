import test from 'node:test';
import assert from 'node:assert/strict';
import { createSafepay } from './safepay.js';
test('initializes Safepay and builds an encoded hosted checkout URL', async () => {
  let request;
  const create = createSafepay({
    publicKey: 'sec_test-only', environment: 'sandbox', appUrl: 'http://localhost:5173',
    fetchImpl: async (url, options) => {
      request = { url, ...options };
      return new Response('{"data":{"token":"tracker_test"}}');
    },
  });
  const payment = await create({ amount: 200, currency: 'PKR', orderId: 'user:request' });
  assert.equal(request.url, 'https://sandbox.api.getsafepay.com/order/v1/init');
  assert.deepEqual(JSON.parse(request.body), { amount: 200, currency: 'PKR', client: 'sec_test-only', environment: 'sandbox' });
  const url = new URL(payment.url);
  assert.equal(url.pathname, '/checkout/pay');
  assert.equal(url.searchParams.get('beacon'), 'tracker_test');
  assert.equal(url.searchParams.get('order_id'), 'user:request');
  assert.equal(url.searchParams.get('redirect_url'), 'http://localhost:5173/?checkout=success');
  assert.ok(!payment.url.includes('sec_test-only'));
});
test('Safepay empty, rejected and malformed responses are handled', async () => {
  for (const [body, status] of [['', 502], ['{}', 200], ['{"error":"secret"}', 401]]) {
    const create = createSafepay({
      publicKey: 'sec_test-only', environment: 'sandbox', appUrl: 'http://localhost:5173',
      fetchImpl: async () => new Response(body, { status }),
    });
    await assert.rejects(create({ amount: 100, currency: 'PKR', orderId: 'request' }), /Safepay/);
  }
});

test('rejects a private key before making a network request', () => {
  assert.throws(() => createSafepay({ publicKey: 'private-secret', environment: 'sandbox', appUrl: 'http://localhost:5173', fetchImpl: () => assert.fail('Must not send a private key') }), /Public API Key/);
});
