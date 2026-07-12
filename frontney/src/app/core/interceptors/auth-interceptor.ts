import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const esNavegador = typeof window !== 'undefined';

  const token = esNavegador
    ? localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token')
    : null;

  const rutasPublicas = [
    '/api/auth/login',
    '/api/auth/validarDoc',
    '/api/auth/validarDni',
    '/api/auth/validar-usuario-correo',
    '/api/auth/validar-paciente',
    '/api/auth/validar-medico',
    '/api/auth/cambiar-password',
    '/api/auth/registrar-usuario',
    '/api/auth/registrar-paciente',
  ];

  const esRutaPublica = rutasPublicas.some((ruta) =>
    request.url.includes(ruta),
  );

  const headersBase = {
    Accept: 'application/json',
  };

  if (!token || esRutaPublica) {
    const requestPublica = request.clone({
      setHeaders: headersBase,
    });

    return next(requestPublica);
  }

  const requestConToken = request.clone({
    setHeaders: {
      ...headersBase,
      Authorization: `Bearer ${token}`,
    },
  });

  return next(requestConToken);
};