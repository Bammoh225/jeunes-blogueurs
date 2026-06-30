import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UtilisateursService } from '../../../core/services/utilisateurs.service';
import { Utilisateur, CreateUtilisateurDto, Role } from '../../../core/models/utilisateur.model';

@Component({
  selector: 'app-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './liste.html',
  styleUrl: './liste.scss'
})
export class Liste implements OnInit {
  private service = inject(UtilisateursService);
  private fb      = inject(FormBuilder);

  utilisateurs = signal<Utilisateur[]>([]);
  loading      = signal(true);
  erreur       = signal('');
  recherche    = '';
  showForm     = signal(false);
  saving       = signal(false);

  roles: { value: Role; label: string }[] = [
    { value: 'responsable_unicef',    label: 'Responsable UNICEF' },
    { value: 'responsable_technique', label: 'Responsable Technique' },
    { value: 'responsable_national',  label: 'Responsable National' },
    { value: 'responsable_zone',      label: 'Responsable Zone' },
    { value: 'responsable_categorie', label: 'Responsable Catégorie' },
    { value: 'equipe_com',            label: 'Équipe Communication' },
  ];

  form = this.fb.group({
    prenom:       ['', Validators.required],
    nom:          ['', Validators.required],
    email:        ['', [Validators.required, Validators.email]],
    mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
    role:         ['responsable_national', Validators.required],
    telephone:    [''],
  });

  ngOnInit() { this.charger(); }

  charger() {
    this.loading.set(true);
    this.service.lister().subscribe({
      next:  r => { this.utilisateurs.set(r.data); this.loading.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  get utilisateursFiltres(): Utilisateur[] {
    const q = this.recherche.toLowerCase();
    return this.utilisateurs().filter(u =>
      !q ||
      u.prenom.toLowerCase().includes(q) ||
      u.nom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  creer() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.service.creer(this.form.value as CreateUtilisateurDto).subscribe({
      next: r => {
        this.utilisateurs.update(list => [r.data, ...list]);
        this.form.reset({ role: 'responsable_national' });
        this.showForm.set(false);
        this.saving.set(false);
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.saving.set(false); }
    });
  }

  desactiver(u: Utilisateur) {
    if (!confirm(`Désactiver ${u.prenom} ${u.nom} ?`)) return;
    this.service.desactiver(u.id).subscribe({
      next: () => this.utilisateurs.update(list => list.filter(x => x.id !== u.id)),
      error: e => this.erreur.set(e.error?.message ?? 'Erreur')
    });
  }

  roleLabel(role: string): string {
    return this.roles.find(r => r.value === role)?.label ?? role;
  }

  roleClass(role: string): string {
    const map: Record<string, string> = {
      'responsable_unicef':    'role-unicef',
      'responsable_technique': 'role-tech',
      'responsable_national':  'role-national',
      'responsable_zone':      'role-zone',
      'responsable_categorie': 'role-categorie',
      'equipe_com':            'role-com',
    };
    return map[role] ?? 'role-default';
  }

  initiales(u: Utilisateur): string {
    return `${u.prenom.charAt(0)}${u.nom.charAt(0)}`.toUpperCase();
  }
}
