import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogueursService } from '../../../core/services/blogueurs.service';
import { Blogueur, StatutBlogueur } from '../../../core/models/blogueur.model';
import { AuthService } from '../../../core/services/auth.service';
import { ROLES_ADMIN } from '../../../core/models/auth.model';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class Detail implements OnInit {
  private service = inject(BlogueursService);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private auth    = inject(AuthService);

  blogueur  = signal<Blogueur | null>(null);
  loading   = signal(true);
  erreur    = signal('');
  saving    = signal(false);

  isAdmin = this.auth.hasRole(...ROLES_ADMIN);

  statuts: { value: StatutBlogueur; label: string }[] = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'actif',      label: 'Actif' },
    { value: 'suspendu',   label: 'Suspendu' },
    { value: 'inactif',    label: 'Inactif' },
  ];

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.charger(id);
  }

  charger(id: number) {
    this.loading.set(true);
    this.service.trouver(id).subscribe({
      next:  r => { this.blogueur.set(r.data); this.loading.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  changerStatut(statut: StatutBlogueur) {
    const b = this.blogueur();
    if (!b) return;
    this.saving.set(true);
    this.service.changerStatut(b.id, statut).subscribe({
      next:  r => { this.blogueur.set(r.data); this.saving.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.saving.set(false); }
    });
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      'en_attente': 'badge-warning',
      'actif':      'badge-success',
      'suspendu':   'badge-danger',
      'inactif':    'badge-gray',
    };
    return map[statut] ?? 'badge-gray';
  }

  initiales(b: Blogueur): string {
    return `${b.prenom.charAt(0)}${b.nom.charAt(0)}`.toUpperCase();
  }

  retour() { this.router.navigate(['/blogueurs']); }
}
