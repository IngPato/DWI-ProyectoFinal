import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service.ts';

declare const bootstrap: any;

type TipoAlerta = 'success' | 'warning' | 'info' | 'danger';
type EstadoCita = 'Pendiente' | 'Confirmada' | 'Atendida' | 'Cancelada';

interface CitaMedico {
  idcitas: number;
  fecha_cita: string;
  hora_cita: string;
  paciente: string;
  documento: string;
  telefono: string;
  especialidad: string;
  motivo: string;
  observacion: string;
  estado: EstadoCita;
}

interface HorarioMedico {
  idhorarios_medico: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: number;
}

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medico.html',
  styleUrl: './medico.css'
})
export class Medico implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  alertaVisible = false;
  alertaMensaje = '';
  alertaTipo: TipoAlerta = 'info';

  buscarCita = '';
  filtroEstado = '';

  usuarioSesion = this.authService.getUsuario();

  citaSeleccionada: CitaMedico | null = null;

  medico = {
    nombres: '',
    apellidos: '',
    cmp: '458796',
    especialidad: 'Medicina General',
    telefono: '999 555 444',
    username: '',
    estado: 'Activo'
  };

  citasMedico: CitaMedico[] = [
    {
      idcitas: 1,
      fecha_cita: '2026-06-16',
      hora_cita: '08:30',
      paciente: 'María Fernández López',
      documento: '77204177',
      telefono: '999888777',
      especialidad: 'Medicina General',
      motivo: 'Malestar corporal y dolor de cabeza',
      observacion: 'Paciente indica síntomas desde hace dos días.',
      estado: 'Confirmada'
    },
    {
      idcitas: 2,
      fecha_cita: '2026-06-16',
      hora_cita: '10:00',
      paciente: 'José Pérez Ramírez',
      documento: '45879632',
      telefono: '988777666',
      especialidad: 'Medicina General',
      motivo: 'Control médico general',
      observacion: 'Sin observaciones adicionales.',
      estado: 'Pendiente'
    },
    {
      idcitas: 3,
      fecha_cita: '2026-06-17',
      hora_cita: '09:30',
      paciente: 'Ana Torres Díaz',
      documento: '74125896',
      telefono: '977666555',
      especialidad: 'Medicina General',
      motivo: 'Dolor abdominal',
      observacion: 'Paciente solicita evaluación médica.',
      estado: 'Atendida'
    },
    {
      idcitas: 4,
      fecha_cita: '2026-06-18',
      hora_cita: '11:00',
      paciente: 'Luis Mendoza Castro',
      documento: '70214589',
      telefono: '966555444',
      especialidad: 'Medicina General',
      motivo: 'Consulta por fiebre',
      observacion: 'Pendiente de evaluación.',
      estado: 'Pendiente'
    }
  ];

  horariosMedico: HorarioMedico[] = [
    {
      idhorarios_medico: 1,
      fecha: '2026-06-16',
      hora_inicio: '08:00',
      hora_fin: '12:00',
      estado: 1
    },
    {
      idhorarios_medico: 2,
      fecha: '2026-06-17',
      hora_inicio: '08:00',
      hora_fin: '13:00',
      estado: 1
    },
    {
      idhorarios_medico: 3,
      fecha: '2026-06-18',
      hora_inicio: '14:00',
      hora_fin: '17:00',
      estado: 0
    }
  ];

  actualizarEstadoForm = this.fb.group({
    detalleEstado: ['Pendiente' as EstadoCita, [Validators.required]]
  });

  horarioForm = this.fb.group({
    fechaHorario: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    horaFin: ['', [Validators.required]],
    estadoHorario: ['1', [Validators.required]]
  });

  ngOnInit(): void {
    if (this.usuarioSesion?.rol !== 'MEDICO') {
      this.authService.logout();
      this.router.navigate(['/']);
      return;
    }

    this.medico.nombres = this.usuarioSesion?.nombre || 'Médico';
    this.medico.apellidos = this.usuarioSesion?.apellido || '';
    this.medico.username = this.usuarioSesion?.username || '';
  }

  get nombreCompletoMedico(): string {
    return `${this.medico.nombres} ${this.medico.apellidos}`.trim();
  }

  get inicialesMedico(): string {
    const nombre = this.medico.nombres?.trim().charAt(0) || 'M';
    const apellido = this.medico.apellidos?.trim().charAt(0) || 'D';
    return `${nombre}${apellido}`.toUpperCase();
  }

  get totalCitas(): number {
    return this.citasMedico.length;
  }

  get citasPendientes(): number {
    return this.citasMedico.filter(cita => cita.estado === 'Pendiente').length;
  }

  get citasConfirmadas(): number {
    return this.citasMedico.filter(cita => cita.estado === 'Confirmada').length;
  }

  get citasAtendidas(): number {
    return this.citasMedico.filter(cita => cita.estado === 'Atendida').length;
  }

  get citasFiltradas(): CitaMedico[] {
    const texto = this.buscarCita.toLowerCase().trim();
    const estado = this.filtroEstado.trim();

    return this.citasMedico.filter(cita => {
      const coincideTexto =
        texto === '' ||
        cita.paciente.toLowerCase().includes(texto) ||
        cita.motivo.toLowerCase().includes(texto) ||
        cita.especialidad.toLowerCase().includes(texto);

      const coincideEstado = estado === '' || cita.estado === estado;

      return coincideTexto && coincideEstado;
    });
  }

  get citasHoy(): CitaMedico[] {
    const hoy = '2026-06-16';
    return this.citasMedico.filter(cita => cita.fecha_cita === hoy);
  }

  abrirDetalleCita(cita: CitaMedico): void {
    this.citaSeleccionada = cita;

    this.actualizarEstadoForm.patchValue({
      detalleEstado: cita.estado
    });

    const modalElemento = document.getElementById('modalDetalleCita');

    if (modalElemento) {
      const modal = new bootstrap.Modal(modalElemento);
      modal.show();
    }
  }

  actualizarEstadoCita(): void {
    if (!this.citaSeleccionada) {
      this.mostrarAlertaMedico('No se encontró la cita seleccionada.', 'danger');
      return;
    }

    if (this.actualizarEstadoForm.invalid) {
      this.actualizarEstadoForm.markAllAsTouched();
      this.mostrarAlertaMedico('Seleccione un estado válido para la cita.', 'warning');
      return;
    }

    const nuevoEstado = this.actualizarEstadoForm.value.detalleEstado as EstadoCita;

    this.citasMedico = this.citasMedico.map(cita => {
      if (cita.idcitas === this.citaSeleccionada?.idcitas) {
        return {
          ...cita,
          estado: nuevoEstado
        };
      }

      return cita;
    });

    this.citaSeleccionada = {
      ...this.citaSeleccionada,
      estado: nuevoEstado
    };

    this.mostrarAlertaMedico('Estado de cita actualizado correctamente.', 'success');
    this.cerrarModal('modalDetalleCita');
  }

  registrarHorario(): void {
    if (this.horarioForm.invalid) {
      this.horarioForm.markAllAsTouched();
      this.mostrarAlertaMedico('Complete todos los campos del horario.', 'warning');
      return;
    }

    const form = this.horarioForm.getRawValue();

    const fecha = form.fechaHorario || '';
    const horaInicio = form.horaInicio || '';
    const horaFin = form.horaFin || '';
    const estado = Number(form.estadoHorario);

    if (horaInicio >= horaFin) {
      this.mostrarAlertaMedico('La hora de inicio debe ser menor que la hora de fin.', 'warning');
      return;
    }

    const nuevoHorario: HorarioMedico = {
      idhorarios_medico: this.horariosMedico.length + 1,
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      estado
    };

    this.horariosMedico = [nuevoHorario, ...this.horariosMedico];

    this.mostrarAlertaMedico('Horario registrado correctamente.', 'success');

    setTimeout(() => {
      this.cerrarModal('modalHorario');
      this.horarioForm.reset({
        fechaHorario: '',
        horaInicio: '',
        horaFin: '',
        estadoHorario: '1'
      });
    }, 800);
  }

  cambiarEstadoHorario(idHorario: number): void {
    this.horariosMedico = this.horariosMedico.map(horario => {
      if (horario.idhorarios_medico === idHorario) {
        return {
          ...horario,
          estado: horario.estado === 1 ? 0 : 1
        };
      }

      return horario;
    });

    this.mostrarAlertaMedico('Estado del horario actualizado.', 'success');
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      Pendiente: 'bg-warning text-dark',
      Confirmada: 'bg-success',
      Atendida: 'bg-info text-dark',
      Cancelada: 'bg-danger'
    };

    return clases[estado] ?? 'bg-secondary';
  }

  claseHorario(estado: number): string {
    return estado === 1 ? 'bg-success' : 'bg-secondary';
  }

  textoHorario(estado: number): string {
    return estado === 1 ? 'Disponible' : 'No disponible';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) {
      return '';
    }

    const partes = fecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  campoInvalidoHorario(campo: string): boolean {
    const control = this.horarioForm.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private mostrarAlertaMedico(mensaje: string, tipo: TipoAlerta): void {
    this.alertaMensaje = mensaje;
    this.alertaTipo = tipo;
    this.alertaVisible = true;

    setTimeout(() => {
      this.alertaVisible = false;
    }, 3000);
  }

  private cerrarModal(idModal: string): void {
    const modalElemento = document.getElementById(idModal);

    if (!modalElemento) {
      return;
    }

    const modal = bootstrap.Modal.getInstance(modalElemento) || new bootstrap.Modal(modalElemento);
    modal.hide();
  }
}