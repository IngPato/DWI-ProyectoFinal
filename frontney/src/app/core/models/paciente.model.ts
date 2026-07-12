export interface PacientePage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface CitaPacienteResponse {
  id?: number;
  idCita?: number;
  idcita?: number;
  idCitas?: number;
  idcitas?: number;

  idPaciente?: number;
  idpaciente?: number;
  id_paciente?: number;

  idMedico?: number;
  idmedico?: number;
  id_medico?: number;

  idEspecialidad?: number;
  idespecialidad?: number;
  id_especialidad?: number;

  idHorario?: number;
  idhorario?: number;
  id_horario?: number;

  idEstadoCita?: number;
  idestadoCita?: number;
  idestadocita?: number;
  id_estado_cita?: number;

  paciente?: string;
  medico?: string;
  especialidad?: string;

  estado?: string;
  estadoCita?: string;
  estadocita?: string;

  fecha?: string;
  fechaCita?: string;
  fechacita?: string;
  fecha_cita?: string;

  fechaHorario?: string;
  fechahorario?: string;
  fecha_horario?: string;

  fechaRegistro?: string;
  fechaRegistroCita?: string;
  fechaActualizacionCita?: string;

  hora?: string;
  horaCita?: string;
  horacita?: string;
  hora_cita?: string;

  horaInicio?: string;
  horainicio?: string;
  hora_inicio?: string;

  horaFin?: string;
  horafin?: string;
  hora_fin?: string;

  motivo?: string;
  motivoCita?: string;
  motivocita?: string;
  motivo_cita?: string;

  observacion?: string;
  observacionCita?: string;
  observacioncita?: string;
  observacion_cita?: string;
}

export interface RegistrarCitaPacienteRequest {
  idPaciente: number;
  idMedico: number;
  idEspecialidad: number;
  idHorario: number;
  fechaCita: string;
  horaCita: string;
  motivoCita: string;
  observacionCita: string;
}

export interface CambiarEstadoCitaRequest {
  idCita: number;
  idEstadoCita: number;
  observacion: string;
}

export interface ApiResponsePaciente<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface EspecialidadPacienteOption {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface DisponibilidadCitaOption {
  idMedico: number;
  nombreMedico: string;
  apellidoMedico: string;
  medico: string;

  idHorario: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  hora: string;
  cupo: number;
}

export interface MedicoDisponibilidadPaciente {
  idMedico: number;
  nombreCompleto: string;
  horarios: DisponibilidadCitaOption[];
}

export interface DiaCalendarioPaciente {
  fecha: string;
  dia: number;
  esMesActual: boolean;
  disponible: boolean;
  seleccionado: boolean;
}

export interface MedicoPacienteOption {
  id: number;
  nombre: string;
  cmp?: string;
  telefono?: string;
  idEspecialidad?: number;
}

export interface HorarioPacienteOption {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  hora: string;
  cupo?: number;
}