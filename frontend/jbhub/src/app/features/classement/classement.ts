import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-classement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './classement.html',
  styleUrl: './classement.scss'
})
export class Classement implements OnInit {
  http = inject(HttpClient);
  exportSvc = inject(ExportService);
  auth = inject(AuthService);
  
  isStaff = this.auth.hasRole(
    'responsable_unicef', 'responsable_technique', 'responsable_national',
    'responsable_zone', 'responsable_categorie', 'equipe_com'
  );
  
  classement = signal<any[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.chargerClassement();
  }

  chargerClassement() {
    this.loading.set(true);
    this.error.set('');
    
    this.http.get<any>(`${environment.apiUrl}/blogueurs/classement`).subscribe({
      next: (res) => {
        this.classement.set(res.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement classement', err);
        this.error.set('Impossible de charger le classement.');
        this.loading.set(false);
      }
    });
  }

  exporterPDF() {
    const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const colonnes = ['Rang', 'Prénom & Nom', 'Ville', 'Publications', 'Activités', 'Score'];
    const lignes = this.classement().map((b, index) => [
      index + 1,
      `${b.prenom} ${b.nom}`,
      b.ville_nom ?? '-',
      b.nb_publications ?? 0,
      b.nb_activites ?? 0,
      b.score ?? 0
    ]);
    this.exportSvc.exportPDF(
      `Classement Jeunes Blogueurs — ${mois}`,
      colonnes, lignes,
      `classement_${mois.replace(' ', '_')}`
    );
  }

  exporterExcel() {
    const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const colonnes = ['Rang', 'Prénom', 'Nom', 'Ville', 'Publications', 'Activités', 'Score'];
    const lignes = this.classement().map((b, index) => [
      index + 1,
      b.prenom,
      b.nom,
      b.ville_nom ?? '-',
      b.nb_publications ?? 0,
      b.nb_activites ?? 0,
      b.score ?? 0
    ]);
    this.exportSvc.exportExcel(colonnes, lignes, `classement_${mois.replace(' ', '_')}`);
  }
}
