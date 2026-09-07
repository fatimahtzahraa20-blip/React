const { createClient } = require('@supabase/supabase-js');
function createUserClient(token) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required');
  if (!key.startsWith('sb_publishable_')) {
    let role;
    try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role; } catch {}
    if (role !== 'anon') throw new Error('Use a publishable or legacy anon key, never a secret/service role key');
  }
  return createClient(url, key, {
    global: { headers: { Authorization: 'Bearer ' + token } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
module.exports = { createUserClient };
