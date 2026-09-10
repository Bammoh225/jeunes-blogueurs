import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Badge {
  id: number;
  nom: string;
  description: string;
  icone_url: string;
  critere_type: 'publications' | 'activites' | 'anciennete' | 'special';
  critere_valeur: number;
}

export const gamificationRepository = {
  async getBadgesForBlogueur(blogueurId: number): Promise<Badge[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT b.* FROM badges b
       JOIN blogueur_badges bb ON bb.badge_id = b.id
       WHERE bb.blogueur_id = ?
       ORDER BY bb.obtenu_le DESC`,
      [blogueurId]
    );
    return rows as Badge[];
  },

  async getAllBadges(): Promise<Badge[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM badges'
    );
    return rows as Badge[];
  },

  async assignBadge(blogueurId: number, badgeId: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT IGNORE INTO blogueur_badges (blogueur_id, badge_id) VALUES (?, ?)',
        [blogueurId, badgeId]
      );
      return result.affectedRows > 0;
    } catch (e) {
      return false;
    }
  }
};
