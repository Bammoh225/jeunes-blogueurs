import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BlogueursService } from '../../../core/services/blogueurs.service';
import { VillesService, Ville } from '../../../core/services/villes.service';
import { ThematiquesService, Thematique } from '../../../core/services/thematiques.service';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss'
})
export class Inscription implements OnInit {
  private fb         = inject(FormBuilder);
  private service    = inject(BlogueursService);
  private villesSvc  = inject(VillesService);
  private thematiquesSvc = inject(ThematiquesService);
  private router     = inject(Router);

  villes       = signal<Ville[]>([]);
  thematiques  = signal<Thematique[]>([]);
  loading      = signal(false);
  erreur       = signal('');
  succes       = signal(false);
  etape        = signal(1);

  thematiqueIds: number[] = [];

  form = this.fb.group({
    prenom:       ['', Validators.required],
    nom:          ['', Validators.required],
    email:        ['', [Validators.required, Validators.email]],
    mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
    date_naissance: ['', Validators.required],
    sexe:           ['', Validators.required],
    telephone:      [''],
    ville_id:       [null],
    langue_ecriture: ['Français', Validators.required],
    bio:             [''],
    niveau_scolaire: [''],
    etablissement:   [''],
    motivation:      [''],
  });

  ngOnInit() {
    this.villesSvc.lister().subscribe({
      next: r => this.villes.set(r.data),
      error: () => {}
    });

    // Catégorie 1 = Blog, thématiques par défaut pour l'inscription
    this.thematiquesSvc.lister().subscribe({
      next: r => {
        // Dédupliquer par nom (les thématiques sont déclinées par catégorie)
        const seen = new Set<string>();
        const uniques = r.data.filter(t => {
          if (seen.has(t.nom)) return false;
          seen.add(t.nom);
          return true;
        });
        this.thematiques.set(uniques);
      },
      error: () => {}
    });
  }

  toggleThematique(id: number) {
    if (this.thematiqueIds.includes(id)) {
      this.thematiqueIds = this.thematiqueIds.filter(t => t !== id);
    } else if (this.thematiqueIds.length < 3) {
      this.thematiqueIds = [...this.thematiqueIds, id];
    }
  }

  isSelected(id: number): boolean {
    return this.thematiqueIds.includes(id);
  }

  etapeSuivante() {
    const { prenom, nom, email, mot_de_passe } = this.form.controls;
    if (prenom.invalid || nom.invalid || email.invalid || mot_de_passe.invalid) {
      [prenom, nom, email, mot_de_passe].forEach(c => c.markAsTouched());
      return;
    }
    this.etape.set(2);
  }

  soumettre() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.thematiqueIds.length === 0) {
      this.erreur.set('Choisissez au moins une thématique');
      return;
    }

    this.loading.set(true);
    this.erreur.set('');

    const dto = {
      ...this.form.value,
      ville_id:       this.form.value.ville_id ? +this.form.value.ville_id : null,
      thematique_ids: this.thematiqueIds,
    };

    this.service.inscrire(dto as any).subscribe({
      next:  () => { this.succes.set(true); this.loading.set(false); },
      error: e  => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }
}
