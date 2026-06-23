import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service.ts';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    router.navigate(['/']);
    return false;
  }

  const rol = authService.getRol();

  if (rol === 'ADMIN') {
    return true;
  }

  router.navigate(['/']);
  return false;
};