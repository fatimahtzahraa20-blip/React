const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function sameSecret(a, b) {
  const hash = async value => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  const [left, right] = await Promise.all([hash(a), hash(b)]);
  return left.reduce((diff, byte, index) => diff | (byte ^ right[index]), 0) === 0;
}
export function createHandler({ env, fetcher = fetch, now = () => Date.now() }) {
  return async request => {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    const secret = env('WEBHOOK_SECRET');
    if (!secret || !await sameSecret(request.headers.get('x-webhook-secret') || '', secret)) return json({ error: 'Unauthorized' }, 401);
    let event;
    try { event = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
    if (!['INSERT', 'UPDATE'].includes(event?.type) || event?.schema !== 'public' || event?.table !== 'contacts' || !uuid.test(event?.record?.id || '')) return json({ error: 'Invalid contact event' }, 400);
    const url = env('SUPABASE_URL');
    const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = env('RESEND_API_KEY');
    const sender = env('EMAIL_FROM');
    if (!url || !serviceKey || !apiKey || !sender) return json({ error: 'Server secrets are incomplete. Check Edge Function configuration.' }, 503);
    const token = crypto.randomUUID();
    const started = now();
    const database = async (path, method, body) => {
      const response = await fetcher(`${url}/rest/v1/${path}`, {
        method,
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error('Database operation failed');
      return response.json();
    };
    let record;
    try {
      [record] = await database('rpc/claim_contact_email', 'POST', { contact_id: event.record.id, token, sender });
    } catch { return json({ error: 'Could not claim email job' }, 503); }
    if (!record) return json({ skipped: true, reason: 'Already processed, in progress, missing, or retry window expired' });
    const finish = async fields => {
      const saved = await database(`contacts?id=eq.${record.id}&claim_token=eq.${token}&status=eq.processing`, 'PATCH', { ...fields, updated_at: new Date(now()).toISOString(), duration_ms: Math.max(0, now() - started) });
      if (!saved.length) throw new Error('Email claim changed before status was saved');
    };
    let providerId;
    try {
      // Use the authoritative, frozen database payload, not untrusted webhook fields.
      const response = await fetcher('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `welcome-contact-${record.id}` },
        body: JSON.stringify(record.email_payload), signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`Email provider rejected the request (HTTP ${response.status}). Check Resend configuration and limits.`);
      const data = await response.json();
      if (typeof data.id !== 'string' || !data.id) throw new Error('Email provider returned an invalid response. Check provider history before retrying.');
      providerId = data.id;
    } catch (error) {
      const message = error.message?.startsWith('Email provider') ? error.message : 'Email provider connection failed or timed out. Retry within the safe retry window.';
      try { await finish({ status: 'failed', last_error: message }); }
      catch { return json({ error: 'Email attempt failed and its status could not be saved. Check provider history before retrying.' }, 503); }
      return json({ error: message }, 502);
    }
    try {
      await finish({ status: 'accepted', email_id: providerId, accepted_at: new Date(now()).toISOString(), last_error: null });
    } catch {
      return json({ error: 'Provider accepted email but status could not be saved. A retry within 23 hours uses the same idempotency key.' }, 503);
    }
    return json({ accepted: true, email_id: providerId });
  };
}
