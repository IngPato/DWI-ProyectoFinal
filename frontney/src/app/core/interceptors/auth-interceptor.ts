import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

  const esRutaPublica =
    request.url.includes('/api/auth/login') ||
    request.url.includes('/api/auth/validarDoc') ||
    request.url.includes('/api/auth/validar-usuario-correo') ||
    request.url.includes('/api/auth/validar-paciente') ||
    request.url.includes('/api/auth/validar-medico') ||
    request.url.includes('/api/auth/cambiar-password') ||
    request.url.includes('/api/auth/registrar-usuario') ||
    request.url.includes('/api/auth/registrar-paciente');

  if (!token || esRutaPublica) {
    return next(request);
  }

  const requestConToken = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  return next(requestConToken);
};