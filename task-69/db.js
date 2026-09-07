const { createClient } = require('@supabase/supabase-js');
function createDatabaseClient() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
async function connectDB(client) {
  const { error } = await client.from('items').select('id,tenant_id,name,sku,created_at,updated_at,deleted_at,deleted_by').limit(0);
  if (error) {
    const failure = new Error('Supabase schema check failed. Run supabase/migrations/202609070002_repair_existing_items.sql in the Supabase SQL Editor. ' + error.message);
    failure.code = error.code;
    throw failure;
  }
}
module.exports = { createDatabaseClient, connectDB };
