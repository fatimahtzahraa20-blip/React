import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { request, clearResponseCache, _debugInspect } from '../src/api/httpClient.js';
const original = globalThis.fetch;
let calls;
beforeEach(() => {
  clearResponseCache();
  calls = [];
  globalThis.fetch = (url, options) => new Promise((resolve, reject) => calls.push({ url, options, resolve: (data, status = 200) => resolve(new Response(JSON.stringify(data), { status })), reject }));
});
afterEach(() => { globalThis.fetch = original; });
const tick = () => new Promise((r) => setImmediate(r));

test('five concurrent GET callers share one network request', async () => {
  const handles = Array.from({ length: 5 }, () => request('/items'));
  await tick();
  assert.equal(calls.length, 1);
  calls[0].resolve({ value: 1 });
  assert.deepEqual(await Promise.all(handles.map((h) => h.promise)), Array(5).fill({ value: 1 }));
});
test('cancellation is independent and idempotent', async () => {
  const a = request('/items'); const b = request('/items');
  const rejected = assert.rejects(a.promise, { name: 'AbortError' });
  a.cancel(); a.cancel();
  await tick();
  assert.equal(calls[0].options.signal.aborted, false);
  calls[0].resolve('ok');
  await rejected; assert.equal(await b.promise, 'ok');
});
test('last cancellation aborts; old completion cannot remove replacement', async () => {
  const a = request('/items');
  const rejected = assert.rejects(a.promise, { name: 'AbortError' });
  await tick(); a.cancel();
  const b = request('/items');
  await tick();
  assert.equal(calls[0].options.signal.aborted, true);
  calls[0].resolve('old');
  await tick();
  assert.equal(_debugInspect().inFlightKeys.length, 1);
  const c = request('/items');
  assert.equal(c.deduped, true);
  calls[1].resolve('new');
  assert.deepEqual(await Promise.all([b.promise, c.promise]), ['new', 'new']);
  await rejected;
});
test('cache reuse, TTL expiry and cache opt-out', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1000 });
  const a = request('/items', { cacheTtlMs: 50 }); await tick(); calls[0].resolve('ok'); await a.promise;
  const b = request('/items', { cacheTtlMs: 50 }); assert.equal(b.fromCache, true); await b.promise;
  t.mock.timers.tick(51);
  const c = request('/items', { cacheTtlMs: 50 }); await tick(); assert.equal(calls.length, 2); calls[1].resolve('fresh'); await c.promise;
  const d = request('/items', { cacheTtlMs: 0 }); await tick(); assert.equal(calls.length, 3); calls[2].resolve('uncached'); await d.promise;
});
test('headers isolate auth contexts and writes are never deduplicated', async () => {
  const handles = [request('/items', { headers: { Authorization: 'Bearer a' } }), request('/items', { headers: { authorization: 'Bearer b' } }),
    request('/items', { method: 'POST', body: { name: 'x' } }), request('/items', { method: 'POST', body: { name: 'x' } })];
  await tick(); assert.equal(calls.length, 4);
  calls.forEach((c) => c.resolve('ok')); await Promise.all(handles.map((h) => h.promise));
});
test('newer independent fetch wins cache even when older resolves last', async () => {
  const a = request('/items', { dedupe: false }); const b = request('/items', { dedupe: false });
  await tick(); calls[1].resolve('new'); await b.promise; calls[0].resolve('old'); await a.promise;
  assert.equal(await request('/items').promise, 'new');
});
test('mutation invalidation detaches old reads and blocks stale cache writes', async () => {
  const old = request('/items'); const write = request('/items', { method: 'POST', body: {} });
  await tick(); calls[1].resolve('saved'); await write.promise;
  const fresh = request('/items'); await tick(); assert.equal(calls.length, 3);
  calls[0].resolve('old'); await old.promise;
  assert.equal(_debugInspect().cachedKeys.length, 0);
  calls[2].resolve('fresh'); await fresh.promise;
  assert.equal(await request('/items').promise, 'fresh');
});
test('HTTP failures are not cached and permit retry', async () => {
  const a = request('/items'); const rejection = assert.rejects(a.promise, { message: 'Unavailable', status: 503 });
  await tick(); calls[0].resolve({ message: 'Unavailable' }, 503); await rejection;
  const b = request('/items'); await tick(); assert.equal(calls.length, 2); calls[1].resolve('ok'); await b.promise;
});
test('clearing cache during a read prevents repopulation', async () => {
  const a = request('/items'); await tick(); clearResponseCache(); calls[0].resolve('old'); await a.promise;
  assert.equal(_debugInspect().cachedKeys.length, 0);
});

