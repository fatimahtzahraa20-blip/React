require('dotenv').config();
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createDatabase } = require('../../db');
const { createDocumentStore } = require('../../models/EditableDoc');
const { createApp } = require('../../server');

test('real Supabase: competing saves have one winner, stale writes never overwrite', {
  skip: !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY,
}, async t => {
  const db = createDatabase();
  const tenant = 'test-' + randomUUID();
  t.after(async () => {
    const { error } = await db.from('documents').delete().eq('tenant_id', tenant);
    if (error) throw error;
  });
  const server = createApp(createDocumentStore(db)).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port + '/documents';
  async function send(path, method, input, scope = tenant) {
    const response = await fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json', 'x-tenant-id': scope },
      body: input === undefined ? undefined : JSON.stringify(input),
    });
    return { status: response.status, data: await response.json() };
  }
  const created = await send('', 'POST', { title: 'Race', body: 'initial' });
  assert.equal(created.status, 201);
  assert.equal(created.data.version, 1);
  const path = '/' + created.data.id;
  const results = await Promise.all(['A', 'B'].map(body => send(path, 'PATCH', { version: 1, body })));
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  const winner = results.find(result => result.status === 200).data;
  const loser = results.find(result => result.status === 409).data;
  assert.equal(winner.version, 2);
  assert.equal(loser.yourVersion, 1);
  assert.deepEqual(loser.current, winner);
  assert.deepEqual((await send(path, 'GET')).data, winner);
  assert.equal((await send(path, 'PATCH', { version: 1, body: 'stale' })).status, 409);
  assert.equal((await send(path, 'PATCH', { version: 2, body: 'intruder' }, 'other-' + tenant)).status, 404);
  assert.equal((await send(path, 'GET', undefined, 'other-' + tenant)).status, 404);
  const rebased = await send(path, 'PATCH', { version: 2, body: 'merged' });
  assert.equal(rebased.status, 200);
  assert.equal(rebased.data.version, 3);
  assert.equal(rebased.data.body, 'merged');
  assert.equal(rebased.data.title, 'Race');
  assert.equal((await send('/' + randomUUID(), 'PATCH', { version: 1, body: 'missing' })).status, 404);
});

