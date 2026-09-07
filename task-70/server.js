import { createClient } from '@supabase/supabase-js';
import { createApp } from './server/app.js';
const { SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const key = SUPABASE_SECRET_KEY || SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env; see README.md.');
const supabase = createClient(SUPABASE_URL, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const port = Number(process.env.PORT || 4080);
createApp(supabase).listen(port, '127.0.0.1', () => {
  console.log('[task-80] API listening at http://127.0.0.1:' + port);
});

