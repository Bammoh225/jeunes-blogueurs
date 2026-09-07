import request from 'supertest';
import app from '../src/app';

describe('STATS', () => {
  let tokenAdmin: string;
  let tokenBlogueur: string;

  beforeAll(async () => {
    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@jb.ci',
        mot_de_passe: 'Admin123',
      });

    expect(resAdmin.status).toBe(200);
    tokenAdmin = resAdmin.body.data.token;

    const resBlogueur = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'kouassi@jb.ci',
        mot_de_passe: 'Password123',
      });

    expect(resBlogueur.status).toBe(200);
    tokenBlogueur = resBlogueur.body.data.token;
  });

  it('should reject stats without authentication', async () => {
    const res = await request(app)
      .get('/api/stats/charts');

    expect(res.status).toBe(401);
  });

  it('should reject stats for jeune_blogueur role', async () => {
    const res = await request(app)
      .get('/api/stats/charts')
      .set('Authorization', `Bearer ${tokenBlogueur}`);

    expect(res.status).toBe(403);
  });

  it('should return dashboard charts for staff', async () => {
    const res = await request(app)
      .get('/api/stats/charts')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('publicationsParMois');
    expect(res.body.data).toHaveProperty('blogueursParVille');
    expect(Array.isArray(res.body.data.publicationsParMois)).toBe(true);
    expect(Array.isArray(res.body.data.blogueursParVille)).toBe(true);
  });
});
