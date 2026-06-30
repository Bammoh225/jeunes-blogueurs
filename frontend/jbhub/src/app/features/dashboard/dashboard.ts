import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  auth = inject(AuthService);
  http = inject(HttpClient);

  user       = this.auth.currentUser;
  loading    = signal(true);
  today      = new Date();

  isBlogueur = this.auth.hasRole('jeune_blogueur');

  // Stats staff
  stats = signal({ blogueurs: 0, publications: 0, activites: 0, notifications: 0 });

  // Stats blogueur
  mesPublications = signal<any[]>([]);
  activitesDispo  = signal<any[]>([]);

  ngOnInit() {
    if (this.isBlogueur) {
      this.chargerBlogueur();
    } else {
      this.chargerStaff();
    }
  }

  chargerStaff() {
    const api = environment.apiUrl;
    let loaded = 0;
    const done = () => { loaded++; if (loaded === 4) this.loading.set(false); };

    this.http.get<any>(`${api}/blogueurs`).subscribe({
      next: r => { this.stats.update(s => ({ ...s, blogueurs: r.data?.length ?? 0 })); done(); },
      error: () => done()
    });
    this.http.get<any>(`${api}/publications`).subscribe({
      next: r => { this.stats.update(s => ({ ...s, publications: r.data?.length ?? 0 })); done(); },
      error: () => done()
    });
    this.http.get<any>(`${api}/activites`).subscribe({
      next: r => { this.stats.update(s => ({ ...s, activites: r.data?.length ?? 0 })); done(); },
      error: () => done()
    });
    this.http.get<any>(`${api}/notifications/non-lus`).subscribe({
      next: r => { this.stats.update(s => ({ ...s, notifications: r.data?.total ?? 0 })); done(); },
      error: () => done()
    });
  }

  chargerBlogueur() {
    const api = environment.apiUrl;
    let loaded = 0;
    const done = () => { loaded++; if (loaded === 2) this.loading.set(false); };

    this.http.get<any>(`${api}/publications`).subscribe({
      next: r => { this.mesPublications.set(r.data?.slice(0, 5) ?? []); done(); },
      error: () => done()
    });
    this.http.get<any>(`${api}/activites`).subscribe({
      next: r => {
        const dispo = r.data?.filter((a: any) => a.statut === 'planifiee') ?? [];
        this.activitesDispo.set(dispo.slice(0, 4));
        done();
      },
      error: () => done()
    });
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      'responsable_unicef':    'Responsable UNICEF',
      'responsable_technique': 'Responsable Technique',
      'responsable_national':  'Responsable National',
      'responsable_zone':      'Responsable de Zone',
      'responsable_categorie': 'Responsable Catégorie',
      'equipe_com':            'Équipe Communication',
      'jeune_blogueur':        'Jeune Blogueur',
    };
    return labels[this.user()?.role ?? ''] ?? this.user()?.role ?? '';
  }
}
