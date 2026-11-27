import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { API_BASE_URL } from '../api';
import { MOCK_USER } from '../mock-data';
import { User } from '../models';

interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly useMock = true;
  readonly user = signal<User | null>(this.useMock ? MOCK_USER : null);
  readonly isAuthenticated = computed(() => this.user() !== null);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${API_BASE_URL}/auth`;
  private token = this.useMock ? 'mock-access-token' : '';

  constructor() {
    if (!this.useMock && isPlatformBrowser(this.platformId)) {
      this.token = sessionStorage.getItem('empify.accessToken') ?? '';
    }
  }

  get accessToken(): string {
    return this.token;
  }

  login(email: string, password: string): Observable<User> {
    if (this.useMock) {
      const user = { ...MOCK_USER, email };
      this.setSession(user, 'mock-access-token');
      return of(user);
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => this.setSession(response.user, response.accessToken)),
        map((response) => response.user),
      );
  }

  register(username: string, email: string, password: string): Observable<User> {
    if (this.useMock) {
      const user = { id: crypto.randomUUID(), username, email };
      this.setSession(user, 'mock-access-token');
      return of(user);
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password })
      .pipe(
        tap((response) => this.setSession(response.user, response.accessToken)),
        map((response) => response.user),
      );
  }

  refresh(): Observable<string> {
    if (this.useMock) return of(this.token);

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, {})
      .pipe(
        tap((response) => this.setSession(response.user, response.accessToken)),
        map((response) => response.accessToken),
      );
  }

  logout(): Observable<void> {
    if (this.useMock) {
      this.clearSession();
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(tap(() => this.clearSession()));
  }

  loadCurrentUser(): Observable<User> {
    if (this.useMock) return of(this.user() ?? MOCK_USER);

    return this.http.get<User>(`${this.apiUrl}/me`).pipe(tap((user) => this.user.set(user)));
  }

  private setSession(user: User, token: string): void {
    this.user.set(user);
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('empify.accessToken', token);
    }
  }

  private clearSession(): void {
    this.user.set(null);
    this.token = '';
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('empify.accessToken');
    }
  }
}
