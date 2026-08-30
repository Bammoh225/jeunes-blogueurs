import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivitesService } from '../../../core/services/activites.service';
import { Activite, CreateActiviteDto, TypeActivite, VisibiliteActivite } from '../../../core/models/activite.model';
import { AuthService } from '../../../core/services/auth.service';
import { VillesService, Ville } from '../../../core/services/villes.service';
import { BlogueursService } from '../../../core/services/blogueurs.service';

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './liste.html',
  styleUrl: './liste.scss'
})
export class Liste implements OnInit {
  private service       = inject(ActivitesService);
  private auth          = inject(AuthService);
  private villesSvc     = inject(VillesService);
  private blogueursSvc  = inject(BlogueursService);
  private fb            = inject(FormBuilder);

  activites   = signal<Activite[]>([]);
  villes      = signal<Ville[]>([]);
  blogueurs   = signal<{ id: number; prenom: string; nom: string }[]>([]);
  loading     = signal(true);
  erreur      = signal('');
  recherche   = '';
  showForm    = signal(false);
  saving      = signal(false);
  selectedParticipants: number[] = [];
  lienGenere  = signal<string | null>(null);
  lienCopie   = signal(false);

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

  visibilites: { value: VisibiliteActivite; label: string }[] = [
    { value: 'ville',    label: 'Toute la ville' },
    { value: 'designee', label: 'Personnes désignées' },
  ];

  form = this.fb.group({
    titre:        ['', Validators.required],
    type:         ['atelier', Validators.required],
    ville_id:     [null, Validators.required],
    date_debut:   ['', Validators.required],
    date_fin:     [''],
    lieu:         [''],
    description:  [''],
    capacite_max: [null as number | null],
    visibilite:   ['ville' as VisibiliteActivite, Validators.required],
  });

  ngOnInit() {
    this.charger();
    this.villesSvc.lister().subscribe({
      next: r => this.villes.set(r.data),
      error: () => {}
    });
    if (this.peutCreer) {
      this.blogueursSvc.lister({ statut: 'actif' }).subscribe({
        next: r => this.blogueurs.set(r.data.map(b => ({ id: b.id, prenom: b.prenom, nom: b.nom }))),
        error: () => {}
      });
    }
  }

  charger() {
    this.loading.set(true);
    this.service.lister().subscribe({
      next:  r => { this.activites.set(r.data); this.loading.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  toggleParticipant(id: number) {
    if (this.selectedParticipants.includes(id)) {
      this.selectedParticipants = this.selectedParticipants.filter(i => i !== id);
    } else {
      this.selectedParticipants = [...this.selectedParticipants, id];
    }
  }

  isParticipantSelected(id: number): boolean {
    return this.selectedParticipants.includes(id);
  }

  get visibiliteDesignee(): boolean {
    return this.form.value.visibilite === 'designee';
  }

  creer() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    if (this.visibiliteDesignee && this.selectedParticipants.length === 0) {
      this.erreur.set('Veuillez désigner au moins un blogueur pour une activité à visibilité restreinte');
      return;
    }

    this.saving.set(true);
    this.erreur.set('');
    const val = this.form.value;
    const dto: CreateActiviteDto = {
      titre:            val.titre!,
      type:             val.type as TypeActivite,
      ville_id: Number(val.ville_id),
      date_debut:       val.date_debut!,
      date_fin:         val.date_fin || null,
      lieu:             val.lieu || null,
      description:      val.description || null,
      capacite_max:     val.capacite_max || null,
      visibilite:       val.visibilite as VisibiliteActivite,
      participant_ids:  this.visibiliteDesignee ? this.selectedParticipants : undefined,
    };

    this.service.creer(dto).subscribe({
      next: r => {
        const activite = r.data!;
        this.activites.update(list => [activite, ...list]);
        this.lienGenere.set(`${window.location.origin}/rejoindre/${activite.token_partage}`);
        this.form.reset({ type: 'atelier', visibilite: 'ville' });
        this.selectedParticipants = [];
        this.showForm.set(false);
        this.saving.set(false);
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.saving.set(false); }
    });
  }

  copierLien() {
    const lien = this.lienGenere();
    if (!lien) return;
    navigator.clipboard.writeText(lien).then(() => {
      this.lienCopie.set(true);
      setTimeout(() => this.lienCopie.set(false), 2000);
    });
  }

  fermerLien() {
    this.lienGenere.set(null);
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
      'atelier': '🛠️', 'formation': '🎓', 'evenement': '🎉', 'autre': '📌'
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
      'planifiee': 'Planifiée', 'en_cours': 'En cours',
      'terminee': 'Terminée',   'annulee':  'Annulée',
    };
    return map[statut] ?? statut;
  }
}