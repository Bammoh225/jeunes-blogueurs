export interface Publication {
  id:                  number;
  auteur_id:           number;
  categorie_id:        number;
  thematique_id:       number;
  titre:               string;
  lien:                string;
  description?:        string | null;
  date_publication:    Date;
  blog_nb_mots?:       number | null;
  vlog_plateforme?:    string | null;
  vlog_duree_minutes?: number | null;
  podcast_plateforme?: string | null;
  podcast_duree_min?:  number | null;
  podcast_invites?:    string | null;
  bd_nb_planches?:     number | null;
  bd_outil?:           string | null;
  soumis_le?:          Date;

  // Jointures
  auteur_prenom?:       string;
  auteur_nom?:          string;
  categorie_nom?:       string;
  thematique_nom?:      string;
  thematique_couleur?:  string;
  nb_evaluations?:      number;
}

export interface PublicationResume {
  id:                  number;
  titre:               string;
  lien:                string;
  date_publication:    Date;
  soumis_le?:          Date;
  auteur_prenom?:      string;
  auteur_nom?:         string;
  categorie_nom?:      string;
  thematique_nom?:     string;
  thematique_couleur?: string;
  nb_evaluations?:     number;
}

export interface CreatePublicationDto {
  categorie_id:        number;
  thematique_id:       number;
  titre:               string;
  lien:                string;
  description?:        string | null;
  date_publication:    Date;
  blog_nb_mots?:       number | null;
  vlog_plateforme?:    string | null;
  vlog_duree_minutes?: number | null;
  podcast_plateforme?: string | null;
  podcast_duree_min?:  number | null;
  podcast_invites?:    string | null;
  bd_nb_planches?:     number | null;
  bd_outil?:           string | null;
}

export interface UpdatePublicationDto {
  categorie_id?:       number;
  thematique_id?:      number;
  titre?:              string;
  lien?:               string;
  description?:        string | null;
  date_publication?:   Date;
  blog_nb_mots?:       number | null;
  vlog_plateforme?:    string | null;
  vlog_duree_minutes?: number | null;
  podcast_plateforme?: string | null;
  podcast_duree_min?:  number | null;
  podcast_invites?:    string | null;
  bd_nb_planches?:     number | null;
  bd_outil?:           string | null;
}