import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DistributionsService, Distribution, TypeDistribution } from '../../core/services/distributions.service';
import { BlogueursService } from '../../core/services/blogueurs.service';
import { UtilisateursService } from '../../core/services/utilisateurs.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-distributions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './distributions.html',
  styleUrl: './distributions.scss'
})
export class Distributions implements OnInit {
  private service       = inject(DistributionsService);
  private blogueursSvc  = inject(BlogueursService);
  private auth          = inject(AuthService);
  private fb            = inject(FormBuilder);

  distributions = signal<Distribution[]>([]);
  beneficiairesDispo = signal<{ id: number; prenom: string; nom: string }[]>([]);
  loading   = signal(true);
  erreur    = signal('');
  showForm  = signal(false);
  saving    = signal(false);
  selectedIds: number[] = [];

  peutGerer = this.auth.hasRole(
    'responsable_unicef', 'responsable_technique',
    'responsable_national', 'responsable_zone'
  );

  types: { value: TypeDistribution; label: string }[] = [
    { value: 'perdiem',  label: 'Perdiem' },
    { value: 'gadget',   label: 'Gadget' },
    { value: 'materiel', label: 'Matériel' },
    { value: 'autre',    label: 'Autre' },
  ];

  form = this.fb.group({
    type:              ['perdiem', Validators.required],
    libelle:           ['', Validators.required],
    description:       [''],
    montant:           [null],
    date_distribution: ['', Validators.required],
  });

  ngOnInit() {
    this.charger();
    if (this.peutGerer) {
      this.blogueursSvc.lister({ statut: 'actif' }).subscribe({
        next: r => this.beneficiairesDispo.set(r.data.map(b => ({ id: b.id, prenom: b.prenom, nom: b.nom }))),
        error: () => {}
      });
    }
  }

  charger() {
    this.loading.set(true);
    this.service.lister().subscribe({
      next:  r => { this.distributions.set(r.data); this.loading.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  toggleBeneficiaire(id: number) {
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter(i => i !== id);
    } else {
      this.selectedIds = [...this.selectedIds, id];
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  creer() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.selectedIds.length === 0) {
      this.erreur.set('Sélectionnez au moins un bénéficiaire');
      return;
    }

    this.saving.set(true);
    this.erreur.set('');

    const dto: any = {
      ...this.form.value,
      montant: this.form.value.montant ? +this.form.value.montant : null,
      beneficiaire_ids: this.selectedIds,
    };

    this.service.creer(dto).subscribe({
      next: r => {
        this.distributions.update(list => [r.data!, ...list]);
        this.form.reset({ type: 'perdiem' });
        this.selectedIds = [];
        this.showForm.set(false);
        this.saving.set(false);
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.saving.set(false); }
    });
  }

  typeLabel(type: string): string {
    return this.types.find(t => t.value === type)?.label ?? type;
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'perdiem':  '💰',
      'gadget':   '🎁',
      'materiel': '📦',
      'autre':    '📋',
    };
    return map[type] ?? '📋';
  }
}
