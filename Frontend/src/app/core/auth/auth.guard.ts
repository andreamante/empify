import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) return true;
  const router = inject(Router);
  if (!auth.accessToken) return router.createUrlTree(['/login']);
  return auth.loadCurrentUser().pipe(
    map(() => true),
  );
};
