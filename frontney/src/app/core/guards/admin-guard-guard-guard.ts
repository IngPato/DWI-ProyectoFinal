import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
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

  if (esRolAdmin(rol)) {
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
      usuario?.nombreRol ||
        usuario?.rol ||
        usuario?.role ||
        usuario?.authority ||
        usuario?.authorities?.[0]?.authority ||
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
      payload?.nombreRol ||
        payload?.rol ||
        payload?.role ||
        payload?.authority ||
        payload?.authorities?.[0]?.authority ||
        '',
    );
  } catch {
    return '';
  }
}

function esRolAdmin(rol: string): boolean {
  const rolNormalizado = rol.toUpperCase().trim();

  return (
    rolNormalizado === 'ADMIN' ||
    rolNormalizado === 'ROLE_ADMIN' ||
    rolNormalizado.includes('ADMIN')
  );
}

function tokenExpirado(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (!payload?.exp) {
      return false;
    }

    const fechaExpiracion = payload.exp * 1000;
    return Date.now() >= fechaExpiracion;
  } catch {
    return false;
  }
}