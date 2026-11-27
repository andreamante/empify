import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../api';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => httpTesting.verify());

  it('refreshes both tokens after a 401 and retries the original request', () => {
    auth.login('user@example.test', 'secret').subscribe();
    httpTesting.expectOne(`${API_BASE_URL}/auth/login`).flush({
      accessToken: 'expired-access-token',
      refreshToken: 'refresh-token-1',
      user: { id: '1', username: 'User', email: 'user@example.test', createdAt: '2025-01-01T00:00:00Z' },
    });

    let response: unknown;
    http.get(`${API_BASE_URL}/tracks`).subscribe((value) => (response = value));
    const originalRequest = httpTesting.expectOne(`${API_BASE_URL}/tracks`);
    expect(originalRequest.request.headers.get('Authorization')).toBe('Bearer expired-access-token');
    originalRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTesting.expectOne(`${API_BASE_URL}/auth/refresh`);
    expect(refreshRequest.request.body).toEqual({ refreshToken: 'refresh-token-1' });
    refreshRequest.flush({
      accessToken: 'new-access-token',
      refreshToken: 'refresh-token-2',
      user: { id: '1', username: 'User', email: 'user@example.test', createdAt: '2025-01-01T00:00:00Z' },
    });

    const retryRequest = httpTesting.expectOne(`${API_BASE_URL}/tracks`);
    expect(retryRequest.request.headers.get('Authorization')).toBe('Bearer new-access-token');
    retryRequest.flush([]);

    expect(response).toEqual([]);
    expect(auth.accessToken).toBe('new-access-token');
    expect(auth.refreshToken).toBe('refresh-token-2');
  });
});
