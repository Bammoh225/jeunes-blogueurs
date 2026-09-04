import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Publication, PublicationResume, CreatePublicationDto } from '../models/publication.model';

@Injectable({ providedIn: 'root' })
export class PublicationsService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/publications`;

  lister(filtres?: {
    auteur_id?: number; categorie_id?: number; thematique_id?: number;
    page?: number; limit?: number; recherche?: string; tri?: string;
  }) {
    let params: any = {};
    if (filtres?.auteur_id)     params['auteur_id']     = filtres.auteur_id;
    if (filtres?.categorie_id)  params['categorie_id']  = filtres.categorie_id;
    if (filtres?.thematique_id) params['thematique_id'] = filtres.thematique_id;
    if (filtres?.page)          params['page']          = filtres.page;
    if (filtres?.limit)         params['limit']         = filtres.limit;
    if (filtres?.recherche)     params['recherche']     = filtres.recherche;
    if (filtres?.tri)           params['tri']           = filtres.tri;
    return this.http.get<ApiResponse<PublicationResume[]>>(this.api, { params });
  }

  trouver(id: number) {
    return this.http.get<ApiResponse<Publication>>(`${this.api}/${id}`);
  }

  soumettre(dto: CreatePublicationDto) {
    return this.http.post<ApiResponse<Publication>>(this.api, dto);
  }

  modifier(id: number, dto: Partial<CreatePublicationDto>) {
    return this.http.patch<ApiResponse<Publication>>(`${this.api}/${id}`, dto);
  }

  supprimer(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.api}/${id}`);
  }
}