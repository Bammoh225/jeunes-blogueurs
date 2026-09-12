import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Ressource {
  id: number;
  titre: string;
  description?: string;
  type: 'document' | 'video' | 'lien';
  url: string;
  createur_prenom?: string;
  createur_nom?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class RessourcesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ressources`;

  lister(): Observable<{ success: boolean; data: Ressource[] }> {
    return this.http.get<{ success: boolean; data: Ressource[] }>(this.apiUrl);
  }

  creer(data: Partial<Ressource>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
