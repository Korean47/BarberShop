import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('HTTP security baseline', () => {
  const app = createApp();

  it('exposes a liveness check without sensitive details', async () => {
    const response = await request(app).get('/api/health/live').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('returns a correlation id and hides route internals', async () => {
    const response = await request(app).get('/api/does-not-exist').expect(404);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(response.headers['x-correlation-id']).toBeTruthy();
  });
});
