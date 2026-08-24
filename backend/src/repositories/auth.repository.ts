import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const authRepository = {

  async findByEmail(email: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM utilisateurs WHERE email = ? AND actif = TRUE LIMIT 1',
      [email]
    );
    return rows[0] ?? null;
  },

  async findById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM utilisateurs WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ?? null;
  },

  async updateProfil(id: number, dto: {
    prenom?: string;
    nom?: string;
    telephone?: string;
    numero_urgence?: string;
  }) {
    const allowed = ['prenom', 'nom', 'telephone', 'numero_urgence'];
    const entries = Object.entries(dto).filter(([k, v]) => allowed.includes(k) && v !== undefined);
    if (!entries.length) return;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v) as string[];

    await pool.execute(
      `UPDATE utilisateurs SET ${fields} WHERE id = ?`,
      [...values, id]
    );
  },

  async updatePassword(id: number, hash: string) {
    await pool.execute<ResultSetHeader>(
      'UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?',
      [hash, id]
    );
  },

  async createResetToken(userId: number, tokenHash: string, expiresAt: Date) {
    await pool.execute<ResultSetHeader>(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, tokenHash, expiresAt]
    );
  },

  async findValidResetToken(tokenHash: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM password_reset_tokens 
       WHERE token_hash = ? AND used = FALSE AND expires_at > NOW() 
       LIMIT 1`,
      [tokenHash]
    );
    return rows[0] ?? null;
  },

  async markResetTokenUsed(id: number) {
    await pool.execute<ResultSetHeader>(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
      [id]
    );
  },

  async invalidateUserResetTokens(userId: number) {
    await pool.execute(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE',
      [userId]
    );
  },

};