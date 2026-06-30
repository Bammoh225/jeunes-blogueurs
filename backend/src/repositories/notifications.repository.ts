import { pool } from '../config/database';
import { Notification, CreateNotificationDto } from '../models/notification.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const notificationsRepository = {

  async findByDestinataire(destinataireId: number): Promise<Notification[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM notifications WHERE destinataire_id = ? ORDER BY created_at DESC LIMIT 50',
      [destinataireId]
    );
    return rows as Notification[];
  },

  async create(dto: CreateNotificationDto): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO notifications (destinataire_id, type, message, lien, publication_id, activite_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [dto.destinataire_id, dto.type, dto.message,
        dto.lien ?? null, dto.publication_id ?? null, dto.activite_id ?? null]);
    return result.insertId;
  },

  async marquerLu(id: number, destinataireId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE notifications SET lu = TRUE WHERE id = ? AND destinataire_id = ?',
      [id, destinataireId]
    );
    return result.affectedRows > 0;
  },

  async marquerTousLus(destinataireId: number): Promise<void> {
    await pool.execute(
      'UPDATE notifications SET lu = TRUE WHERE destinataire_id = ?',
      [destinataireId]
    );
  },

  async countNonLus(destinataireId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM notifications WHERE destinataire_id = ? AND lu = FALSE',
      [destinataireId]
    );
    return rows[0].total as number;
  },

};
