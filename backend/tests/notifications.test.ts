import request from 'supertest';
import app from '../src/app';

describe('NOTIFICATIONS', () => {
  let tokenAdmin:     string;
  let tokenBlogueur:  string;
  let notificationId: number;

  beforeAll(async () => {
    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@jb.ci', mot_de_passe: 'Admin123' });
    tokenAdmin = resAdmin.body.data.token;

    const resBlogueur = await request(app)
      .post('/api/auth/login')
      .send({ email: 'kouassi@jb.ci', mot_de_passe: 'Password123' });
    tokenBlogueur = resBlogueur.body.data.token;
  });

  it('should reject notifications without auth', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('should list notifications for admin', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should list notifications for blogueur', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenBlogueur}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      notificationId = res.body.data[0].id;
    }
  });

  it('should get non lus count', async () => {
    const res = await request(app)
      .get('/api/notifications/non-lus')
      .set('Authorization', `Bearer ${tokenBlogueur}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
  });

  it('should mark notification as read', async () => {
    if (!notificationId) return;
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/lu`)
      .set('Authorization', `Bearer ${tokenBlogueur}`);
    expect(res.status).toBe(200);
  });

  it('should mark all notifications as read', async () => {
    const res = await request(app)
      .patch('/api/notifications/tous-lus')
      .set('Authorization', `Bearer ${tokenBlogueur}`);
    expect(res.status).toBe(200);
  });
});
