import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogueursService } from '../../../core/services/blogueurs.service';
import { PublicationsService } from '../../../core/services/publications.service';
import { BlogueurResume } from '../../../core/models/blogueur.model';
import { VillesService, Ville } from '../../../core/services/villes.service';
import { ExportService } from '../../../core/services/export.service';

interface BlogueurAvecStatut extends BlogueurResume {
  aPublieMois: boolean;
}

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './liste.html',
  styleUrl: './liste.scss'
})
export class Liste implements OnInit {
  private service     = inject(BlogueursService);
  private villesSvc   = inject(VillesService);
  private pubService  = inject(PublicationsService);
  private exportSvc   = inject(ExportService);

  blogueurs = signal<BlogueurAvecStatut[]>([]);
  villes    = signal<Ville[]>([]);
  loading   = signal(true);
  erreur    = signal('');

  filtreStatut    = '';
  filtreVille     = '';
  filtreSuivi     = '';
  recherche       = '';
  tri             = 'recent';

  statuts: { value: string; label: string }[] = [
    { value: '',           label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'actif',      label: 'Actif' },
    { value: 'suspendu',   label: 'Suspendu' },
    { value: 'inactif',    label: 'Inactif' },
  ];

  ngOnInit() {
    this.charger();
    this.villesSvc.lister().subscribe({
      next: r => this.villes.set(r.data),
      error: () => {}
    });
  }

  charger() {
    this.loading.set(true);
    this.service.lister().subscribe({
      next: blogueurs => {
        this.pubService.lister().subscribe({
          next: pubs => {
            const maintenant = new Date();
            const moisCourant = maintenant.getMonth();
            const anneeCourante = maintenant.getFullYear();

            const avecStatut: BlogueurAvecStatut[] = blogueurs.data.map(b => {
              const aPublie = pubs.data.some((p: any) => {
                if (p.auteur_id !== b.id) return false;
                const dateRef = p.date_publication ?? p.soumis_le;
                if (!dateRef) return false;
                const d = new Date(dateRef);
                return d.getMonth() === moisCourant && d.getFullYear() === anneeCourante;
              });
              return { ...b, aPublieMois: aPublie };
            });

            this.blogueurs.set(avecStatut);
            this.loading.set(false);
          },
          error: () => {
            this.blogueurs.set(blogueurs.data.map(b => ({ ...b, aPublieMois: false })));
            this.loading.set(false);
          }
        });
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  get blogueursActifs(): BlogueurAvecStatut[] {
    return this.blogueurs().filter(b => b.statut === 'actif');
  }

  get nbAJour(): number {
    return this.blogueursActifs.filter(b => b.aPublieMois).length;
  }

  get nbEnRetard(): number {
    return this.blogueursActifs.filter(b => !b.aPublieMois).length;
  }

  get blogueursFiltres(): BlogueurAvecStatut[] {
    const q = this.recherche.toLowerCase();
    let result = this.blogueurs().filter(b => {
      const matchRecherche = !q ||
        b.prenom.toLowerCase().includes(q) ||
        b.nom.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q);

      const matchStatut = !this.filtreStatut || b.statut === this.filtreStatut;
      const matchVille  = !this.filtreVille || b.ville_nom === this.filtreVille;

      const matchSuivi = !this.filtreSuivi ||
        (this.filtreSuivi === 'a_jour'    && b.statut === 'actif' && b.aPublieMois) ||
        (this.filtreSuivi === 'en_retard' && b.statut === 'actif' && !b.aPublieMois);

      return matchRecherche && matchStatut && matchVille && matchSuivi;
    });

    if (this.tri === 'recent') {
      result = [...result].sort((a, b) =>
        new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      );
    } else if (this.tri === 'ancien') {
      result = [...result].sort((a, b) =>
        new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
      );
    } else if (this.tri === 'publications') {
      result = [...result].sort((a, b) => (b.nb_publications ?? 0) - (a.nb_publications ?? 0));
    } else if (this.tri === 'nom') {
      result = [...result].sort((a, b) => a.nom.localeCompare(b.nom));
    }

    return result;
  }

  exporterPDF() {
    const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const colonnes = ['Prénom', 'Nom', 'Email', 'Téléphone', "N° d'Urgence", 'Ville', 'Statut', 'Publications', `Publié ce mois (${mois})`];
    const lignes = this.blogueursFiltres.map(b => [
      b.prenom,
      b.nom,
      b.email,
      b.telephone ?? '-',
      b.numero_urgence ?? '-',
      b.ville_nom ?? '-',
      b.statut,
      b.nb_publications ?? 0,
      b.statut === 'actif' ? (b.aPublieMois ? 'Oui' : 'Non') : '-',
    ]);
    this.exportSvc.exportPDF(
      `Rapport Blogueurs — ${mois}`,
      colonnes, lignes,
      `blogueurs_${mois.replace(' ', '_')}`
    );
  }

  exporterExcel() {
    const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const colonnes = ['Prénom', 'Nom', 'Email', 'Téléphone', "N° d'Urgence", 'Ville', 'Statut', 'Publications', `Publié ce mois`];
    const lignes = this.blogueursFiltres.map(b => [
      b.prenom,
      b.nom,
      b.email,
      b.telephone ?? '-',
      b.numero_urgence ?? '-',
      b.ville_nom ?? '-',
      b.statut,
      b.nb_publications ?? 0,
      b.statut === 'actif' ? (b.aPublieMois ? 'Oui' : 'Non') : '-',
    ]);
    this.exportSvc.exportExcel(colonnes, lignes, `blogueurs_${mois.replace(' ', '_')}`);
  }

  reinitialiserFiltres() {
    this.recherche = '';
    this.filtreStatut = '';
    this.filtreVille = '';
    this.filtreSuivi = '';
    this.tri = 'recent';
  }

  get filtresActifs(): boolean {
    return !!(this.recherche || this.filtreStatut || this.filtreVille || this.filtreSuivi || this.tri !== 'recent');
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      'en_attente': 'badge-warning',
      'actif':      'badge-success',
      'suspendu':   'badge-danger',
      'inactif':    'badge-gray',
    };
    return map[statut] ?? 'badge-gray';
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      'en_attente': 'En attente',
      'actif':      'Actif',
      'suspendu':   'Suspendu',
      'inactif':    'Inactif',
    };
    return map[statut] ?? statut;
  }

  initiales(b: BlogueurAvecStatut): string {
    return `${b.prenom.charAt(0)}${b.nom.charAt(0)}`.toUpperCase();
  }

  moisLabel(): string {
    const label = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
