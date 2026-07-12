import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
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
        mensaje =
          error.error?.message ||
          error.error?.mensaje ||
          'La solicitud enviada no es válida.';
      }

      if (error.status === 401) {
        mensaje = 'No autorizado. Verifique su sesión o sus credenciales.';
      }

      if (error.status === 403) {
        mensaje = 'No tiene permisos para realizar esta acción.';
      }

      if (error.status === 404) {
        mensaje = 'El recurso solicitado no fue encontrado.';
      }

      if (error.status === 409) {
        mensaje =
          error.error?.message ||
          error.error?.mensaje ||
          'Existe un conflicto con la información enviada.';
      }

      if (error.status === 500) {
        mensaje = 'Error interno del servidor. Intente nuevamente más tarde.';
      }

      const esDisponibilidadSinHorarios =
        request.url.includes('/api/citas/disponibilidad') &&
        error.status === 400 &&
        String(
          error.error?.message ||
            error.error?.mensaje ||
            mensaje ||
            '',
        )
          .toLowerCase()
          .includes('no existen horarios disponibles');

      if (!esDisponibilidadSinHorarios) {
        console.error('Error HTTP:', {
          url: request.url,
          status: error.status,
          message: mensaje,
          error,
        });
      }

      return throwError(() =>
        Object.assign(error, {
          mensajePersonalizado: mensaje,
          esDisponibilidadSinHorarios,
        }),
      );
    }),
  );
};