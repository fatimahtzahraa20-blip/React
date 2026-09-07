import { SafepayError } from './safepay.js';
import express from 'express';
export function createApp({ supabase, createPayment, unitAmount, currency = 'PKR', configurationError }) {
  const app = express();
  app.use(express.json({ limit: '8kb' }));
  app.get('/health', (_req, res) => res.json({ status: configurationError ? 'configuration_required' : 'ready' }));
  app.post('/create-payment', async (req, res) => {
    if (configurationError) return res.status(503).json({ error: configurationError });
    const token = req.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return res.status(401).json({ error: 'Sign in before checking out.' });
    const quantity = req.body?.quantity ?? 1;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Quantity must be an integer from 1 to 10.' });
    }
    const requestId = req.headers['idempotency-key'];
    if (typeof requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId)) {
      return res.status(400).json({ error: 'A valid Idempotency-Key header is required.' });
    }
    try {
      const { data, error: authError } = await supabase.auth.getUser(token);
      if (authError || !data?.user) return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
      const user = data.user;
      const orderId = `${user.id}:${requestId}`;
      const table = () => supabase.from('safepay_checkout_sessions');
      // Reserve the order before calling Safepay: a unique key prevents concurrent creations.
      const { error: insertError } = await table().insert({
        order_id: orderId, user_id: user.id, quantity, amount: unitAmount * quantity, currency,
      });
      if (insertError) {
        if (insertError.code !== '23505') {
          return res.status(503).json({ error: 'Cannot save checkout. Run supabase/safepay.sql and check SUPABASE_SERVICE_ROLE_KEY.' });
        }
        const { data: previous, error } = await table().select('*').eq('order_id', orderId).single();
        if (error) return res.status(503).json({ error: 'Cannot retrieve your checkout. Please retry.' });
        if (previous.quantity !== quantity) return res.status(409).json({ error: 'Checkout quantity changed. Refresh the page and try again.' });
        if (previous.checkout_url) return res.status(200).json({ id: previous.payment_token, url: previous.checkout_url });
        return res.status(409).json({ error: 'This checkout attempt is pending or failed. Wait briefly and retry, or refresh to start a new checkout.' });
      }
      let payment;
      try {
        payment = await createPayment({ amount: unitAmount * quantity, currency, orderId });
      } catch (error) {
        return res.status(502).json({ error: error instanceof SafepayError ? error.message : error.name === 'TimeoutError'
          ? 'Safepay timed out. Refresh the page before starting another checkout.'
          : 'Safepay could not create checkout. Check your sandbox credentials and network, then refresh to retry.' });
      }
      const { error: saveError } = await table().update({
        payment_token: payment.id, checkout_url: payment.url,
      }).eq('order_id', orderId);
      if (saveError) return res.status(503).json({ error: 'Could not save the Safepay checkout link. Check your Supabase setup before retrying.' });
      return res.status(201).json(payment);
    } catch {
      return res.status(502).json({ error: 'Payment service unavailable. Check your Supabase connection and retry.' });
    }
  });
  app.use((error, _req, res, _next) => {
    res.status(error.type === 'entity.parse.failed' ? 400 : error.status === 413 ? 413 : 500).json({ error: 'Invalid request.' });
  });
  return app;
}
