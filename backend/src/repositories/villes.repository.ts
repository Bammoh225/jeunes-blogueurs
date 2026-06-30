import { pool } from '../config/database';
import { Ville } from '../models/ville.model';
import { RowDataPacket } from 'mysql2';

export const villesRepository = {

  async findAll(): Promise<Ville[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM villes WHERE actif = TRUE ORDER BY nom ASC'
    );
    return rows as Ville[];
  },

  async findById(id: number): Promise<Ville | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM villes WHERE id = ? LIMIT 1', [id]
    );
    return (rows[0] as Ville) ?? null;
  },

};
