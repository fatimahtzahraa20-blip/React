import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

test('HTTP playground flows', async t => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = (path, options) => fetch(base + path, options);
  const issue = async (body = {}) => {
    const res = await call('/api/demo-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(res.status, 200); return (await res.json()).token;
  };
  await t.test('health and missing token', async () => {
    assert.equal((await (await call('/api/health')).json()).demoEnabled, true);
    assert.equal((await call('/api/protected')).status, 401);
  });
  await t.test('custom identity, role authorization and echo', async () => {
    const token = await issue({ name: 'Test User', role: 'developer', expiresIn: 300 });
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const response = await call('/api/protected', { headers });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.json()).user.name, 'Test User');
    assert.equal((await call('/api/admin', { headers })).status, 403);
    const echo = await call('/api/echo', { method: 'POST', headers, body: JSON.stringify({ hello: ['world', 64] }) });
    assert.equal(echo.status, 200); assert.deepEqual((await echo.json()).data, { hello: ['world', 64] });
    const admin = await issue({ role: 'admin' });
    assert.equal((await call('/api/admin', { headers: { Authorization: `Bearer ${admin}` } })).status, 200);
  });
  for (const scenario of ['expired', 'future', 'signature', 'audience']) await t.test(`rejects ${scenario} scenario`, async () => {
    const token = await issue({ scenario });
    assert.equal((await call('/api/protected', { headers: { Authorization: `Bearer ${token}` } })).status, 401);
  });
  await t.test('bad inputs and unknown API return JSON errors', async () => {
    for (const body of [{ role: 'owner' }, { name: '' }, { expiresIn: 0 }, { scenario: 'unknown' }]) {
      assert.equal((await call('/api/demo-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).status, 400);
    }
    const bad = await call('/api/echo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
    assert.equal(bad.status, 400); assert.equal((await bad.json()).error, 'Invalid JSON body');
    assert.equal((await call('/api/missing')).status, 404);
  });
});

test('production requires secret and disables demo issuance', async t => {
  assert.throws(() => createApp({ production: true }));
  const server = createApp({ production: true, secret: 'test-production-secret' }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base + '/api/demo-token', { method: 'POST' })).status, 404);
  assert.equal((await (await fetch(base + '/api/health')).json()).demoEnabled, false);
});
