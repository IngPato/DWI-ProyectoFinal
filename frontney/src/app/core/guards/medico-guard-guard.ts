import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const medicoGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token =
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token');

  if (!token || tokenExpirado(token)) {
    return router.createUrlTree(['/']);
  }

  const rol = obtenerRolDesdeStorage() || obtenerRolDesdeToken(token);

  if (esRolMedico(rol)) {
    return true;
  }

  return router.createUrlTree(['/']);
};

function obtenerRolDesdeStorage(): string {
  const usuarioTexto =
    localStorage.getItem('auth_user') ||
    localStorage.getItem('usuario_sesion') ||
    sessionStorage.getItem('auth_user') ||
    sessionStorage.getItem('usuario_sesion');

  if (!usuarioTexto) {
    return '';
  }

  try {
    const usuario = JSON.parse(usuarioTexto);

    return String(
      usuario?.rol ||
        usuario?.nombreRol ||
        usuario?.role ||
        usuario?.authority ||
        usuario?.authorities?.[0]?.authority ||
        usuario?.data?.rol ||
        usuario?.data?.nombreRol ||
        usuario?.data?.role ||
        usuario?.data?.authority ||
        usuario?.data?.authorities?.[0]?.authority ||
        '',
    );
  } catch {
    return '';
  }
}

function obtenerRolDesdeToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    return String(
      payload?.rol ||
        payload?.nombreRol ||
        payload?.role ||
        payload?.authority ||
        payload?.authorities?.[0]?.authority ||
        '',
    );
  } catch {
    return '';
  }
}

function esRolMedico(rol: string): boolean {
  const rolNormalizado = String(rol)
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return (
    rolNormalizado === 'MEDICO' ||
    rolNormalizado === 'ROLE_MEDICO' ||
    rolNormalizado.includes('MEDICO')
  );
}

function tokenExpirado(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (!payload?.exp) {
      return false;
    }

    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}