export interface LoginDto {
  email: string;
  mot_de_passe: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: Role;
  ville_id?: number | null;
  categorie_id?: number | null;
}

export interface AuthResponse {
  token: string;
  utilisateur: JwtPayload;
}

export type Role =
  | 'responsable_unicef'
  | 'responsable_technique'
  | 'responsable_national'
  | 'responsable_zone'
  | 'responsable_categorie'
  | 'equipe_com'
  | 'jeune_blogueur';

export const ROLES_STAFF: Role[] = [
  'responsable_unicef',
  'responsable_technique',
  'responsable_national',
  'responsable_zone',
  'responsable_categorie',
  'equipe_com',
];

export const ROLES_ADMIN: Role[] = [
  'responsable_unicef',
  'responsable_technique',
];
