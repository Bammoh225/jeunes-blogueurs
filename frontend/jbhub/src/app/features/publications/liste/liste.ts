import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicationsService } from '../../../core/services/publications.service';
import { PublicationResume } from '../../../core/models/publication.model';
import { ApiMeta } from '../../../core/models/api.model';
import { AuthService } from '../../../core/services/auth.service';
import { ThematiquesService, Thematique } from '../../../core/services/thematiques.service';

interface GroupeMois {
  cle:          string;
  label:        string;
  publications: PublicationResume[];
}

const LIMIT_PAR_DEFAUT = 30;
const DEBOUNCE_RECHERCHE_MS = 350;

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './liste.html',
  styleUrl: './liste.scss'
})
export class Liste implements OnInit, OnDestroy {
  private service        = inject(PublicationsService);
  private auth           = inject(AuthService);
  private thematiquesSvc = inject(ThematiquesService);

  // Publications de la PAGE COURANTE uniquement (le filtrage/tri/recherche
  // et la pagination sont faits côté backend en SQL, plus côté client sur
  // tout le jeu de données)
  publications = signal<PublicationResume[]>([]);
  thematiques  = signal<Thematique[]>([]);
  loading      = signal(true);
  erreur       = signal('');

  meta = signal<ApiMeta>({ total: 0, page: 1, limit: LIMIT_PAR_DEFAUT, totalPages: 1 });

  recherche        = '';
  filtreCategorie  = '';
  filtreThematique = '';
  tri              = 'recent';

  isStaff    = !this.auth.hasRole('jeune_blogueur');
  isBlogueur = !this.auth.hasRole('responsable_unicef');

  vueMois = signal(this.isStaff);
  moisOuverts = signal<Set<string>>(new Set());

  categories = [
    { id: 1, nom: 'Blog' },
    { id: 2, nom: 'Vlog' },
    { id: 3, nom: 'Podcast' },
    { id: 4, nom: 'BD' },
  ];

  private rechercheTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.charger(1);
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

  ngOnDestroy() {
    if (this.rechercheTimeout) clearTimeout(this.rechercheTimeout);
  }

  charger(page: number = this.meta().page) {
    this.loading.set(true);
    const categorieId  = this.filtreCategorie ? +this.filtreCategorie : undefined;
    const thematiqueId = this.filtreThematique
      ? this.thematiques().find(t => t.nom === this.filtreThematique)?.id
      : undefined;

    this.service.lister({
      categorie_id:  categorieId,
      thematique_id: thematiqueId,
      page,
      limit: this.meta().limit,
      recherche: this.recherche || undefined,
      tri: this.tri,
    }).subscribe({
      next: r => {
        this.publications.set(r.data);
        if (r.meta) this.meta.set(r.meta);
        this.loading.set(false);
        const moisCourant = this.getMoisKey(new Date());
        this.moisOuverts.set(new Set([moisCourant]));
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  // Déclenché par les selects/tri : rechargement immédiat, retour à la page 1
  onFiltreChange() {
    this.charger(1);
  }

  // Déclenché par la recherche texte : debounce pour éviter une requête par frappe
  onRechercheChange() {
    if (this.rechercheTimeout) clearTimeout(this.rechercheTimeout);
    this.rechercheTimeout = setTimeout(() => this.charger(1), DEBOUNCE_RECHERCHE_MS);
  }

  pagePrecedente() {
    if (this.meta().page > 1) this.charger(this.meta().page - 1);
  }

  pageSuivante() {
    if (this.meta().page < this.meta().totalPages) this.charger(this.meta().page + 1);
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

  // Regroupement par mois : ne porte que sur la page actuellement chargée
  // (nécessaire pour rester compatible avec la pagination côté serveur)
  get groupesParMois(): GroupeMois[] {
    const map = new Map<string, PublicationResume[]>();

    for (const p of this.publications()) {
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
    this.charger(1);
  }

  get filtresActifs(): boolean {
    return !!(this.recherche || this.filtreCategorie || this.filtreThematique || this.tri !== 'recent');
  }
}