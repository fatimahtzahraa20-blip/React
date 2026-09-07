const express = require('express');
const cors = require('cors');
const { resolveTenant } = require('./middleware/tenant');
const { createPaymentsRouter } = require('./routes/payments');
function createApp(getClient) {
  const app = express();
  app.use(cors({ exposedHeaders: ['Idempotency-Replayed', 'Retry-After'] }));
  app.use(express.json({ limit: '16kb' }));
  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use(resolveTenant);
  app.use('/payments', createPaymentsRouter(getClient));
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'INVALID_JSON' });
    if (err.status === 413) return res.status(413).json({ error: 'BODY_TOO_LARGE' });
    console.error('[payments]', err.message);
    res.set('Retry-After', '1').status(503).json({ error: 'RETRY_SAME_KEY' });
  });
  return app;
}
module.exports = createApp();
module.exports.createApp = createApp;
