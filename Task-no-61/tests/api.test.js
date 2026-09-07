import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../server/app.js';

describe('GET /api/health', () => {
  it('returns a healthy API status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'task-71-api'
    });
  });
});
