import { HttpClient } from '@angular/common/http';
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

  listarUsuariosActivos(): Observable<AdminPage<UsuarioAdmin>> {
    return this.http.get<any>(API_ENDPOINTS.admin.usuariosActivos).pipe(
      map((response) => this.normalizarPagina<UsuarioAdmin>(response)),
    );
  }

  listarMedicos(page = 0, size = 10): Observable<AdminPage<MedicoAdmin>> {
    return this.http.get<any>(
      `${API_ENDPOINTS.admin.medicos}?page=${page}&size=${size}`,
    ).pipe(
      map((response) => this.normalizarPagina<MedicoAdmin>(response)),
    );
  }

crearMedico(request: MedicoRequest): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    API_ENDPOINTS.admin.medicos,
    request
  );
}

actualizarMedico(id: number, request: MedicoRequest): Observable<ApiResponse<any>> {
  return this.http.put<ApiResponse<any>>(
    `${API_ENDPOINTS.admin.medicos}/${id}`,
    request
  );
}

  listarPacientes(page = 0, size = 10): Observable<AdminPage<PacienteAdmin>> {
    return this.http.get<any>(
      `${API_ENDPOINTS.admin.pacientes}?page=${page}&size=${size}`,
    ).pipe(
      map((response) => this.normalizarPagina<PacienteAdmin>(response)),
    );
  }

 listarEspecialidades(page = 0, size = 10): Observable<AdminPage<EspecialidadAdmin>> {
  return this.http.get<any>(API_ENDPOINTS.admin.especialidadesActivas).pipe(
    map((response) => this.normalizarPagina<EspecialidadAdmin>(response))
  );
}

  crearEspecialidad(request: EspecialidadRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      API_ENDPOINTS.admin.especialidades,
      request,
    );
  }

  actualizarEspecialidad(id: number, request: EspecialidadRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${API_ENDPOINTS.admin.especialidades}/${id}`,
      request,
    );
  }

  cambiarEstadoEspecialidad(id: number, estado: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${API_ENDPOINTS.admin.especialidades}/${id}/estado`,
      { estado },
    );
  }

  listarCitas(page = 0, size = 10): Observable<AdminPage<CitaAdmin>> {
    return this.http.get<any>(
      `${API_ENDPOINTS.admin.citas}?page=${page}&size=${size}`,
    ).pipe(
      map((response) => this.normalizarPagina<CitaAdmin>(response)),
    );
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