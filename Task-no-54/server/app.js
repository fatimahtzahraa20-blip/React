import express from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { createAuthMiddleware } from './authMiddleware.js';
export function createApp({ production = false, secret } = {}) {
  if (production && !secret) throw new Error('Set JWT_SECRET in production');
  secret ||= randomBytes(32).toString('hex');
  const app = express();
  app.use(express.json({ limit: '16kb' }));
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', (_req, res) => res.json({ status: 'online', demoEnabled: !production, algorithm: 'HS256', issuer: 'task-64', audience: 'task-64-api' }));
  if (!production) app.post('/api/demo-token', (req, res) => {
    const { scenario = 'valid', name = 'Alex Morgan', role = 'developer', expiresIn = 3600 } = req.body || {};
    if (!['valid', 'expired', 'future', 'signature', 'audience'].includes(scenario) || typeof name !== 'string' || !name.trim() || name.length > 80 || !['developer', 'admin'].includes(role) || !Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > 86400) return res.status(400).json({ error: 'Use a name, developer/admin role, and lifetime of 1–86400 seconds.' });
    const options = { algorithm: 'HS256', subject: 'user_64', issuer: 'task-64', audience: scenario === 'audience' ? 'other-api' : 'task-64-api', expiresIn: scenario === 'expired' ? -60 : expiresIn };
    if (scenario === 'future') options.notBefore = 3600;
    res.json({ token: jwt.sign({ name: name.trim(), role }, scenario === 'signature' ? randomBytes(32) : secret, options) });
  });
  const authMiddleware = createAuthMiddleware(secret);
  app.get('/api/protected', authMiddleware, (req, res) => res.json({ message: 'Access granted. Your token is verified.', user: req.user }));
  app.get('/api/admin', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Administrator role required. Authentication succeeded, but access is denied.' });
    res.json({ message: 'Administrator access granted.', user: req.user });
  });
  app.post('/api/echo', authMiddleware, (req, res) => res.json({ message: 'Authenticated request received.', user: req.user, data: req.body ?? null }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));
  app.use(express.static('dist'));
  app.use((error, _req, res, _next) => res.status(error.status || 500).json({ error: error.type === 'entity.parse.failed' ? 'Invalid JSON body' : error.status === 413 ? 'Request body is too large' : 'Server error' }));
  return app;
}
