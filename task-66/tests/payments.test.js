const { before, after, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const request = require('supertest');
const { createApp } = require('../app');
let db;
const client = {
  async rpc(name, p) {
    assert.equal(name, 'create_payment');
    try {
      const result = await db.query('select public.create_payment($1, $2, $3, $4, $5) as result',
        [p.p_tenant_id, p.p_key, p.p_account_id, p.p_amount_cents, p.p_currency]);
      return { data: result.rows[0].result, error: null };
    } catch (error) { return { data: null, error }; }
  },
};
const app = createApp(() => client);
before(async () => {
  db = new PGlite();
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  await db.exec(fs.readFileSync(path.join(__dirname, '../supabase/migrations/202609070001_create_payments.sql'), 'utf8'));
});
after(async () => { await db?.close(); });
beforeEach(async () => { await db.exec('truncate payment_idempotency, payment_orders, payment_accounts;'); });
const body = { accountId: 'acct_1', amountCents: 2500 };
const pay = (key = 'key-1', payload = body, tenant = 'tenant-1', target = app) =>
  request(target).post('/payments').set('x-tenant-id', tenant).set('Idempotency-Key', key).send(payload);
const count = async table => Number((await db.query('select count(*) as n from ' + table)).rows[0].n);
const balance = async () => Number((await db.query('select balance_cents from payment_accounts')).rows[0].balance_cents);

test('sequential duplicate replays exact response with canonical defaults', async () => {
  const first = await pay();
  const second = await pay('key-1', { currency: 'USD', amountCents: 2500, accountId: 'acct_1' });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.deepEqual(second.body, first.body);
  assert.equal(second.headers['idempotency-replayed'], 'true');
  assert.equal(await count('payment_orders'), 1);
  assert.equal(await balance(), -2500);
});
test('20 simultaneous HTTP duplicates debit once (PGlite serializes SQL)', async () => {
  const responses = await Promise.all(Array.from({ length: 20 }, () => pay()));
  responses.forEach(r => { assert.equal(r.status, 201); assert.deepEqual(r.body, responses[0].body); });
  assert.equal(await count('payment_orders'), 1);
  assert.equal(await count('payment_idempotency'), 1);
  assert.equal(await balance(), -2500);
});
test('same key with changed payload conflicts', async () => {
  await pay();
  assert.equal((await pay('key-1', { ...body, amountCents: 100 })).status, 422);
  assert.equal(await count('payment_orders'), 1);
});
test('concurrent HTTP conflicting payloads have only one winner', async () => {
  const responses = await Promise.all([pay(), pay('key-1', { ...body, amountCents: 100 })]);
  assert.deepEqual(responses.map(r => r.status).sort(), [201, 422]);
  assert.equal(await count('payment_orders'), 1);
});
test('distinct keys debit the same account', async () => {
  const responses = await Promise.all(Array.from({ length: 10 }, (_, i) => pay('key-' + i)));
  responses.forEach(r => assert.equal(r.status, 201));
  assert.equal(await count('payment_orders'), 10);
  assert.equal(await balance(), -25000);
});
test('same key is isolated across tenants', async () => {
  assert.equal((await pay()).status, 201);
  assert.equal((await pay('key-1', body, 'tenant-2')).status, 201);
  assert.equal(await count('payment_orders'), 2);
  assert.equal(await count('payment_accounts'), 2);
});
test('failure saving response rolls back debit and order; same key retries', async () => {
  await db.exec("create function fail_response() returns trigger language plpgsql as $$ begin raise exception 'injected failure'; end $$; create trigger fail_response before insert on payment_idempotency for each row execute function fail_response();");
  try { assert.equal((await pay()).status, 503); }
  finally { await db.exec('drop trigger fail_response on payment_idempotency; drop function fail_response();'); }
  assert.equal(await count('payment_orders'), 0);
  assert.equal(await count('payment_accounts'), 0);
  assert.equal(await count('payment_idempotency'), 0);
  assert.equal((await pay()).status, 201);
});
test('lost response after commit replays on retry', async () => {
  const lostResponseApp = createApp(() => ({
    async rpc(...args) {
      await client.rpc(...args);
      return { data: null, error: new Error('response lost') };
    },
  }));
  assert.equal((await pay('lost', body, 'tenant-1', lostResponseApp)).status, 503);
  const retry = await pay('lost');
  assert.equal(retry.status, 201);
  assert.equal(retry.headers['idempotency-replayed'], 'true');
  assert.equal(await count('payment_orders'), 1);
  assert.equal(await balance(), -2500);
});
test('balance overflow rolls back new key and order', async () => {
  await pay('max', { ...body, amountCents: Number.MAX_SAFE_INTEGER });
  const response = await pay('overflow', { ...body, amountCents: 1 });
  assert.equal(response.status, 422);
  assert.equal(response.body.error, 'BALANCE_LIMIT_EXCEEDED');
  assert.equal(await count('payment_orders'), 1);
  assert.equal(await count('payment_idempotency'), 1);
});
test('invalid inputs never reserve keys', async () => {
  for (const payload of [null, [], {}, { ...body, amountCents: 1.5 }, { ...body, amountCents: -1 },
    { ...body, amountCents: Number.MAX_SAFE_INTEGER + 1 }, { ...body, accountId: {} },
    { ...body, currency: 'EUR' }, { ...body, unexpected: true }]) {
    assert.equal((await pay('invalid', payload)).status, 400);
  }
  assert.equal((await request(app).post('/payments').set('x-tenant-id', 't').send(body)).status, 400);
  assert.equal((await request(app).post('/payments').set('Idempotency-Key', 'k').send(body)).status, 401);
  assert.equal(await count('payment_idempotency'), 0);
});
test('browser roles cannot execute RPC or read tables; service role can pay', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec('set role ' + role);
    try {
      await assert.rejects(db.query("select public.create_payment('t','k','a',1,'USD')"), /permission denied/);
      await assert.rejects(db.query('select * from payment_orders'), /permission denied/);
    } finally { await db.exec('reset role'); }
  }
  await db.exec('set role service_role');
  try { assert.equal((await pay()).status, 201); }
  finally { await db.exec('reset role'); }
});
