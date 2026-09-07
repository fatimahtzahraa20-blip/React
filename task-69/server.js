require('dotenv').config();
const express = require('express');
const { createDatabaseClient, connectDB } = require('./db');
const { resolveTenant } = require('./middleware/tenant');
const { itemsRouter } = require('./routes/items');
function createApp(client) {
  const app = express();
  app.use(express.json({ limit: '16kb' }));
  app.get('/health', async (req, res) => { await connectDB(client); res.json({ ok: true, database: 'supabase' }); });
  app.use('/items', resolveTenant, itemsRouter(client));
  app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
  app.use((err, req, res, next) => {
    if (err.code === '22P02') {
      return res.status(400).json({ error: 'INVALID_IDENTIFIER', message: 'This database requires a UUID tenant identifier.' });
    }
    if (err.code === '23503') {
      return res.status(409).json({ error: 'TENANT_NOT_FOUND', message: 'The tenant must exist in the tenants table before creating items.' });
    }
    const schemaMissing = ['42703', '42P01', 'PGRST202', 'PGRST204', 'PGRST205'].includes(err.code);
    const status = schemaMissing ? 503 : err.status || 500;
    if (status >= 500) console.error('[task-79]', err.message);
    res.status(status).json({ error: schemaMissing ? 'DATABASE_SETUP_REQUIRED' : status >= 500 ? 'DATABASE_ERROR' : err.code || 'BAD_REQUEST',
      message: schemaMissing ? 'Supabase schema is incomplete. Run supabase/migrations/202609070002_repair_existing_items.sql in the Supabase SQL Editor, then restart the server.' : status >= 500 ? 'Database request failed. Check the server logs.' : err.message });
  });
  return app;
}
if (require.main === module) {
  (async () => {
    const client = createDatabaseClient();
    await connectDB(client);
    const port = process.env.PORT || 4079;
    createApp(client).listen(port, '127.0.0.1', () => console.log('[task-79] listening on localhost:' + port));
  })().catch((err) => { console.error(err.message); process.exitCode = 1; });
}
module.exports = { createApp };
