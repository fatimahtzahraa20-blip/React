const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server');
const Item = require('../models/Item');
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';

function fixture() {
  let rows = [
    { id: ID_A, tenant_id: A, name: 'A item', sku: 'shared' },
    { id: ID_B, tenant_id: B, name: 'B item', sku: 'shared' },
  ];
  const calls = [];
  const factory = token => ({
    auth: { getUser: async () => ({ data: { user: ['a', 'b', 'both', 'db-error'].includes(token) ? { id: token } : null } }) },
    from(table) {
      const filters = {};
      let operation = 'select', payload;
      const query = {
        select() { return this; },
        eq(key, value) { filters[key] = value; return this; },
        order() { return this; },
        insert(value) { operation = 'insert'; payload = value; return this; },
        update(value) { operation = 'update'; payload = value; return this; },
        delete() { operation = 'delete'; return this; },
        single() { return execute(true); },
        maybeSingle() { return execute(true); },
        then(resolve, reject) { return execute(false).then(resolve, reject); },
      };
      async function execute(single) {
        await new Promise(resolve => setTimeout(resolve, token === 'a' ? 8 : 1));
        calls.push({ table, operation, filters: { ...filters }, payload });
        if (token === 'db-error') return { error: { code: 'TEST_FAILURE', message: 'private database detail' } };
        if (table === 'tenant_memberships') {
          const allowed = token === 'both' || (token === 'a' && filters.tenant_id === A) || (token === 'b' && filters.tenant_id === B);
          return { data: allowed && filters.user_id === token ? { tenant_id: filters.tenant_id } : null };
        }
        // Deliberately no simulated RLS: these tests must catch missing repository scope.
        const selected = rows.filter(row => Object.entries(filters).every(([key, value]) => row[key] === value));
        if (operation === 'insert') {
          if (rows.some(row => row.tenant_id === payload.tenant_id && row.sku === payload.sku)) return { error: { code: '23505' } };
          const row = { ...payload, id: '33333333-3333-4333-8333-333333333333' };
          rows.push(row); return { data: row };
        }
        if (operation === 'update') selected.forEach(row => Object.assign(row, payload));
        if (operation === 'delete') rows = rows.filter(row => !selected.includes(row));
        return { data: single ? selected[0] || null : selected };
      }
      return query;
    },
  });
  return { factory, calls };
}

test('API authenticates, scopes every operation, and isolates concurrent requests', async t => {
  const { factory, calls } = fixture();
  const server = createApp(factory).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  async function request(token, tenant, method = 'GET', path = '/items', body) {
    const headers = {};
    if (token) headers.Authorization = 'Bearer ' + token;
    if (tenant) headers['x-tenant-id'] = tenant;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
  }
  assert.equal((await request(null, A)).status, 401);
  assert.equal((await request('forged', A)).status, 401);
  assert.equal((await request('a', null)).status, 400);
  assert.equal((await request('a', 'tenant-a')).status, 400);
  assert.equal((await request('a', B)).status, 403);
  assert.equal((await request('b', A)).status, 403);
  const concurrent = await Promise.all(Array.from({ length: 20 }, (_, i) => request(i % 2 ? 'a' : 'b', i % 2 ? A : B)));
  concurrent.forEach((response, i) => {
    assert.equal(response.status, 200);
    assert.equal(response.data.length, 1);
    assert.equal(response.data[0].tenant_id, i % 2 ? A : B);
  });
  assert.equal((await request('both', A)).data.length, 1);
  assert.equal((await request('a', A, 'DELETE', '/items/' + ID_B)).status, 404);
  assert.equal((await request('a', A, 'PUT', '/items/' + ID_B, { name: 'attack', sku: 'attack' })).status, 404);
  assert.equal((await request('b', B)).data[0].name, 'B item');
  for (const body of [{ name: 'x', sku: 'x', tenant_id: B }, { name: 'x', sku: 'x', tenantId: B }, { name: ' ', sku: 'x' }, { name: 123, sku: 'x' }, null, []]) {
    assert.equal((await request('a', A, 'POST', '/items', body)).status, 400);
  }
  assert.equal((await request('a', A, 'POST', '/items', { name: 'duplicate', sku: 'shared' })).status, 409);
  const created = await request('a', A, 'POST', '/items', { name: ' New ', sku: ' new ' });
  assert.equal(created.status, 201);
  assert.equal(created.data.tenant_id, A);
  assert.equal(created.data.name, 'New');
  assert.equal((await request('a', A, 'PUT', '/items/' + ID_A, { name: 'Updated', sku: 'shared' })).data.name, 'Updated');
  assert.equal((await request('a', A, 'DELETE', '/items/' + ID_A)).status, 200);
  assert.equal((await request('a', A, 'DELETE', '/items/not-a-uuid')).status, 400);
  const failure = await request('db-error', A);
  assert.equal(failure.status, 500);
  assert.deepEqual(failure.data, { error: 'INTERNAL_ERROR' });
  for (const call of calls.filter(call => call.table === 'items')) {
    if (call.operation === 'insert') assert.ok(call.payload.tenant_id);
    else assert.ok(call.filters.tenant_id);
  }
});
test('repository fails closed outside middleware context', () => {
  assert.throws(() => Item.list(), /Authenticated tenant context required/);
  assert.throws(() => Item.create({ name: 'x', sku: 'x' }), /Authenticated tenant context required/);
  assert.throws(() => Item.update(ID_A, { name: 'x', sku: 'x' }), /Authenticated tenant context required/);
  assert.throws(() => Item.remove(ID_A), /Authenticated tenant context required/);
});
