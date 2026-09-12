export interface Ressource {
  id: number;
  titre: string;
  description?: string;
  type: 'document' | 'video' | 'lien';
  url: string;
  createur_id?: number;
  created_at: Date;
}

export interface CreateRessourceDto {
  titre: string;
  description?: string;
  type: 'document' | 'video' | 'lien';
  url: string;
  createur_id?: number;
}
