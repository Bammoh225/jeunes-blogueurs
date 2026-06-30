export type Role =
  | 'responsable_unicef'
  | 'responsable_technique'
  | 'responsable_national'
  | 'responsable_zone'
  | 'responsable_categorie'
  | 'equipe_com'
  | 'jeune_blogueur';

export type StatutBlogueur = 'en_attente' | 'actif' | 'inactif' | 'suspendu';
export type StatutPublication = 'brouillon' | 'soumis' | 'publie';
export type TypeActivite = 'terrain' | 'en_ligne' | 'mixte';
export type StatutActivite = 'planifie' | 'en_cours' | 'termine' | 'annule';
export type TypeNotification =
  | 'nouvelle_inscription'
  | 'nouvelle_publication'
  | 'publication_evaluee'
  | 'nouvelle_activite'
  | 'rappel_activite';

export interface JwtPayload {
  id:            number;
  email:         string;
  prenom:        string;
  nom:           string;
  role:          Role;
  ville_id?:     number | null;
  categorie_id?: number | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?:    T;
  errors?:  string[];
}

export interface PaginationQuery {
  page:  number;
  limit: number;
}

export interface PaginatedResult<T> {
  items:       T[];
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
}
