const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server');
const id = '00000000-0000-4000-8000-000000000001';

test('HTTP validation, conflict mapping, missing documents and database errors', async t => {
  let calls = 0;
  const current = { id, title: 'Shared', body: 'winner', version: 2 };
  const store = {
    get: async tenant => tenant === 'demo' ? current : null,
    create: async (tenant, input) => ({ ...input, id, version: 1 }),
    update: async () => { calls++; return { status: 'conflict', current }; },
  };
  const server = createApp(store).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  const send = (path, method = 'GET', body, tenant = 'demo') => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(tenant ? { 'x-tenant-id': tenant } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  assert.equal((await send('/documents/' + id, 'GET', undefined, '')).status, 401);
  assert.equal((await send('/documents/bad')).status, 400);
  assert.equal((await send('/documents/' + id, 'GET', undefined, 'other')).status, 404);
  for (const version of [undefined, 0, -1, 1.5, '1', null, 2147483647]) {
    assert.equal((await send('/documents/' + id, 'PATCH', { version, body: 'edit' })).status, 400);
  }
  for (const input of [{ version: 1 }, { version: 1, title: '' }, { version: 1, body: null }, { version: 1, tenant_id: 'other' }]) {
    assert.equal((await send('/documents/' + id, 'PATCH', input)).status, 400);
  }
  assert.equal(calls, 0);
  const conflict = await send('/documents/' + id, 'PATCH', { version: 1, body: 'loser' });
  assert.equal(conflict.status, 409);
  assert.deepEqual(await conflict.json(), { error: 'CONFLICT', message: 'This document changed since you loaded it.', yourVersion: 1, current });
  assert.equal((await send('/documents', 'POST', { title: 'New' })).status, 201);
  store.update = async () => ({ status: 'updated', current });
  assert.equal((await send('/documents/' + id, 'PATCH', { version: 1, body: 'edit' })).status, 200);
  store.update = async () => ({ status: 'not_found' });
  assert.equal((await send('/documents/' + id, 'PATCH', { version: 1, body: 'edit' })).status, 404);
  store.get = async () => { throw new Error('private database detail'); };
  const failure = await send('/documents/' + id);
  assert.equal(failure.status, 500);
  assert.equal((await failure.text()).includes('private database detail'), false);
  const malformed = await fetch(base + '/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
});

