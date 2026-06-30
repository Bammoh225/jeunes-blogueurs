import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PublicationsService } from '../../../core/services/publications.service';
import { ThematiquesService, Thematique } from '../../../core/services/thematiques.service';

interface Categorie { id: number; nom: string; }

@Component({
  selector: 'app-soumettre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './soumettre.html',
  styleUrl: './soumettre.scss'
})
export class Soumettre implements OnInit {
  private service        = inject(PublicationsService);
  private thematiquesSvc = inject(ThematiquesService);
  private router          = inject(Router);
  private fb              = inject(FormBuilder);

  categories  = signal<Categorie[]>([]);
  thematiques = signal<Thematique[]>([]);
  loading     = signal(false);
  erreur      = signal('');

  types = [
    { value: 'blog',    label: 'Blog',    categorie_id: 1 },
    { value: 'vlog',    label: 'Vlog',    categorie_id: 2 },
    { value: 'podcast', label: 'Podcast', categorie_id: 3 },
    { value: 'bd',      label: 'Bande Dessinée', categorie_id: 4 },
  ];

  typeSelectionne = signal('blog');

  form = this.fb.group({
    categorie_id:       [1, Validators.required],
    thematique_id:      [null, Validators.required],
    titre:              ['', Validators.required],
    lien:               ['', Validators.required],
    description:        [''],
    date_publication:   ['', Validators.required],
    blog_nb_mots:       [null],
    vlog_plateforme:    [''],
    vlog_duree_minutes: [null],
    podcast_plateforme: [''],
    podcast_duree_min:  [null],
    podcast_invites:    [''],
    bd_nb_planches:     [null],
    bd_outil:           [''],
  });

  ngOnInit() {
    this.categories.set([
      { id: 1, nom: 'Blog' },
      { id: 2, nom: 'Vlog' },
      { id: 3, nom: 'Podcast' },
      { id: 4, nom: 'BD' },
    ]);
    this.chargerToutesThematiques();
  }

  chargerToutesThematiques() {
    this.thematiquesSvc.lister().subscribe({
      next: r => {
        // Dédupliquer par nom (les mêmes thématiques apparaissent sous plusieurs catégories)
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

  onTypeChange(type: { value: string; categorie_id: number }) {
    this.typeSelectionne.set(type.value);
    this.form.patchValue({ categorie_id: type.categorie_id });
  }

  soumettre() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.erreur.set('');

    const val = this.form.value;
    const dto: any = {
      categorie_id:     +val.categorie_id!,
      thematique_id:    +val.thematique_id!,
      titre:            val.titre,
      lien:             val.lien,
      description:      val.description || null,
      date_publication: val.date_publication,
    };

    if (this.typeSelectionne() === 'blog' && val.blog_nb_mots)
      dto.blog_nb_mots = +val.blog_nb_mots;
    if (this.typeSelectionne() === 'vlog') {
      if (val.vlog_plateforme)    dto.vlog_plateforme    = val.vlog_plateforme;
      if (val.vlog_duree_minutes) dto.vlog_duree_minutes = +val.vlog_duree_minutes;
    }
    if (this.typeSelectionne() === 'podcast') {
      if (val.podcast_plateforme) dto.podcast_plateforme = val.podcast_plateforme;
      if (val.podcast_duree_min)  dto.podcast_duree_min  = +val.podcast_duree_min;
      if (val.podcast_invites)    dto.podcast_invites    = val.podcast_invites;
    }
    if (this.typeSelectionne() === 'bd') {
      if (val.bd_nb_planches) dto.bd_nb_planches = +val.bd_nb_planches;
      if (val.bd_outil)       dto.bd_outil       = val.bd_outil;
    }

    this.service.soumettre(dto).subscribe({
      next:  () => this.router.navigate(['/publications']),
      error: e  => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }
}
