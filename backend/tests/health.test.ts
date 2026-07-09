import request from 'supertest';
import app from '../src/app';

describe('API Health Check', () => {
  it('should return API OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
