import request from 'supertest';
import app from '../src/app';

describe('AUTH - Login & Profil', () => {
  let token: string;

  it('should login user and return token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@jb.ci', mot_de_passe: 'Admin123' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    token = res.body.data.token;
  });

  it('should access profil with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profil')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('should reject access without token', async () => {
    const res = await request(app).get('/api/auth/profil');
    expect(res.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profil')
      .set('Authorization', 'Bearer fake_token');
    expect(res.status).toBe(401);
  });
});
