import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';

import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  PacienteRegistroRequest,
  CambiarPasswordRequest,
  UsuarioRegistroRequest,
  UsuarioResponse,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'usuario_sesion';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private esNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.auth.login, request).pipe(
      tap((response) => {
        if (response.success && response.data?.token) {
          this.guardarSesion(response.data);
        }
      }),
    );
  }

  guardarSesion(usuario: LoginResponse): void {
    if (!this.esNavegador()) {
      return;
    }

    localStorage.setItem(this.TOKEN_KEY, usuario.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  }

  getToken(): string | null {
    if (!this.esNavegador()) {
      return null;
    }

    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsuario(): LoginResponse | null {
    if (!this.esNavegador()) {
      return null;
    }

    const usuario = localStorage.getItem(this.USER_KEY);

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(usuario) as LoginResponse;
    } catch {
      return null;
    }
  }

  getRol(): string | null {
    return this.getUsuario()?.rol ?? null;
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (!this.esNavegador()) {
      return;
    }

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  validarDniPaciente(documento: string) {
    return this.http
      .get<any>(`${API_ENDPOINTS.auth.validarDoc}?doc=${encodeURIComponent(documento)}`)
      .pipe(
        map((response) => {
          const mensaje = response?.message?.toLowerCase() ?? '';

          if (response?.success === true || mensaje.includes('documento existe')) {
            return true;
          }

          if (response?.success === false || mensaje.includes('documento no existe')) {
            return false;
          }

          return false;
        }),
      );
  }

  validarUsuarioCorreo(usuario: string, email: string) {
    return this.http
      .get<any>(
        `${API_ENDPOINTS.auth.validarUsuarioCorreo}?usuario=${encodeURIComponent(usuario)}&email=${encodeURIComponent(email)}`,
      )
      .pipe(
        map((response) => {
          const mensaje = response?.message?.toLowerCase() ?? '';

          if (response?.success === true || mensaje.includes('usuario existe')) {
            return true;
          }

          if (response?.success === false || mensaje.includes('usuario no existe')) {
            return false;
          }

          return false;
        }),
      );
  }

  registrarUsuario(request: UsuarioRegistroRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(API_ENDPOINTS.auth.registrarUsuario, request);
  }

  registrarPaciente(request: PacienteRegistroRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(API_ENDPOINTS.auth.registrarPaciente, request);
  }

  validarPacienteRecuperacion(documento: string, fechaNacimientoPaciente: string) {
    return this.http.get<any>(
      `${API_ENDPOINTS.auth.validarPacienteRecuperacion}?documento=${encodeURIComponent(documento)}&fechaNacimientoPaciente=${encodeURIComponent(fechaNacimientoPaciente)}`,
    );
  }

  validarMedicoRecuperacion(cmpMedico: string) {
    return this.http.get<any>(
      `${API_ENDPOINTS.auth.validarMedicoRecuperacion}?cmpMedico=${encodeURIComponent(cmpMedico)}`,
    );
  }

  cambiarPasswordPrimerAcceso(request: CambiarPasswordRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(API_ENDPOINTS.auth.cambiarPassword, request);
  }
}