import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActivitesService } from '../../../core/services/activites.service';
import { ActivitePublique } from '../../../core/models/activite.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-rejoindre',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rejoindre.html',
  styleUrl: './rejoindre.scss'
})
export class Rejoindre implements OnInit {
  private service = inject(ActivitesService);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private auth    = inject(AuthService);

  activite    = signal<ActivitePublique | null>(null);
  loading     = signal(true);
  erreur      = signal('');
  inscrit     = signal(false);
  inscription = signal(false);
  token       = '';

  user = this.auth.currentUser;

  ngOnInit() {
    this.token = this.route.snapshot.params['token'];
    this.charger();
  }

  charger() {
    this.loading.set(true);
    this.service.voirParToken(this.token).subscribe({
      next: r => { this.activite.set(r.data); this.loading.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Lien invalide'); this.loading.set(false); }
    });
  }

  confirmerParticipation() {
    this.inscription.set(true);
    this.service.inscrireViaLien(this.token).subscribe({
      next: () => { this.inscrit.set(true); this.inscription.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur lors de l\'inscription'); this.inscription.set(false); }
    });
  }

  get lienConnexion(): string[] {
    return ['/login'];
  }

  get queryParamsConnexion() {
    return { returnUrl: `/rejoindre/${this.token}` };
  }

  get complet(): boolean {
    const a = this.activite();
    return a?.places_restantes === 0;
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'atelier': '🛠️', 'formation': '🎓', 'evenement': '🎉', 'autre': '📌'
    };
    return map[type] ?? '📌';
  }
}