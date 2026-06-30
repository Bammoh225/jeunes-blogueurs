export type TypeDistribution = 'perdiem' | 'gadget' | 'materiel' | 'autre';

export interface Distribution {
  id:                number;
  responsable_id:    number;
  type:              TypeDistribution;
  libelle:           string;
  description?:      string | null;
  montant?:          number | null;
  date_distribution: Date;
  cree_le?:          Date;

  // Jointures
  responsable_prenom?: string;
  responsable_nom?:    string;
  nb_beneficiaires?:   number;
  nb_recus?:           number;
}

export interface Beneficiaire {
  id:      number;
  prenom:  string;
  nom:     string;
  email:   string;
  recu:    boolean;
}

export interface CreateDistributionDto {
  type:               TypeDistribution;
  libelle:            string;
  description?:       string | null;
  montant?:           number | null;
  date_distribution:  string;
  beneficiaire_ids:   number[];
}

export interface UpdateDistributionDto {
  type?:              TypeDistribution;
  libelle?:           string;
  description?:       string | null;
  montant?:           number | null;
  date_distribution?: string;
}
