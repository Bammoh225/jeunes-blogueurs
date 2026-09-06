import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export const statsRepository = {

  async getPublicationsParMois(): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as mois,
        COUNT(id) as total
      FROM publications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY mois
      ORDER BY mois ASC
    `);
    return rows;
  },

  async getBlogueursParVille(): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        v.nom as ville,
        COUNT(u.id) as total
      FROM utilisateurs u
      JOIN villes v ON v.id = u.ville_id
      WHERE u.role != 'responsable_unicef'
      GROUP BY v.id, v.nom
      ORDER BY total DESC
    `);
    return rows;
  }

};
