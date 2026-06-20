export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface LoginRequest {
  login: string;
  password: string;
}
export interface CambiarPasswordRequest {
  idusuario: number;
  nuevacontrasena: string;
}
export type RolBackend = 'PACIENTE' | 'MEDICO' | 'ADMIN' | 'RECEPCIONISTA';

export interface LoginResponse {
  idusuario: number;
  rol: RolBackend;
  username: string;
  correo: string;
  nombre: string;
  apellido: string;
  token: string;
  cambiopass?: boolean;
}
export interface UsuarioRegistroRequest {
  username: string;
  correo: string;
  password: string;
  idRol: number;
  cambiarContraseña: boolean;
}

export interface UsuarioResponse {
  idusuario: number;
  idRol: number;
  nombreRol: string;
  username: string;
  correo: string;
  estado: number;
  fechaCreacion: string;
}

export interface PacienteRegistroRequest {
  idusuario: number;
  nombresPaciente: string;
  apellidosPaciente: string;
  tipoDocumentoPaciente: string;
  numeroDocumentoPaciente: string;
  fechaNacimientoPaciente: string;
  grupoSanguineoPaciente: string;
  sexoPaciente: string;
  direccionPaciente: string;
  telefonoPaciente: string;
}

export interface PacienteResponse {
  idusuario: number;
  usuarioPaciente: string;
  correoPaciente: string;
  fechaCreacion: string;

  nombresPaciente: string;
  apellidosPaciente: string;
  tipoDocumentoPaciente: string;
  numeroDocumentoPaciente: string;
  fechaNacimientoPaciente: string;
  grupoSanguineoPaciente: string;
  sexoPaciente: string;
  direccionPaciente: string;
  telefonoPaciente: string;
  estadoPaciente: number;
}