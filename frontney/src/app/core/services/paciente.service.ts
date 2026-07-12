import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { API_ENDPOINTS } from '../config/api.config';
import {
  ApiResponsePaciente,
  CambiarEstadoCitaRequest,
  CitaPacienteResponse,
  DisponibilidadCitaOption,
  EspecialidadPacienteOption,
  HorarioPacienteOption,
  MedicoPacienteOption,
  PacientePage,
  RegistrarCitaPacienteRequest,
} from '../models/paciente.model';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private readonly http = inject(HttpClient);

  private readonly citasUrl = API_ENDPOINTS.paciente.citas;

  listarCitasPaciente(
    idPaciente: number,
    page = 0,
    size = 10,
    filtro = '',
  ): Observable<PacientePage<CitaPacienteResponse>> {
    if (!idPaciente) {
      return of(this.paginaVacia<CitaPacienteResponse>(size));
    }

    let params = new HttpParams().set('page', String(page)).set('size', String(size));

    const filtroLimpio = filtro.trim();

    if (filtroLimpio.length > 0) {
      params = params.set('filtro', filtroLimpio);
    }

    return this.http.get<any>(`${this.citasUrl}/paciente/${idPaciente}`, { params }).pipe(
      map((response) => {
        if (response?.success === false) {
          return this.paginaVacia<CitaPacienteResponse>(size);
        }

        return this.normalizarPagina<CitaPacienteResponse>(response);
      }),
      catchError((error) => {
        const mensaje = String(
          error?.error?.message ||
            error?.error?.mensaje ||
            error?.mensajePersonalizado ||
            error?.message ||
            '',
        ).toLowerCase();

        if (error?.status === 400 && mensaje.includes('paciente no existe')) {
          return of(this.paginaVacia<CitaPacienteResponse>(size));
        }

        return throwError(() => error);
      }),
    );
  }

  obtenerCitaPorId(idCita: number): Observable<CitaPacienteResponse | null> {
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

  registrarCitaInteligente(
    request: RegistrarCitaPacienteRequest,
  ): Observable<ApiResponsePaciente<CitaPacienteResponse | null>> {
    return this.http
      .post<
        ApiResponsePaciente<CitaPacienteResponse | null>
      >(`${this.citasUrl}/registrar-inteligente`, request)
      .pipe(
        map((response) => this.normalizarApiResponse<CitaPacienteResponse | null>(response)),
        catchError((error) => {
          return of(
            this.respuestaErrorApi<CitaPacienteResponse | null>(
              error,
              'No se pudo registrar la cita.',
            ),
          );
        }),
      );
  }

  cambiarEstadoCita(
    request: CambiarEstadoCitaRequest,
  ): Observable<ApiResponsePaciente<CitaPacienteResponse | null>> {
    const body: CambiarEstadoCitaRequest = {
      idCita: Number(request.idCita),
      idEstadoCita: Number(request.idEstadoCita),
      observacion: request.observacion?.trim() || 'Cambio de estado de cita.',
    };

    return this.http
      .put<
        ApiResponsePaciente<CitaPacienteResponse | null>
      >(`${this.citasUrl}/cambiar-estado`, body)
      .pipe(
        map((response) => this.normalizarApiResponse<CitaPacienteResponse | null>(response)),
        catchError((error) => {
          return of(
            this.respuestaErrorApi<CitaPacienteResponse | null>(
              error,
              'No se pudo cambiar el estado de la cita.',
            ),
          );
        }),
      );
  }

  cancelarCita(
    idCita: number,
    observacion: string,
  ): Observable<ApiResponsePaciente<CitaPacienteResponse | null>> {
    return this.cambiarEstadoCita({
      idCita: Number(idCita),
      idEstadoCita: 4,
      observacion: observacion?.trim() || 'Cita cancelada por el paciente.',
    });
  }

  listarEspecialidadesActivas(): Observable<EspecialidadPacienteOption[]> {
    return this.http.get<any>(`${API_ENDPOINTS.admin.especialidades}/activos`).pipe(
      map((response) =>
        this.normalizarLista<any>(response).map((item) => ({
          id: Number(
            item.idespecialidades ?? item.idEspecialidad ?? item.idespecialidad ?? item.id ?? 0,
          ),
          nombre:
            item.nombreEspecialidad ??
            item.nombre_especialidad ??
            item.nombreespecialidad ??
            item.nombre ??
            'Sin nombre',
          descripcion:
            item.descripcionEspecialidad ?? item.descripcion_especialidad ?? item.descripcion ?? '',
        })),
      ),
    );
  }

  consultarDisponibilidadCita(
    idEspecialidad: number,
    fecha: string,
  ): Observable<DisponibilidadCitaOption[]> {
    const params = new HttpParams()
      .set('idEspecialidad', String(idEspecialidad))
      .set('fecha', fecha);

    return this.http.get<any>(`${this.citasUrl}/disponibilidad`, { params }).pipe(
      map((response) =>
        this.normalizarLista<any>(response).map((item) => {
          const horaInicio = String(item.horaInicio ?? item.hora_inicio ?? '');
          const horaFin = String(item.horaFin ?? item.hora_fin ?? '');

          const nombreMedico = String(item.nombreMedico ?? '').trim();
          const apellidoMedico = String(item.apellidoMedico ?? '').trim();

          return {
            idMedico: Number(item.idMedico ?? item.idmedico ?? 0),
            nombreMedico,
            apellidoMedico,
            medico: `${nombreMedico} ${apellidoMedico}`.trim(),

            idHorario: Number(item.idHorario ?? item.idhorario ?? item.id_horario ?? 0),
            fecha: String(item.fecha ?? fecha),
            horaInicio,
            horaFin,
            hora: horaFin ? `${horaInicio} - ${horaFin}` : horaInicio,
            cupo: Number(item.cupo ?? 0),
          };
        }),
      ),
      catchError((error) => {
        const mensaje = String(
          error?.error?.message ||
            error?.error?.mensaje ||
            error?.mensajePersonalizado ||
            error?.message ||
            '',
        ).toLowerCase();

        const sinDisponibilidad =
          error?.status === 400 &&
          (mensaje.includes('no existen horarios disponibles') ||
            mensaje.includes('no hay horarios disponibles') ||
            mensaje.includes('especialidad y fecha seleccionada'));

        if (sinDisponibilidad) {
          return of([]);
        }

        return throwError(() => error);
      }),
    );
  }

  listarMedicosPorEspecialidad(idEspecialidad: number): Observable<MedicoPacienteOption[]> {
    return this.http.get<any>(`${API_ENDPOINTS.admin.medicos}/especialidad/${idEspecialidad}`).pipe(
      map((response) =>
        this.normalizarLista<any>(response).map((item) => ({
          id: Number(
            item.idMedico ?? item.idmedico ?? item.idmedicos ?? item.idusuario ?? item.id ?? 0,
          ),
          nombre: `${item.nombresMedico ?? item.nombres_medico ?? item.nombres ?? ''} ${
            item.apellidosMedico ?? item.apellidos_medico ?? item.apellidos ?? ''
          }`.trim(),
          cmp: item.cmpMedico ?? item.cmp_medico ?? item.cmp ?? '',
          telefono: item.telefonoMedico ?? item.telefono_medico ?? item.telefono ?? '',
          idEspecialidad: Number(
            item.idespecialidad ?? item.idEspecialidad ?? item.id_especialidad ?? idEspecialidad,
          ),
        })),
      ),
    );
  }

  listarFechasDisponiblesPorMedico(idMedico: number): Observable<string[]> {
    const apiBase = this.citasUrl.replace(/\/citas$/, '');

    return this.http
      .get<any>(`${apiBase}/horarios-medico/medico/${idMedico}/fechas-disponibles`)
      .pipe(
        map((response) =>
          this.normalizarLista<any>(response)
            .map((item) => String(item.fecha ?? item.fechaHorario ?? item))
            .filter((fecha) => fecha && fecha !== 'undefined'),
        ),
      );
  }

  listarHorariosDisponibles(idMedico: number, fecha: string): Observable<HorarioPacienteOption[]> {
    const apiBase = this.citasUrl.replace(/\/citas$/, '');

    const params = new HttpParams().set('idMedico', String(idMedico)).set('fecha', fecha);

    return this.http.get<any>(`${apiBase}/horarios-medico/disponibles`, { params }).pipe(
      map((response) =>
        this.normalizarLista<any>(response).map((item) => {
          const horaInicio = String(item.horaInicio ?? item.hora_inicio ?? item.horaIni ?? '');

          const horaFin = String(item.horaFin ?? item.hora_fin ?? '');

          return {
            id: Number(
              item.idHorario ??
                item.idhorario ??
                item.id_horario ??
                item.idhorariosMedico ??
                item.idhorarios_medico ??
                item.id ??
                0,
            ),
            fecha: String(item.fecha ?? fecha),
            horaInicio,
            horaFin,
            hora: horaFin ? `${horaInicio} - ${horaFin}` : horaInicio,
            cupo: Number(item.cupo ?? 0),
          };
        }),
      ),
    );
  }
  private normalizarCita(item: any): CitaPacienteResponse {
    const idCita = Number(
      item?.idCita ?? item?.idcita ?? item?.idCitas ?? item?.idcitas ?? item?.id ?? 0,
    );

    const estado =
      item?.estadoCita ??
      item?.estadocita ??
      item?.estado ??
      item?.nombreEstado ??
      item?.nombre_estado ??
      '';

    const fechaCita =
      item?.fechaCita ??
      item?.fechacita ??
      item?.fecha_cita ??
      item?.fecha ??
      item?.fechaHorario ??
      item?.fecha_horario ??
      '';

    const horaInicio =
      item?.horaInicio ??
      item?.horainicio ??
      item?.hora_inicio ??
      item?.horaCita ??
      item?.horacita ??
      item?.hora_cita ??
      '';

    const horaFin = item?.horaFin ?? item?.horafin ?? item?.hora_fin ?? '';

    const horaCita = item?.horaCita ?? item?.horacita ?? item?.hora_cita ?? horaInicio;

    const motivo = item?.motivoCita ?? item?.motivocita ?? item?.motivo_cita ?? item?.motivo ?? '';

    const observacion =
      item?.observacionCita ??
      item?.observacioncita ??
      item?.observacion_cita ??
      item?.observacion ??
      '';

    return {
      ...item,

      id: idCita,
      idCita,
      idcita: idCita,

      idPaciente: Number(item?.idPaciente ?? item?.idpaciente ?? item?.id_paciente ?? 0),
      idMedico: Number(item?.idMedico ?? item?.idmedico ?? item?.id_medico ?? 0),
      idEspecialidad: Number(
        item?.idEspecialidad ?? item?.idespecialidad ?? item?.id_especialidad ?? 0,
      ),
      idHorario: Number(item?.idHorario ?? item?.idhorario ?? item?.id_horario ?? 0),
      idEstadoCita: Number(
        item?.idEstadoCita ?? item?.idestadoCita ?? item?.idestadocita ?? item?.id_estado_cita ?? 0,
      ),

      paciente: item?.paciente ?? '',
      medico: item?.medico ?? '',
      especialidad: item?.especialidad ?? '',

      estado,
      estadoCita: estado,
      estadocita: estado,

      fecha: fechaCita,
      fechaCita,
      fechacita: fechaCita,
      fecha_cita: fechaCita,

      hora: horaCita,
      horaCita,
      horacita: horaCita,
      hora_cita: horaCita,

      horaInicio,
      horaFin,

      motivo,
      motivoCita: motivo,
      motivocita: motivo,
      motivo_cita: motivo,

      observacion,
      observacionCita: observacion,
      observacioncita: observacion,
      observacion_cita: observacion,
    } as CitaPacienteResponse;
  }
  private normalizarApiResponse<T>(response: any): ApiResponsePaciente<T> {
    return {
      success: response?.success === true,
      message: response?.message || response?.mensaje || '',
      data: (response?.data ?? null) as T,
    };
  }

  private respuestaErrorApi<T>(error: any, mensajeDefault: string): ApiResponsePaciente<T> {
    return {
      success: false,
      message:
        error?.error?.message ||
        error?.error?.mensaje ||
        error?.mensajePersonalizado ||
        error?.message ||
        mensajeDefault,
      data: null as T,
    };
  }

  private normalizarPagina<T>(response: any): PacientePage<T> {
    const page = response?.content ? response : response?.data?.content ? response.data : null;

    if (page) {
      return {
        content: page.content ?? [],
        totalElements: page.totalElements ?? 0,
        totalPages: page.totalPages ?? 0,
        number: page.number ?? 0,
        size: page.size ?? 10,
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

    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
    };
  }

  private normalizarLista<T>(response: any): T[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.data?.content)) {
      return response.data.content;
    }

    return [];
  }
  private paginaVacia<T>(size = 10): PacientePage<T> {
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
