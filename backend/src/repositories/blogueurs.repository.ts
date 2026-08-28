import { pool } from '../config/database';
import {
  BlogueurResume,
  Blogueur,
  CreateBlogueurDto,
  UpdateBlogueurDto
} from '../models/blogueur.model';
import { StatutBlogueur } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const blogueursRepository = {

  async findAll(
    filtres?: {
      statut?: StatutBlogueur;
      ville_id?: number;
      categorie_id?: number;
    }
  ): Promise<BlogueurResume[]> {

    let where = "WHERE u.role != 'responsable_unicef'";

    const params: (string | number)[] = [];

    if (filtres?.statut) {
      where += ' AND pb.statut = ?';
      params.push(filtres.statut);
    }

    if (filtres?.ville_id) {
      where += ' AND u.ville_id = ?';
      params.push(filtres.ville_id);
    }

    if (filtres?.categorie_id) {
      where += ' AND u.categorie_id = ?';
      params.push(filtres.categorie_id);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        u.id,
        u.prenom,
        u.nom,
        u.email,
        u.telephone,
        COALESCE(pb.numero_urgence, u.numero_urgence) AS numero_urgence,
        u.photo_url,
        u.created_at,

        COALESCE(pb.statut, 'actif') AS statut,
        COALESCE(pb.nb_publications, 0) AS nb_publications,

        v.nom AS ville_nom,
        c.nom AS categorie_nom,

        GROUP_CONCAT(
          t.nom
          ORDER BY t.nom
          SEPARATOR ','
        ) AS thematiques_str

      FROM utilisateurs u

      LEFT JOIN profils_blogueurs pb
        ON pb.utilisateur_id = u.id

      LEFT JOIN villes v
        ON v.id = u.ville_id

      LEFT JOIN categories c
        ON c.id = u.categorie_id

      LEFT JOIN blogueur_thematiques bt
        ON bt.blogueur_id = u.id

      LEFT JOIN thematiques t
        ON t.id = bt.thematique_id

      ${where}

      GROUP BY u.id

      ORDER BY u.created_at DESC
    `, params);

    return rows.map(r => ({
      ...r,
      thematiques: r.thematiques_str
        ? r.thematiques_str.split(',')
        : [],
    })) as BlogueurResume[];
  },


  async findById(id: number): Promise<Blogueur | null> {

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        u.id,
        u.prenom,
        u.nom,
        u.email,
        u.telephone,
        u.photo_url,
        u.ville_id,
        u.categorie_id,
        u.actif,
        u.created_at,

        pb.date_naissance,
        pb.sexe,
        pb.bio,
        pb.niveau_scolaire,
        pb.etablissement,
        pb.experience,
        pb.langue_ecriture,
        pb.motivation,
        COALESCE(pb.numero_urgence, u.numero_urgence) AS numero_urgence,
        COALESCE(pb.statut, 'actif') AS statut,
        COALESCE(pb.nb_publications, 0) AS nb_publications,

        v.nom AS ville_nom,
        c.nom AS categorie_nom,

        GROUP_CONCAT(
          t.nom
          ORDER BY t.nom
          SEPARATOR ','
        ) AS thematiques_str

      FROM utilisateurs u

      LEFT JOIN profils_blogueurs pb
        ON pb.utilisateur_id = u.id

      LEFT JOIN villes v
        ON v.id = u.ville_id

      LEFT JOIN categories c
        ON c.id = u.categorie_id

      LEFT JOIN blogueur_thematiques bt
        ON bt.blogueur_id = u.id

      LEFT JOIN thematiques t
        ON t.id = bt.thematique_id

      WHERE u.id = ?
        AND u.role != 'responsable_unicef'

      GROUP BY u.id

      LIMIT 1
    `, [id]);

    if (!rows[0]) {
      return null;
    }

    const row = rows[0];

    return {
      ...row,
      thematiques: row.thematiques_str
        ? row.thematiques_str.split(',')
        : [],
    } as unknown as Blogueur;
  },


  async create(
    dto: CreateBlogueurDto,
    hashedPassword: string
  ): Promise<number> {

    const conn = await pool.getConnection();

    try {

      await conn.beginTransaction();


      // =========================================================
      // 1. CRÉER L'UTILISATEUR
      // =========================================================

      const [userResult] = await conn.execute<ResultSetHeader>(
        `
        INSERT INTO utilisateurs (
          prenom,
          nom,
          email,
          mot_de_passe,
          telephone,
          role,
          ville_id,
          categorie_id
        )
        VALUES (?, ?, ?, ?, ?, 'jeune_blogueur', ?, ?)
        `,
        [
          dto.prenom,
          dto.nom,
          dto.email,
          hashedPassword,
          dto.telephone ?? null,
          dto.ville_id ?? null,
          dto.categorie_id ?? null
        ]
      );

      const userId = userResult.insertId;


      // =========================================================
      // 2. CRÉER LE PROFIL BLOGUEUR
      // =========================================================

      await conn.execute(
  `
  INSERT INTO profils_blogueurs (
    utilisateur_id,
    date_naissance,
    sexe,
    bio,
    niveau_scolaire,
    etablissement,
    experience,
    langue_ecriture,
    motivation,
    numero_urgence
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  [
    userId,
    dto.date_naissance,
    dto.sexe ?? null,
    dto.bio ?? null,
    dto.niveau_scolaire ?? null,       // n'est plus demandé à l'inscription, restera null jusqu'au remplissage via le profil
    dto.etablissement ?? null,         // idem
    dto.experience ?? null,
    dto.langue_ecriture ?? 'Français', // valeur par défaut cohérente avec l'ancien select du formulaire
    dto.motivation ?? null,

    // IMPORTANT :
    // numero_urgence est obligatoire
    dto.numero_urgence
  ]
);


      // =========================================================
      // 3. ASSOCIATION DES THÉMATIQUES
      // =========================================================

      const themes = dto.thematique_ids.slice(0, 3);

      for (const tid of themes) {

        await conn.execute(
          `
          INSERT INTO blogueur_thematiques (
            blogueur_id,
            thematique_id
          )
          VALUES (?, ?)
          `,
          [userId, tid]
        );

      }


      // =========================================================
      // 4. VALIDATION
      // =========================================================

      await conn.commit();

      return userId;

    } catch (err) {

      await conn.rollback();

      throw err;

    } finally {

      conn.release();

    }
  },


  async update(
    id: number,
    dto: UpdateBlogueurDto
  ): Promise<boolean> {

    const conn = await pool.getConnection();

    try {

      await conn.beginTransaction();


      // =========================================================
      // MISE À JOUR UTILISATEUR
      // =========================================================

      const userFields: Record<string, unknown> = {};

      if (dto.telephone !== undefined) {
        userFields.telephone = dto.telephone;
      }

      if (dto.photo_url !== undefined) {
        userFields.photo_url = dto.photo_url;
      }


      if (Object.keys(userFields).length > 0) {

        const sets = Object.keys(userFields)
          .map(k => `${k} = ?`)
          .join(', ');

        const sql = `
          UPDATE utilisateurs
          SET ${sets}
          WHERE id = ?
        `;

        const vals = [
          ...Object.values(userFields),
          id
        ] as (string | number | null)[];

        await conn.execute(sql, vals);
      }


      // =========================================================
      // MISE À JOUR PROFIL
      // =========================================================

      const profilFields: Record<string, unknown> = {};

      if (dto.date_naissance !== undefined) {
        profilFields.date_naissance = dto.date_naissance;
      }

      if (dto.sexe !== undefined) {
        profilFields.sexe = dto.sexe;
      }

      if (dto.bio !== undefined) {
        profilFields.bio = dto.bio;
      }

      if (dto.niveau_scolaire !== undefined) {
        profilFields.niveau_scolaire = dto.niveau_scolaire;
      }

      if (dto.etablissement !== undefined) {
        profilFields.etablissement = dto.etablissement;
      }

      if (dto.langue_ecriture !== undefined) {
        profilFields.langue_ecriture = dto.langue_ecriture;
      }

      if (dto.motivation !== undefined) {
        profilFields.motivation = dto.motivation;
      }

      // IMPORTANT :
      // numero_urgence est dans profils_blogueurs
      if (dto.numero_urgence !== undefined) {
        profilFields.numero_urgence = dto.numero_urgence;
      }


      if (Object.keys(profilFields).length > 0) {

        const sets = Object.keys(profilFields)
          .map(k => `${k} = ?`)
          .join(', ');

        const sql = `
          UPDATE profils_blogueurs
          SET ${sets}
          WHERE utilisateur_id = ?
        `;

        const vals = [
          ...Object.values(profilFields),
          id
        ] as (string | number | null)[];

        await conn.execute(sql, vals);
      }


      // =========================================================
      // MISE À JOUR DES THÉMATIQUES
      // =========================================================

      if (dto.thematique_ids) {

        await conn.execute(
          `
          DELETE FROM blogueur_thematiques
          WHERE blogueur_id = ?
          `,
          [id]
        );

        for (const tid of dto.thematique_ids.slice(0, 3)) {

          await conn.execute(
            `
            INSERT INTO blogueur_thematiques (
              blogueur_id,
              thematique_id
            )
            VALUES (?, ?)
            `,
            [id, tid]
          );

        }
      }


      await conn.commit();

      return true;

    } catch (err) {

      await conn.rollback();

      throw err;

    } finally {

      conn.release();

    }
  },


  async updateStatut(
    id: number,
    statut: StatutBlogueur
  ): Promise<boolean> {

    const [result] = await pool.execute<ResultSetHeader>(
      `
      UPDATE profils_blogueurs
      SET statut = ?
      WHERE utilisateur_id = ?
      `,
      [statut, id]
    );

    return result.affectedRows > 0;
  },


  async incrementPublications(
    id: number
  ): Promise<void> {

    await pool.execute(
      `
      UPDATE profils_blogueurs
      SET nb_publications = nb_publications + 1
      WHERE utilisateur_id = ?
      `,
      [id]
    );
  },


  async emailExists(
    email: string
  ): Promise<boolean> {

    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT id
      FROM utilisateurs
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    return rows.length > 0;
  },

};
