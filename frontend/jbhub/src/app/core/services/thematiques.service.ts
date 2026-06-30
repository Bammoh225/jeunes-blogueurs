import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';

export interface Thematique {
  id:           number;
  nom:          string;
  categorie_id: number;
  couleur?:     string;
}

@Injectable({ providedIn: 'root' })
export class ThematiquesService {
  private http = inject(HttpClient);

  lister() {
    return this.http.get<ApiResponse<Thematique[]>>(`${environment.apiUrl}/thematiques`);
  }

  parCategorie(categorieId: number) {
    return this.http.get<ApiResponse<Thematique[]>>(
      `${environment.apiUrl}/thematiques?categorie_id=${categorieId}`
    );
  }
}
