export interface Evaluation {
  id:                  number;
  publication_id:      number;
  evaluateur_id:       number;
  retenu_reseaux:      boolean;
  commentaire?:        string | null;
  reseau_utilise?:     string | null;
  date_utilisation?:   Date | null;
  evalue_le?:          Date;

  // Jointures
  evaluateur_prenom?:  string;
  evaluateur_nom?:     string;
  publication_titre?:  string;
}

export interface CreateEvaluationDto {
  publication_id:      number;
  retenu_reseaux:      boolean;
  commentaire?:        string | null;
  reseau_utilise?:     string | null;
  date_utilisation?:   Date | null;
}