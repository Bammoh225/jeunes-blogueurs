import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
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
  
  // Charts Staff
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: { min: 0 }
    },
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };
  public barChartType: ChartType = 'bar';

  public pubChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public villeChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  showCharts = signal(false);

  // Stats blogueur
  mesPublications = signal<any[]>([]);
  activitesDispo  = signal<any[]>([]);

  ngOnInit() {
    if (this.isBlogueur) {
      this.chargerBlogueur();
    } else {
      this.chargerStaff();
      this.chargerCharts();
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

  chargerCharts() {
    this.http.get<any>(`${environment.apiUrl}/stats/charts`).subscribe({
      next: r => {
        const d = r.data;
        if (d) {
          const pubLabels = d.publicationsParMois.map((x: any) => x.mois);
          const pubTotals = d.publicationsParMois.map((x: any) => x.total);
          this.pubChartData = {
            labels: pubLabels,
            datasets: [ { data: pubTotals, label: 'Publications', backgroundColor: '#0ea5e9' } ]
          };

          const villeLabels = d.blogueursParVille.map((x: any) => x.ville);
          const villeTotals = d.blogueursParVille.map((x: any) => x.total);
          this.villeChartData = {
            labels: villeLabels,
            datasets: [ { data: villeTotals, label: 'Blogueurs par Ville', backgroundColor: '#10b981' } ]
          };

          this.showCharts.set(true);
        }
      }
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
