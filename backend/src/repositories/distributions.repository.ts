import { pool } from '../config/database';
import {
  Distribution,
  Beneficiaire,
  CreateDistributionDto,
  UpdateDistributionDto
} from '../models/distribution.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const distributionsRepository = {

  async findAll(userId?: number, role?: string): Promise<Distribution[]> {
    let whereClause = '';
    const params: (string | number)[] = [];

    // Les administrateurs voient toutes les distributions.
    const isAdmin =
      role === 'responsable_unicef' ||
      role === 'responsable_technique';

    if (!isAdmin) {
      if (role === 'jeune_blogueur') {
        // Un jeune blogueur voit uniquement
        // les distributions dont il est bénéficiaire.
        whereClause = `
          WHERE EXISTS (
            SELECT 1
            FROM distribution_beneficiaires db2
            WHERE db2.distribution_id = d.id
              AND db2.utilisateur_id = ?
          )
        `;
        params.push(userId!);
      } else {
        // Les responsables/staff voient les distributions
        // dont ils sont responsables.
        whereClause = 'WHERE d.responsable_id = ?';
        params.push(userId!);
      }
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT
        d.*,
        u.prenom AS responsable_prenom,
        u.nom    AS responsable_nom,
        COUNT(db.utilisateur_id) AS nb_beneficiaires,
        COALESCE(SUM(db.recu), 0) AS nb_recus
      FROM distributions d
      JOIN utilisateurs u ON u.id = d.responsable_id
      LEFT JOIN distribution_beneficiaires db
        ON db.distribution_id = d.id
      ${whereClause}
      GROUP BY d.id
      ORDER BY d.date_distribution DESC
      `,
      params
    );

    return rows as Distribution[];
  },

  async findByIdForUser(
    id: number,
    userId: number,
    role: string
  ): Promise<Distribution | null> {
    let query = `
      SELECT
        d.*,
        u.prenom AS responsable_prenom,
        u.nom AS responsable_nom,
        COUNT(db.utilisateur_id) AS nb_beneficiaires,
        COALESCE(SUM(db.recu), 0) AS nb_recus
      FROM distributions d
      JOIN utilisateurs u ON u.id = d.responsable_id
      LEFT JOIN distribution_beneficiaires db
        ON db.distribution_id = d.id
      WHERE d.id = ?
    `;

    const params: unknown[] = [id];

    if (role === 'jeune_blogueur') {
      query += `
        AND EXISTS (
          SELECT 1
          FROM distribution_beneficiaires db2
          WHERE db2.distribution_id = d.id
            AND db2.utilisateur_id = ?
        )
      `;
      params.push(userId);
    } else if (
      role !== 'responsable_unicef' &&
      role !== 'responsable_technique'
    ) {
      query += ` AND d.responsable_id = ? `;
      params.push(userId);
    }

    query += `
      GROUP BY d.id
      LIMIT 1
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return (rows[0] as Distribution) || null;
  },

  async findById(id: number): Promise<Distribution | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT
        d.*,
        u.prenom AS responsable_prenom,
        u.nom    AS responsable_nom,
        COUNT(db.utilisateur_id) AS nb_beneficiaires,
        COALESCE(SUM(db.recu), 0) AS nb_recus
      FROM distributions d
      JOIN utilisateurs u ON u.id = d.responsable_id
      LEFT JOIN distribution_beneficiaires db
        ON db.distribution_id = d.id
      WHERE d.id = ?
      GROUP BY d.id
      LIMIT 1
      `,
      [id]
    );

    return (rows[0] as Distribution) ?? null;
  },

  async findBeneficiaires(distributionId: number): Promise<Beneficiaire[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT
        u.id,
        u.prenom,
        u.nom,
        u.email,
        db.recu
      FROM distribution_beneficiaires db
      JOIN utilisateurs u
        ON u.id = db.utilisateur_id
      WHERE db.distribution_id = ?
      ORDER BY u.nom ASC
      `,
      [distributionId]
    );

    return rows as Beneficiaire[];
  },

  async create(
    responsableId: number,
    dto: CreateDistributionDto
  ): Promise<number> {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [result] = await conn.execute<ResultSetHeader>(
        `
        INSERT INTO distributions
          (responsable_id, type, libelle, description, montant, date_distribution)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          responsableId,
          dto.type,
          dto.libelle,
          dto.description ?? null,
          dto.montant ?? null,
          dto.date_distribution
        ] as (string | number | null)[]
      );

      const distributionId = result.insertId;

      for (const userId of dto.beneficiaire_ids) {
        await conn.execute(
          `
          INSERT INTO distribution_beneficiaires
            (distribution_id, utilisateur_id)
          VALUES (?, ?)
          `,
          [distributionId, userId]
        );
      }

      await conn.commit();

      return distributionId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async update(
    id: number,
    dto: UpdateDistributionDto
  ): Promise<boolean> {
    const allowed = [
      'type',
      'libelle',
      'description',
      'montant',
      'date_distribution'
    ];

    const entries = Object.entries(dto).filter(
      ([key, value]) =>
        allowed.includes(key) && value !== undefined
    );

    if (!entries.length) return false;

    const sets = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value) as (
      string | number | null
    )[];

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE distributions SET ${sets} WHERE id = ?`,
      [...values, id] as (string | number | null)[]
    );

    return result.affectedRows > 0;
  },

  async marquerRecu(
    distributionId: number,
    userId: number,
    recu: boolean
  ): Promise<void> {
    await pool.execute(
      `
      UPDATE distribution_beneficiaires
      SET recu = ?
      WHERE distribution_id = ?
        AND utilisateur_id = ?
      `,
      [recu, distributionId, userId]
    );
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM distributions WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  },

};
