import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginDto, AuthResponse, JwtPayload } from '../models/auth.model';
import { ApiResponse } from '../models/api.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<JwtPayload | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    this.currentUser.set(this.storage.getUser());
  }

  login(dto: LoginDto) {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, dto).pipe(
      tap(res => {
        this.storage.setToken(res.data.token);
        this.storage.setUser(res.data.utilisateur);
        this.currentUser.set(res.data.utilisateur);
      })
    );
  }

  motDePasseOublie(email: string) {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/mot-de-passe-oublie`, { email });
  }

  reinitialiserMotDePasse(token: string, nouveau_mot_de_passe: string) {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/reinitialiser-mot-de-passe`, {
      token,
      nouveau_mot_de_passe
    });
  }

  logout(): void {
    this.storage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.storage.isLoggedIn();
  }

  getRole(): string | null {
    return this.currentUser()?.role ?? null;
  }

  hasRole(...roles: string[]): boolean {
    const role = this.getRole();
    return role ? roles.includes(role) : false;
  }
}