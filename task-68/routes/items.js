const router = require('express').Router();
const Item = require('../models/Item');
const { UUID } = require('../middleware/tenant');
function validateItem(req, res, next) {
  const body = req.body;
  if (!body || Array.isArray(body) || Object.keys(body).some(key => !['name', 'sku'].includes(key)) ||
      typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 200 ||
      typeof body.sku !== 'string' || !body.sku.trim() || body.sku.trim().length > 100) {
    return res.status(400).json({ error: 'INVALID_ITEM', message: 'Supply only name (1-200 characters) and sku (1-100 characters).' });
  }
  req.body = { name: body.name.trim(), sku: body.sku.trim() };
  next();
}
router.param('id', (req, res, next, id) => UUID.test(id) ? next() : res.status(400).json({ error: 'INVALID_ITEM_ID' }));
router.get('/', async (req, res) => res.json(await Item.list()));
router.post('/', validateItem, async (req, res) => res.status(201).json(await Item.create(req.body)));
router.put('/:id', validateItem, async (req, res) => {
  const item = await Item.update(req.params.id, req.body);
  return item ? res.json(item) : res.status(404).json({ error: 'NOT_FOUND' });
});
router.delete('/:id', async (req, res) => {
  const item = await Item.remove(req.params.id);
  return item ? res.json({ ok: true }) : res.status(404).json({ error: 'NOT_FOUND' });
});
module.exports = router;
