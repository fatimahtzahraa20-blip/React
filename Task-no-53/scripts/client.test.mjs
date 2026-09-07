import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stats, canRetry, validateConfig } from '../src/lib.js';
test('statistics derive from real completed records and handle an empty database', () => {
  assert.deepEqual(stats([]), { total: 0, rate: '—', duration: '—' });
  assert.deepEqual(stats([{ status: 'accepted', duration_ms: 200 }, { status: 'failed', duration_ms: 400 }, { status: 'queued' }]), { total: 3, rate: '50%', duration: '300 ms' });
});
test('retry rules enforce cooldown, acceptance and idempotency window', () => {
  const now = Date.now(), old = new Date(now - 120000).toISOString();
  assert.equal(canRetry({ status: 'failed', updated_at: old, first_attempt_at: old }, now), true);
  assert.equal(canRetry({ status: 'accepted', updated_at: old }, now), false);
  assert.equal(canRetry({ status: 'failed', updated_at: new Date(now).toISOString() }, now), false);
  assert.equal(canRetry({ status: 'failed', updated_at: old, first_attempt_at: new Date(now - 24 * 3600000).toISOString() }, now), false);
});
test('connection rejects private keys and unsafe URLs', () => {
  assert.throws(() => validateConfig({ url: 'https://project.supabase.co', key: 'sb_secret_private' }));
  assert.throws(() => validateConfig({ url: 'http://project.supabase.co', key: 'sb_publishable_test' }));
  assert.throws(() => validateConfig({ url: 'https://project.supabase.co/rest/v1', key: 'sb_publishable_test' }));
  assert.deepEqual(validateConfig({ url: 'https://project.supabase.co', key: 'sb_publishable_test' }), { url: 'https://project.supabase.co', key: 'sb_publishable_test' });
  const jwt = 'header.' + Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url') + '.signature';
  assert.throws(() => validateConfig({ url: 'https://project.supabase.co', key: jwt }));
});
