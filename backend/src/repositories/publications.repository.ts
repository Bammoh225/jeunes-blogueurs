import { pool } from '../config/database';
import { Publication, PublicationResume, CreatePublicationDto, UpdatePublicationDto } from '../models/publication.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const publicationsRepository = {

  async findAll(
    filtres?: { auteur_id?: number; categorie_id?: number; thematique_id?: number },
    pagination?: { page?: number; limit?: number },
    recherche?: string,
    tri?: string
  ): Promise<{ data: PublicationResume[]; total: number }> {
    let where = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (filtres?.auteur_id)     { where += ' AND p.auteur_id = ?';     params.push(filtres.auteur_id); }
    if (filtres?.categorie_id)  { where += ' AND p.categorie_id = ?';  params.push(filtres.categorie_id); }
    if (filtres?.thematique_id) { where += ' AND p.thematique_id = ?'; params.push(filtres.thematique_id); }
    if (recherche) {
      where += ' AND (p.titre LIKE ? OR CONCAT(u.prenom, " ", u.nom) LIKE ?)';
      const q = `%${recherche}%`;
      params.push(q, q);
    }

    // Comptage total (pour la pagination), avant LIMIT/OFFSET
    const [countRows] = await pool.execute<RowDataPacket[]>(`
      SELECT COUNT(DISTINCT p.id) AS total
      FROM publications p
      JOIN utilisateurs u  ON u.id = p.auteur_id
      JOIN categories c    ON c.id = p.categorie_id
      JOIN thematiques t   ON t.id = p.thematique_id
      ${where}
    `, params);
    const total = Number((countRows[0] as any)?.total ?? 0);

    // Whitelist du tri (jamais d'input brut dans ORDER BY)
    let orderBy = 'p.soumis_le DESC';
    if (tri === 'ancien')       orderBy = 'p.soumis_le ASC';
    else if (tri === 'evaluations') orderBy = 'nb_evaluations DESC';

    // Page/limit validés et clampés avant d'être injectés dans LIMIT/OFFSET
    // (mysql2 gère mal LIMIT/OFFSET en placeholders préparés, donc on les
    // inline après les avoir forcés en entiers sûrs)
    const page  = Math.max(1, Math.trunc(Number(pagination?.page)) || 1);
    const limit = Math.min(100, Math.max(1, Math.trunc(Number(pagination?.limit)) || 20));
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        p.id, p.auteur_id, p.titre, p.lien, p.date_publication, p.soumis_le,
        u.prenom AS auteur_prenom, u.nom AS auteur_nom,
        c.nom    AS categorie_nom,
        t.nom    AS thematique_nom,
        t.couleur AS thematique_couleur,
        COUNT(e.id) AS nb_evaluations
      FROM publications p
      JOIN utilisateurs u  ON u.id = p.auteur_id
      JOIN categories c    ON c.id = p.categorie_id
      JOIN thematiques t   ON t.id = p.thematique_id
      LEFT JOIN evaluations e ON e.publication_id = p.id
      ${where}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `, params);

    return { data: rows as PublicationResume[], total };
  },

  async findById(id: number): Promise<Publication | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        p.*,
        u.prenom AS auteur_prenom, u.nom AS auteur_nom,
        c.nom    AS categorie_nom,
        t.nom    AS thematique_nom,
        t.couleur AS thematique_couleur,
        COUNT(e.id) AS nb_evaluations
      FROM publications p
      JOIN utilisateurs u  ON u.id = p.auteur_id
      JOIN categories c    ON c.id = p.categorie_id
      JOIN thematiques t   ON t.id = p.thematique_id
      LEFT JOIN evaluations e ON e.publication_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
      LIMIT 1
    `, [id]);

    return (rows[0] as Publication) ?? null;
  },

  async create(auteurId: number, dto: CreatePublicationDto): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO publications
        (auteur_id, categorie_id, thematique_id, titre, lien, description, date_publication,
         blog_nb_mots,
         vlog_plateforme, vlog_duree_minutes,
         podcast_plateforme, podcast_duree_min, podcast_invites,
         bd_nb_planches, bd_outil)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auteurId, dto.categorie_id, dto.thematique_id,
        dto.titre, dto.lien, dto.description ?? null, dto.date_publication,
        dto.blog_nb_mots ?? null,
        dto.vlog_plateforme ?? null, dto.vlog_duree_minutes ?? null,
        dto.podcast_plateforme ?? null, dto.podcast_duree_min ?? null, dto.podcast_invites ?? null,
        dto.bd_nb_planches ?? null, dto.bd_outil ?? null,
      ] as (string | number | null)[]
    );
    return result.insertId;
  },

  async update(id: number, dto: UpdatePublicationDto): Promise<boolean> {
    const allowed = ['categorie_id','thematique_id','titre','lien','description',
      'date_publication','blog_nb_mots','vlog_plateforme','vlog_duree_minutes',
      'podcast_plateforme','podcast_duree_min','podcast_invites','bd_nb_planches','bd_outil'];

    const entries = Object.entries(dto).filter(([k, v]) => allowed.includes(k) && v !== undefined);
    if (!entries.length) return false;

    const sets = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v) as (string | number | null)[];

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE publications SET ${sets} WHERE id = ?`,
      [...values, id] as (string | number | null)[]
    );
    return result.affectedRows > 0;
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM publications WHERE id = ?', [id]
    );
    return result.affectedRows > 0;
  },

};