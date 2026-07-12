export type EstadoCita =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'ATENDIDA'
  | 'CANCELADA'
  | 'NO_ASISTIO'
  | '';

export type TipoAlerta = 'success' | 'warning' | 'info' | 'danger';

export interface MedicoPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface MedicoPerfil {
  idmedicos: number;
  idMedico?: number;
  idmedico?: number;
  idusuario?: number;

  nombresMedico: string;
  apellidosMedico?: string;

  cmpMedico: string;
  telefonoMedico: string;

  especialidad: string;
  idespecialidad?: number;
  idEspecialidad?: number;
}

export interface CitaMedico {
  idcitas: number;
  idCita?: number;
  idcita?: number;

  idPaciente?: number;
  idpaciente?: number;

  idMedico?: number;
  idmedico?: number;

  idEspecialidad?: number;
  idespecialidad?: number;

  idHorario?: number;
  idhorario?: number;

  idEstadoCita?: number;
  idestadoCita?: number;
  idestadocita?: number;

  fecha_cita: string;
  fechaCita?: string;
  fechaRegistro?: string;
  fechaRegistroCita?: string;
  fechaActualizacionCita?: string;
  fechaHorario?: string;

  hora_cita: string;
  horaCita?: string;
  horaInicio?: string;
  horaFin?: string;

  paciente: string;
  documento: string;
  telefono: string;
  direccionPaciente: string;
  grupoSanSexo: string;
  medico: string;
  especialidad: string;
  motivo: string;
  observacion: string;
  estado: EstadoCita;
}

export interface HorarioMedico {
  idhorarios_medico: number;
  idhorariosMedico?: number;
  idHorario?: number;

  idmedico?: number;
  idMedico?: number;

  fecha: string;

  hora_inicio: string;
  hora_fin: string;

  horaInicio?: string;
  horaFin?: string;

  cupo: number;
  estado: number;
}

export interface HorarioMedicoRequest {
  idmedico: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cupo: number;
}

export interface CambiarEstadoCitaMedicoRequest {
  idCita: number;
  idEstadoCita: number;
  observacion: string;
}

export interface ApiResponseMedico<T> {
  success: boolean;
  message: string;
  data: T;
}