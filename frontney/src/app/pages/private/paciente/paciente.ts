import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service.ts';

declare const bootstrap: any;

type TipoAlerta = 'success' | 'warning' | 'info' | 'danger';

interface CitaPaciente {
  id: number;
  fecha: string;
  hora: string;
  especialidad: string;
  medico: string;
  motivo: string;
  observacion: string;
  estado: 'Pendiente' | 'Confirmada' | 'Atendida' | 'Cancelada';
}

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './paciente.html',
  styleUrl: './paciente.css'
})
export class Paciente implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  alertaVisible = false;
  alertaMensaje = '';
  alertaTipo: TipoAlerta = 'info';

  buscarCita = '';
  filtroEstadoCita = '';

  citaSeleccionada: CitaPaciente | null = null;

  usuarioSesion = this.authService.getUsuario();

  paciente = {
    nombres: '',
    apellidos: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '77204177',
    fechaNacimiento: '1998-05-12',
    sexo: 'Femenino',
    grupoSanguineo: 'O+',
    telefono: '999888777',
    direccion: 'Jr. Amazonas N.° 123'
  };

  especialidades = [
    { id: 1, nombre: 'Medicina General' },
    { id: 2, nombre: 'Cardiología' },
    { id: 3, nombre: 'Pediatría' },
    { id: 4, nombre: 'Odontología' }
  ];

  medicos = [
    { id: 1, nombre: 'Dr. Carlos Ramírez' },
    { id: 2, nombre: 'Dr. Luis Mendoza' },
    { id: 3, nombre: 'Dra. Ana Torres' }
  ];

  horarios = [
    { id: 1, hora: '08:00 - 08:30' },
    { id: 2, hora: '09:30 - 10:00' },
    { id: 3, hora: '11:00 - 11:30' }
  ];

  citas: CitaPaciente[] = [
    {
      id: 1,
      fecha: '18/06/2026',
      hora: '09:30',
      especialidad: 'Medicina General',
      medico: 'Dr. Carlos Ramírez',
      motivo: 'Malestar corporal',
      observacion: 'Sin observaciones adicionales.',
      estado: 'Confirmada'
    },
    {
      id: 2,
      fecha: '20/06/2026',
      hora: '11:00',
      especialidad: 'Cardiología',
      medico: 'Dr. Luis Mendoza',
      motivo: 'Control preventivo',
      observacion: 'Paciente solicita evaluación preventiva.',
      estado: 'Pendiente'
    },
    {
      id: 3,
      fecha: '10/06/2026',
      hora: '08:00',
      especialidad: 'Odontología',
      medico: 'Dra. Ana Torres',
      motivo: 'Dolor dental',
      observacion: 'Atención realizada.',
      estado: 'Atendida'
    }
  ];

  nuevaCitaForm = this.fb.group({
    id_especialidad: ['', [Validators.required]],
    id_medico: ['', [Validators.required]],
    fecha_cita: ['', [Validators.required]],
    id_horario: ['', [Validators.required]],
    motivo_cita: ['', [Validators.required, Validators.maxLength(250)]],
    observacion_cita: ['', [Validators.maxLength(250)]]
  });

  editarPerfilForm = this.fb.group({
    nombres_paciente: ['', [Validators.required]],
    apellidos_paciente: ['', [Validators.required]],
    tipo_documento_paciente: ['DNI', [Validators.required]],
    numero_documento_paciente: ['', [Validators.required]],
    fecha_nacimiento_paciente: ['', [Validators.required]],
    sexo_paciente: ['', [Validators.required]],
    grupo_sanguineo_paciente: [''],
    telefono_paciente: [''],
    direccion_paciente: ['']
  });

  ngOnInit(): void {
    if (this.usuarioSesion?.rol !== 'PACIENTE') {
      this.authService.logout();
      this.router.navigate(['/']);
      return;
    }

    this.paciente.nombres = this.usuarioSesion?.nombre || 'Paciente';
    this.paciente.apellidos = this.usuarioSesion?.apellido || '';

    this.editarPerfilForm.patchValue({
      nombres_paciente: this.paciente.nombres,
      apellidos_paciente: this.paciente.apellidos,
      tipo_documento_paciente: this.paciente.tipoDocumento,
      numero_documento_paciente: this.paciente.numeroDocumento,
      fecha_nacimiento_paciente: this.paciente.fechaNacimiento,
      sexo_paciente: this.paciente.sexo,
      grupo_sanguineo_paciente: this.paciente.grupoSanguineo,
      telefono_paciente: this.paciente.telefono,
      direccion_paciente: this.paciente.direccion
    });
  }

  get nombreCompletoPaciente(): string {
    return `${this.paciente.nombres} ${this.paciente.apellidos}`.trim();
  }

  get inicialesPaciente(): string {
    const nombres = this.paciente.nombres?.trim().charAt(0) || 'P';
    const apellidos = this.paciente.apellidos?.trim().charAt(0) || 'A';
    return `${nombres}${apellidos}`.toUpperCase();
  }

  get totalCitas(): number {
    return this.citas.length;
  }

  get citasPendientes(): number {
    return this.citas.filter(cita => cita.estado === 'Pendiente').length;
  }

  get citasConfirmadas(): number {
    return this.citas.filter(cita => cita.estado === 'Confirmada').length;
  }

  get citasAtendidas(): number {
    return this.citas.filter(cita => cita.estado === 'Atendida').length;
  }

  get proximaCita(): CitaPaciente | null {
    return this.citas.find(cita => cita.estado === 'Confirmada' || cita.estado === 'Pendiente') ?? null;
  }

  get citasFiltradas(): CitaPaciente[] {
    const texto = this.buscarCita.toLowerCase().trim();
    const estado = this.filtroEstadoCita.toLowerCase().trim();

    return this.citas.filter(cita => {
      const contenido = `
        ${cita.fecha}
        ${cita.hora}
        ${cita.especialidad}
        ${cita.medico}
        ${cita.motivo}
        ${cita.estado}
      `.toLowerCase();

      const coincideTexto = texto === '' || contenido.includes(texto);
      const coincideEstado = estado === '' || cita.estado.toLowerCase() === estado;

      return coincideTexto && coincideEstado;
    });
  }

  guardarNuevaCita(): void {
    if (this.nuevaCitaForm.invalid) {
      this.nuevaCitaForm.markAllAsTouched();
      this.mostrarAlertaPaciente('Complete todos los campos obligatorios de la cita.', 'warning');
      return;
    }

    const form = this.nuevaCitaForm.getRawValue();

    const especialidad = this.especialidades.find(e => e.id === Number(form.id_especialidad));
    const medico = this.medicos.find(m => m.id === Number(form.id_medico));
    const horario = this.horarios.find(h => h.id === Number(form.id_horario));

    const nuevaCita: CitaPaciente = {
      id: this.citas.length + 1,
      fecha: this.formatearFecha(form.fecha_cita || ''),
      hora: horario?.hora.split(' - ')[0] || '',
      especialidad: especialidad?.nombre || '',
      medico: medico?.nombre || '',
      motivo: form.motivo_cita || '',
      observacion: form.observacion_cita || 'Sin observaciones adicionales.',
      estado: 'Pendiente'
    };

    this.citas = [nuevaCita, ...this.citas];

    this.mostrarAlertaPaciente('Cita registrada correctamente como pendiente.', 'success');

    setTimeout(() => {
      this.cerrarModal('modalNuevaCita');
      this.nuevaCitaForm.reset();
    }, 900);
  }

  actualizarPerfil(): void {
    if (this.editarPerfilForm.invalid) {
      this.editarPerfilForm.markAllAsTouched();
      this.mostrarAlertaPaciente('Complete los datos principales del paciente.', 'warning');
      return;
    }

    const form = this.editarPerfilForm.getRawValue();

    this.paciente = {
      nombres: form.nombres_paciente || '',
      apellidos: form.apellidos_paciente || '',
      tipoDocumento: form.tipo_documento_paciente || 'DNI',
      numeroDocumento: form.numero_documento_paciente || '',
      fechaNacimiento: form.fecha_nacimiento_paciente || '',
      sexo: form.sexo_paciente || '',
      grupoSanguineo: form.grupo_sanguineo_paciente || '',
      telefono: form.telefono_paciente || '',
      direccion: form.direccion_paciente || ''
    };

    this.mostrarAlertaPaciente('Datos del paciente actualizados correctamente.', 'success');

    setTimeout(() => {
      this.cerrarModal('modalEditarPerfil');
    }, 900);
  }

  verDetalle(cita: CitaPaciente): void {
    this.citaSeleccionada = cita;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  campoInvalidoFormularioCita(campo: string): boolean {
    const control = this.nuevaCitaForm.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  campoInvalidoPerfil(campo: string): boolean {
    const control = this.editarPerfilForm.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
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

  private mostrarAlertaPaciente(mensaje: string, tipo: TipoAlerta): void {
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

  private formatearFecha(fecha: string): string {
    if (!fecha) {
      return '';
    }

    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }
}
