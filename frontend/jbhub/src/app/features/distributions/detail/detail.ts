import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DistributionsService, Distribution, Beneficiaire } from '../../../core/services/distributions.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class Detail implements OnInit {
  private service = inject(DistributionsService);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private auth    = inject(AuthService);

  distribution = signal<Distribution | null>(null);
  beneficiaires = signal<Beneficiaire[]>([]);
  loading  = signal(true);
  erreur   = signal('');
  updating = signal(false);

  user = this.auth.currentUser;

  isStaff = this.auth.hasRole(
    'responsable_unicef', 'responsable_technique', 'responsable_national',
    'responsable_zone', 'responsable_categorie', 'equipe_com'
  );

  isBlogueur = this.auth.hasRole('jeune_blogueur');

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.charger(id);
  }

  charger(id: number) {
    this.loading.set(true);
    this.service.trouver(id).subscribe({
      next: r => {
        this.distribution.set(r.data);
        this.service.listerBeneficiaires(id).subscribe({
          next: rb => { this.beneficiaires.set(rb.data); this.loading.set(false); },
          error: () => this.loading.set(false)
        });
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  get monStatut(): Beneficiaire | undefined {
    return this.beneficiaires().find(b => b.id === this.user()?.id);
  }

  confirmerReception(recu: boolean) {
    const d = this.distribution();
    const u = this.user();
    if (!d || !u) return;

    this.updating.set(true);
    this.service.marquerRecu(d.id, u.id, recu).subscribe({
      next: () => {
        this.beneficiaires.update(list =>
          list.map(b => b.id === u.id ? { ...b, recu } : b)
        );
        this.updating.set(false);
      },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.updating.set(false); }
    });
  }

  toggleRecu(beneficiaireId: number, recuActuel: boolean) {
    const d = this.distribution();
    if (!d || !this.isStaff) return;

    this.service.marquerRecu(d.id, beneficiaireId, !recuActuel).subscribe({
      next: () => {
        this.beneficiaires.update(list =>
          list.map(b => b.id === beneficiaireId ? { ...b, recu: !recuActuel } : b)
        );
      },
      error: e => this.erreur.set(e.error?.message ?? 'Erreur')
    });
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      'perdiem': 'Perdiem', 'gadget': 'Gadget', 'materiel': 'Matériel', 'autre': 'Autre'
    };
    return map[type] ?? type;
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'perdiem': '💰', 'gadget': '🎁', 'materiel': '📦', 'autre': '📋'
    };
    return map[type] ?? '📋';
  }

  retour() { this.router.navigate(['/distributions']); }
}
