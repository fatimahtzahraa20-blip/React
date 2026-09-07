import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';

async function request(t, client, ids = ['admin'], token = 'valid') {
  const server = createApp(client, ids).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return fetch(`http://127.0.0.1:${server.address().port}/admin/users`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
}
function client(id = 'admin', listUsers = async () => ({ data: { users: [] } })) {
  return { auth: { getUser: async () => ({ data: { user: id ? { id } : null } }), admin: { listUsers } } };
}
test('missing and invalid authentication cannot list users', async t => {
  const forbidden = async () => { assert.fail('must not list users'); };
  assert.equal((await request(t, client('admin', forbidden), ['admin'], '')).status, 401);
  assert.equal((await request(t, client(null, forbidden))).status, 401);
});
test('non-admin and empty allowlist deny access', async t => {
  const forbidden = async () => { assert.fail('must not list users'); };
  assert.equal((await request(t, client('other', forbidden))).status, 403);
  assert.equal((await request(t, client('admin', forbidden), [])).status, 403);
});
test('collects all pages and excludes private metadata', async t => {
  const pages = [];
  const mock = client('admin', async ({ page, perPage }) => {
    pages.push(page);
    assert.equal(perPage, 1000);
    return { data: { users: Array.from({ length: page === 1 ? 1000 : 1 }, (_, i) => ({ id: `${page}-${i}`, email: 'test@example.com', user_metadata: { secret: 'hidden' } })) } };
  });
  const response = await request(t, mock);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(body.total, 1001);
  assert.deepEqual(pages, [1, 2]);
  assert.equal('user_metadata' in body.users[0], false);
});
test('configuration and upstream failures are handled without leaking details', async t => {
  assert.equal((await request(t, null)).status, 503);
  const response = await request(t, client('admin', async () => ({ error: new Error('private details') })));
  assert.equal(response.status, 502);
  assert.equal((await response.text()).includes('private details'), false);
});
