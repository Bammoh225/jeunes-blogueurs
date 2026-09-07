import { pool } from '../src/config/database';

let statutInitial: string | null = null;

beforeAll(async () => {
  const [rows] = await pool.execute<any[]>(
    `
    SELECT pb.statut
    FROM profils_blogueurs pb
    INNER JOIN utilisateurs u ON u.id = pb.utilisateur_id
    WHERE u.email = ?
    LIMIT 1
    `,
    ['kouassi@jb.ci']
  );

  statutInitial = rows[0]?.statut ?? null;

  await pool.execute(
    `
    UPDATE profils_blogueurs pb
    INNER JOIN utilisateurs u ON u.id = pb.utilisateur_id
    SET pb.statut = 'actif'
    WHERE u.email = ?
    `,
    ['kouassi@jb.ci']
  );
});

afterAll(async () => {
  if (statutInitial === null) {
    return;
  }

  await pool.execute(
    `
    UPDATE profils_blogueurs pb
    INNER JOIN utilisateurs u ON u.id = pb.utilisateur_id
    SET pb.statut = ?
    WHERE u.email = ?
    `,
    [statutInitial, 'kouassi@jb.ci']
  );
});
