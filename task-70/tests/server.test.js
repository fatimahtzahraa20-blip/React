import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';

test('API uses Supabase, validates input, handles conflicts and counts reads', async (t) => {
  const rows = [{ id: 'uuid-1', name: 'Widget', sku: 'WID-1' }];
  let reads = 0;
  const supabase = { from(table) {
    assert.equal(table, 'task80_items');
    return {
      select() { reads++; return this; }, order() { return this; }, limit() { return this; },
      ilike(column, pattern) { assert.equal(column, 'name'); assert.equal(pattern, '%Wid%'); return this; },
      abortSignal() { return Promise.resolve({ data: rows, error: null }); },
      insert(row) { return { select() { return { single: async () => row.sku === 'WID-1' ? { error: { code: '23505' } } : { data: { id: 'uuid-2', ...row } } }; } }; },
    };
  }};
  const server = createApp(supabase).listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  const get = await fetch(base + '/items?q=Wid&delayMs=0');
  assert.equal(get.status, 200); assert.deepEqual((await get.json()).items, rows); assert.equal(reads, 1);
  assert.equal((await fetch(base + '/items?delayMs=-1')).status, 400);
  const post = (body) => fetch(base + '/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal((await post({})).status, 400);
  assert.equal((await post({ name: 'Widget', sku: 'WID-1' })).status, 409);
  const saved = await post({ name: ' New ', sku: ' NEW-1 ' });
  assert.equal(saved.status, 201); assert.equal((await saved.json()).name, 'New');
  assert.equal((await (await fetch(base + '/request-count')).json()).requestCount, 1);
  await fetch(base + '/reset-count', { method: 'POST' });
  assert.equal((await (await fetch(base + '/request-count')).json()).requestCount, 0);
});
test('Supabase read errors return a useful JSON response', async (t) => {
  const query = { select() { return this; }, order() { return this; }, limit() { return this; }, abortSignal: async () => ({ error: { message: 'Missing table' } }) };
  const server = createApp({ from: () => query }).listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  t.after(() => new Promise((r) => server.close(r)));
  const result = await fetch('http://127.0.0.1:' + server.address().port + '/api/items?delayMs=0');
  assert.equal(result.status, 502);
  assert.match((await result.json()).message, /Supabase/);
});


