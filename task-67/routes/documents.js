const express = require('express');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validate(input, patch) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Expected a JSON object.';
  const allowed = patch ? ['version', 'title', 'body', 'editedBy'] : ['title', 'body', 'editedBy'];
  if (Object.keys(input).some(key => !allowed.includes(key))) return 'Unknown field.';
  if ((!patch || input.title !== undefined) &&
      (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 200)) {
    return 'Title must contain 1 to 200 characters.';
  }
  for (const [key, limit] of [['body', 100000], ['editedBy', 100]]) {
    if (input[key] !== undefined && (typeof input[key] !== 'string' || input[key].length > limit)) {
      return key + ' must be a string of at most ' + limit + ' characters.';
    }
  }
  if (patch && !['title', 'body', 'editedBy'].some(key => input[key] !== undefined)) return 'Provide at least one change.';
}

function createDocumentsRouter(store) {
  const router = express.Router();
  router.param('id', (req, res, next, id) => {
    if (!uuid.test(id)) return res.status(400).json({ error: 'INVALID_ID' });
    next();
  });
  router.get('/:id', async (req, res) => {
    const doc = await store.get(req.tenantId, req.params.id);
    if (!doc) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json(doc);
  });
  router.post('/', async (req, res) => {
    const message = validate(req.body, false);
    if (message) return res.status(400).json({ error: 'INVALID_INPUT', message });
    res.status(201).json(await store.create(req.tenantId, req.body));
  });
  router.patch('/:id', async (req, res) => {
    const version = req.body?.version;
    if (!Number.isInteger(version) || version < 1 || version >= 2147483647) {
      return res.status(400).json({ error: 'VERSION_REQUIRED', message: 'Include a positive integer version below 2147483647.' });
    }
    const message = validate(req.body, true);
    if (message) return res.status(400).json({ error: 'INVALID_INPUT', message });
    const result = await store.update(req.tenantId, req.params.id, req.body);
    if (result.status === 'not_found') return res.status(404).json({ error: 'NOT_FOUND' });
    if (result.status === 'conflict') {
      return res.status(409).json({
        error: 'CONFLICT', message: 'This document changed since you loaded it.',
        yourVersion: version, current: result.current,
      });
    }
    res.json(result.current);
  });
  return router;
}
module.exports = { createDocumentsRouter };

