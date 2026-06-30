import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Activite, CreateActiviteDto, UpdateActiviteDto } from '../models/activite.model';

export interface Participant {
  id:         number;
  prenom:     string;
  nom:        string;
  email:      string;
  telephone?: string;
  present:    boolean;
}

@Injectable({ providedIn: 'root' })
export class ActivitesService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/activites`;

  lister(ville_id?: number) {
    const params: any = {};
    if (ville_id) params['ville_id'] = ville_id;
    return this.http.get<ApiResponse<Activite[]>>(this.api, { params });
  }

  trouver(id: number) {
    return this.http.get<ApiResponse<Activite>>(`${this.api}/${id}`);
  }

  listerParticipants(id: number) {
    return this.http.get<ApiResponse<Participant[]>>(`${this.api}/${id}/participants`);
  }

  creer(dto: CreateActiviteDto) {
    return this.http.post<ApiResponse<Activite>>(this.api, dto);
  }

  modifier(id: number, dto: UpdateActiviteDto) {
    return this.http.patch<ApiResponse<Activite>>(`${this.api}/${id}`, dto);
  }

  ajouterParticipant(activiteId: number, userId: number) {
    return this.http.post<ApiResponse<null>>(
      `${this.api}/${activiteId}/participants`,
      { utilisateur_id: userId }
    );
  }

  marquerPresence(activiteId: number, userId: number, present: boolean) {
    return this.http.patch<ApiResponse<null>>(
      `${this.api}/${activiteId}/participants/presence`,
      { utilisateur_id: userId, present }
    );
  }
}
