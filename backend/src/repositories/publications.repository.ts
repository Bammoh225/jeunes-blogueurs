import { pool } from '../config/database';
import { Publication, PublicationResume, CreatePublicationDto, UpdatePublicationDto } from '../models/publication.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const publicationsRepository = {

  async findAll(filtres?: { auteur_id?: number; categorie_id?: number; thematique_id?: number }): Promise<PublicationResume[]> {
    let where = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (filtres?.auteur_id)     { where += ' AND p.auteur_id = ?';     params.push(filtres.auteur_id); }
    if (filtres?.categorie_id)  { where += ' AND p.categorie_id = ?';  params.push(filtres.categorie_id); }
    if (filtres?.thematique_id) { where += ' AND p.thematique_id = ?'; params.push(filtres.thematique_id); }

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
      ORDER BY p.soumis_le DESC
    `, params);

    return rows as PublicationResume[];
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
