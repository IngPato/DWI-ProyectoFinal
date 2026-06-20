import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service.ts';

export const medicoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.getUsuario();

  if (usuario?.token && usuario.rol === 'MEDICO') {
    return true;
  }

  authService.logout();
  return router.createUrlTree(['/']);
};