import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivitesService } from '../../../core/services/activites.service';
import { Activite, CreateActiviteDto, TypeActivite } from '../../../core/models/activite.model';
import { AuthService } from '../../../core/services/auth.service';
import { VillesService, Ville } from '../../../core/services/villes.service';

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './liste.html',
  styleUrl: './liste.scss'
})
export class Liste implements OnInit {
  private service   = inject(ActivitesService);
  private auth      = inject(AuthService);
  private villesSvc = inject(VillesService);
  private fb        = inject(FormBuilder);

  activites  = signal<Activite[]>([]);
  villes     = signal<Ville[]>([]);
  loading    = signal(true);
  erreur     = signal('');
  recherche  = '';
  showForm   = signal(false);
  saving     = signal(false);

  peutCreer = this.auth.hasRole(
    'responsable_unicef', 'responsable_technique',
    'responsable_national', 'responsable_zone'
  );

  types: { value: TypeActivite; label: string }[] = [
    { value: 'atelier',   label: 'Atelier' },
    { value: 'formation', label: 'Formation' },
    { value: 'evenement', label: 'Événement' },
    { value: 'autre',     label: 'Autre' },
  ];

  form = this.fb.group({
    titre:       ['', Validators.required],
    type:        ['atelier', Validators.required],
    ville_id:    [null, Validators.required],
    date_debut:  ['', Validators.required],
    date_fin:    [''],
    lieu:        [''],
    description: [''],
  });

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
      next:  r => { this.activites.set(r.data); this.loading.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  creer() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value;
    const dto: CreateActiviteDto = {
      titre:       val.titre!,
      type:        val.type as TypeActivite,
      ville_id:    +val.ville_id!,
      date_debut:  val.date_debut!,
      date_fin:    val.date_fin || null,
      lieu:        val.lieu || null,
      description: val.description || null,
    };
    this.service.creer(dto).subscribe({
      next: r => {
        this.activites.update(list => [r.data!, ...list]);
        this.form.reset({ type: 'atelier' });
        this.showForm.set(false);
        this.saving.set(false);
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.saving.set(false); }
    });
  }

  get activitesFiltrees(): Activite[] {
    const q = this.recherche.toLowerCase();
    return this.activites().filter(a =>
      !q ||
      a.titre.toLowerCase().includes(q) ||
      (a.ville_nom ?? '').toLowerCase().includes(q)
    );
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'atelier':   '🛠️',
      'formation': '🎓',
      'evenement': '🎉',
      'autre':     '📌',
    };
    return map[type] ?? '📌';
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      'planifiee': 'badge-warning',
      'en_cours':  'badge-info',
      'terminee':  'badge-success',
      'annulee':   'badge-danger',
    };
    return map[statut] ?? 'badge-gray';
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      'planifiee': 'Planifiée',
      'en_cours':  'En cours',
      'terminee':  'Terminée',
      'annulee':   'Annulée',
    };
    return map[statut] ?? statut;
  }
}
