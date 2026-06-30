export type TypeActivite = 'atelier' | 'formation' | 'evenement' | 'autre';
export type StatutActivite = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';

export interface Activite {
  id:                   number;
  organisateur_id:      number;
  ville_id:             number;
  titre:                string;
  description?:         string | null;
  type:                 TypeActivite;
  date_debut:           Date;
  date_fin?:            Date | null;
  lieu?:                string | null;
  statut?:              StatutActivite;
  rapport?:             string | null;
  nb_participants?:     number;
  organisateur_prenom?: string;
  organisateur_nom?:    string;
  ville_nom?:           string;
}

export interface CreateActiviteDto {
  ville_id:     number;
  titre:        string;
  description?: string | null;
  type:         TypeActivite;
  date_debut:   string;
  date_fin?:    string | null;
  lieu?:        string | null;
}

export interface UpdateActiviteDto {
  titre?:       string;
  description?: string | null;
  type?:        TypeActivite;
  date_debut?:  string;
  date_fin?:    string | null;
  lieu?:        string | null;
  statut?:      StatutActivite;
  rapport?:     string | null;
}
