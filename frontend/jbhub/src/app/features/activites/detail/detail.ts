import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivitesService, Participant, MonStatut } from '../../../core/services/activites.service';
import { Activite, StatutActivite, UpdateActiviteDto } from '../../../core/models/activite.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class Detail implements OnInit {
  private service = inject(ActivitesService);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private auth    = inject(AuthService);
  private fb      = inject(FormBuilder);

  activite         = signal<Activite | null>(null);
  participants     = signal<Participant[]>([]);
  monStatut        = signal<MonStatut>({ inscrit: false, present: false });
  loading          = signal(true);
  erreur           = signal('');
  saving           = signal(false);
  showForm         = signal(false);
  showParticipants = signal(false);
  participating    = signal(false);
  updatingPresence = signal(false);

  user = this.auth.currentUser;

  peutModifier = this.auth.hasRole(
    'responsable_unicef', 'responsable_technique',
    'responsable_national', 'responsable_zone'
  );

  isStaff = this.auth.hasRole(
    'responsable_unicef', 'responsable_technique', 'responsable_national',
    'responsable_zone', 'responsable_categorie', 'equipe_com'
  );

  isBlogueur = this.auth.hasRole('jeune_blogueur','responsable_national', 'responsable_technique','responsable_categorie','equipe_com');

  statuts: { value: StatutActivite; label: string }[] = [
    { value: 'planifiee', label: 'Planifiée' },
    { value: 'en_cours',  label: 'En cours' },
    { value: 'terminee',  label: 'Terminée' },
    { value: 'annulee',   label: 'Annulée' },
  ];

  form = this.fb.group({
    statut:  [''],
    rapport: [''],
  });

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.charger(id);
  }

  charger(id: number) {
    this.loading.set(true);
    this.service.trouver(id).subscribe({
      next: r => {
        this.activite.set(r.data);
        this.form.patchValue({
          statut:  r.data.statut ?? '',
          rapport: r.data.rapport ?? '',
        });

        // Charger le statut selon le rôle
        if (this.isBlogueur) {
          // Blogueur : juste son propre statut
          this.service.monStatut(id).subscribe({
            next: rs => {
              this.monStatut.set(rs.data ?? { inscrit: false, present: false });
              this.loading.set(false);
            },
            error: () => this.loading.set(false)
          });
        } else {
          // Staff : pas besoin du statut personnel
          this.loading.set(false);
        }
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  chargerParticipants() {
    const a = this.activite();
    if (!a) return;
    this.service.listerParticipants(a.id).subscribe({
      next: r => { this.participants.set(r.data); this.showParticipants.set(true); },
      error: e => this.erreur.set(e.error?.message ?? 'Erreur')
    });
  }

  participer() {
    const a = this.activite();
    const u = this.user();
    if (!a || !u) return;
    this.participating.set(true);
    this.service.ajouterParticipant(a.id, u.id).subscribe({
      next: () => {
        this.monStatut.set({ inscrit: true, present: false });
        this.participating.set(false);
        this.activite.update(act => act ? { ...act, nb_participants: (act.nb_participants ?? 0) + 1 } : act);
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.participating.set(false); }
    });
  }

  confirmerPresence(present: boolean) {
    const a = this.activite();
    const u = this.user();
    if (!a || !u) return;
    this.updatingPresence.set(true);
    this.service.confirmerPresence(a.id, u.id, present).subscribe({
      next: () => {
        this.monStatut.update(s => ({ ...s, present }));
        this.updatingPresence.set(false);
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.updatingPresence.set(false); }
    });
  }

  marquerPresence(userId: number, present: boolean) {
    const a = this.activite();
    if (!a) return;
    this.service.marquerPresence(a.id, userId, present).subscribe({
      next: () => {
        this.participants.update(list =>
          list.map(p => p.id === userId ? { ...p, present } : p)
        );
      },
      error: e => this.erreur.set(e.error?.message ?? 'Erreur')
    });
  }

  sauvegarder() {
    const a = this.activite();
    if (!a) return;
    this.saving.set(true);
    const dto: UpdateActiviteDto = {
      statut:  this.form.value.statut as StatutActivite || undefined,
      rapport: this.form.value.rapport || undefined,
    };
    this.service.modifier(a.id, dto).subscribe({
      next: r => { this.activite.set(r.data); this.saving.set(false); this.showForm.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.saving.set(false); }
    });
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      'planifiee': 'badge-warning', 'en_cours': 'badge-info',
      'terminee': 'badge-success',  'annulee':  'badge-danger',
    };
    return map[statut] ?? 'badge-gray';
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'atelier': '🛠️', 'formation': '🎓', 'evenement': '🎉', 'autre': '📌'
    };
    return map[type] ?? '📌';
  }

  retour() { this.router.navigate(['/activites']); }
}
