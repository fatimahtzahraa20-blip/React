import express from 'express';
import { setTimeout as delay } from 'node:timers/promises';
function databaseMessage(error) {
  if (['PGRST205', '42P01'].includes(error.code)) return 'Supabase table public.task80_items is missing. Run the entire supabase/schema.sql in the project configured in .env.';
  if (error.code === '42501') return 'Supabase access denied. Check the server secret key and run the grants in supabase/schema.sql.';
  return 'Supabase request failed. Check the API terminal, project URL, server key, and database connection.';
}
export function createApp(supabase) {
  const app = express();
  let requestCount = 0;
  app.use(express.json({ limit: '16kb' }));
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/items', async (req, res) => {
    const q = req.query.q ?? '';
    const delayMs = Number(req.query.delayMs ?? 800);
    if (typeof q !== 'string' || q.length > 120 || !Number.isFinite(delayMs) || delayMs < 0 || delayMs > 3000) {
      return res.status(400).json({ message: 'Use a search up to 120 characters and delayMs between 0 and 3000.' });
    }
    const hit = ++requestCount;
    const controller = new AbortController();
    const onClose = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', onClose);
    try {
      await delay(delayMs, undefined, { signal: controller.signal });
      let query = supabase.from('task80_items').select('id,name,sku,created_at').order('created_at').order('id');
      if (q) query = query.ilike('name', '%' + q.replace(/[\\%_]/g, '\\$&') + '%');
      const { data, error } = await query.limit(100).abortSignal(controller.signal);
      if (controller.signal.aborted) return;
      if (error) throw error;
      res.json({ items: data, requestCount: hit, query: q });
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error('Supabase read failed:', error.message);
        res.status(502).json({ message: databaseMessage(error) });
      }
    } finally { res.off('close', onClose); }
  });
  app.post('/api/items', async (req, res) => {
    const { name, sku } = req.body ?? {};
    if (typeof name !== 'string' || typeof sku !== 'string' || !name.trim() || !sku.trim() || name.trim().length > 120 || sku.trim().length > 80) {
      return res.status(400).json({ message: 'Name (1-120 characters) and SKU (1-80 characters) are required.' });
    }
    const { data, error } = await supabase.from('task80_items').insert({ name: name.trim(), sku: sku.trim() }).select('id,name,sku,created_at').single();
    if (error) return res.status(error.code === '23505' ? 409 : 502).json({ message: error.code === '23505' ? 'SKU already exists.' : databaseMessage(error) });
    res.status(201).json(data);
  });
  app.get('/api/request-count', (_req, res) => res.json({ requestCount }));
  app.post('/api/reset-count', (_req, res) => { requestCount = 0; res.json({ requestCount }); });
  app.use((error, _req, res, _next) => {
    res.status(error.status === 400 ? 400 : 500).json({ message: error.status === 400 ? 'Invalid JSON body.' : 'Unexpected server error.' });
  });
  return app;
}


