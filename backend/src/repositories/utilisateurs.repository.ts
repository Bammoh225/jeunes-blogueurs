import { pool } from '../config/database';
import {
  Utilisateur,
  UtilisateurPublic,
  CreateUtilisateurDto,
  UpdateUtilisateurDto
} from '../models/utilisateur.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const utilisateursRepository = {

  async findAll(): Promise<UtilisateurPublic[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.numero_urgence, u.photo_url,
             u.role, u.ville_id, u.categorie_id, u.actif, u.created_at, u.updated_at,
             v.nom AS ville_nom, c.nom AS categorie_nom
      FROM utilisateurs u
      LEFT JOIN villes v ON u.ville_id = v.id
      LEFT JOIN categories c ON u.categorie_id = c.id
      WHERE u.role != 'jeune_blogueur'
      ORDER BY u.created_at DESC
    `);
    return rows as UtilisateurPublic[];
  },

  async findById(id: number): Promise<UtilisateurPublic | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT u.id, u.prenom, u.nom, u.email, u.telephone, u.numero_urgence, u.photo_url,
             u.role, u.ville_id, u.categorie_id, u.actif, u.created_at, u.updated_at,
             v.nom AS ville_nom, c.nom AS categorie_nom
      FROM utilisateurs u
      LEFT JOIN villes v ON u.ville_id = v.id
      LEFT JOIN categories c ON u.categorie_id = c.id
      WHERE u.id = ? LIMIT 1
    `, [id]);
    return (rows[0] as UtilisateurPublic) ?? null;
  },

  async create(dto: CreateUtilisateurDto & { mot_de_passe: string }): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, telephone, numero_urgence, role, ville_id, categorie_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      dto.prenom,
      dto.nom,
      dto.email,
      dto.mot_de_passe,
      dto.telephone ?? null,
      dto.numero_urgence ?? null,
      dto.role ?? 'blogueur',
      dto.ville_id ?? null,
      dto.categorie_id ?? null,
    ]);
    return result.insertId;
  },

  async update(id: number, dto: UpdateUtilisateurDto): Promise<boolean> {
    const fields = Object.entries(dto)
      .filter(([, v]) => v !== undefined)
      .map(([k]) => `${k} = ?`)
      .join(', ');

    const values = Object.values(dto).filter(v => v !== undefined);

    if (!fields) return false;

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE utilisateurs SET ${fields} WHERE id = ?`,
      [...values, id]
    );
    return result.affectedRows > 0;
  },

  async deactivate(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE utilisateurs SET actif = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const query = excludeId
      ? 'SELECT id FROM utilisateurs WHERE email = ? AND id != ? LIMIT 1'
      : 'SELECT id FROM utilisateurs WHERE email = ? LIMIT 1';
    const params = excludeId ? [email, excludeId] : [email];
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows.length > 0;
  },

};