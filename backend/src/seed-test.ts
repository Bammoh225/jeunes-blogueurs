import { pool } from './config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('Fetching foreign keys...');
    
    // Fetch categories
    const [categories]: any = await pool.query('SELECT id FROM categories');
    const categorieIds = categories.map((c: any) => c.id);
    if (categorieIds.length === 0) throw new Error('No categories found');

    // Fetch thematiques
    const [thematiques]: any = await pool.query('SELECT id FROM thematiques');
    const thematiqueIds = thematiques.map((t: any) => t.id);
    if (thematiqueIds.length === 0) throw new Error('No thematiques found');

    // Fetch villes
    const [villes]: any = await pool.query('SELECT id FROM villes');
    const villeIds = villes.map((v: any) => v.id);
    if (villeIds.length === 0) throw new Error('No villes found');

    console.log('Generating 300 users...');
    const users = [];
    const passwordHash = await bcrypt.hash('password123', 10);
    for (let i = 1; i <= 300; i++) {
      users.push({
        prenom: `TestPrenom${i}`,
        nom: `TestNom${i}`,
        email: `testuser${i}_${Date.now()}@example.com`,
        mot_de_passe: passwordHash,
        role: 'jeune_blogueur',
        ville_id: villeIds[Math.floor(Math.random() * villeIds.length)],
        categorie_id: categorieIds[Math.floor(Math.random() * categorieIds.length)],
      });
    }

    const userIds = [];
    for (const u of users) {
      const [result]: any = await pool.query(
        'INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, role, ville_id, categorie_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [u.prenom, u.nom, u.email, u.mot_de_passe, u.role, u.ville_id, u.categorie_id]
      );
      userIds.push(result.insertId);
    }
    console.log(`Inserted 300 users.`);

    console.log('Generating 1000 publications...');
    const start2026 = new Date('2026-01-01T00:00:00Z').getTime();
    const end2026 = new Date('2026-12-31T23:59:59Z').getTime();

    const publications = [];
    for (let i = 1; i <= 1000; i++) {
      const randomTime = start2026 + Math.random() * (end2026 - start2026);
      const datePublication = new Date(randomTime);
      
      const auteurId = userIds[Math.floor(Math.random() * userIds.length)];
      const catId = categorieIds[Math.floor(Math.random() * categorieIds.length)];
      const thId = thematiqueIds[Math.floor(Math.random() * thematiqueIds.length)];
      
      publications.push({
        auteur_id: auteurId,
        categorie_id: catId,
        thematique_id: thId,
        titre: `Publication de Test ${i} - 2026`,
        lien: `https://example.com/pub-${i}-${Date.now()}`,
        description: `Description pour la publication de test numéro ${i}.`,
        date_publication: datePublication,
        soumis_le: datePublication,
      });
    }

    // Insert publications in chunks of 100 to avoid locking or huge queries
    const chunkSize = 100;
    for (let i = 0; i < publications.length; i += chunkSize) {
      const chunk = publications.slice(i, i + chunkSize);
      const values = chunk.map(p => [
        p.auteur_id, p.categorie_id, p.thematique_id, p.titre, p.lien, p.description, p.date_publication, p.soumis_le
      ]);
      await pool.query(
        'INSERT INTO publications (auteur_id, categorie_id, thematique_id, titre, lien, description, date_publication, soumis_le) VALUES ?',
        [values]
      );
      console.log(`Inserted ${i + chunk.length} publications...`);
    }

    console.log(`Successfully inserted 1000 publications.`);

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    pool.end();
  }
}

seed();
