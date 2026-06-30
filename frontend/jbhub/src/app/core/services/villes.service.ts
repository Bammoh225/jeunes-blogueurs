import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';

export interface Ville {
  id: number;
  nom: string;
}

export interface Categorie {
  id: number;
  nom: string;
}

export interface Thematique {
  id: number;
  nom: string;
  categorie_id: number;
}

@Injectable({ providedIn: 'root' })
export class VillesService {
  private http = inject(HttpClient);

  lister() {
    return this.http.get<ApiResponse<Ville[]>>(`${environment.apiUrl}/villes`);
  }
}
