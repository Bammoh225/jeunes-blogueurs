import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';

export type TypeDistribution = 'perdiem' | 'gadget' | 'materiel' | 'autre';

export interface Distribution {
  id:                 number;
  responsable_id:     number;
  type:               TypeDistribution;
  libelle:            string;
  description?:       string | null;
  montant?:           number | null;
  date_distribution:  Date;
  cree_le?:           Date;
  responsable_prenom?: string;
  responsable_nom?:   string;
  nb_beneficiaires?:  number;
  nb_recus?:          number;
}

export interface Beneficiaire {
  id:     number;
  prenom: string;
  nom:    string;
  email:  string;
  recu:   boolean;
}

export interface CreateDistributionDto {
  type:               TypeDistribution;
  libelle:            string;
  description?:       string | null;
  montant?:           number | null;
  date_distribution:  string;
  beneficiaire_ids:   number[];
}

@Injectable({ providedIn: 'root' })
export class DistributionsService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/distributions`;

  lister() {
    return this.http.get<ApiResponse<Distribution[]>>(this.api);
  }

  trouver(id: number) {
    return this.http.get<ApiResponse<Distribution>>(`${this.api}/${id}`);
  }

  listerBeneficiaires(id: number) {
    return this.http.get<ApiResponse<Beneficiaire[]>>(`${this.api}/${id}/beneficiaires`);
  }

  creer(dto: CreateDistributionDto) {
    return this.http.post<ApiResponse<Distribution>>(this.api, dto);
  }

  marquerRecu(distributionId: number, userId: number, recu: boolean) {
    return this.http.patch<ApiResponse<null>>(
      `${this.api}/${distributionId}/beneficiaires/recu`,
      { utilisateur_id: userId, recu }
    );
  }

  supprimer(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.api}/${id}`);
  }
}
