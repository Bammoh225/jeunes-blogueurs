import { pool } from '../config/database';
import { Activite, CreateActiviteDto, UpdateActiviteDto } from '../models/activite.model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

export const activitesRepository = {

  async findAll(filtres?: { villeId?: number; userId?: number; role?: string }): Promise<Activite[]> {
    let where = 'WHERE 1=1';
    const params: (string | number)[] = [];

    const staffRoles = ['responsable_unicef', 'responsable_technique', 'responsable_national', 'equipe_com', 'responsable_categorie'];

    if (filtres?.role === 'jeune_blogueur' && filtres.userId) {
      where += ` AND (
        (a.visibilite = 'ville' AND a.ville_id = (SELECT ville_id FROM utilisateurs WHERE id = ?))
        OR (a.visibilite = 'designee' AND EXISTS (
          SELECT 1 FROM participants_activites pa2
          WHERE pa2.activite_id = a.id AND pa2.utilisateur_id = ?
        ))
      )`;
      params.push(filtres.userId, filtres.userId);
    } else if (filtres?.role === 'responsable_zone' && filtres.villeId) {
      where += ' AND a.ville_id = ?';
      params.push(filtres.villeId);
    } else if (filtres?.villeId) {
      where += ' AND a.ville_id = ?';
      params.push(filtres.villeId);
    }
    // staff sans ville_id : voit tout

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT a.*, u.prenom AS organisateur_prenom, u.nom AS organisateur_nom,
             v.nom AS ville_nom, COUNT(pa.utilisateur_id) AS nb_participants
      FROM activites a
      JOIN utilisateurs u ON u.id = a.organisateur_id
      JOIN villes v       ON v.id = a.ville_id
      LEFT JOIN participants_activites pa ON pa.activite_id = a.id
      ${where} GROUP BY a.id ORDER BY a.date_debut DESC
    `, params);
    return rows as Activite[];
  },

  async findById(id: number): Promise<Activite | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT a.*, u.prenom AS organisateur_prenom, u.nom AS organisateur_nom,
             v.nom AS ville_nom, COUNT(pa.utilisateur_id) AS nb_participants
      FROM activites a
      JOIN utilisateurs u ON u.id = a.organisateur_id
      JOIN villes v       ON v.id = a.ville_id
      LEFT JOIN participants_activites pa ON pa.activite_id = a.id
      WHERE a.id = ? GROUP BY a.id LIMIT 1
    `, [id]);
    return (rows[0] as Activite) ?? null;
  },

  async findByToken(token: string): Promise<Activite | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT a.*, v.nom AS ville_nom, COUNT(pa.utilisateur_id) AS nb_participants
      FROM activites a
      JOIN villes v ON v.id = a.ville_id
      LEFT JOIN participants_activites pa ON pa.activite_id = a.id
      WHERE a.token_partage = ? GROUP BY a.id LIMIT 1
    `, [token]);
    return (rows[0] as Activite) ?? null;
  },

  async findParticipants(activiteId: number): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT u.id, u.prenom, u.nom, u.email, u.telephone, pa.present
      FROM participants_activites pa
      JOIN utilisateurs u ON u.id = pa.utilisateur_id
      WHERE pa.activite_id = ?
      ORDER BY u.nom ASC
    `, [activiteId]);
    return rows;
  },

  async countParticipants(activiteId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM participants_activites WHERE activite_id = ?',
      [activiteId]
    );
    return (rows[0] as any).total;
  },

  async isInscrit(activiteId: number, userId: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM participants_activites WHERE activite_id = ? AND utilisateur_id = ? LIMIT 1',
      [activiteId, userId]
    );
    return rows.length > 0;
  },

  async getMonStatut(activiteId: number, userId: number): Promise<{ inscrit: boolean; present: boolean } | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT present FROM participants_activites WHERE activite_id = ? AND utilisateur_id = ? LIMIT 1',
      [activiteId, userId]
    );
    if (rows.length === 0) return { inscrit: false, present: false };
    return { inscrit: true, present: !!rows[0].present };
  },

  async create(organisateurId: number, dto: CreateActiviteDto): Promise<number> {
    const token = crypto.randomBytes(24).toString('hex');
    const [result] = await pool.execute<ResultSetHeader>(`
      INSERT INTO activites (
        organisateur_id, ville_id, titre, description, type,
        date_debut, date_fin, lieu, capacite_max, visibilite, token_partage
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      organisateurId, dto.ville_id, dto.titre,
      dto.description ?? null, dto.type, dto.date_debut,
      dto.date_fin ?? null, dto.lieu ?? null,
      dto.capacite_max ?? null,
      dto.visibilite ?? 'ville',
      token
    ]);

    const activiteId = result.insertId;

    if (dto.visibilite === 'designee' && dto.participant_ids?.length) {
      for (const uid of dto.participant_ids) {
        await pool.execute(
          'INSERT IGNORE INTO participants_activites (activite_id, utilisateur_id) VALUES (?, ?)',
          [activiteId, uid]
        );
      }
    }

    return activiteId;
  },

  async update(id: number, dto: UpdateActiviteDto): Promise<boolean> {
    const allowed = ['titre','description','type','date_debut','date_fin','lieu','capacite_max','statut','rapport'];
    const entries = Object.entries(dto).filter(([k, v]) => allowed.includes(k) && v !== undefined);
    if (!entries.length) return false;
    const sets = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v) as (string | number | null)[];
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE activites SET ${sets} WHERE id = ?`,
      [...values, id] as (string | number | null)[]
    );
    return result.affectedRows > 0;
  },

  async addParticipant(activiteId: number, userId: number): Promise<void> {
    await pool.execute(
      'INSERT IGNORE INTO participants_activites (activite_id, utilisateur_id) VALUES (?, ?)',
      [activiteId, userId]
    );
  },

  async marquerPresence(activiteId: number, userId: number, present: boolean): Promise<void> {
    await pool.execute(
      'UPDATE participants_activites SET present = ? WHERE activite_id = ? AND utilisateur_id = ?',
      [present, activiteId, userId]
    );
  },

};