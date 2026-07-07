import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  id:    number;
  titre: string;
  type:  'blogueur' | 'publication' | 'activite';
  route: string;
  meta?: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private api  = environment.apiUrl;

  rechercher(query: string, isStaff: boolean) {
    const q = query.toLowerCase();

    const blogueurs$ = isStaff
      ? this.http.get<any>(`${this.api}/blogueurs`).pipe(
          map(r => (r.data ?? [])
            .filter((b: any) =>
              `${b.prenom} ${b.nom}`.toLowerCase().includes(q) ||
              b.email?.toLowerCase().includes(q)
            )
            .slice(0, 5)
            .map((b: any) => ({
              id: b.id,
              titre: `${b.prenom} ${b.nom}`,
              type: 'blogueur' as const,
              route: `/blogueurs/${b.id}`,
              meta: b.ville_nom ?? b.email,
            }))),
          catchError(() => of([]))
        )
      : of([]);

    const publications$ = this.http.get<any>(`${this.api}/publications`).pipe(
      map(r => (r.data ?? [])
        .filter((p: any) => p.titre?.toLowerCase().includes(q))
        .slice(0, 5)
        .map((p: any) => ({
          id: p.id,
          titre: p.titre,
          type: 'publication' as const,
          route: `/publications/${p.id}`,
          meta: `${p.auteur_prenom} ${p.auteur_nom}`,
        }))),
      catchError(() => of([]))
    );

    const activites$ = this.http.get<any>(`${this.api}/activites`).pipe(
      map(r => (r.data ?? [])
        .filter((a: any) => a.titre?.toLowerCase().includes(q))
        .slice(0, 5)
        .map((a: any) => ({
          id: a.id,
          titre: a.titre,
          type: 'activite' as const,
          route: `/activites/${a.id}`,
          meta: a.ville_nom,
        }))),
      catchError(() => of([]))
    );

    return forkJoin([blogueurs$, publications$, activites$]).pipe(
      map(([b, p, a]) => [...b, ...p, ...a] as SearchResult[])
    );
  }
}
