const { createClient } = require('@supabase/supabase-js');
let client;
function getDB() {
  if (!client) {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env; see README.');
    }
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
async function connectDB() {
  const db = getDB();
  const { error } = await db.from('payment_orders').select('id').limit(0);
  if (error) throw new Error('Supabase startup check failed. Apply the SQL migration and check credentials: ' + error.message);
  return db;
}
module.exports = { getDB, connectDB };
