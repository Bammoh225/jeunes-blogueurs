import { StatutBlogueur } from '../types';

export interface Blogueur {

  // =========================================================
  // Depuis utilisateurs
  // =========================================================

  id: number;

  prenom: string;

  nom: string;

  email: string;

  telephone?: string;

  photo_url?: string | null;

  ville_id?: number | null;

  categorie_id?: number | null;

  actif?: boolean;


  // =========================================================
  // Depuis profils_blogueurs
  // =========================================================

  date_naissance: Date;

  sexe?: 'M' | 'F';

  bio?: string;

  niveau_scolaire?: string;

  etablissement?: string;

  experience?: string;

  langue_ecriture?: string;

  motivation?: string;

  numero_urgence: string;

  statut: StatutBlogueur;

  nb_publications?: number;

  lien_portfolio?: string;

  presentation?: string;

  date_inscription?: Date;


  // =========================================================
  // Jointures
  // =========================================================

  ville_nom?: string | null;

  categorie_nom?: string | null;

  thematiques?: string[];

}


export interface BlogueurResume {

  id: number;

  prenom: string;

  nom: string;

  email: string;

  telephone?: string;

  numero_urgence?: string | null;

  photo_url?: string | null;

  statut: StatutBlogueur;

  nb_publications?: number;

  ville_nom?: string | null;

  categorie_nom?: string | null;

  thematiques?: string[];

  created_at?: Date;

}


export interface CreateBlogueurDto {

  // =========================================================
  // Partie utilisateurs
  // =========================================================

  prenom: string;

  nom: string;

  email: string;

  mot_de_passe: string;

  telephone?: string;

  /*
   * OBLIGATOIRE
   * Correspond à profils_blogueurs.numero_urgence
   */
  numero_urgence: string;

  ville_id?: number | null;

  categorie_id?: number | null;


  // =========================================================
  // Partie profils_blogueurs
  // =========================================================

  date_naissance: Date;

  sexe: 'M' | 'F';

  bio?: string;

  niveau_scolaire?: string;

  etablissement?: string;

  experience?: string;

  langue_ecriture: string;

  motivation?: string;

  lien_portfolio?: string;

  presentation?: string;


  // =========================================================
  // Thématiques
  // =========================================================

  thematique_ids: number[];

}


export interface UpdateBlogueurDto {

  // =========================================================
  // Partie utilisateurs
  // =========================================================

  prenom?: string;

  nom?: string;

  email?: string;

  mot_de_passe?: string;

  telephone?: string;

  photo_url?: string | null;

  ville_id?: number | null;

  categorie_id?: number | null;


  // =========================================================
  // Partie profils_blogueurs
  // =========================================================

  date_naissance?: Date;

  sexe?: 'M' | 'F';

  statut?: StatutBlogueur;

  bio?: string;

  niveau_scolaire?: string;

  etablissement?: string;

  experience?: string;

  langue_ecriture?: string;

  motivation?: string;

  numero_urgence?: string;

  lien_portfolio?: string;

  presentation?: string;




  thematique_ids?: number[];

}