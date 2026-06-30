export interface PublicationResume {
  auteur_id?:          number;
  id:                  number;
  titre:               string;
  lien:                string;
  date_publication?:   Date;
  soumis_le?:          Date;
  auteur_prenom?:      string;
  auteur_nom?:         string;
  categorie_nom?:      string;
  thematique_nom?:     string;
  thematique_couleur?: string;
  nb_evaluations?:     number;
}

export interface Publication extends PublicationResume {
  auteur_id:           number;
  categorie_id:        number;
  thematique_id:       number;
  description?:        string | null;
  blog_nb_mots?:       number | null;
  vlog_plateforme?:    string | null;
  vlog_duree_minutes?: number | null;
  podcast_plateforme?: string | null;
  podcast_duree_min?:  number | null;
  podcast_invites?:    string | null;
  bd_nb_planches?:     number | null;
  bd_outil?:           string | null;
}

export interface CreatePublicationDto {
  categorie_id:        number;
  thematique_id:       number;
  titre:               string;
  lien:                string;
  description?:        string | null;
  date_publication:    string;
  blog_nb_mots?:       number | null;
  vlog_plateforme?:    string | null;
  vlog_duree_minutes?: number | null;
  podcast_plateforme?: string | null;
  podcast_duree_min?:  number | null;
  podcast_invites?:    string | null;
  bd_nb_planches?:     number | null;
  bd_outil?:           string | null;
}
