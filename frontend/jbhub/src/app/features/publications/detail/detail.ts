import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicationsService } from '../../../core/services/publications.service';
import { Publication } from '../../../core/models/publication.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class Detail implements OnInit {
  private service = inject(PublicationsService);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private auth    = inject(AuthService);

  publication = signal<Publication | null>(null);
  loading     = signal(true);
  erreur      = signal('');
  deleting    = signal(false);

  user = this.auth.currentUser;

  isAdmin = this.auth.hasRole('responsable_unicef', 'responsable_technique');

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.charger(id);
  }

  charger(id: number) {
    this.loading.set(true);
    this.service.trouver(id).subscribe({
      next:  r => { this.publication.set(r.data); this.loading.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  peutSupprimer(): boolean {
    const p = this.publication();
    if (!p) return false;
    return this.isAdmin || p.auteur_id === this.user()?.id;
  }

  supprimer() {
    if (!confirm('Supprimer cette publication ?')) return;
    const p = this.publication();
    if (!p) return;
    this.deleting.set(true);
    this.service.supprimer(p.id).subscribe({
      next:  () => this.router.navigate(['/publications']),
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.deleting.set(false); }
    });
  }

  retour() { this.router.navigate(['/publications']); }
}
