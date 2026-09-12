import { pool } from '../config/database';
import { Ressource, CreateRessourceDto } from '../models/ressource.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const ressourcesRepository = {

  async findAll(): Promise<Ressource[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT r.*, u.prenom as createur_prenom, u.nom as createur_nom
      FROM ressources r
      LEFT JOIN utilisateurs u ON r.createur_id = u.id
      ORDER BY r.created_at DESC
    `);
    return rows as Ressource[];
  },

  async create(dto: CreateRessourceDto): Promise<number> {
    const [res] = await pool.execute<ResultSetHeader>(
      `INSERT INTO ressources (titre, description, type, url, createur_id)
       VALUES (?, ?, ?, ?, ?)`,
      [dto.titre, dto.description || null, dto.type, dto.url, dto.createur_id || null]
    );
    return res.insertId;
  },

  async delete(id: number): Promise<boolean> {
    const [res] = await pool.execute<ResultSetHeader>(
      `DELETE FROM ressources WHERE id = ?`,
      [id]
    );
    return res.affectedRows > 0;
  }
};
