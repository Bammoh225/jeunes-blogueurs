export type StatutBlogueur = 'en_attente' | 'actif' | 'suspendu' | 'inactif';

export interface BlogueurResume {
  id:              number;
  prenom:          string;
  nom:             string;
  email:           string;
  telephone?:      string;
  numero_urgence?: string | null;
  photo_url?:      string | null;
  statut:          StatutBlogueur;
  nb_publications?: number;
  ville_nom?:      string | null;
  categorie_nom?:  string | null;
  thematiques?:    string[];
  created_at?:     Date;
}

export interface Blogueur extends BlogueurResume {
  telephone?:      string;
  numero_urgence?: string | null;
  ville_id?:       number | null;
  categorie_id?:   number | null;
  date_naissance?: Date;
  sexe?:           'M' | 'F';
  bio?:            string;
  niveau_scolaire?: string;
  etablissement?:  string;
  langue_ecriture?: string;
  motivation?:     string;
  lien_portfolio?: string;
}
