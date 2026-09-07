import { createClient } from '@supabase/supabase-js';
import { createApp } from './app.js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET = 'avatars', PORT = '3000' } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.');
}
const port = Number(PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
createApp({ supabase, bucket: SUPABASE_STORAGE_BUCKET }).listen(port, () => {
  console.log(`Profile picture API listening on http://localhost:${port}`);
});
