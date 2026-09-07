require('dotenv').config();
const express = require('express');
const { createUserClient } = require('./db');
const { makeResolveTenant } = require('./middleware/tenant');
function createApp(clientFactory = createUserClient) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use('/items', makeResolveTenant(clientFactory), require('./routes/items'));
  app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
  app.use((err, req, res, next) => {
    if (err.code === '23505') return res.status(409).json({ error: 'SKU_ALREADY_EXISTS' });
    if (err.code === '42501') return res.status(403).json({ error: 'ACCESS_DENIED' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'INVALID_JSON' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'BODY_TOO_LARGE' });
    console.error('Request failed:', err.code || err.name || 'DATABASE_ERROR');
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  });
  return app;
}
if (require.main === module) {
  createUserClient('startup-config-check');
  createApp().listen(process.env.PORT || 4058, () => console.log('[task-78] API listening'));
}
module.exports = { createApp };
