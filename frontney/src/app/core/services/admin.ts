import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_ENDPOINTS } from '../config/api.config';
import { ApiResponse } from '../models/auth.model';
import {
  AdminPage,
  CitaAdmin,
  EspecialidadAdmin,
  EspecialidadRequest,
  MedicoAdmin,
  MedicoRequest,
  PacienteAdmin,
  UsuarioAdmin,
} from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);

  listarUsuariosActivos(
    page = 0,
    size = 10,
    filtro = '',
  ): Observable<AdminPage<UsuarioAdmin>> {
    const params = this.construirParams(page, size, filtro);

    return this.http
      .get<any>(API_ENDPOINTS.admin.usuariosActivos, { params })
      .pipe(map((response) => this.normalizarPagina<UsuarioAdmin>(response)));
  }

  listarMedicos(
    page = 0,
    size = 10,
    filtro = '',
  ): Observable<AdminPage<MedicoAdmin>> {
    const params = this.construirParams(page, size, filtro);

    return this.http
      .get<any>(API_ENDPOINTS.admin.medicos, { params })
      .pipe(map((response) => this.normalizarPagina<MedicoAdmin>(response)));
  }

  crearMedico(request: MedicoRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      API_ENDPOINTS.admin.medicos,
      request,
    );
  }

  actualizarMedico(
    id: number,
    request: MedicoRequest,
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_ENDPOINTS.admin.medicos}/${id}`,
      request,
    );
  }

  listarPacientes(
    page = 0,
    size = 10,
    filtro = '',
  ): Observable<AdminPage<PacienteAdmin>> {
    const params = this.construirParams(page, size, filtro);

    return this.http
      .get<any>(API_ENDPOINTS.admin.pacientes, { params })
      .pipe(map((response) => this.normalizarPagina<PacienteAdmin>(response)));
  }

  /**
   * Lista paginada para la tabla de especialidades.
   * Backend:
   * GET /api/especialidades?page=0&size=10&filtro=...
   */
  listarEspecialidades(
    page = 0,
    size = 10,
    filtro = '',
  ): Observable<AdminPage<EspecialidadAdmin>> {
    const params = this.construirParams(page, size, filtro);

    return this.http
      .get<any>(API_ENDPOINTS.admin.especialidades, { params })
      .pipe(
        map((response) => this.normalizarPagina<EspecialidadAdmin>(response)),
      );
  }

  /**
   * Lista solo especialidades activas para el combo de registrar médico.
   * Backend:
   * GET /api/especialidades/activos
   */
  listarEspecialidadesActivas(): Observable<EspecialidadAdmin[]> {
    const endpoint =
      (API_ENDPOINTS.admin as any).especialidadesActivas ??
      `${API_ENDPOINTS.admin.especialidades}/activos`;

    return this.http
      .get<any>(endpoint)
      .pipe(map((response) => this.normalizarLista<EspecialidadAdmin>(response)));
  }

  crearEspecialidad(
    request: EspecialidadRequest,
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      API_ENDPOINTS.admin.especialidades,
      request,
    );
  }

  actualizarEspecialidad(
    id: number,
    request: EspecialidadRequest,
  ): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_ENDPOINTS.admin.especialidades}/${id}`,
      request,
    );
  }

  cambiarEstadoEspecialidad(
    id: number,
    estado: number,
  ): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${API_ENDPOINTS.admin.especialidades}/${id}/estado`,
      {
        estadoEspecialidad: estado,
        estado,
      },
    );
  }

  listarCitas(
    page = 0,
    size = 10,
    filtro = '',
  ): Observable<AdminPage<CitaAdmin>> {
    const params = this.construirParams(page, size, filtro);

    return this.http
      .get<any>(API_ENDPOINTS.admin.citas, { params })
      .pipe(map((response) => this.normalizarPagina<CitaAdmin>(response)));
  }

  private construirParams(
    page: number,
    size: number,
    filtro: string,
  ): HttpParams {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    const filtroLimpio = filtro.trim();

    if (filtroLimpio.length > 0) {
      params = params.set('filtro', filtroLimpio);
    }

    return params;
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

  private normalizarPagina<T>(response: any): AdminPage<T> {
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

    const page = response?.content
      ? response
      : response?.data?.content
        ? response.data
        : null;

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
}