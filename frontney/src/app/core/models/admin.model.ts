export interface AdminPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface UsuarioAdmin {
  idusuario: number;
  username: string;
  correo: string;
  idRol: number;
  nombreRol: string;
  estado: number;
  fechaCreacion?: string;
}

export interface MedicoAdmin {
  idmedicos?: number;
  idMedico?: number;
  idusuario: number;
  usuarioMedico: string;
  correoMedico: string;
  idespecialidad: number;
  especialidad: string;
  nombresMedico: string;
  apellidosMedico: string;
  cmpMedico: string;
  telefonoMedico: string;
  fecha_creacion?: string;
  fechaCreacion?: string;
  estadoMedico: number;
}

export interface MedicoRequest {
  idespecialidad: number;
  nombresMedico: string;
  apellidosMedico: string;
  cmpMedico: string;
  telefonoMedico: string;
  idRol: number;
  username: string;
  correo: string;
}

export interface PacienteAdmin {
  idusuario: number;
  usuarioPaciente: string;
  correoPaciente: string;
  fechaCreacion?: string;
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

export interface EspecialidadAdmin {
  idespecialidades?: number;
  idEspecialidad?: number;
  nombreEspecialidad?: string;
  nombre_especialidad?: string;
  descripcionEspecialidad?: string;
  descripcion_especialidad?: string;
  estadoEspecialidad?: number;
}

export interface EspecialidadRequest {
  nombreEspecialidad: string;
  descripcionEspecialidad: string;
  estadoEspecialidad: number;
}

export interface CitaAdmin {
  idcitas?: number;
  idCita?: number;
  fechaCita?: string;
  fecha_cita?: string;
  horaCita?: string;
  hora_cita?: string;
  paciente?: string;
  medico?: string;
  especialidad?: string;
  motivoCita?: string;
  motivo_cita?: string;
  estado?: string;
}