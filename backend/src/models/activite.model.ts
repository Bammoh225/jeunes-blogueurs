export type TypeActivite = 'atelier' | 'formation' | 'evenement' | 'autre';
export type StatutActivite = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
export type VisibiliteActivite = 'ville' | 'designee';

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
  capacite_max?:        number | null;
  visibilite:           VisibiliteActivite;
  token_partage:        string;
  statut?:              StatutActivite;
  rapport?:             string | null;
  nb_participants?:     number;
  organisateur_prenom?: string;
  organisateur_nom?:    string;
  ville_nom?:           string;
}

export interface CreateActiviteDto {
  ville_id:        number;
  titre:           string;
  description?:    string | null;
  type:            TypeActivite;
  date_debut:      Date;
  date_fin?:       Date | null;
  lieu?:           string | null;
  capacite_max?:   number | null;
  visibilite?:     VisibiliteActivite;
  participant_ids?: number[]; // requis si visibilite = 'designee'
}

export interface UpdateActiviteDto {
  titre?:        string;
  description?:  string | null;
  type?:         TypeActivite;
  date_debut?:   Date;
  date_fin?:     Date | null;
  lieu?:         string | null;
  capacite_max?: number | null;
  statut?:       StatutActivite;
  rapport?:      string | null;
}