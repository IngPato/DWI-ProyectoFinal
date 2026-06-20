import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {

      const esValidacionRegistro =
        request.url.includes('/api/auth/validarDoc') ||
        request.url.includes('/api/auth/validarDni') ||
        request.url.includes('/api/auth/validar-usuario-correo');

      if (esValidacionRegistro) {
        return throwError(() => error);
      }

      let mensaje = 'Ocurrió un error inesperado.';

      if (error.status === 0) {
        mensaje = 'No se pudo conectar con el servidor. Verifique si el backend está activo.';
      }

      if (error.status === 400) {
        mensaje = error.error?.message || error.error?.mensaje || 'La solicitud enviada no es válida.';
      }

      if (error.status === 401) {
        mensaje = 'Sesión vencida o credenciales incorrectas.';

        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('usuario_sesion');
          localStorage.removeItem('auth_user');
        }

        router.navigate(['/']);
      }

      if (error.status === 403) {
        mensaje = 'No tiene permisos para realizar esta acción.';
      }

      if (error.status === 404) {
        mensaje = 'El recurso solicitado no fue encontrado.';
      }

      if (error.status === 409) {
        mensaje = error.error?.message || error.error?.mensaje || 'Existe un conflicto con la información enviada.';
      }

      if (error.status === 500) {
        mensaje = 'Error interno del servidor. Intente nuevamente más tarde.';
      }

      console.error('Error HTTP:', {
        url: request.url,
        status: error.status,
        message: mensaje,
        error
      });

      return throwError(() => ({
        ...error,
        mensajePersonalizado: mensaje
      }));
    })
  );
};