import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.scss'
})
export class Profil implements OnInit {
  private auth    = inject(AuthService);
  private http    = inject(HttpClient);
  private storage = inject(StorageService);
  private fb      = inject(FormBuilder);

  user       = this.auth.currentUser;
  saving     = signal(false);
  savingMdp  = signal(false);
  erreur     = signal('');
  erreurMdp  = signal('');
  succes     = signal('');
  succesMdp  = signal('');
  profilData = signal<any>(null);

  isAdmin = this.auth.hasRole('responsable_unicef');

  formProfil = this.fb.group({
    prenom:          ['', Validators.required],
    nom:             ['', Validators.required],
    telephone:       [''],
    numero_urgence:  [''],
  });

  formMdp = this.fb.group({
    ancien_mot_de_passe:  ['', Validators.required],
    nouveau_mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
    confirmation:         ['', Validators.required],
  });

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/auth/profil`).subscribe({
      next: r => {
        this.profilData.set(r.data);
        this.formProfil.patchValue({
          prenom:         r.data.prenom,
          nom:            r.data.nom,
          telephone:      r.data.telephone ?? '',
          numero_urgence: r.data.numero_urgence ?? '',
        });
      }
    });
  }

  sauvegarderProfil() {
    if (this.formProfil.invalid) { this.formProfil.markAllAsTouched(); return; }
    this.saving.set(true);
    this.erreur.set('');
    this.succes.set('');

    this.http.patch<any>(`${environment.apiUrl}/auth/profil`, this.formProfil.value).subscribe({
      next: r => {
        const updated = { ...this.user()!, ...r.data };
        this.storage.setUser(updated);
        this.auth.currentUser.set(updated);
        this.succes.set('Profil mis à jour avec succès');
        this.saving.set(false);
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.saving.set(false); }
    });
  }

  changerMotDePasse() {
    if (this.formMdp.invalid) { this.formMdp.markAllAsTouched(); return; }

    const { nouveau_mot_de_passe, confirmation } = this.formMdp.value;
    if (nouveau_mot_de_passe !== confirmation) {
      this.erreurMdp.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.savingMdp.set(true);
    this.erreurMdp.set('');
    this.succesMdp.set('');

    this.http.patch<any>(`${environment.apiUrl}/auth/mot-de-passe`, {
      ancien_mot_de_passe:  this.formMdp.value.ancien_mot_de_passe,
      nouveau_mot_de_passe: this.formMdp.value.nouveau_mot_de_passe,
    }).subscribe({
      next: () => {
        this.succesMdp.set('Mot de passe modifié avec succès');
        this.formMdp.reset();
        this.savingMdp.set(false);
      },
      error: e => { this.erreurMdp.set(e.error?.message ?? 'Erreur'); this.savingMdp.set(false); }
    });
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      'responsable_unicef':    'Responsable UNICEF',
      'responsable_technique': 'Responsable Technique',
      'responsable_national':  'Responsable National',
      'responsable_zone':      'Responsable de Zone',
      'responsable_categorie': 'Responsable Catégorie',
      'equipe_com':            'Équipe Communication',
      'jeune_blogueur':        'Jeune Blogueur',
    };
    return labels[this.user()?.role ?? ''] ?? this.user()?.role ?? '';
  }

  initiales(): string {
    const u = this.user();
    if (!u) return '';
    return `${u.prenom.charAt(0)}${u.nom?.charAt(0) ?? ''}`.toUpperCase();
  }
}
