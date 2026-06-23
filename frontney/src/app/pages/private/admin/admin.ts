import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminService } from '../../../core/services/admin';
import {
  AdminPage,
  CitaAdmin,
  EspecialidadAdmin,
  EspecialidadRequest,
  MedicoAdmin,
  MedicoRequest,
  PacienteAdmin,
  UsuarioAdmin,
} from '../../../core/models/admin.model';

type TabAdmin = 'usuarios' | 'medicos' | 'pacientes' | 'especialidades' | 'citas';

declare const Swal: any;
declare const bootstrap: any;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  navbarConSombra = false;

  tabActual: TabAdmin = 'usuarios';

  usuarios: UsuarioAdmin[] = [];
  medicos: MedicoAdmin[] = [];
  pacientes: PacienteAdmin[] = [];
  especialidades: EspecialidadAdmin[] = [];
  citas: CitaAdmin[] = [];

  cargandoUsuarios = false;
  cargandoMedicos = false;
  cargandoPacientes = false;
  cargandoEspecialidades = false;
  cargandoCitas = false;

  buscarUsuarios = '';
  buscarMedicos = '';
  buscarPacientes = '';
  buscarEspecialidades = '';
  buscarCitas = '';

  pageUsuarios: AdminPage<UsuarioAdmin> | null = null;
  pageMedicos: AdminPage<MedicoAdmin> | null = null;
  pagePacientes: AdminPage<PacienteAdmin> | null = null;
  pageEspecialidades: AdminPage<EspecialidadAdmin> | null = null;
  pageCitas: AdminPage<CitaAdmin> | null = null;

  pageMedicosActual = 0;
  pagePacientesActual = 0;
  pageEspecialidadesActual = 0;
  pageCitasActual = 0;

  size = 10;

  datosCargados = {
    usuarios: false,
    medicos: false,
    pacientes: false,
    especialidades: false,
    citas: false,
  };

  modoMedico: 'crear' | 'editar' = 'crear';
  modoEspecialidad: 'crear' | 'editar' = 'crear';

  medicoSeleccionado: MedicoAdmin | null = null;
  especialidadSeleccionada: EspecialidadAdmin | null = null;

  guardandoMedico = false;
  guardandoEspecialidad = false;
  cambiandoEstadoEspecialidad = false;

  formMedico = this.fb.group({
    idespecialidad: [null as number | null, [Validators.required]],
    nombresMedico: ['', [Validators.required]],
    apellidosMedico: ['', [Validators.required]],
    cmpMedico: ['', [Validators.required]],
    telefonoMedico: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    idRol: [2, [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(4)]],
    correo: ['', [Validators.required, Validators.email]],
  });

  formEspecialidad = this.fb.group({
    nombreEspecialidad: ['', [Validators.required]],
    descripcionEspecialidad: ['', [Validators.required]],
    estadoEspecialidad: [1, [Validators.required]],
  });

  ngOnInit(): void {
    this.cargarTodo();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.navbarConSombra = window.scrollY > 80;
  }

  cargarTodo(): void {
    this.cargarUsuarios(true);
    this.cargarMedicos(0, true);
    this.cargarPacientes(0, true);
    this.cargarEspecialidades(0, true);

    // No se carga citas al iniciar para evitar demora o 403.
    // Las citas se cargarán solo cuando se entre al tab "Citas".
  }

  cambiarTab(tab: TabAdmin): void {
    this.tabActual = tab;

    if (tab === 'usuarios') {
      this.cargarUsuarios(false);
    }

    if (tab === 'medicos') {
      this.cargarMedicos(this.pageMedicosActual, false);
    }

    if (tab === 'pacientes') {
      this.cargarPacientes(this.pagePacientesActual, false);
    }

    if (tab === 'especialidades') {
      this.cargarEspecialidades(this.pageEspecialidadesActual, false);
    }

    if (tab === 'citas') {
      this.cargarCitas(this.pageCitasActual, false);
    }
  }

  cargarUsuarios(forzar = true): void {
    if (this.cargandoUsuarios) {
      return;
    }

    if (!forzar && this.datosCargados.usuarios) {
      return;
    }

    this.cargandoUsuarios = true;

    this.adminService
      .listarUsuariosActivos()
      .pipe(finalize(() => (this.cargandoUsuarios = false)))
      .subscribe({
        next: (page) => {
          this.pageUsuarios = page;
          this.usuarios = page.content ?? [];
          this.datosCargados.usuarios = true;
        },
        error: (error) => {
          this.usuarios = [];
          this.pageUsuarios = this.paginaVacia<UsuarioAdmin>();
          this.datosCargados.usuarios = false;
          this.mostrarError('No se pudo cargar usuarios.', error);
        },
      });
  }

  cargarMedicos(page = this.pageMedicosActual, forzar = true): void {
    if (this.cargandoMedicos) {
      return;
    }

    if (!forzar && this.datosCargados.medicos) {
      return;
    }

    this.cargandoMedicos = true;
    this.pageMedicosActual = page;

    this.adminService
      .listarMedicos(page, this.size)
      .pipe(finalize(() => (this.cargandoMedicos = false)))
      .subscribe({
        next: (data) => {
          this.pageMedicos = data;
          this.medicos = data.content ?? [];
          this.datosCargados.medicos = true;
        },
        error: (error) => {
          this.medicos = [];
          this.pageMedicos = this.paginaVacia<MedicoAdmin>();
          this.datosCargados.medicos = false;
          this.mostrarError('No se pudo cargar médicos.', error);
        },
      });
  }

  cargarPacientes(page = this.pagePacientesActual, forzar = true): void {
    if (this.cargandoPacientes) {
      return;
    }

    if (!forzar && this.datosCargados.pacientes) {
      return;
    }

    this.cargandoPacientes = true;
    this.pagePacientesActual = page;

    this.adminService
      .listarPacientes(page, this.size)
      .pipe(finalize(() => (this.cargandoPacientes = false)))
      .subscribe({
        next: (data) => {
          this.pagePacientes = data;
          this.pacientes = data.content ?? [];
          this.datosCargados.pacientes = true;
        },
        error: (error) => {
          this.pacientes = [];
          this.pagePacientes = this.paginaVacia<PacienteAdmin>();
          this.datosCargados.pacientes = false;
          this.mostrarError('No se pudo cargar pacientes.', error);
        },
      });
  }

  cargarEspecialidades(page = this.pageEspecialidadesActual, forzar = true): void {
    if (this.cargandoEspecialidades) {
      return;
    }

    if (!forzar && this.datosCargados.especialidades) {
      return;
    }

    this.cargandoEspecialidades = true;
    this.pageEspecialidadesActual = page;

    this.adminService
      .listarEspecialidades(page, this.size)
      .pipe(finalize(() => (this.cargandoEspecialidades = false)))
      .subscribe({
        next: (data) => {
          this.pageEspecialidades = data;
          this.especialidades = data.content ?? [];
          this.datosCargados.especialidades = true;
        },
        error: (error) => {
          console.error('No se pudo cargar especialidades.', error);
          this.pageEspecialidades = this.paginaVacia<EspecialidadAdmin>();
          this.especialidades = [];
          this.datosCargados.especialidades = false;
        },
      });
  }

  cargarCitas(page = this.pageCitasActual, forzar = true): void {
    if (this.cargandoCitas) {
      return;
    }

    if (!forzar && this.datosCargados.citas) {
      return;
    }

    this.cargandoCitas = true;
    this.pageCitasActual = page;

    this.adminService
      .listarCitas(page, this.size)
      .pipe(finalize(() => (this.cargandoCitas = false)))
      .subscribe({
        next: (data) => {
          this.pageCitas = data;
          this.citas = data.content ?? [];
          this.datosCargados.citas = true;
        },
        error: (error) => {
          console.error('No se pudo cargar citas.', error);
          this.pageCitas = this.paginaVacia<CitaAdmin>();
          this.citas = [];
          this.datosCargados.citas = false;
        },
      });
  }

  get usuariosFiltrados(): UsuarioAdmin[] {
    const texto = this.buscarUsuarios.toLowerCase().trim();

    if (!texto) {
      return this.usuarios;
    }

    return this.usuarios.filter((u) =>
      `${u.username ?? ''} ${u.correo ?? ''} ${u.nombreRol ?? ''}`
        .toLowerCase()
        .includes(texto),
    );
  }

  get medicosFiltrados(): MedicoAdmin[] {
    const texto = this.buscarMedicos.toLowerCase().trim();

    if (!texto) {
      return this.medicos;
    }

    return this.medicos.filter((m) =>
      `${m.nombresMedico ?? ''} ${m.apellidosMedico ?? ''} ${m.cmpMedico ?? ''} ${m.especialidad ?? ''} ${m.usuarioMedico ?? ''} ${m.correoMedico ?? ''}`
        .toLowerCase()
        .includes(texto),
    );
  }

  get pacientesFiltrados(): PacienteAdmin[] {
    const texto = this.buscarPacientes.toLowerCase().trim();

    if (!texto) {
      return this.pacientes;
    }

    return this.pacientes.filter((p) =>
      `${p.nombresPaciente ?? ''} ${p.apellidosPaciente ?? ''} ${p.numeroDocumentoPaciente ?? ''} ${p.usuarioPaciente ?? ''} ${p.correoPaciente ?? ''}`
        .toLowerCase()
        .includes(texto),
    );
  }

  get especialidadesFiltradas(): EspecialidadAdmin[] {
    const texto = this.buscarEspecialidades.toLowerCase().trim();

    if (!texto) {
      return this.especialidades;
    }

    return this.especialidades.filter((e) =>
      `${this.nombreEspecialidad(e)} ${this.descripcionEspecialidad(e)}`
        .toLowerCase()
        .includes(texto),
    );
  }

  get citasFiltradas(): CitaAdmin[] {
    const texto = this.buscarCitas.toLowerCase().trim();

    if (!texto) {
      return this.citas;
    }

    return this.citas.filter((c) =>
      `${c.paciente ?? ''} ${c.medico ?? ''} ${c.especialidad ?? ''} ${c.motivoCita ?? c.motivo_cita ?? ''} ${c.estado ?? ''}`
        .toLowerCase()
        .includes(texto),
    );
  }

  siguienteMedicos(): void {
    if (!this.pageMedicos?.last) {
      this.cargarMedicos(this.pageMedicosActual + 1, true);
    }
  }

  anteriorMedicos(): void {
    if (!this.pageMedicos?.first) {
      this.cargarMedicos(this.pageMedicosActual - 1, true);
    }
  }

  siguientePacientes(): void {
    if (!this.pagePacientes?.last) {
      this.cargarPacientes(this.pagePacientesActual + 1, true);
    }
  }

  anteriorPacientes(): void {
    if (!this.pagePacientes?.first) {
      this.cargarPacientes(this.pagePacientesActual - 1, true);
    }
  }

  siguienteEspecialidades(): void {
    if (!this.pageEspecialidades?.last) {
      this.cargarEspecialidades(this.pageEspecialidadesActual + 1, true);
    }
  }

  anteriorEspecialidades(): void {
    if (!this.pageEspecialidades?.first) {
      this.cargarEspecialidades(this.pageEspecialidadesActual - 1, true);
    }
  }

  siguienteCitas(): void {
    if (!this.pageCitas?.last) {
      this.cargarCitas(this.pageCitasActual + 1, true);
    }
  }

  anteriorCitas(): void {
    if (!this.pageCitas?.first) {
      this.cargarCitas(this.pageCitasActual - 1, true);
    }
  }

  abrirCrearMedico(): void {
    this.modoMedico = 'crear';
    this.medicoSeleccionado = null;

    if (this.especialidades.length === 0) {
      this.cargarEspecialidades(0, true);
    }

    this.formMedico.reset({
      idespecialidad: null,
      nombresMedico: '',
      apellidosMedico: '',
      cmpMedico: '',
      telefonoMedico: '',
      idRol: 2,
      username: '',
      correo: '',
    });

    this.abrirModal('modalMedicoAdmin');
  }

  abrirEditarMedico(medico: MedicoAdmin): void {
    this.modoMedico = 'editar';
    this.medicoSeleccionado = medico;

    if (this.especialidades.length === 0) {
      this.cargarEspecialidades(0, true);
    }

    this.formMedico.reset({
      idespecialidad: medico.idespecialidad ?? null,
      nombresMedico: medico.nombresMedico ?? '',
      apellidosMedico: medico.apellidosMedico ?? '',
      cmpMedico: medico.cmpMedico ?? '',
      telefonoMedico: medico.telefonoMedico ?? '',
      idRol: 2,
      username: medico.usuarioMedico ?? '',
      correo: medico.correoMedico ?? '',
    });

    this.abrirModal('modalMedicoAdmin');
  }

  guardarMedico(): void {
    if (this.formMedico.invalid) {
      this.formMedico.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Complete correctamente los datos del médico.',
        confirmButtonText: 'Entendido',
      });

      return;
    }

    const form = this.formMedico.getRawValue();

    const request: MedicoRequest = {
      idespecialidad: Number(form.idespecialidad),
      nombresMedico: form.nombresMedico?.trim() ?? '',
      apellidosMedico: form.apellidosMedico?.trim() ?? '',
      cmpMedico: form.cmpMedico?.trim() ?? '',
      telefonoMedico: form.telefonoMedico?.trim() ?? '',
      idRol: Number(form.idRol ?? 2),
      username: form.username?.trim() ?? '',
      correo: form.correo?.trim() ?? '',
    };

    let peticion;

    if (this.modoMedico === 'crear') {
      peticion = this.adminService.crearMedico(request);
    } else {
      const idMedico = this.idMedicoParaActualizar(this.medicoSeleccionado);

      if (!idMedico) {
        Swal.fire({
          icon: 'error',
          title: 'Médico no identificado',
          text: 'No se pudo obtener el ID del médico seleccionado.',
          confirmButtonText: 'Aceptar',
        });

        return;
      }

      peticion = this.adminService.actualizarMedico(idMedico, request);
    }

    this.guardandoMedico = true;

    peticion
      .pipe(finalize(() => (this.guardandoMedico = false)))
      .subscribe({
        next: (response) => {
          if (response?.success !== true) {
            Swal.fire({
              icon: 'error',
              title: 'No se pudo guardar',
              text: response?.message || 'No se pudo guardar el médico.',
              confirmButtonText: 'Aceptar',
            });

            return;
          }

          Swal.fire({
            icon: 'success',
            title: this.modoMedico === 'crear' ? 'Médico registrado' : 'Médico actualizado',
            text: response.message || 'Operación realizada correctamente.',
            timer: 1400,
            showConfirmButton: false,
          }).then(() => {
            this.cerrarModal('modalMedicoAdmin');

            this.tabActual = 'medicos';
            this.buscarMedicos = '';
            this.pageMedicosActual = 0;
            this.datosCargados.medicos = false;
            this.datosCargados.usuarios = false;

            this.cargarMedicos(0, true);
            this.cargarUsuarios(true);
          });
        },

        error: (error) => {
          const mensaje = this.mensajeErrorLimpio(
            error,
            'No se pudo guardar el médico.',
          );

          Swal.fire({
            icon: 'error',
            title: 'Error al guardar médico',
            text: mensaje,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  abrirCrearEspecialidad(): void {
    this.modoEspecialidad = 'crear';
    this.especialidadSeleccionada = null;

    this.formEspecialidad.reset({
      nombreEspecialidad: '',
      descripcionEspecialidad: '',
      estadoEspecialidad: 1,
    });

    this.abrirModal('modalEspecialidadAdmin');
  }

  abrirEditarEspecialidad(especialidad: EspecialidadAdmin): void {
    this.modoEspecialidad = 'editar';
    this.especialidadSeleccionada = especialidad;

    this.formEspecialidad.reset({
      nombreEspecialidad: this.nombreEspecialidad(especialidad),
      descripcionEspecialidad: this.descripcionEspecialidad(especialidad),
      estadoEspecialidad: this.estadoEspecialidad(especialidad),
    });

    this.abrirModal('modalEspecialidadAdmin');
  }

  guardarEspecialidad(): void {
    if (this.formEspecialidad.invalid) {
      this.formEspecialidad.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Complete el nombre y descripción de la especialidad.',
        confirmButtonText: 'Entendido',
      });

      return;
    }

    const form = this.formEspecialidad.getRawValue();

    const request: EspecialidadRequest = {
      nombreEspecialidad: form.nombreEspecialidad?.trim() ?? '',
      descripcionEspecialidad: form.descripcionEspecialidad?.trim() ?? '',
      estadoEspecialidad: Number(form.estadoEspecialidad ?? 1),
    };

    let peticion;

    if (this.modoEspecialidad === 'crear') {
      peticion = this.adminService.crearEspecialidad(request);
    } else {
      const idEspecialidad = this.idEspecialidad(this.especialidadSeleccionada);

      if (!idEspecialidad) {
        Swal.fire({
          icon: 'error',
          title: 'Especialidad no identificada',
          text: 'No se pudo obtener el ID de la especialidad.',
          confirmButtonText: 'Aceptar',
        });

        return;
      }

      peticion = this.adminService.actualizarEspecialidad(idEspecialidad, request);
    }

    this.guardandoEspecialidad = true;

    peticion
      .pipe(finalize(() => (this.guardandoEspecialidad = false)))
      .subscribe({
        next: (response) => {
          if (response?.success !== true) {
            Swal.fire({
              icon: 'error',
              title: 'No se pudo guardar',
              text: response?.message || 'No se pudo guardar la especialidad.',
              confirmButtonText: 'Aceptar',
            });

            return;
          }

          Swal.fire({
            icon: 'success',
            title:
              this.modoEspecialidad === 'crear'
                ? 'Especialidad registrada'
                : 'Especialidad actualizada',
            text: response.message || 'Operación realizada correctamente.',
            timer: 1400,
            showConfirmButton: false,
          }).then(() => {
            this.cerrarModal('modalEspecialidadAdmin');

            this.tabActual = 'especialidades';
            this.buscarEspecialidades = '';
            this.pageEspecialidadesActual = 0;
            this.datosCargados.especialidades = false;

            this.cargarEspecialidades(0, true);
          });
        },

        error: (error) => {
          const mensaje = this.mensajeErrorLimpio(
            error,
            'No se pudo guardar la especialidad.',
          );

          Swal.fire({
            icon: 'error',
            title: 'Error al guardar especialidad',
            text: mensaje,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  confirmarCambioEstadoEspecialidad(especialidad: EspecialidadAdmin): void {
    const id = this.idEspecialidad(especialidad);

    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Especialidad no identificada',
        text: 'No se pudo obtener el ID de la especialidad.',
        confirmButtonText: 'Aceptar',
      });

      return;
    }

    const estadoActual = this.estadoEspecialidad(especialidad);
    const nuevoEstado = estadoActual === 1 ? 0 : 1;

    Swal.fire({
      icon: 'question',
      title: nuevoEstado === 1 ? '¿Activar especialidad?' : '¿Desactivar especialidad?',
      text: `Se cambiará el estado de ${this.nombreEspecialidad(especialidad)}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (!result.isConfirmed) {
        return;
      }

      this.cambiarEstadoEspecialidad(id, nuevoEstado);
    });
  }

  private cambiarEstadoEspecialidad(id: number, estado: number): void {
    this.cambiandoEstadoEspecialidad = true;

    this.adminService
      .cambiarEstadoEspecialidad(id, estado)
      .pipe(finalize(() => (this.cambiandoEstadoEspecialidad = false)))
      .subscribe({
        next: (response) => {
          if (response?.success !== true) {
            Swal.fire({
              icon: 'error',
              title: 'No se pudo cambiar el estado',
              text: response?.message || 'No se pudo actualizar el estado.',
              confirmButtonText: 'Aceptar',
            });

            return;
          }

          Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            text: response.message || 'El estado fue actualizado correctamente.',
            timer: 1200,
            showConfirmButton: false,
          });

          this.datosCargados.especialidades = false;
          this.cargarEspecialidades(0, true);
        },

        error: (error) => {
          const mensaje = this.mensajeErrorLimpio(
            error,
            'No se pudo cambiar el estado.',
          );

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  campoInvalidoMedico(campo: string): boolean {
    const control = this.formMedico.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  campoInvalidoEspecialidad(campo: string): boolean {
    const control = this.formEspecialidad.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  estadoBadge(estado: number | undefined): string {
    return estado === 1 ? 'Activo' : 'Inactivo';
  }

  estadoBadgeClass(estado: number | undefined): string {
    return estado === 1 ? 'bg-success' : 'bg-secondary';
  }

  nombreEspecialidad(e: EspecialidadAdmin): string {
    return (
      e.nombreEspecialidad ??
      e.nombre_especialidad ??
      (e as any).nombreespecialidad ??
      'Sin nombre'
    );
  }

  descripcionEspecialidad(e: EspecialidadAdmin): string {
    return (
      e.descripcionEspecialidad ??
      e.descripcion_especialidad ??
      (e as any).descripcionEspecialidad ??
      (e as any).cripcionespecialidad ??
      (e as any).descripcion ??
      'Sin descripción'
    );
  }

  estadoEspecialidad(especialidad: EspecialidadAdmin | null): number {
    return Number(
      especialidad?.estadoEspecialidad ??
        (especialidad as any)?.estadoespecialidad ??
        1,
    );
  }

  idEspecialidad(especialidad: EspecialidadAdmin | null): number {
    return Number(
      especialidad?.idespecialidades ??
        especialidad?.idEspecialidad ??
        (especialidad as any)?.idespecialidad ??
        (especialidad as any)?.id ??
        0,
    );
  }

  fechaCita(c: CitaAdmin): string {
    return this.formatearFecha(c.fechaCita ?? c.fecha_cita ?? '');
  }

  horaCita(c: CitaAdmin): string {
    return c.horaCita ?? c.hora_cita ?? '-';
  }

  motivoCita(c: CitaAdmin): string {
    return c.motivoCita ?? c.motivo_cita ?? '-';
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) {
      return '-';
    }

    const soloFecha = fecha.split('T')[0];
    const partes = soloFecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  totalUsuarios(): number {
    return this.pageUsuarios?.totalElements ?? this.usuarios.length;
  }

  totalMedicos(): number {
    return this.pageMedicos?.totalElements ?? this.medicos.length;
  }

  totalPacientes(): number {
    return this.pagePacientes?.totalElements ?? this.pacientes.length;
  }

  totalEspecialidades(): number {
    return this.pageEspecialidades?.totalElements ?? this.especialidades.length;
  }

  cerrarSesion(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('usuario_sesion');

    this.router.navigate(['/']);
  }

  private paginaVacia<T>(): AdminPage<T> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: this.size,
      first: true,
      last: true,
    };
  }

  private mostrarError(mensaje: string, error: any): void {
    console.error(mensaje, error);

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: this.mensajeErrorLimpio(error, mensaje),
      confirmButtonText: 'Aceptar',
    });
  }

  private mensajeErrorLimpio(error: any, mensajeDefault: string): string {
    const mensaje =
      error?.error?.message ||
      error?.error?.mensaje ||
      error?.mensajePersonalizado ||
      error?.message ||
      mensajeDefault;

    if (
      String(mensaje).includes('Duplicate entry') ||
      String(mensaje).includes('constraint')
    ) {
      return 'El dato ingresado ya existe en el sistema. Verifique CMP, usuario o correo.';
    }

    if (String(mensaje).includes('403')) {
      return 'No tiene permisos para realizar esta acción.';
    }

    return mensaje;
  }

  private idMedicoParaActualizar(medico: MedicoAdmin | null): number {
    return Number(
      medico?.idusuario ??
        medico?.idmedicos ??
        medico?.idMedico ??
        (medico as any)?.idmedico ??
        (medico as any)?.idMedico ??
        0,
    );
  }

  private abrirModal(idModal: string): void {
    const modalElemento = document.getElementById(idModal);

    if (!modalElemento) {
      return;
    }

    const modal = bootstrap.Modal.getInstance(modalElemento) || new bootstrap.Modal(modalElemento);
    modal.show();
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