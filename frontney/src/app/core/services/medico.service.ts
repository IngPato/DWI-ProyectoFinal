import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { API_ENDPOINTS } from '../config/api.config';
import {
  ApiResponseMedico,
  CambiarEstadoCitaMedicoRequest,
  CitaMedico,
  EstadoCita,
  HorarioMedico,
  HorarioMedicoRequest,
  MedicoPage,
  MedicoPerfil,
} from '../models/medico.model';

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  private readonly http = inject(HttpClient);

private readonly medicoEndpoints = (API_ENDPOINTS as any).medico ?? (API_ENDPOINTS as any).medicos;

private readonly medicoUrl =
  this.medicoEndpoints?.medico ??
  this.medicoEndpoints?.base ??
  this.medicoEndpoints?.perfil;

private readonly citasUrl =
  this.medicoEndpoints?.citas;

private readonly horarioMedicoUrl =
  this.medicoEndpoints?.horarioMedico ??
  this.medicoEndpoints?.horarios;

  obtenerMedicoPorUsuario(idUsuario: number): Observable<MedicoPerfil | null> {
    return this.http.get<any>(`${this.medicoUrl}/${idUsuario}`).pipe(
      map((response) => {
        if (response?.success === false) {
          return null;
        }

        const data = response?.data ?? response;

        if (!data) {
          return null;
        }

        return this.normalizarMedico(data);
      }),
    );
  }

  listarCitasMedico(
    idMedico: number,
    page = 0,
    size = 10,
    filtro = '',
  ): Observable<MedicoPage<CitaMedico>> {
    if (!idMedico) {
      return of(this.paginaVacia<CitaMedico>(size));
    }

    let params = new HttpParams().set('page', String(page)).set('size', String(size));

    const filtroLimpio = filtro.trim();

    if (filtroLimpio.length > 0) {
      params = params.set('filtro', filtroLimpio);
    }

    return this.http.get<any>(`${this.citasUrl}/medico/${idMedico}`, { params }).pipe(
      map((response) => {
        const pagina = this.normalizarPagina<any>(response, size);

        return {
          ...pagina,
          content: pagina.content.map((item) => this.normalizarCita(item)),
        };
      }),
      catchError((error) => {
        const mensaje = String(
          error?.error?.message ||
            error?.error?.mensaje ||
            error?.mensajePersonalizado ||
            error?.message ||
            '',
        ).toLowerCase();

        if (
          error?.status === 400 &&
          (mensaje.includes('medico no existe') || mensaje.includes('médico no existe'))
        ) {
          return of(this.paginaVacia<CitaMedico>(size));
        }

        return throwError(() => error);
      }),
    );
  }

  obtenerCitaPorId(idCita: number): Observable<CitaMedico | null> {
    return this.http.get<any>(`${this.citasUrl}/${idCita}`).pipe(
      map((response) => {
        if (response?.success === false) {
          return null;
        }

        const data = response?.data ?? response;

        if (!data) {
          return null;
        }

        return this.normalizarCita(data);
      }),
    );
  }

  cambiarEstadoCita(request: CambiarEstadoCitaMedicoRequest): Observable<ApiResponseMedico<any>> {
    const body: CambiarEstadoCitaMedicoRequest = {
      idCita: Number(request.idCita),
      idEstadoCita: Number(request.idEstadoCita),
      observacion: request.observacion?.trim() || 'Cambio de estado realizado por el médico.',
    };

    return this.http.put<any>(`${this.citasUrl}/cambiar-estado`, body).pipe(
      map((response) => this.normalizarApiResponse<any>(response)),
      catchError((error) =>
        of(this.respuestaErrorApi<any>(error, 'No se pudo actualizar la cita.')),
      ),
    );
  }

  listarHorariosMedico(
    idMedico: number,
    page = 0,
    size = 10,
    fecha = '',
  ): Observable<MedicoPage<HorarioMedico>> {
    if (!idMedico) {
      return of(this.paginaVacia<HorarioMedico>(size));
    }

    let params = new HttpParams().set('page', String(page)).set('size', String(size));

    const fechaLimpia = fecha.trim();

    if (fechaLimpia.length > 0) {
      params = params.set('fecha', fechaLimpia);
    }

    return this.http.get<any>(`${this.horarioMedicoUrl}/${idMedico}`, { params }).pipe(
      map((response) => {
        const pagina = this.normalizarPagina<any>(response, size);

        return {
          ...pagina,
          content: pagina.content.map((item) => this.normalizarHorario(item, idMedico)),
        };
      }),
    );
  }

  registrarHorario(request: HorarioMedicoRequest): Observable<ApiResponseMedico<any>> {
    const body: HorarioMedicoRequest = {
      idmedico: Number(request.idmedico),
      fecha: request.fecha,
      horaInicio: this.horaParaApi(request.horaInicio),
      horaFin: this.horaParaApi(request.horaFin),
      cupo: 1,
    };

    return this.http.post<any>(this.horarioMedicoUrl, body).pipe(
      map((response) => this.normalizarApiResponse<any>(response)),
      catchError((error) =>
        of(this.respuestaErrorApi<any>(error, 'No se pudo registrar el horario.')),
      ),
    );
  }

  actualizarHorario(
    idHorario: number,
    request: HorarioMedicoRequest,
  ): Observable<ApiResponseMedico<any>> {
    const body: HorarioMedicoRequest = {
      idmedico: Number(request.idmedico),
      fecha: request.fecha,
      horaInicio: this.horaParaApi(request.horaInicio),
      horaFin: this.horaParaApi(request.horaFin),
      cupo: 1,
    };

    return this.http.put<any>(`${this.horarioMedicoUrl}/${idHorario}`, body).pipe(
      map((response) => this.normalizarApiResponse<any>(response)),
      catchError((error) =>
        of(this.respuestaErrorApi<any>(error, 'No se pudo actualizar el horario.')),
      ),
    );
  }

  cambiarEstadoHorario(idHorario: number, estado: number): Observable<ApiResponseMedico<any>> {
    return this.http.patch<any>(`${this.horarioMedicoUrl}/${idHorario}/estado`, { estado }).pipe(
      map((response) => this.normalizarApiResponse<any>(response)),
      catchError((error) =>
        of(this.respuestaErrorApi<any>(error, 'No se pudo cambiar el estado del horario.')),
      ),
    );
  }

  private normalizarMedico(item: any): MedicoPerfil {
    const idMedico = Number(
      item?.idmedicos ?? item?.idMedico ?? item?.idmedico ?? item?.id_medico ?? 0,
    );

    return {
      ...item,
      idmedicos: idMedico,
      idMedico,
      idmedico: idMedico,
      idusuario: Number(item?.idusuario ?? item?.idUsuario ?? item?.id_usuario ?? 0),

      nombresMedico:
        item?.nombresMedico ??
        item?.nombres_medico ??
        item?.nombresmedico ??
        item?.nombreMedico ??
        '',

      apellidosMedico:
        item?.apellidosMedico ?? item?.apellidos_medico ?? item?.apellidosmedico ?? '',

      cmpMedico: item?.cmpMedico ?? item?.cmp_medico ?? item?.cmpmedico ?? item?.cmp ?? '',

      telefonoMedico:
        item?.telefonoMedico ??
        item?.telefono_medico ??
        item?.telefonomedico ??
        item?.telefono ??
        '',

      especialidad:
        item?.especialidad ??
        item?.nombreEspecialidad ??
        item?.nombre_especialidad ??
        'Sin especialidad',

      idespecialidad: Number(item?.idespecialidad ?? item?.idEspecialidad ?? 0),
      idEspecialidad: Number(item?.idespecialidad ?? item?.idEspecialidad ?? 0),
    };
  }

  private normalizarCita(item: any): CitaMedico {
    const idCita = Number(item?.idcita ?? item?.idCita ?? item?.idcitas ?? item?.id ?? 0);

    const estado = this.estadoNormalizado(
      item?.estadoCita ?? item?.estadocita ?? item?.estado ?? '',
    );

    const fecha =
      item?.fechaCita ??
      item?.fechacita ??
      item?.fecha_cita ??
      item?.fecha ??
      item?.fechaHorario ??
      '';

    const horaInicio =
      item?.horaInicio ??
      item?.hora_inicio ??
      item?.horaCita ??
      item?.horacita ??
      item?.hora_cita ??
      '';

    const horaFin = item?.horaFin ?? item?.hora_fin ?? '';

    const hora = item?.horaCita ?? item?.horacita ?? item?.hora_cita ?? horaInicio ?? '';

    return {
      ...item,

      idcitas: idCita,
      idCita,
      idcita: idCita,

      idPaciente: Number(item?.idPaciente ?? item?.idpaciente ?? 0),
      idpaciente: Number(item?.idPaciente ?? item?.idpaciente ?? 0),

      idMedico: Number(item?.idMedico ?? item?.idmedico ?? 0),
      idmedico: Number(item?.idMedico ?? item?.idmedico ?? 0),

      idEspecialidad: Number(item?.idEspecialidad ?? item?.idespecialidad ?? 0),
      idespecialidad: Number(item?.idEspecialidad ?? item?.idespecialidad ?? 0),

      idHorario: Number(item?.idHorario ?? item?.idhorario ?? 0),
      idhorario: Number(item?.idHorario ?? item?.idhorario ?? 0),

      idEstadoCita: Number(
        item?.idEstadoCita ??
          item?.idestadoCita ??
          item?.idestadocita ??
          this.idEstadoDesdeEstado(estado),
      ),
      idestadoCita: Number(
        item?.idEstadoCita ??
          item?.idestadoCita ??
          item?.idestadocita ??
          this.idEstadoDesdeEstado(estado),
      ),

      fecha_cita: fecha,
      fechaCita: fecha,
      fechaHorario: item?.fechaHorario ?? '',
      fechaRegistro: item?.fechaRegistro ?? item?.fechaRegistroCita ?? '',
      fechaRegistroCita: item?.fechaRegistroCita ?? item?.fechaRegistro ?? '',
      fechaActualizacionCita: item?.fechaActualizacionCita ?? '',

      hora_cita: hora,
      horaCita: hora,
      horaInicio,
      horaFin,

      paciente: item?.paciente ?? 'Paciente no registrado',
      documento: item?.documento ?? item?.numeroDocumentoPaciente ?? item?.dni ?? '-',
      telefono: item?.telefono ?? item?.telefonoPaciente ?? '-',
      medico: item?.medico ?? '',
      especialidad: item?.especialidad ?? '-',

      motivo: item?.motivoCita ?? item?.motivocita ?? item?.motivo_cita ?? item?.motivo ?? '-',

      observacion:
        item?.observacionCita ??
        item?.observacioncita ??
        item?.observacion_cita ??
        item?.observacion ??
        'Sin observaciones.',

      estado,
    };
  }

  private normalizarHorario(item: any, idMedico: number): HorarioMedico {
    const idHorario = Number(
      item?.idhorariosMedico ?? item?.idhorarios_medico ?? item?.idHorario ?? item?.id ?? 0,
    );

    const horaInicio = item?.horaInicio ?? item?.hora_inicio ?? item?.horainicio ?? '';

    const horaFin = item?.horaFin ?? item?.hora_fin ?? item?.horafin ?? '';

    return {
      ...item,
      idhorarios_medico: idHorario,
      idhorariosMedico: idHorario,
      idHorario,

      idmedico: Number(item?.idmedico ?? item?.idMedico ?? idMedico),
      idMedico: Number(item?.idmedico ?? item?.idMedico ?? idMedico),

      fecha: item?.fecha ?? '',

      hora_inicio: horaInicio,
      hora_fin: horaFin,

      horaInicio,
      horaFin,

      cupo: Number(item?.cupo ?? 1),
      estado: Number(item?.estado ?? 1),
    };
  }

  private normalizarPagina<T>(response: any, size = 10): MedicoPage<T> {
    const page = response?.content ? response : response?.data?.content ? response.data : null;

    if (page) {
      return {
        content: page.content ?? [],
        totalElements: page.totalElements ?? 0,
        totalPages: page.totalPages ?? 0,
        number: page.number ?? 0,
        size: page.size ?? size,
        first: page.first ?? true,
        last: page.last ?? true,
      };
    }

    if (Array.isArray(response)) {
      return {
        content: response,
        totalElements: response.length,
        totalPages: 1,
        number: 0,
        size: response.length,
        first: true,
        last: true,
      };
    }

    if (Array.isArray(response?.data)) {
      return {
        content: response.data,
        totalElements: response.data.length,
        totalPages: 1,
        number: 0,
        size: response.data.length,
        first: true,
        last: true,
      };
    }

    return this.paginaVacia<T>(size);
  }

  private normalizarApiResponse<T>(response: any): ApiResponseMedico<T> {
    return {
      success: response?.success === true,
      message: response?.message || response?.mensaje || '',
      data: (response?.data ?? null) as T,
    };
  }

  private respuestaErrorApi<T>(error: any, mensajeDefault: string): ApiResponseMedico<T> {
    return {
      success: false,
      message: this.mensajeError(error) || mensajeDefault,
      data: null as T,
    };
  }

  private mensajeError(error: any): string {
    return (
      error?.error?.message ||
      error?.error?.mensaje ||
      error?.mensajePersonalizado ||
      error?.message ||
      ''
    );
  }

  private estadoNormalizado(estado: string): EstadoCita {
    const valor = String(estado || '')
      .toUpperCase()
      .replace(' ', '_')
      .trim();

    if (valor === 'PENDIENTE') return 'PENDIENTE';
    if (valor === 'CONFIRMADA' || valor === 'CONFIRMADO') return 'CONFIRMADA';
    if (valor === 'ATENDIDA' || valor === 'ATENDIDO') return 'ATENDIDA';
    if (valor === 'CANCELADA' || valor === 'CANCELADO') return 'CANCELADA';
    if (valor === 'NO_ASISTIO' || valor === 'NO ASISTIO' || valor === 'NO ASISTIÓ') {
      return 'NO_ASISTIO';
    }

    return '';
  }

  private idEstadoDesdeEstado(estado: EstadoCita | string): number {
    const estadoNormalizado = this.estadoNormalizado(String(estado));

    const estados: Record<string, number> = {
      PENDIENTE: 1,
      CONFIRMADA: 2,
      ATENDIDA: 3,
      CANCELADA: 4,
      NO_ASISTIO: 5,
    };

    return estados[estadoNormalizado] ?? 1;
  }

  private horaParaApi(hora: string): string {
    if (!hora) {
      return '';
    }

    if (hora.length === 5) {
      return `${hora}:00`;
    }

    return hora;
  }

  private paginaVacia<T>(size = 10): MedicoPage<T> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size,
      first: true,
      last: true,
    };
  }
}
