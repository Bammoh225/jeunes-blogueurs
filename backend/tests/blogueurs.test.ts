import request from 'supertest';
import app from '../src/app';

describe('BLOGUEURS', () => {
  let tokenAdmin:    string;
  let tokenBlogueur: string;
  let blogueurId:    number;

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

  it('should inscribe a new blogueur (public) → 201', async () => {
    const email = `test_${Date.now()}@jb.ci`;
    const res = await request(app)
      .post('/api/blogueurs')
      .send({
        prenom: 'Test',
        nom: 'Blogueur',
        email,
        mot_de_passe: 'Password123',
        date_naissance: '2005-01-01',
        sexe: 'M',
        langue_ecriture: 'Français',
        thematique_ids: [1, 2],
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    blogueurId = res.body.data.id;
  });

  it('should list blogueurs (staff only)', async () => {
    const res = await request(app)
      .get('/api/blogueurs')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should reject blogueur list without auth', async () => {
    const res = await request(app).get('/api/blogueurs');
    expect(res.status).toBe(401);
  });

  it('should reject blogueur list for jeune_blogueur role', async () => {
    const res = await request(app)
      .get('/api/blogueurs')
      .set('Authorization', `Bearer ${tokenBlogueur}`);
    expect(res.status).toBe(403);
  });

  it('should get blogueur by id', async () => {
    const res = await request(app)
      .get(`/api/blogueurs/${blogueurId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(blogueurId);
  });

  it('should change blogueur statut to actif', async () => {
    const res = await request(app)
      .patch(`/api/blogueurs/${blogueurId}/statut`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ statut: 'actif' });
    expect(res.status).toBe(200);
  });

  it('should reject statut change by blogueur', async () => {
    const res = await request(app)
      .patch(`/api/blogueurs/${blogueurId}/statut`)
      .set('Authorization', `Bearer ${tokenBlogueur}`)
      .send({ statut: 'actif' });
    expect(res.status).toBe(403);
  });
});
