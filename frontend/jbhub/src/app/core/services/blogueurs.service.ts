import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Blogueur, BlogueurResume, StatutBlogueur } from '../models/blogueur.model';

@Injectable({ providedIn: 'root' })
export class BlogueursService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/blogueurs`;

  lister(filtres?: { statut?: string; ville_id?: number; categorie_id?: number }) {
    let params: any = {};
    if (filtres?.statut)       params['statut']       = filtres.statut;
    if (filtres?.ville_id)     params['ville_id']     = filtres.ville_id;
    if (filtres?.categorie_id) params['categorie_id'] = filtres.categorie_id;
    return this.http.get<ApiResponse<BlogueurResume[]>>(this.api, { params });
  }

  trouver(id: number) {
    return this.http.get<ApiResponse<Blogueur>>(`${this.api}/${id}`);
  }

  inscrire(dto: any) {
    return this.http.post<ApiResponse<Blogueur>>(this.api, dto);
  }

  changerStatut(id: number, statut: StatutBlogueur) {
    return this.http.patch<ApiResponse<Blogueur>>(`${this.api}/${id}/statut`, { statut });
  }

  modifier(id: number, dto: Partial<Blogueur>) {
    return this.http.patch<ApiResponse<Blogueur>>(`${this.api}/${id}`, dto);
  }
}
