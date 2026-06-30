import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Utilisateur, CreateUtilisateurDto } from '../models/utilisateur.model';

@Injectable({ providedIn: 'root' })
export class UtilisateursService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/utilisateurs`;

  lister() {
    return this.http.get<ApiResponse<Utilisateur[]>>(this.api);
  }

  trouver(id: number) {
    return this.http.get<ApiResponse<Utilisateur>>(`${this.api}/${id}`);
  }

  creer(dto: CreateUtilisateurDto) {
    return this.http.post<ApiResponse<Utilisateur>>(this.api, dto);
  }

  modifier(id: number, dto: Partial<CreateUtilisateurDto>) {
    return this.http.patch<ApiResponse<Utilisateur>>(`${this.api}/${id}`, dto);
  }

  desactiver(id: number) {
    return this.http.delete<ApiResponse<null>>(`${this.api}/${id}`);
  }
}
