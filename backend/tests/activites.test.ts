import request from 'supertest';
import app from '../src/app';

describe('ACTIVITES', () => {
  let tokenAdmin:    string;
  let tokenBlogueur: string;
  let activiteId:    number;

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

  it('should reject activite creation without auth', async () => {
    const res = await request(app).post('/api/activites').send({});
    expect(res.status).toBe(401);
  });

  it('should reject activite creation by blogueur', async () => {
    const res = await request(app)
      .post('/api/activites')
      .set('Authorization', `Bearer ${tokenBlogueur}`)
      .send({ ville_id: 1, titre: 'Test', type: 'atelier', date_debut: '2025-08-01T09:00:00' });
    expect(res.status).toBe(403);
  });

  it('should create activite as admin', async () => {
    const res = await request(app)
      .post('/api/activites')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ville_id: 1, titre: 'Atelier Jest Test', type: 'atelier', date_debut: '2025-08-01T09:00:00' });
    expect(res.status).toBe(201);
    activiteId = res.body.data.id;
  });

  it('should list activites', async () => {
    const res = await request(app)
      .get('/api/activites')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get activite by id', async () => {
    const res = await request(app)
      .get(`/api/activites/${activiteId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });

  it('should allow blogueur to view activite', async () => {
    const res = await request(app)
      .get(`/api/activites/${activiteId}`)
      .set('Authorization', `Bearer ${tokenBlogueur}`);
    expect(res.status).toBe(200);
  });

  it('should allow blogueur to participate', async () => {
    const resBlogueur = await request(app)
      .post('/api/auth/login')
      .send({ email: 'kouassi@jb.ci', mot_de_passe: 'Password123' });
    const userId = resBlogueur.body.data.utilisateur.id;
    const res = await request(app)
      .post(`/api/activites/${activiteId}/participants`)
      .set('Authorization', `Bearer ${tokenBlogueur}`)
      .send({ utilisateur_id: userId });
    expect([200, 201]).toContain(res.status);
  });

  it('should update activite statut', async () => {
    const res = await request(app)
      .patch(`/api/activites/${activiteId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'terminee', rapport: 'Rapport Jest' });
    expect(res.status).toBe(200);
  });
});
