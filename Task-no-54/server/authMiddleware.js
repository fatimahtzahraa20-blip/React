import jwt from 'jsonwebtoken';

export function createAuthMiddleware(secret) {
  if (!secret) throw new Error('JWT_SECRET is required');
  return function authMiddleware(req, res, next) {
    const match = /^Bearer +([^\s]+)$/i.exec(req.get('Authorization') || '');
    if (!match) return res.status(401).json({ error: 'Provide Authorization: Bearer <token>' });
    try {
      const payload = jwt.verify(match[1], secret, { algorithms: ['HS256'], issuer: 'task-64', audience: 'task-64-api' });
      if (typeof payload !== 'object' || !payload.sub || !Number.isFinite(payload.exp)) {
        return res.status(401).json({ error: 'Token must include a subject and expiration' });
      }
      req.user = payload;
    } catch (error) {
      return res.status(401).json({ error: error.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token' });
    }
    next();
  };
}
