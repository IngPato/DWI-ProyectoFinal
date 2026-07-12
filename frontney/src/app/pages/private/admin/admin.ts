import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';

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
export class Admin implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  private readonly destroy$ = new Subject<void>();

  private readonly buscarUsuarios$ = new Subject<string>();
  private readonly buscarMedicos$ = new Subject<string>();
  private readonly buscarPacientes$ = new Subject<string>();
  private readonly buscarEspecialidades$ = new Subject<string>();
  private readonly buscarCitas$ = new Subject<string>();

  private busquedasConfiguradas = false;

  navbarConSombra = false;
  seccionActual: 'resumen' | 'gestion' = 'resumen';
  tabActual: TabAdmin = 'usuarios';

  usuarios: UsuarioAdmin[] = [];
  medicos: MedicoAdmin[] = [];
  pacientes: PacienteAdmin[] = [];
  especialidades: EspecialidadAdmin[] = [];
  especialidadesActivasCombo: EspecialidadAdmin[] = [];
  citas: CitaAdmin[] = [];

  cargandoUsuarios = false;
  cargandoMedicos = false;
  cargandoPacientes = false;
  cargandoEspecialidades = false;
  cargandoEspecialidadesActivas = false;
  cargandoCitas = false;

  private _buscarUsuarios = '';
  private _buscarMedicos = '';
  private _buscarPacientes = '';
  private _buscarEspecialidades = '';
  private _buscarCitas = '';

  get buscarUsuarios(): string {
    return this._buscarUsuarios;
  }

  set buscarUsuarios(valor: string) {
    this._buscarUsuarios = valor ?? '';

    if (this.busquedasConfiguradas) {
      this.buscarUsuarios$.next(this._buscarUsuarios);
    }
  }

  get buscarMedicos(): string {
    return this._buscarMedicos;
  }

  set buscarMedicos(valor: string) {
    this._buscarMedicos = valor ?? '';

    if (this.busquedasConfiguradas) {
      this.buscarMedicos$.next(this._buscarMedicos);
    }
  }

  get buscarPacientes(): string {
    return this._buscarPacientes;
  }

  set buscarPacientes(valor: string) {
    this._buscarPacientes = valor ?? '';

    if (this.busquedasConfiguradas) {
      this.buscarPacientes$.next(this._buscarPacientes);
    }
  }

  get buscarEspecialidades(): string {
    return this._buscarEspecialidades;
  }

  set buscarEspecialidades(valor: string) {
    this._buscarEspecialidades = valor ?? '';

    if (this.busquedasConfiguradas) {
      this.buscarEspecialidades$.next(this._buscarEspecialidades);
    }
  }

  get buscarCitas(): string {
    return this._buscarCitas;
  }

  set buscarCitas(valor: string) {
    this._buscarCitas = valor ?? '';

    if (this.busquedasConfiguradas) {
      this.buscarCitas$.next(this._buscarCitas);
    }
  }

  pageUsuarios: AdminPage<UsuarioAdmin> | null = null;
  pageMedicos: AdminPage<MedicoAdmin> | null = null;
  pagePacientes: AdminPage<PacienteAdmin> | null = null;
  pageEspecialidades: AdminPage<EspecialidadAdmin> | null = null;
  pageCitas: AdminPage<CitaAdmin> | null = null;

  pageUsuariosActual = 0;
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
    if (!this.esNavegador) {
      return;
    }

    this.configurarBusquedas();
    this.cargarDatosInicialesAdmin();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.esNavegador) {
      return;
    }

    this.navbarConSombra = window.scrollY > 80;
  }

  private cargarDatosInicialesAdmin(): void {
    this.cargarUsuarios(0, true);
    this.cargarEspecialidadesActivas(true);

    setTimeout(() => {
      this.cargarMedicos(0, true);
      this.cargarPacientes(0, true);
      this.cargarEspecialidades(0, true);
      this.cargarCitas(0, true);
    }, 0);
  }

  private configurarBusquedas(): void {
    this.buscarUsuarios$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageUsuariosActual = 0;
        this.datosCargados.usuarios = false;
        this.cargarUsuarios(0, true);
      });

    this.buscarMedicos$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageMedicosActual = 0;
        this.datosCargados.medicos = false;
        this.cargarMedicos(0, true);
      });

    this.buscarPacientes$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pagePacientesActual = 0;
        this.datosCargados.pacientes = false;
        this.cargarPacientes(0, true);
      });

    this.buscarEspecialidades$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageEspecialidadesActual = 0;
        this.datosCargados.especialidades = false;
        this.cargarEspecialidades(0, true);
      });

    this.buscarCitas$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageCitasActual = 0;
        this.datosCargados.citas = false;
        this.cargarCitas(0, true);
      });

    this.busquedasConfiguradas = true;
  }

  cargarTodo(): void {
    this.cargarDatosInicialesAdmin();
  }

  cambiarTab(tab: TabAdmin): void {
    this.tabActual = tab;
    this.refrescarVista();

    if (tab === 'usuarios') {
      this.cargarUsuarios(this.pageUsuariosActual, false);
      return;
    }

    if (tab === 'medicos') {
      this.cargarMedicos(this.pageMedicosActual, false);
      return;
    }

    if (tab === 'pacientes') {
      this.cargarPacientes(this.pagePacientesActual, false);
      return;
    }

    if (tab === 'especialidades') {
      this.cargarEspecialidades(this.pageEspecialidadesActual, false);
      return;
    }

    if (tab === 'citas') {
      this.cargarCitas(this.pageCitasActual, false);
    }
  }

  cargarUsuarios(page = this.pageUsuariosActual, forzar = true): void {
    if (!this.esNavegador || this.cargandoUsuarios) {
      return;
    }

    if (!forzar && this.datosCargados.usuarios) {
      return;
    }

    this.cargandoUsuarios = true;
    this.pageUsuariosActual = Math.max(page, 0);
    this.refrescarVista();

    this.adminService
      .listarUsuariosActivos(this.pageUsuariosActual, this.size, this.buscarUsuarios)
      .pipe(
        finalize(() => {
          this.cargandoUsuarios = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (pageData) => {
          this.pageUsuarios = pageData;
          this.usuarios = pageData.content ?? [];
          this.datosCargados.usuarios = true;
          this.refrescarVista();
        },
        error: (error) => {
          this.usuarios = [];
          this.pageUsuarios = this.paginaVacia<UsuarioAdmin>();
          this.datosCargados.usuarios = false;
          this.mostrarError('No se pudo cargar usuarios.', error);
          this.refrescarVista();
        },
      });
  }

  cargarMedicos(page = this.pageMedicosActual, forzar = true): void {
    if (!this.esNavegador || this.cargandoMedicos) {
      return;
    }

    if (!forzar && this.datosCargados.medicos) {
      return;
    }

    this.cargandoMedicos = true;
    this.pageMedicosActual = Math.max(page, 0);
    this.refrescarVista();

    this.adminService
      .listarMedicos(this.pageMedicosActual, this.size, this.buscarMedicos)
      .pipe(
        finalize(() => {
          this.cargandoMedicos = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (data) => {
          this.pageMedicos = data;
          this.medicos = data.content ?? [];
          this.datosCargados.medicos = true;
          this.refrescarVista();
        },
        error: (error) => {
          this.medicos = [];
          this.pageMedicos = this.paginaVacia<MedicoAdmin>();
          this.datosCargados.medicos = false;
          this.mostrarError('No se pudo cargar médicos.', error);
          this.refrescarVista();
        },
      });
  }

  cargarPacientes(page = this.pagePacientesActual, forzar = true): void {
    if (!this.esNavegador || this.cargandoPacientes) {
      return;
    }

    if (!forzar && this.datosCargados.pacientes) {
      return;
    }

    this.cargandoPacientes = true;
    this.pagePacientesActual = Math.max(page, 0);
    this.refrescarVista();

    this.adminService
      .listarPacientes(this.pagePacientesActual, this.size, this.buscarPacientes)
      .pipe(
        finalize(() => {
          this.cargandoPacientes = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (data) => {
          this.pagePacientes = data;
          this.pacientes = data.content ?? [];
          this.datosCargados.pacientes = true;
          this.refrescarVista();
        },
        error: (error) => {
          this.pacientes = [];
          this.pagePacientes = this.paginaVacia<PacienteAdmin>();
          this.datosCargados.pacientes = false;
          this.mostrarError('No se pudo cargar pacientes.', error);
          this.refrescarVista();
        },
      });
  }

  cargarEspecialidades(page = this.pageEspecialidadesActual, forzar = true): void {
    if (!this.esNavegador || this.cargandoEspecialidades) {
      return;
    }

    if (!forzar && this.datosCargados.especialidades) {
      return;
    }

    this.cargandoEspecialidades = true;
    this.pageEspecialidadesActual = Math.max(page, 0);
    this.refrescarVista();

    this.adminService
      .listarEspecialidades(this.pageEspecialidadesActual, this.size, this.buscarEspecialidades)
      .pipe(
        finalize(() => {
          this.cargandoEspecialidades = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (data) => {
          this.pageEspecialidades = data;
          this.especialidades = data.content ?? [];
          this.datosCargados.especialidades = true;
          this.refrescarVista();
        },
        error: (error) => {
          this.especialidades = [];
          this.pageEspecialidades = this.paginaVacia<EspecialidadAdmin>();
          this.datosCargados.especialidades = false;
          this.mostrarError('No se pudo cargar especialidades.', error);
          this.refrescarVista();
        },
      });
  }

  cargarEspecialidadesActivas(forzar = false): void {
    if (!this.esNavegador || this.cargandoEspecialidadesActivas) {
      return;
    }

    if (!forzar && this.especialidadesActivasCombo.length > 0) {
      return;
    }

    this.cargandoEspecialidadesActivas = true;
    this.refrescarVista();

    this.adminService
      .listarEspecialidadesActivas()
      .pipe(
        finalize(() => {
          this.cargandoEspecialidadesActivas = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (data) => {
          this.especialidadesActivasCombo = data ?? [];
          this.refrescarVista();
        },
        error: (error) => {
          this.especialidadesActivasCombo = [];
          this.mostrarError('No se pudo cargar especialidades activas.', error);
          this.refrescarVista();
        },
      });
  }

  cargarCitas(page = this.pageCitasActual, forzar = true): void {
    if (!this.esNavegador || this.cargandoCitas) {
      return;
    }

    if (!forzar && this.datosCargados.citas) {
      return;
    }

    this.cargandoCitas = true;
    this.pageCitasActual = Math.max(page, 0);
    this.refrescarVista();

    this.adminService
      .listarCitas(this.pageCitasActual, this.size, this.buscarCitas)
      .pipe(
        finalize(() => {
          this.cargandoCitas = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (data) => {
          this.pageCitas = data;
          this.citas = data.content ?? [];
          this.datosCargados.citas = true;
          this.refrescarVista();
        },
        error: (error) => {
          this.citas = [];
          this.pageCitas = this.paginaVacia<CitaAdmin>();
          this.datosCargados.citas = false;
          this.mostrarError('No se pudo cargar citas.', error);
          this.refrescarVista();
        },
      });
  }

  get usuariosFiltrados(): UsuarioAdmin[] {
    return this.usuarios;
  }

  get medicosFiltrados(): MedicoAdmin[] {
    return this.medicos;
  }

  get pacientesFiltrados(): PacienteAdmin[] {
    return this.pacientes;
  }

  get especialidadesFiltradas(): EspecialidadAdmin[] {
    return this.especialidades;
  }

  get citasFiltradas(): CitaAdmin[] {
    return this.citas;
  }

  siguienteUsuarios(): void {
    if (!this.pageUsuarios?.last) {
      this.cargarUsuarios(this.pageUsuariosActual + 1, true);
    }
  }

  anteriorUsuarios(): void {
    if (!this.pageUsuarios?.first) {
      this.cargarUsuarios(this.pageUsuariosActual - 1, true);
    }
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

    if (this.especialidadesActivasCombo.length === 0) {
      this.cargarEspecialidadesActivas(true);
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

    this.refrescarVista();
    this.abrirModal('modalMedicoAdmin');
  }

  abrirEditarMedico(medico: MedicoAdmin): void {
    this.modoMedico = 'editar';
    this.medicoSeleccionado = medico;

    if (this.especialidadesActivasCombo.length === 0) {
      this.cargarEspecialidadesActivas(true);
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

    this.refrescarVista();
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
    this.refrescarVista();

    peticion
      .pipe(
        finalize(() => {
          this.guardandoMedico = false;
          this.refrescarVista();
        }),
      )
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
            this._buscarMedicos = '';
            this.pageMedicosActual = 0;
            this.datosCargados.medicos = false;
            this.datosCargados.usuarios = false;

            this.cargarMedicos(0, true);
            this.cargarUsuarios(0, true);
            this.cargarEspecialidadesActivas(true);
            this.refrescarVista();
          });
        },

        error: (error) => {
          const mensaje = this.mensajeErrorLimpio(error, 'No se pudo guardar el médico.');

          Swal.fire({
            icon: 'error',
            title: 'Error al guardar médico',
            text: mensaje,
            confirmButtonText: 'Aceptar',
          });

          this.refrescarVista();
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

    this.refrescarVista();
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

    this.refrescarVista();
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
    this.refrescarVista();

    peticion
      .pipe(
        finalize(() => {
          this.guardandoEspecialidad = false;
          this.refrescarVista();
        }),
      )
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
            this._buscarEspecialidades = '';
            this.pageEspecialidadesActual = 0;
            this.datosCargados.especialidades = false;

            this.cargarEspecialidades(0, true);
            this.cargarEspecialidadesActivas(true);
            this.refrescarVista();
          });
        },

        error: (error) => {
          const mensaje = this.mensajeErrorLimpio(error, 'No se pudo guardar la especialidad.');

          Swal.fire({
            icon: 'error',
            title: 'Error al guardar especialidad',
            text: mensaje,
            confirmButtonText: 'Aceptar',
          });

          this.refrescarVista();
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
    this.refrescarVista();

    this.adminService
      .cambiarEstadoEspecialidad(id, estado)
      .pipe(
        finalize(() => {
          this.cambiandoEstadoEspecialidad = false;
          this.refrescarVista();
        }),
      )
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
            timer: 500,
            showConfirmButton: false,
          });

          this.datosCargados.especialidades = false;
          this.cargarEspecialidades(0, true);
          this.cargarEspecialidadesActivas(true);
          this.refrescarVista();
        },

        error: (error) => {
          const mensaje = this.mensajeErrorLimpio(error, 'No se pudo cambiar el estado.');

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            confirmButtonText: 'Aceptar',
          });

          this.refrescarVista();
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
      e.nombreEspecialidad ?? e.nombre_especialidad ?? (e as any).nombreespecialidad ?? 'Sin nombre'
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
      especialidad?.estadoEspecialidad ?? (especialidad as any)?.estadoespecialidad ?? 1,
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

  async cerrarSesion(): Promise<void> {
    const respuesta = await Swal.fire({
      icon: 'question',
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (!respuesta.isConfirmed) {
      return;
    }

    this.limpiarSesion();

    await this.router.navigateByUrl('/', {
      replaceUrl: true,
    });
  }

  private limpiarSesion(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('usuario_sesion');

    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('usuario_sesion');
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

    this.refrescarVista();
  }

  private mensajeErrorLimpio(error: any, mensajeDefault: string): string {
    const mensaje =
      error?.error?.message ||
      error?.error?.mensaje ||
      error?.mensajePersonalizado ||
      error?.message ||
      mensajeDefault;

    if (String(mensaje).includes('Duplicate entry') || String(mensaje).includes('constraint')) {
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

    setTimeout(() => {
      this.refrescarVista();
    }, 0);
  }

  private cerrarModal(idModal: string): void {
    const modalElemento = document.getElementById(idModal);

    if (!modalElemento) {
      return;
    }

    const modal = bootstrap.Modal.getInstance(modalElemento) || new bootstrap.Modal(modalElemento);
    modal.hide();

    setTimeout(() => {
      this.refrescarVista();
    }, 0);
  }

  irASeccion(seccion: 'resumen' | 'gestion'): void {
    this.seccionActual = seccion;

    const elemento = document.getElementById(seccion);

    if (!elemento) {
      return;
    }

    const alturaNavbar = 90;
    const posicion = elemento.offsetTop - alturaNavbar;

    window.scrollTo({
      top: posicion,
      behavior: 'smooth',
    });

    this.cerrarNavbarMovil();
  }

  private cerrarNavbarMovil(): void {
    const navbarElemento = document.getElementById('navbarAdmin');

    if (!navbarElemento) {
      return;
    }

    const collapse =
      bootstrap.Collapse.getInstance(navbarElemento) ||
      new bootstrap.Collapse(navbarElemento, { toggle: false });

    collapse.hide();
  }

  private refrescarVista(): void {
    if (!this.esNavegador) {
      return;
    }

    try {
      this.cdr.detectChanges();
    } catch {
      // Evita errores si Angular ya cerró o destruyó la vista.
    }
  }
}