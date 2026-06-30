import { pool } from '../config/database';
import { Evaluation, CreateEvaluationDto } from '../models/evaluation.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const evaluationsRepository = {

  async findByPublication(publicationId: number): Promise<Evaluation[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        e.*,
        u.prenom AS evaluateur_prenom,
        u.nom    AS evaluateur_nom
      FROM evaluations e
      JOIN utilisateurs u ON u.id = e.evaluateur_id
      WHERE e.publication_id = ?
      ORDER BY e.evalue_le DESC
    `, [publicationId]);
    return rows as Evaluation[];
  },

  async findAll(): Promise<Evaluation[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        e.*,
        u.prenom  AS evaluateur_prenom,
        u.nom     AS evaluateur_nom,
        p.titre   AS publication_titre
      FROM evaluations e
      JOIN utilisateurs u ON u.id = e.evaluateur_id
      JOIN publications p ON p.id = e.publication_id
      ORDER BY e.evalue_le DESC
    `);
    return rows as Evaluation[];
  },

 async create(evaluateurId: number, dto: CreateEvaluationDto): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO evaluations
        (publication_id, evaluateur_id, retenu_reseaux, commentaire, reseau_utilise, date_utilisation)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dto.publication_id, evaluateurId,
        dto.retenu_reseaux, dto.commentaire ?? null,
        dto.reseau_utilise ?? null,
        dto.date_utilisation ?? null,
      ] as (string | number | boolean | null)[]
    );
    return result.insertId;
  },
};
