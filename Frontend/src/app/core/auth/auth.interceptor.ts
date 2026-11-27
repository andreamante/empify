import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.accessToken || !request.url.startsWith(`${API_BASE_URL}/`)) {
    return next(request);
  }

  const isRefreshRequest = request.url === `${API_BASE_URL}/auth/refresh`;
  const authenticatedRequest = (accessToken: string) =>
    request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
  const initialRequest = auth.accessToken ? authenticatedRequest(auth.accessToken) : request;

  return next(initialRequest).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isRefreshRequest ||
        !request.url.startsWith(`${API_BASE_URL}/`)
      ) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        catchError((refreshError: unknown) => {
          auth.clearSession();
          void router.navigateByUrl('/login');
          return throwError(() => refreshError);
        }),
        switchMap((accessToken) => next(authenticatedRequest(accessToken))),
      );
    }),
  );
};
