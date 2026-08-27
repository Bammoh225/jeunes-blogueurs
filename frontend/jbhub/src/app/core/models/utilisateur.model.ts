export type Role =
  | 'responsable_unicef'
  | 'responsable_technique'
  | 'responsable_national'
  | 'responsable_zone'
  | 'responsable_categorie'
  | 'equipe_com'
  | 'jeune_blogueur';

export interface Utilisateur {
  id:           number;
  prenom:       string;
  nom:          string;
  email:        string;
  role:         Role;
  telephone?:   string;
  numero_urgence?: string;
  photo_url?:   string | null;
  ville_id?:    number | null;
  ville_nom?:   string | null;
  categorie_id?: number | null;
  categorie_nom?: string | null;
  actif:        boolean;
  created_at?:  Date;
}

export interface CreateUtilisateurDto {
  prenom:       string;
  nom:          string;
  email:        string;
  mot_de_passe: string;
  role:         Role;
  telephone?:   string;
  numero_urgence?: string;
  ville_id?:    number | null;
  categorie_id?: number | null;
}
