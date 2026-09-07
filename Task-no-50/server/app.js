import express from 'express';

export function createApp(supabase, adminIds = []) {
  const app = express();
  app.disable('x-powered-by');
  app.get(['/admin/users', '/api/admin/users'], async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!supabase) return res.status(503).json({ error: 'Configure the server Supabase environment variables first.' });
    const token = req.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return res.status(401).json({ error: 'Sign in to continue.' });
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) return res.status(401).json({ error: 'Your session is invalid or expired. Sign in again.' });
      if (!adminIds.includes(data.user.id)) return res.status(403).json({ error: 'This account does not have administrator access.' });
      const users = [];
      const perPage = 1000;
      for (let page = 1; ; page++) {
        const { data: result, error: listError } = await supabase.auth.admin.listUsers({ page, perPage });
        if (listError) throw listError;
        users.push(...result.users.map(user => ({
          id: user.id, email: user.email ?? '', phone: user.phone ?? '',
          created_at: user.created_at, last_sign_in_at: user.last_sign_in_at ?? null,
          email_confirmed_at: user.email_confirmed_at ?? null,
        })));
        if (result.users.length < perPage) break;
      }
      return res.json({ users, total: users.length });
    } catch {
      return res.status(502).json({ error: 'Unable to retrieve users from Supabase. Please try again.' });
    }
  });
  return app;
}
