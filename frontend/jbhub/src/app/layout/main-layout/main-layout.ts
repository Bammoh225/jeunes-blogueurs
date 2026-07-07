import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { SearchService, SearchResult } from '../../core/services/search.service';
import { ROLES_ADMIN, ROLES_STAFF } from '../../core/models/auth.model';
import { filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

interface NavItem {
  label:  string;
  icon:   string;
  route:  string;
  roles?: string[];
  badge?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  auth       = inject(AuthService);
  notifSvc   = inject(NotificationsService);
  searchSvc  = inject(SearchService);
  router     = inject(Router);

  sidebarOpen = signal(true);
  mobileOpen  = signal(false);
  isMobile    = signal(false);
  user        = this.auth.currentUser;
  nonLus      = signal(0);

  searchQuery   = '';
  searchResults = signal<SearchResult[]>([]);
  searchOpen    = signal(false);
  searching     = signal(false);
  private searchSubject = new Subject<string>();

  isStaff = this.auth.hasRole(
    'responsable_unicef', 'responsable_technique', 'responsable_national',
    'responsable_zone', 'responsable_categorie', 'equipe_com'
  );

  navItems: NavItem[] = [
    {
      label: 'Dashboard', route: '/dashboard',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
    },
    {
      label: 'Blogueurs', route: '/blogueurs', roles: ROLES_STAFF,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    },
    {
      label: 'Publications', route: '/publications',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
    },
    {
      label: 'Évaluations', route: '/evaluations', roles: ROLES_STAFF,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
    },
    {
      label: 'Activités', route: '/activites',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    },
    {
      label: 'Notifications', route: '/notifications', badge: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
    },
    {
      label: 'Distributions', route: '/distributions',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
    },
    {
      label: 'Utilisateurs', route: '/utilisateurs', roles: ROLES_ADMIN,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    },
    {
      label: 'Mon profil', route: '/profil',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    },
  ];

  ngOnInit() {
    this.checkScreenSize();
    this.chargerNonLus();
    setInterval(() => this.chargerNonLus(), 30000);

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.mobileOpen.set(false);
      this.searchOpen.set(false);
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.trim().length < 2) return of([]);
        this.searching.set(true);
        return this.searchSvc.rechercher(q, this.isStaff);
      })
    ).subscribe(results => {
      this.searchResults.set(results);
      this.searching.set(false);
    });
  }

  onSearchInput() {
    this.searchOpen.set(this.searchQuery.trim().length >= 2);
    this.searchSubject.next(this.searchQuery);
  }

  closeSearch() {
    setTimeout(() => this.searchOpen.set(false), 150);
  }

  navigateToResult(route: string) {
    this.searchQuery = '';
    this.searchOpen.set(false);
    this.router.navigateByUrl(route);
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      blogueur: 'Blogueur', publication: 'Publication', activite: 'Activité'
    };
    return map[type] ?? type;
  }

  @HostListener('window:resize')
  checkScreenSize() {
    const mobile = window.innerWidth < 768;
    this.isMobile.set(mobile);
    if (mobile) this.sidebarOpen.set(false);
  }

  toggleMenu() {
    if (this.isMobile()) {
      this.mobileOpen.set(!this.mobileOpen());
    } else {
      this.sidebarOpen.set(!this.sidebarOpen());
    }
  }

  chargerNonLus() {
    this.notifSvc.countNonLus().subscribe({
      next: (r: any) => this.nonLus.set(r.data?.total ?? 0),
      error: () => {}
    });
  }

  visibleItems(): NavItem[] {
    return this.navItems.filter(item => {
      if (!item.roles) return true;
      return this.auth.hasRole(...item.roles);
    });
  }

  logout(): void { this.auth.logout(); }
}
