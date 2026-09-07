require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createDatabase } = require('./db');
const { createDocumentStore } = require('./models/EditableDoc');
const { resolveTenant } = require('./middleware/tenant');
const { createDocumentsRouter } = require('./routes/documents');

function createApp(store) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '1mb' }));
  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use('/documents', resolveTenant, createDocumentsRouter(store));
  app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'INVALID_JSON' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'PAYLOAD_TOO_LARGE' });
    console.error('[task-77]', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Database request failed.' });
  });
  return app;
}
if (require.main === module) {
  try {
    const db = createDatabase();
    const port = process.env.PORT || 4077;
    createApp(createDocumentStore(db)).listen(port, '127.0.0.1', () => {
      console.log('[task-77] listening on http://localhost:' + port);
    });
  } catch (err) {
    console.error('[task-77]', err.message);
    process.exitCode = 1;
  }
}
module.exports = { createApp };

