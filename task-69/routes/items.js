const express = require('express');
const { ItemRepository } = require('../models/Item');
function itemsRouter(client) {
  const router = express.Router();
  router.use((req, res, next) => { req.items = new ItemRepository(client, req.tenantId); next(); });
  const list = (scope) => async (req, res) => {
    const limit = Number(req.query.limit ?? 100), offset = Number(req.query.offset ?? 0);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0) return res.status(400).json({ error: 'INVALID_PAGINATION' });
    const repo = scope === 'trash' ? req.items.onlyDeleted() : scope === 'all' ? req.items.withDeleted() : req.items;
    res.json(await repo.list(offset, limit));
  };
  router.get('/', list('live'));
  router.get('/trash', list('trash'));
  router.get('/all', list('all'));
  router.post('/', async (req, res) => {
    const { name, sku } = req.body || {};
    if (typeof name !== 'string' || typeof sku !== 'string' || !name.trim() || !sku.trim() || name.trim().length > 200 || sku.trim().length > 100)
      return res.status(400).json({ error: 'INVALID_ITEM', message: 'Name (1-200) and SKU (1-100 characters) are required.' });
    res.status(201).json(await req.items.create({ name: name.trim(), sku: sku.trim() }));
  });
  router.param('id', (req, res, next, id) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return res.status(400).json({ error: 'INVALID_ID' });
    next();
  });
  router.delete('/:id', async (req, res) => {
    const item = await req.items.softDelete(req.params.id, req.actor);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND_OR_ALREADY_DELETED' });
    res.json(item);
  });
  router.post('/:id/restore', async (req, res) => {
    const item = await req.items.restore(req.params.id);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND_OR_NOT_DELETED' });
    res.json(item);
  });
  return router;
}
module.exports = { itemsRouter };
