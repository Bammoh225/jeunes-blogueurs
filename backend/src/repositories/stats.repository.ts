import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface PublicationStat extends RowDataPacket {
  mois: string;
  total: number;
}

export interface BlogueurVilleStat extends RowDataPacket {
  ville: string;
  total: number;
}

export const statsRepository = {

  async getPublicationsParMois(): Promise<PublicationStat[]> {
    const [rows] = await pool.execute<PublicationStat[]>(`
      SELECT
        DATE_FORMAT(p.date_publication, '%Y-%m') AS mois,
        COUNT(p.id) AS total
      FROM publications p
      WHERE p.date_publication >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY YEAR(p.date_publication), MONTH(p.date_publication), DATE_FORMAT(p.date_publication, '%Y-%m')
      ORDER BY YEAR(p.date_publication) ASC, MONTH(p.date_publication) ASC
    `);

    return rows;
  },

  async getBlogueursParVille(): Promise<BlogueurVilleStat[]> {
    const [rows] = await pool.execute<BlogueurVilleStat[]>(`
      SELECT
        v.nom AS ville,
        COUNT(u.id) AS total
      FROM utilisateurs u
      INNER JOIN villes v ON v.id = u.ville_id
      WHERE u.role = 'jeune_blogueur'
      GROUP BY v.id, v.nom
      ORDER BY total DESC, v.nom ASC
    `);

    return rows;
  }

};
