import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../supabase/functions/send-insert-email/handler.js';
const id = '12345678-1234-1234-1234-123456789abc';
const event = { type: 'INSERT', schema: 'public', table: 'contacts', record: { id } };
const request = (body = event, secret = 'test-secret') => new Request('https://function.test', { method: 'POST', headers: { 'x-webhook-secret': secret }, body: JSON.stringify(body) });
function fixture(options = {}) {
  const calls = [], saves = [];
  const payload = { from: 'Team <hello@example.com>', to: ['contact@example.com'], subject: 'Welcome aboard!', text: 'Hello from the stored payload' };
  const config = { WEBHOOK_SECRET: 'test-secret', RESEND_API_KEY: 'test-key', EMAIL_FROM: 'Team <hello@example.com>', SUPABASE_URL: 'https://project.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'server-only', ...options.env };
  const handler = createHandler({ env: name => config[name], fetcher: async (url, init) => {
    calls.push({ url, ...init });
    if (url.endsWith('/rpc/claim_contact_email')) return options.claimError ? new Response('', { status: 500 }) : Response.json(options.empty ? [] : [{ id, email_payload: payload }]);
    if (url.includes('/contacts?')) { saves.push(JSON.parse(init.body)); return options.saveError ? new Response('', { status: 500 }) : Response.json(options.lostClaim ? [] : [{ id }]); }
    if (url === 'https://api.resend.com/emails') {
      if (options.networkError) throw new Error('private network details');
      return Response.json(options.providerBody || { id: 'email-123' }, { status: options.providerStatus || 200 });
    }
    throw new Error('Unexpected request');
  }});
  return { handler, calls, saves, payload };
}

test('rejects invalid methods, secrets, JSON, and events without outbound requests', async () => {
  const { handler, calls } = fixture();
  assert.equal((await handler(new Request('https://function.test'))).status, 405);
  assert.equal((await handler(request(event, 'wrong'))).status, 401);
  assert.equal((await handler(new Request('https://function.test', { method: 'POST', headers: { 'x-webhook-secret': 'test-secret' }, body: '{' }))).status, 400);
  for (const invalid of [null, {}, { ...event, type: 'DELETE' }, { ...event, table: 'other' }, { ...event, record: { id: 'bad' } }]) assert.equal((await handler(request(invalid))).status, 400);
  assert.equal(calls.length, 0);
});
test('requires server configuration', async () => {
  const { handler, calls } = fixture({ env: { RESEND_API_KEY: '' } });
  assert.equal((await handler(request())).status, 503); assert.equal(calls.length, 0);
});
test('claims atomically, sends frozen database payload, and persists accepted status', async () => {
  const { handler, calls, saves, payload } = fixture();
  const result = await handler(request({ ...event, record: { id, email: 'attacker@example.com' } }));
  assert.equal(result.status, 200); assert.deepEqual(await result.json(), { accepted: true, email_id: 'email-123' });
  const send = calls.find(call => call.url === 'https://api.resend.com/emails');
  assert.deepEqual(JSON.parse(send.body), payload);
  assert.equal(send.headers['Idempotency-Key'], 'welcome-contact-' + id);
  assert.equal(saves[0].status, 'accepted'); assert.equal(saves[0].email_id, 'email-123');
  assert.ok(calls[2].url.includes('claim_token=eq.')); assert.ok(saves[0].duration_ms >= 0);
});
test('duplicates skip provider calls', async () => {
  const { handler, calls } = fixture({ empty: true });
  assert.equal((await (await handler(request())).json()).skipped, true); assert.equal(calls.length, 1);
});
test('UPDATE retry events use the same sender path', async () => {
  const { handler } = fixture(); assert.equal((await handler(request({ ...event, type: 'UPDATE' }))).status, 200);
});
test('provider rejection and network failures persist safe failure status', async () => {
  for (const options of [{ providerStatus: 429 }, { networkError: true }, { providerBody: {} }]) {
    const { handler, saves } = fixture(options);
    assert.equal((await handler(request())).status, 502); assert.equal(saves[0].status, 'failed');
    assert.ok(!saves[0].last_error.includes('private network details'));
  }
});
test('database failure cannot be reported as accepted', async () => {
  for (const options of [{ claimError: true }, { saveError: true }, { lostClaim: true }]) {
    const { handler } = fixture(options); assert.equal((await handler(request())).status, 503);
  }
});
