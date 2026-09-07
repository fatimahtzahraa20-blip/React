const express = require('express');
const { getDB } = require('../db');

function createPaymentsRouter(getClient = getDB) {
  const router = express.Router();
  router.post('/', async (req, res, next) => {
    const key = req.get('Idempotency-Key');
    if (!key || !/^[\x21-\x7e]{1,200}$/.test(key)) return res.status(400).json({ error: 'INVALID_IDEMPOTENCY_KEY' });
    const body = req.body;
    if (!body || Array.isArray(body) || typeof body !== 'object') return res.status(400).json({ error: 'INVALID_BODY' });
    const { accountId, amountCents, currency = 'USD' } = body;
    if (typeof accountId !== 'string' || !accountId.trim() || accountId.length > 200 ||
        !Number.isSafeInteger(amountCents) || amountCents <= 0 || currency !== 'USD' ||
        Object.keys(body).some(k => !['accountId', 'amountCents', 'currency'].includes(k))) {
      return res.status(400).json({ error: 'INVALID_BODY', message: 'Provide accountId, positive integer amountCents, and USD currency.' });
    }
    try {
      // One RPC is one database transaction, including the saved replay response.
      const { data, error } = await getClient().rpc('create_payment', {
        p_tenant_id: req.tenantId, p_key: key, p_account_id: accountId,
        p_amount_cents: amountCents, p_currency: currency,
      });
      if (error) {
        if (error.code === 'P0001' && error.message === 'BALANCE_LIMIT_EXCEEDED') {
          return res.status(422).json({ error: error.message });
        }
        throw error;
      }
      if (!data || !Number.isInteger(data.status_code) || !data.body) throw new Error('Invalid payment RPC response');
      return res.set('Idempotency-Replayed', String(data.replayed)).status(data.status_code).json(data.body);
    } catch (err) {
      // A lost response may follow a successful commit. Always retry the same key.
      next(err);
    }
  });
  return router;
}
module.exports = { createPaymentsRouter };
