import request from 'supertest';
import app from '../src/app';

describe('PUBLICATIONS - CRUD', () => {
  let tokenAdmin:    string;
  let tokenBlogueur: string;
  let publicationId: number;

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

  it('should reject publication creation without auth', async () => {
    const res = await request(app).post('/api/publications').send({});
    expect(res.status).toBe(401);
  });

  it('should reject publication creation by admin', async () => {
    const res = await request(app)
      .post('/api/publications')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        categorie_id: 1,
        thematique_id: 1,
        titre: 'Test publication',
        lien: 'https://test.ci/article',
        date_publication: '2025-06-01',
      });
    expect(res.status).toBe(403);
  });

  it('should create a publication as blogueur', async () => {
    const res = await request(app)
      .post('/api/publications')
      .set('Authorization', `Bearer ${tokenBlogueur}`)
      .send({
        categorie_id: 1,
        thematique_id: 1,
        titre: 'Test publication Jest',
        lien: 'https://test.ci/jest-article',
        date_publication: '2025-06-01',
        blog_nb_mots: 500,
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    publicationId = res.body.data.id;
  });

  it('should get all publications with auth', async () => {
    const res = await request(app)
      .get('/api/publications')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get one publication with auth', async () => {
    const res = await request(app)
      .get(`/api/publications/${publicationId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(publicationId);
  });

  it('should reject get publication without auth', async () => {
    const res = await request(app).get(`/api/publications/${publicationId}`);
    expect(res.status).toBe(401);
  });

  it('should delete publication as blogueur owner', async () => {
    const res = await request(app)
      .delete(`/api/publications/${publicationId}`)
      .set('Authorization', `Bearer ${tokenBlogueur}`);
    expect(res.status).toBe(200);
  });
});
