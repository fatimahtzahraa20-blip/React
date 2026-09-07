import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createAuthMiddleware } from './authMiddleware.js';
const secret = 'test-only-secret-with-sufficient-length';
const sign = (options = {}, key = secret) => jwt.sign({}, key, { subject: 'user_64', issuer: 'task-64', audience: 'task-64-api', expiresIn: '1h', ...options });
function run(header) {
  const req = { get: () => header }; const result = { next: false };
  const res = { status(code) { result.status = code; return this; }, json(body) { result.body = body; return this; } };
  createAuthMiddleware(secret)(req, res, () => { result.next = true; });
  return { ...result, user: req.user };
}
test('valid bearer token attaches verified user', () => { const result = run(`Bearer ${sign()}`); assert.equal(result.next, true); assert.equal(result.user.sub, 'user_64'); });
test('case insensitive bearer scheme', () => assert.equal(run(`bearer ${sign()}`).next, true));
for (const [name, header] of [['missing', undefined], ['wrong scheme', 'Basic abc'], ['malformed', 'Bearer abc extra'], ['invalid signature', `Bearer ${sign({}, 'different-secret')}`], ['expired', `Bearer ${sign({ expiresIn: -1 })}`], ['wrong audience', `Bearer ${sign({ audience: 'other' })}`], ['wrong algorithm', `Bearer ${sign({ algorithm: 'HS384' })}`], ['not active', `Bearer ${sign({ notBefore: '1h' })}`]]) {
  test(`rejects ${name}`, () => { const result = run(header); assert.equal(result.status, 401); assert.equal(result.next, false); assert.equal(result.user, undefined); });
}
test('requires server secret', () => assert.throws(() => createAuthMiddleware('')));
