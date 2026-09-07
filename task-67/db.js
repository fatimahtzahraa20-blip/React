const { createClient } = require('@supabase/supabase-js');

function createDatabase() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
module.exports = { createDatabase };

