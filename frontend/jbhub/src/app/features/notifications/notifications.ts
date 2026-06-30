import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationsService } from '../../core/services/notifications.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit {
  private service = inject(NotificationsService);
  private router  = inject(Router);

  notifications = signal<Notification[]>([]);
  loading       = signal(true);
  erreur        = signal('');
  markingAll    = signal(false);

  ngOnInit() { this.charger(); }

  charger() {
    this.loading.set(true);
    this.service.lister().subscribe({
      next:  r => { this.notifications.set(r.data); this.loading.set(false); },
      error: e => { this.erreur.set(e.error?.message ?? 'Erreur'); this.loading.set(false); }
    });
  }

  marquerLu(n: Notification) {
    if (n.lu) {
      if (n.lien) this.router.navigateByUrl(n.lien);
      return;
    }
    this.service.marquerLu(n.id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(item => item.id === n.id ? { ...item, lu: true } : item)
        );
        if (n.lien) this.router.navigateByUrl(n.lien);
      }
    });
  }

  marquerTousLus() {
    this.markingAll.set(true);
    this.service.marquerTousLus().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, lu: true })));
        this.markingAll.set(false);
      },
      error: () => this.markingAll.set(false)
    });
  }

  get nonLus(): number {
    return this.notifications().filter(n => !n.lu).length;
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'nouvelle_inscription':  '✍️',
      'nouvelle_publication':  '📝',
      'nouvelle_activite':     '🎯',
      'publication_evaluee':   '⭐',
      'validation':            '✅',
      'rejet':                 '❌',
      'commentaire':           '💬',
      'like':                  '❤️',
      'systeme':               '🔔',
    };
    return map[type] ?? '🔔';
  }
}
