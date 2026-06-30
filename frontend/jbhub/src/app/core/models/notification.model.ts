export type TypeNotification =
  | 'nouvelle_inscription'
  | 'nouvelle_publication'
  | 'nouvelle_activite'
  | 'publication_evaluee'
  | 'inscription'
  | 'validation'
  | 'rejet'
  | 'commentaire'
  | 'like'
  | 'publication'
  | 'systeme';

export interface Notification {
  id:              number;
  destinataire_id: number;
  type:            TypeNotification;
  message:         string;
  lien?:           string | null;
  lu:              boolean;
  created_at:      Date;
}
