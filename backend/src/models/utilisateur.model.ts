import { Role } from '../types';

export interface Utilisateur {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  mot_de_passe: string;
  role: Role;
  telephone?: string;
  ville_id?: number | null;
  categorie_id?: number | null;
  cree_le: Date;
  mis_a_jour_le: Date;
}

export type UtilisateurSansMdp = Omit<Utilisateur, 'mot_de_passe'>;

export type UtilisateurPublic = Omit<Utilisateur, 'mot_de_passe'> & {
  ville_nom?: string | null;
  categorie_nom?: string | null;
  photo_url?: string | null;
  actif?: boolean;
};

export interface CreateUtilisateurDto {
  prenom: string;
  nom: string;
  email: string;
  mot_de_passe: string;
  role?: Role;
  telephone?: string;
  ville_id?: number | null;
  categorie_id?: number | null;
}

export interface UpdateUtilisateurDto {
  prenom?: string;
  nom?: string;
  email?: string;
  mot_de_passe?: string;
  role?: Role;
  telephone?: string;
  ville_id?: number | null;
  categorie_id?: number | null;
}