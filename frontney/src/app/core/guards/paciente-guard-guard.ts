import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service.ts';

export const pacienteGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.getUsuario();

  if (usuario?.token && usuario.rol === 'PACIENTE') {
    return true;
  }

  authService.logout();
  return router.createUrlTree(['/']);
};