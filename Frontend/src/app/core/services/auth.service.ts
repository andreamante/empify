import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api';
import { MOCK_USER } from '../mock-data';
import { User } from '../models';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly useMock = false;
  readonly user = signal<User | null>(this.useMock ? MOCK_USER : null);
  readonly isAuthenticated = computed(() => this.user() !== null);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${API_BASE_URL}/auth`;
  private token = this.useMock ? 'mock-access-token' : '';
  private refreshTokenValue = '';
  private refreshRequest$: Observable<string> | null = null;

  constructor() {
    if (!this.useMock && isPlatformBrowser(this.platformId)) {
      this.token = sessionStorage.getItem('empify.accessToken') ?? '';
      this.refreshTokenValue = sessionStorage.getItem('empify.refreshToken') ?? '';
    }
  }

  get accessToken(): string {
    return this.token;
  }

  get refreshToken(): string {
    return this.refreshTokenValue;
  }

  login(email: string, password: string): Observable<User> {
    if (this.useMock) {
      const user = { ...MOCK_USER, email };
      this.setSession(user, 'mock-access-token', 'mock-refresh-token');
      return of(user);
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) =>
          this.setSession(response.user, response.accessToken, response.refreshToken),
        ),
        map((response) => response.user),
      );
  }

  register(username: string, email: string, password: string): Observable<User> {
    if (this.useMock) {
      const user = { id: crypto.randomUUID(), username, email };
      this.setSession(user, 'mock-access-token', 'mock-refresh-token');
      return of(user);
    }

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password })
      .pipe(
        tap((response) =>
          this.setSession(response.user, response.accessToken, response.refreshToken),
        ),
        map((response) => response.user),
      );
  }

  refresh(): Observable<string> {
    if (this.useMock) return of(this.token);

    if (!this.refreshTokenValue) {
      return throwError(() => new Error('No refresh token is available.'));
    }
    if (this.refreshRequest$) return this.refreshRequest$;

    const request$ = this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken: this.refreshTokenValue })
      .pipe(
        tap((response) =>
          this.setSession(response.user, response.accessToken, response.refreshToken),
        ),
        map((response) => response.accessToken),
        finalize(() => {
          if (this.refreshRequest$ === request$) this.refreshRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    this.refreshRequest$ = request$;
    return request$;
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

  clearSession(): void {
    this.user.set(null);
    this.token = '';
    this.refreshTokenValue = '';
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('empify.accessToken');
      sessionStorage.removeItem('empify.refreshToken');
    }
  }

  private setSession(user: User, token: string, refreshToken: string): void {
    this.user.set(user);
    this.token = token;
    this.refreshTokenValue = refreshToken;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('empify.accessToken', token);
      sessionStorage.setItem('empify.refreshToken', refreshToken);
    }
  }
}
