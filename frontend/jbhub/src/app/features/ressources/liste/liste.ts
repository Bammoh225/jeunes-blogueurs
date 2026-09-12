import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RessourcesService, Ressource } from '../../../core/services/ressources.service';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-ressources-liste',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './liste.html',
  styleUrl: './liste.scss'
})
export class Liste implements OnInit {
  ressourcesSvc = inject(RessourcesService);
  auth = inject(AuthService);
  exportSvc = inject(ExportService);

  ressources = signal<Ressource[]>([]);
  loading = signal(true);

  isAdmin = this.auth.hasRole('responsable_unicef', 'responsable_technique');
  isStaff = this.auth.hasRole(
    'responsable_unicef', 'responsable_technique', 'responsable_national',
    'responsable_zone', 'responsable_categorie', 'equipe_com'
  );

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.loading.set(true);
    this.ressourcesSvc.lister().subscribe({
      next: (res: any) => {
        this.ressources.set(res.data || []);
        this.loading.set(false);
      },
      error: (e: any) => {
        console.error(e);
        window.alert('Erreur de chargement');
        this.loading.set(false);
      }
    });
  }

  supprimer(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette ressource ?')) return;

    this.ressourcesSvc.supprimer(id).subscribe({
      next: () => {
        this.charger();
      },
      error: (e: any) => {
        console.error(e);
        window.alert('Impossible de supprimer la ressource');
      }
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'document': return '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>';
      case 'video': return '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>';
      case 'lien':
      default: return '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>';
    }
  }

  exporterPDF() {
    const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const colonnes = ['Titre', 'Type', 'Description', 'Lien', 'Date'];
    const lignes = this.ressources().map(r => [
      r.titre,
      r.type.charAt(0).toUpperCase() + r.type.slice(1),
      r.description ?? '-',
      r.url,
      r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '-'
    ]);
    this.exportSvc.exportPDF(
      `Rapport Ressources — ${mois}`,
      colonnes, lignes,
      `ressources_${mois.replace(' ', '_')}`
    );
  }

  exporterExcel() {
    const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const colonnes = ['Titre', 'Type', 'Description', 'Lien', 'Date'];
    const lignes = this.ressources().map(r => [
      r.titre,
      r.type.charAt(0).toUpperCase() + r.type.slice(1),
      r.description ?? '-',
      r.url,
      r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '-'
    ]);
    this.exportSvc.exportExcel(colonnes, lignes, `ressources_${mois.replace(' ', '_')}`);
  }
}
