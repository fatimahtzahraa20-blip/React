import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

async function fixture(t, { authError = false, databaseError = false, saveError = false, providerError = false, configurationError } = {}) {
  const calls = [];
  const rows = new Map();
  const app = createApp({
    supabase: {
      auth: { getUser: async () => ({ data: { user: authError ? null : { id: 'user-1' } }, error: authError }) },
      from: () => ({
        insert: async row => {
          if (databaseError) return { error: { code: '42P01' } };
          if (rows.has(row.order_id)) return { error: { code: '23505' } };
          rows.set(row.order_id, row); return {};
        },
        select: () => ({ eq: (_, id) => ({ single: async () => ({ data: rows.get(id) }) }) }),
        update: value => ({ eq: async (_, id) => {
          if (saveError) return { error: true };
          Object.assign(rows.get(id), value); return {};
        } }),
      }),
    },
    createPayment: async params => {
      calls.push(params);
      if (providerError) throw new Error('private provider details');
      return { id: 'tracker_test', url: 'https://sandbox.api.getsafepay.com/checkout/pay' };
    },
    unitAmount: 100, currency: 'PKR', configurationError,
  });
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return { calls, rows, post: (body = {}, headers = {}) => fetch(`http://localhost:${server.address().port}/create-payment`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token', 'Idempotency-Key': '12345678-1234-1234-1234-123456789012', ...headers }, body: JSON.stringify(body),
  }) };
}
test('creates checkout using server amount and persists ownership', async t => {
  const { post, calls, rows } = await fixture(t);
  const response = await post({ quantity: 2, amount: 1 });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).id, 'tracker_test');
  assert.equal(calls[0].amount, 200);
  assert.equal(calls[0].currency, 'PKR');
  assert.equal([...rows.values()][0].user_id, 'user-1');
});
test('retries reuse checkout; changed quantity is rejected', async t => {
  const { post, calls } = await fixture(t);
  assert.equal((await post()).status, 201);
  assert.equal((await post()).status, 200);
  assert.equal((await post({ quantity: 2 })).status, 409);
  assert.equal(calls.length, 1);
});
test('rejects missing or invalid authorization', async t => {
  const first = await fixture(t);
  assert.equal((await first.post({}, { Authorization: '' })).status, 401);
  const second = await fixture(t, { authError: true });
  assert.equal((await second.post()).status, 401);
  assert.equal(first.calls.length + second.calls.length, 0);
});
test('rejects invalid quantities and missing retry key', async t => {
  const { post, calls } = await fixture(t);
  for (const quantity of [0, -1, 11, 1.5, '2']) assert.equal((await post({ quantity })).status, 400);
  assert.equal((await post({}, { 'Idempotency-Key': '' })).status, 400);
  assert.equal(calls.length, 0);
});
test('missing configuration returns JSON 503', async t => {
  const { post } = await fixture(t, { configurationError: 'Configure SAFEPAY_UNIT_AMOUNT' });
  const response = await post();
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /SAFEPAY_UNIT_AMOUNT/);
});
test('missing table prevents provider calls', async t => {
  const { post, calls } = await fixture(t, { databaseError: true });
  const response = await post();
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /safepay.sql/);
  assert.equal(calls.length, 0);
});
test('provider failure returns JSON and prevents repeated initialization', async t => {
  const { post, calls } = await fixture(t, { providerError: true });
  const response = await post();
  assert.equal(response.status, 502);
  assert.doesNotMatch((await response.json()).error, /private/);
  assert.equal((await post()).status, 409);
  assert.equal(calls.length, 1);
});
test('failed persistence does not expose a checkout URL', async t => {
  const { post } = await fixture(t, { saveError: true });
  const response = await post();
  assert.equal(response.status, 503);
  assert.equal((await response.json()).url, undefined);
});
