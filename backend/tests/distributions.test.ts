import request from 'supertest';
import app from '../src/app';

describe('DISTRIBUTIONS', () => {
  let tokenAdmin:     string;
  let tokenBlogueur:  string;
  let distributionId: number;
  let blogueurUserId: number;

  beforeAll(async () => {
    const resAdmin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@jb.ci', mot_de_passe: 'Admin123' });
    tokenAdmin = resAdmin.body.data.token;

    const resBlogueur = await request(app)
      .post('/api/auth/login')
      .send({ email: 'kouassi@jb.ci', mot_de_passe: 'Password123' });
    tokenBlogueur  = resBlogueur.body.data.token;
    blogueurUserId = resBlogueur.body.data.utilisateur.id;
  });

  it('should reject distribution creation without auth', async () => {
    const res = await request(app).post('/api/distributions').send({});
    expect(res.status).toBe(401);
  });

  it('should reject distribution creation by blogueur', async () => {
    const res = await request(app)
      .post('/api/distributions')
      .set('Authorization', `Bearer ${tokenBlogueur}`)
      .send({ type: 'perdiem', libelle: 'Test', date_distribution: '2025-07-01', beneficiaire_ids: [blogueurUserId] });
    expect(res.status).toBe(403);
  });

  it('should create distribution as admin', async () => {
    const res = await request(app)
      .post('/api/distributions')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ type: 'perdiem', libelle: 'Perdiem Jest', montant: 5000, date_distribution: '2025-07-01', beneficiaire_ids: [blogueurUserId] });
    expect(res.status).toBe(201);
    distributionId = res.body.data.id;
  });

  it('should list distributions', async () => {
    const res = await request(app)
      .get('/api/distributions')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get distribution by id', async () => {
    const res = await request(app)
      .get(`/api/distributions/${distributionId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });

  it('should list beneficiaires', async () => {
    const res = await request(app)
      .get(`/api/distributions/${distributionId}/beneficiaires`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('should allow blogueur to confirm reception', async () => {
    const res = await request(app)
      .patch(`/api/distributions/${distributionId}/beneficiaires/recu`)
      .set('Authorization', `Bearer ${tokenBlogueur}`)
      .send({ utilisateur_id: blogueurUserId, recu: true });
    expect(res.status).toBe(200);
  });

  it('should reject blogueur confirming for another user', async () => {
    const res = await request(app)
      .patch(`/api/distributions/${distributionId}/beneficiaires/recu`)
      .set('Authorization', `Bearer ${tokenBlogueur}`)
      .send({ utilisateur_id: 1, recu: true });
    expect(res.status).toBe(403);
  });
});
