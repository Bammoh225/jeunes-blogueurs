import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicationsService } from '../../../core/services/publications.service';
import { PublicationResume } from '../../../core/models/publication.model';
import { AuthService } from '../../../core/services/auth.service';
import { ThematiquesService, Thematique } from '../../../core/services/thematiques.service';

interface GroupeMois {
  cle:          string;
  label:        string;
  publications: PublicationResume[];
}

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './liste.html',
  styleUrl: './liste.scss'
})
export class Liste implements OnInit {
  private service        = inject(PublicationsService);
  private auth           = inject(AuthService);
  private thematiquesSvc = inject(ThematiquesService);

  publications = signal<PublicationResume[]>([]);
  thematiques  = signal<Thematique[]>([]);
  loading      = signal(true);
  erreur       = signal('');
  recherche    = '';

  filtreCategorie  = '';
  filtreThematique = '';
  tri              = 'recent';

  vueMois = signal(false);
  moisOuverts = signal<Set<string>>(new Set());

  isBlogueur = this.auth.hasRole('jeune_blogueur');
  isStaff    = !this.isBlogueur;

  categories = [
    { id: 1, nom: 'Blog' },
    { id: 2, nom: 'Vlog' },
    { id: 3, nom: 'Podcast' },
    { id: 4, nom: 'BD' },
  ];

  ngOnInit() {
    this.charger();
    this.thematiquesSvc.lister().subscribe({
      next: r => {
        const seen = new Set<string>();
        const uniques = r.data.filter(t => {
          if (seen.has(t.nom)) return false;
          seen.add(t.nom);
          return true;
        }).sort((a, b) => a.nom.localeCompare(b.nom));
        this.thematiques.set(uniques);
      },
      error: () => {}
    });
  }

  charger() {
    this.loading.set(true);
    this.service.lister().subscribe({
      next:  r => {
        this.publications.set(r.data);
        this.loading.set(false);
        // Ouvrir le mois courant par défaut
        const moisCourant = this.getMoisKey(new Date());
        this.moisOuverts.set(new Set([moisCourant]));
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  get publicationsFiltrees(): PublicationResume[] {
    const q = this.recherche.toLowerCase();
    let result = this.publications().filter(p => {
      const matchRecherche = !q ||
        p.titre.toLowerCase().includes(q) ||
        (p.auteur_prenom + ' ' + p.auteur_nom).toLowerCase().includes(q);

      const matchCategorie = !this.filtreCategorie ||
        p.categorie_nom === this.categories.find(c => c.id === +this.filtreCategorie)?.nom;

      const matchThematique = !this.filtreThematique ||
        p.thematique_nom === this.filtreThematique;

      return matchRecherche && matchCategorie && matchThematique;
    });

    if (this.tri === 'recent') {
      result = [...result].sort((a, b) =>
        new Date(b.soumis_le ?? 0).getTime() - new Date(a.soumis_le ?? 0).getTime()
      );
    } else if (this.tri === 'ancien') {
      result = [...result].sort((a, b) =>
        new Date(a.soumis_le ?? 0).getTime() - new Date(b.soumis_le ?? 0).getTime()
      );
    } else if (this.tri === 'evaluations') {
      result = [...result].sort((a, b) => (b.nb_evaluations ?? 0) - (a.nb_evaluations ?? 0));
    }

    return result;
  }

  getMoisKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  getMoisLabel(cle: string): string {
    const [annee, mois] = cle.split('-');
    const date = new Date(+annee, +mois - 1);
    const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get groupesParMois(): GroupeMois[] {
    const map = new Map<string, PublicationResume[]>();

    for (const p of this.publicationsFiltrees) {
      const dateRef = p.date_publication ?? p.soumis_le;
      if (!dateRef) continue;
      const key = this.getMoisKey(new Date(dateRef));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }

    const groupes: GroupeMois[] = Array.from(map.entries())
      .map(([cle, publications]) => ({ cle, label: this.getMoisLabel(cle), publications }))
      .sort((a, b) => b.cle.localeCompare(a.cle));

    return groupes;
  }

  toggleMois(cle: string) {
    const set = new Set(this.moisOuverts());
    if (set.has(cle)) set.delete(cle);
    else set.add(cle);
    this.moisOuverts.set(set);
  }

  isMoisOuvert(cle: string): boolean {
    return this.moisOuverts().has(cle);
  }

  reinitialiserFiltres() {
    this.recherche = '';
    this.filtreCategorie = '';
    this.filtreThematique = '';
    this.tri = 'recent';
  }

  get filtresActifs(): boolean {
    return !!(this.recherche || this.filtreCategorie || this.filtreThematique || this.tri !== 'recent');
  }
}
