import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service.ts';
import { MedicoService } from '../../../core/services/medico.service';
import {
  CitaMedico,
  EstadoCita,
  HorarioMedico,
  HorarioMedicoRequest,
  MedicoPage,
  MedicoPerfil,
  TipoAlerta,
} from '../../../core/models/medico.model';

declare const bootstrap: any;
declare const Swal: any;

type SeccionMedico = 'resumen' | 'citas' | 'horarios';

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medico.html',
  styleUrl: './medico.css',
})
export class Medico implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly medicoService = inject(MedicoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  private readonly destroy$ = new Subject<void>();
  private readonly buscarCita$ = new Subject<string>();
  private readonly buscarHorario$ = new Subject<string>();

  seccionActual: SeccionMedico = 'resumen';

  usuarioSesion = this.obtenerUsuarioSesion();
  idMedicoSesion = 0;

  buscarCita = '';
  filtroEstado = '';
  filtroFechaHorario = '';

  citasMedico: CitaMedico[] = [];
  citasHoyLista: CitaMedico[] = [];
  horariosMedico: HorarioMedico[] = [];

  pageCitas: MedicoPage<CitaMedico> | null = null;
  pageHorarios: MedicoPage<HorarioMedico> | null = null;

  pageCitasActual = 0;
  pageHorariosActual = 0;
  size = 10;

  cargandoPerfilMedico = false;
  cargandoCitas = false;
  cargandoDetalleCita = false;
  cargandoHorarios = false;
  guardandoEstadoCita = false;
  guardandoHorario = false;
  cambiandoEstadoHorario = false;

  citaSeleccionada: CitaMedico | null = null;
  horarioSeleccionado: HorarioMedico | null = null;

  modoHorario: 'crear' | 'editar' = 'crear';

  medico = {
    nombres: '',
    apellidos: '',
    cmp: '',
    especialidad: '',
    idEspecialidad: 0,
    telefono: '',
    username: '',
    correo: '',
    estado: 'Activo',
  };

  actualizarEstadoForm = this.fb.group({
    idEstadoCita: ['1', [Validators.required]],
    observacion: ['', [Validators.maxLength(250)]],
  });

  horarioForm = this.fb.group({
    fechaHorario: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    horaFin: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (!this.esNavegador) {
      return;
    }

    this.usuarioSesion = this.obtenerUsuarioSesion();

    if (!this.esMedicoValido()) {
      this.router.navigateByUrl('/', { replaceUrl: true });
      return;
    }

    this.idMedicoSesion = this.obtenerIdMedicoSesion();

    this.inicializarDatosMedicoDesdeSesion();
    this.configurarBusquedas();
    this.cargarDatosInicialesMedico();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    return this.pageCitas?.totalElements ?? this.citasMedico.length;
  }

  get citasPendientes(): number {
    return this.citasMedico.filter((cita) => cita.estado === 'PENDIENTE').length;
  }

  get citasConfirmadas(): number {
    return this.citasMedico.filter((cita) => cita.estado === 'CONFIRMADA').length;
  }

  get citasAtendidas(): number {
    return this.citasMedico.filter((cita) => cita.estado === 'ATENDIDA').length;
  }

  get citasFiltradas(): CitaMedico[] {
    if (!this.filtroEstado) {
      return this.citasMedico;
    }

    return this.citasMedico.filter((cita) => cita.estado === this.filtroEstado);
  }

  get citasHoy(): CitaMedico[] {
    return this.citasHoyLista;
  }

  get totalHorarios(): number {
    return this.pageHorarios?.totalElements ?? this.horariosMedico.length;
  }

  private configurarBusquedas(): void {
    this.buscarCita$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageCitasActual = 0;
        this.cargarCitasMedico(0, true);
      });

    this.buscarHorario$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageHorariosActual = 0;
        this.cargarHorariosMedico(0, true);
      });
  }

  private cargarDatosInicialesMedico(): void {
    this.cargarMedicoDesdeUsuarioSesion();
  }

  private inicializarDatosMedicoDesdeSesion(): void {
    const medicoStorage = this.usuarioSesion?.medico ?? this.usuarioSesion?.data?.medico ?? null;

    if (medicoStorage) {
      this.aplicarDatosMedicoDesdeApi(medicoStorage, false);
      return;
    }

    this.medico.nombres =
      this.usuarioSesion?.nombre ||
      this.usuarioSesion?.nombres ||
      this.usuarioSesion?.username ||
      'Médico';

    this.medico.apellidos = this.usuarioSesion?.apellido || this.usuarioSesion?.apellidos || '';
    this.medico.username = this.usuarioSesion?.username || '';
    this.medico.correo = this.usuarioSesion?.correo || '';
  }

  private cargarMedicoDesdeUsuarioSesion(): void {
    if (!this.esNavegador || this.cargandoPerfilMedico) {
      return;
    }

    const idUsuario = this.obtenerIdUsuarioSesion();

    if (!idUsuario) {
      this.mostrarAlertaMedico('No se pudo obtener el ID del usuario médico.', 'warning');
      return;
    }

    this.cargandoPerfilMedico = true;
    this.refrescarVista();

    this.medicoService
      .obtenerMedicoPorUsuario(idUsuario)
      .pipe(
        finalize(() => {
          this.cargandoPerfilMedico = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (data) => {
          if (!data) {
            this.mostrarAlertaMedico('No se encontró información del médico.', 'warning');
            return;
          }

          this.aplicarDatosMedicoDesdeApi(data, true);
        },
        error: (error) => {
          this.mostrarAlertaMedico(
            this.mensajeErrorLimpio(error, 'No se pudo cargar el perfil médico.'),
            'danger',
          );
        },
      });
  }

  private aplicarDatosMedicoDesdeApi(data: MedicoPerfil, recargar = true): void {
    const idMedicoApi = Number(data?.idmedicos ?? data?.idMedico ?? data?.idmedico ?? 0);

    if (idMedicoApi) {
      this.idMedicoSesion = idMedicoApi;
    }

    this.medico = {
      nombres:
        data?.nombresMedico ||
        this.usuarioSesion?.nombre ||
        this.usuarioSesion?.nombres ||
        'Médico',
      apellidos:
        data?.apellidosMedico ||
        this.usuarioSesion?.apellido ||
        this.usuarioSesion?.apellidos ||
        '',
      cmp: data?.cmpMedico || '',
      especialidad: data?.especialidad || 'Sin especialidad',
      idEspecialidad: Number(data?.idespecialidad ?? data?.idEspecialidad ?? 0),
      telefono: data?.telefonoMedico || '',
      username: this.usuarioSesion?.username || '',
      correo: this.usuarioSesion?.correo || '',
      estado: 'Activo',
    };

    this.usuarioSesion = {
      ...this.usuarioSesion,
      idMedico: this.idMedicoSesion,
      idmedico: this.idMedicoSesion,
      medico: data,
    };

    this.guardarUsuarioSesionActualizado();
    this.refrescarVista();

    if (recargar && this.idMedicoSesion) {
      this.pageCitasActual = 0;
      this.pageHorariosActual = 0;

      setTimeout(() => {
        this.cargarCitasMedico(0, true);
        this.cargarHorariosMedico(0, true);
        this.refrescarVista();
      }, 100);
    }
  }

  buscarCitasServidor(valor: string): void {
    this.buscarCita = valor ?? '';
    this.buscarCita$.next(this.buscarCita);
  }

  buscarHorariosServidor(valor: string): void {
    this.filtroFechaHorario = valor ?? '';
    this.buscarHorario$.next(this.filtroFechaHorario);
  }

  cambiarFiltroEstado(valor: string): void {
    this.filtroEstado = valor ?? '';
    this.refrescarVista();
  }

  cargarCitasMedico(page = this.pageCitasActual, forzar = true): void {
    if (!this.esNavegador) {
      return;
    }

    if (this.cargandoCitas && !forzar) {
      return;
    }

    const idMedico = this.obtenerIdMedicoSesion();

    if (!idMedico) {
      this.pageCitas = this.paginaVacia<CitaMedico>();
      this.citasMedico = [];
      this.citasHoyLista = [];
      this.refrescarVista();
      return;
    }

    this.idMedicoSesion = idMedico;
    this.cargandoCitas = true;
    this.pageCitasActual = Math.max(page, 0);
    this.refrescarVista();

    this.medicoService
      .listarCitasMedico(idMedico, this.pageCitasActual, this.size, this.buscarCita)
      .pipe(
        finalize(() => {
          this.cargandoCitas = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (pageData) => {
          this.pageCitas = pageData;
          this.citasMedico = pageData.content ?? [];
          this.citasHoyLista = this.citasMedico.filter((cita) => this.esFechaHoy(cita.fecha_cita));
          this.refrescarVista();
        },
        error: (error) => {
          this.pageCitas = this.paginaVacia<CitaMedico>();
          this.citasMedico = [];
          this.citasHoyLista = [];

          this.mostrarAlertaMedico(
            this.mensajeErrorLimpio(error, 'No se pudo cargar las citas.'),
            'danger',
          );

          this.refrescarVista();
        },
      });
  }

  siguienteCitas(): void {
    if (!this.pageCitas?.last) {
      this.cargarCitasMedico(this.pageCitasActual + 1, true);
    }
  }

  anteriorCitas(): void {
    if (!this.pageCitas?.first) {
      this.cargarCitasMedico(this.pageCitasActual - 1, true);
    }
  }

  abrirDetalleCita(cita: CitaMedico): void {
    const idCita = this.idCita(cita);

    if (!idCita) {
      this.mostrarAlertaMedico('No se pudo obtener el ID de la cita.', 'warning');
      return;
    }

    this.citaSeleccionada = cita;

    this.actualizarEstadoForm.reset({
      idEstadoCita: String(this.idEstadoDesdeEstado(cita.estado)),
      observacion: cita.observacion || '',
    });

    this.cargandoDetalleCita = true;
    this.abrirModal('modalDetalleCita');
    this.refrescarVista();

    this.medicoService
      .obtenerCitaPorId(idCita)
      .pipe(
        finalize(() => {
          this.cargandoDetalleCita = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (detalle) => {
          if (!detalle) {
            this.mostrarAlertaMedico('No se encontró el detalle completo de la cita.', 'warning');
            return;
          }

          this.citaSeleccionada = {
            ...cita,
            ...detalle,
            idcitas: this.idCita(detalle),
            idCita: this.idCita(detalle),
            idcita: this.idCita(detalle),
            motivo: detalle.motivo || cita.motivo || '-',
            observacion: detalle.observacion || cita.observacion || 'Sin observaciones.',
          };

          this.actualizarEstadoForm.patchValue({
            idEstadoCita: String(this.idEstadoDesdeEstado(this.citaSeleccionada.estado)),
            observacion: this.citaSeleccionada.observacion || '',
          });

          this.refrescarVista();
        },
        error: (error) => {
          this.mostrarAlertaMedico(
            this.mensajeErrorLimpio(error, 'No se pudo cargar el detalle de la cita.'),
            'danger',
          );
          this.refrescarVista();
        },
      });
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

    const idCita = this.idCita(this.citaSeleccionada);
    const form = this.actualizarEstadoForm.getRawValue();

    const idEstadoCita = Number(form.idEstadoCita || 0);

    if (!idCita || !idEstadoCita) {
      this.mostrarAlertaMedico('No se pudo identificar la cita o el estado.', 'warning');
      return;
    }

    const observacion =
      form.observacion?.trim() ||
      `Estado actualizado a ${this.estadoTextoDesdeId(idEstadoCita)} por el médico.`;

    this.guardandoEstadoCita = true;
    this.refrescarVista();

    this.medicoService
      .cambiarEstadoCita({
        idCita,
        idEstadoCita,
        observacion,
      })
      .pipe(
        finalize(() => {
          this.guardandoEstadoCita = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: async (response) => {
          if (response?.success !== true) {
            this.mostrarAlertaMedico(
              response?.message || 'No se pudo actualizar el estado de la cita.',
              'warning',
            );
            return;
          }

          const nuevoEstado = this.estadoDesdeId(idEstadoCita);

          this.actualizarCitaEnVista(idCita, nuevoEstado, observacion);

          await Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            text: response.message || 'El estado de la cita fue actualizado correctamente.',
            timer: 1400,
            showConfirmButton: false,
          });

          this.cerrarModal('modalDetalleCita');
          this.cargandoCitas = false;

          setTimeout(() => {
            this.cargarCitasMedico(this.pageCitasActual, true);
            this.refrescarVista();
          }, 150);
        },
        error: (error) => {
          this.mostrarAlertaMedico(
            this.mensajeErrorLimpio(error, 'No se pudo actualizar el estado de la cita.'),
            'danger',
          );
        },
      });
  }

  private actualizarCitaEnVista(idCita: number, estado: EstadoCita, observacion: string): void {
    this.citasMedico = this.citasMedico.map((cita) => {
      if (this.idCita(cita) !== idCita) {
        return cita;
      }

      return {
        ...cita,
        estado,
        idEstadoCita: this.idEstadoDesdeEstado(estado),
        observacion,
      };
    });

    this.citasHoyLista = this.citasHoyLista.map((cita) => {
      if (this.idCita(cita) !== idCita) {
        return cita;
      }

      return {
        ...cita,
        estado,
        idEstadoCita: this.idEstadoDesdeEstado(estado),
        observacion,
      };
    });

    if (this.citaSeleccionada && this.idCita(this.citaSeleccionada) === idCita) {
      this.citaSeleccionada = {
        ...this.citaSeleccionada,
        estado,
        idEstadoCita: this.idEstadoDesdeEstado(estado),
        observacion,
      };
    }

    this.refrescarVista();
  }

  abrirCrearHorario(): void {
    this.modoHorario = 'crear';
    this.horarioSeleccionado = null;

    this.horarioForm.reset({
      fechaHorario: '',
      horaInicio: '',
      horaFin: '',
    });

    this.abrirModal('modalHorario');
  }

  abrirEditarHorario(horario: HorarioMedico): void {
    if (this.horarioSinCupo(horario)) {
      this.mostrarAlertaMedico(
        'Este horario no puede editarse porque ya no tiene cupos disponibles.',
        'warning',
      );
      return;
    }

    this.modoHorario = 'editar';
    this.horarioSeleccionado = horario;

    this.horarioForm.reset({
      fechaHorario: horario.fecha,
      horaInicio: this.horaParaInput(horario.hora_inicio),
      horaFin: this.horaParaInput(horario.hora_fin),
    });

    this.abrirModal('modalHorario');
  }

  guardarHorario(): void {
    if (this.horarioForm.invalid) {
      this.horarioForm.markAllAsTouched();
      this.mostrarAlertaMedico('Complete todos los campos del horario.', 'warning');
      return;
    }
    if (this.modoHorario === 'editar' && this.horarioSinCupo(this.horarioSeleccionado)) {
      this.mostrarAlertaMedico(
        'No se puede actualizar este horario porque ya no tiene cupos disponibles.',
        'warning',
      );
      return;
    }

    const idMedico = this.obtenerIdMedicoSesion();

    if (!idMedico) {
      this.mostrarAlertaMedico('No se pudo obtener el ID del médico.', 'danger');
      return;
    }

    const form = this.horarioForm.getRawValue();

    const fecha = form.fechaHorario || '';
    const horaInicio = this.horaParaApi(form.horaInicio || '');
    const horaFin = this.horaParaApi(form.horaFin || '');

    if (horaInicio >= horaFin) {
      this.mostrarAlertaMedico('La hora de inicio debe ser menor que la hora de fin.', 'warning');
      return;
    }

    const request: HorarioMedicoRequest = {
      idmedico: idMedico,
      fecha,
      horaInicio,
      horaFin,
      cupo: 1,
    };

    const peticion =
      this.modoHorario === 'crear'
        ? this.medicoService.registrarHorario(request)
        : this.medicoService.actualizarHorario(this.idHorario(this.horarioSeleccionado), request);

    this.guardandoHorario = true;
    this.refrescarVista();

    peticion
      .pipe(
        finalize(() => {
          this.guardandoHorario = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: async (response) => {
          if (response?.success !== true) {
            this.mostrarAlertaMedico(
              response?.message || 'No se pudo guardar el horario.',
              'warning',
            );
            return;
          }

          await Swal.fire({
            icon: 'success',
            title: this.modoHorario === 'crear' ? 'Horario registrado' : 'Horario actualizado',
            text: response.message || 'Operación realizada correctamente.',
            timer: 1400,
            showConfirmButton: false,
          });

          this.cerrarModal('modalHorario');
          this.horarioForm.reset();

          this.pageHorariosActual = 0;
          this.cargandoHorarios = false;

          setTimeout(() => {
            this.cargarHorariosMedico(0, true);
            this.refrescarVista();
          }, 150);
        },
        error: (error) => {
          this.mostrarAlertaMedico(
            this.mensajeErrorLimpio(error, 'No se pudo guardar el horario.'),
            'danger',
          );
        },
      });
  }

  cargarHorariosMedico(page = this.pageHorariosActual, forzar = true): void {
    if (!this.esNavegador) {
      return;
    }

    if (this.cargandoHorarios && !forzar) {
      return;
    }

    const idMedico = this.obtenerIdMedicoSesion();

    if (!idMedico) {
      this.pageHorarios = this.paginaVacia<HorarioMedico>();
      this.horariosMedico = [];
      this.refrescarVista();
      return;
    }

    this.idMedicoSesion = idMedico;
    this.cargandoHorarios = true;
    this.pageHorariosActual = Math.max(page, 0);
    this.refrescarVista();

    this.medicoService
      .listarHorariosMedico(idMedico, this.pageHorariosActual, this.size, this.filtroFechaHorario)
      .pipe(
        finalize(() => {
          this.cargandoHorarios = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (pageData) => {
          this.pageHorarios = pageData;
          this.horariosMedico = pageData.content ?? [];
          this.refrescarVista();
        },
        error: (error) => {
          this.pageHorarios = this.paginaVacia<HorarioMedico>();
          this.horariosMedico = [];

          this.mostrarAlertaMedico(
            this.mensajeErrorLimpio(error, 'No se pudo cargar los horarios.'),
            'danger',
          );

          this.refrescarVista();
        },
      });
  }

  siguienteHorarios(): void {
    if (!this.pageHorarios?.last) {
      this.cargarHorariosMedico(this.pageHorariosActual + 1, true);
    }
  }

  anteriorHorarios(): void {
    if (!this.pageHorarios?.first) {
      this.cargarHorariosMedico(this.pageHorariosActual - 1, true);
    }
  }

  async cambiarEstadoHorario(horario: HorarioMedico): Promise<void> {
    if (this.horarioSinCupo(horario)) {
      this.mostrarAlertaMedico(
        'No se puede cambiar el estado de este horario porque ya no tiene cupos disponibles.',
        'warning',
      );
      return;
    }
    const idHorario = this.idHorario(horario);

    if (!idHorario) {
      this.mostrarAlertaMedico('No se pudo obtener el ID del horario.', 'warning');
      return;
    }

    const nuevoEstado = horario.estado === 1 ? 0 : 1;

    const respuesta = await Swal.fire({
      icon: 'question',
      title: nuevoEstado === 1 ? '¿Activar horario?' : '¿Desactivar horario?',
      text: 'Se actualizará únicamente el estado del horario médico.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!respuesta.isConfirmed) {
      return;
    }

    this.cambiandoEstadoHorario = true;
    this.refrescarVista();

    this.medicoService
      .cambiarEstadoHorario(idHorario, nuevoEstado)
      .pipe(
        finalize(() => {
          this.cambiandoEstadoHorario = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: async (response) => {
          if (response?.success !== true) {
            this.mostrarAlertaMedico(
              response?.message || 'No se pudo cambiar el estado del horario.',
              'warning',
            );
            return;
          }

          this.horariosMedico = this.horariosMedico.map((item) =>
            this.idHorario(item) === idHorario
              ? {
                  ...item,
                  estado: nuevoEstado,
                }
              : item,
          );

          await Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            text: response.message || 'Estado del horario actualizado correctamente.',
            timer: 1200,
            showConfirmButton: false,
          });

          this.cargandoHorarios = false;

          setTimeout(() => {
            this.cargarHorariosMedico(this.pageHorariosActual, true);
            this.refrescarVista();
          }, 150);
        },
        error: (error) => {
          this.mostrarAlertaMedico(
            this.mensajeErrorLimpio(error, 'No se pudo cambiar el estado del horario.'),
            'danger',
          );
        },
      });
  }

  cerrarSesion(): void {
    this.authService.logout();

    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('usuario_sesion');

    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('usuario_sesion');

    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  irASeccion(seccion: SeccionMedico): void {
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

  claseEstado(estado: EstadoCita | string): string {
    const estadoNormalizado = String(estado || '').toUpperCase();

    const clases: Record<string, string> = {
      PENDIENTE: 'bg-warning text-dark',
      CONFIRMADA: 'bg-success',
      ATENDIDA: 'bg-info text-dark',
      CANCELADA: 'bg-danger',
      NO_ASISTIO: 'bg-dark',
    };

    return clases[estadoNormalizado] ?? 'bg-secondary';
  }

  estadoTexto(estado: EstadoCita | string): string {
    const estadoNormalizado = String(estado || '').toUpperCase();

    const textos: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      ATENDIDA: 'Atendida',
      CANCELADA: 'Cancelada',
      NO_ASISTIO: 'No asistió',
    };

    return textos[estadoNormalizado] ?? 'Sin estado';
  }

  claseHorario(estado: number): string {
    return estado === 1 ? 'bg-success' : 'bg-secondary';
  }

  textoHorario(estado: number): string {
    return estado === 1 ? 'Disponible' : 'No disponible';
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) {
      return '-';
    }

    const soloFecha = String(fecha).split('T')[0];
    const partes = soloFecha.split('-');

    if (partes.length !== 3) {
      return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  formatearHora(hora?: string): string {
    if (!hora) {
      return '-';
    }

    return String(hora).substring(0, 8);
  }

  idCita(cita: CitaMedico | null): number {
    const data: any = cita;

    return Number(data?.idcitas ?? data?.idCitas ?? data?.idCita ?? data?.idcita ?? data?.id ?? 0);
  }

  idHorario(horario: HorarioMedico | null): number {
    return Number(
      horario?.idhorarios_medico ?? horario?.idhorariosMedico ?? horario?.idHorario ?? 0,
    );
  }
  horarioSinCupo(horario: HorarioMedico | null): boolean {
    return Number(horario?.cupo ?? 0) <= 0;
  }
  campoInvalidoHorario(campo: string): boolean {
    const control = this.horarioForm.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  campoInvalidoEstado(campo: string): boolean {
    const control = this.actualizarEstadoForm.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private estadoDesdeId(idEstado: number): EstadoCita {
    const estados: Record<number, EstadoCita> = {
      1: 'PENDIENTE',
      2: 'CONFIRMADA',
      3: 'ATENDIDA',
      4: 'CANCELADA',
      5: 'NO_ASISTIO',
    };

    return estados[idEstado] ?? '';
  }

  private estadoTextoDesdeId(idEstado: number): string {
    return this.estadoTexto(this.estadoDesdeId(idEstado));
  }

  private idEstadoDesdeEstado(estado: EstadoCita | string): number {
    const estadoNormalizado = String(estado || '').toUpperCase();

    const estados: Record<string, number> = {
      PENDIENTE: 1,
      CONFIRMADA: 2,
      ATENDIDA: 3,
      CANCELADA: 4,
      NO_ASISTIO: 5,
    };

    return estados[estadoNormalizado] ?? 1;
  }

  private obtenerUsuarioSesion(): any {
    const usuarioAuthService = this.authService.getUsuario();

    if (usuarioAuthService) {
      return usuarioAuthService;
    }

    if (!this.esNavegador) {
      return null;
    }

    const usuarioTexto =
      localStorage.getItem('auth_user') ||
      localStorage.getItem('usuario_sesion') ||
      sessionStorage.getItem('auth_user') ||
      sessionStorage.getItem('usuario_sesion');

    if (!usuarioTexto) {
      return null;
    }

    try {
      return JSON.parse(usuarioTexto);
    } catch {
      return null;
    }
  }

  private obtenerIdUsuarioSesion(): number {
    return Number(
      this.usuarioSesion?.idusuario ??
        this.usuarioSesion?.idUsuario ??
        this.usuarioSesion?.id_usuario ??
        this.usuarioSesion?.id ??
        this.usuarioSesion?.data?.idusuario ??
        this.usuarioSesion?.data?.idUsuario ??
        0,
    );
  }

  private obtenerIdMedicoSesion(): number {
    return Number(
      this.idMedicoSesion ||
        this.usuarioSesion?.idMedico ||
        this.usuarioSesion?.idmedico ||
        this.usuarioSesion?.id_medico ||
        this.usuarioSesion?.medico?.idmedicos ||
        this.usuarioSesion?.medico?.idMedico ||
        this.usuarioSesion?.medico?.idmedico ||
        0,
    );
  }

  private esMedicoValido(): boolean {
    if (!this.esNavegador) {
      return true;
    }

    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    const rol = String(
      this.usuarioSesion?.rol || this.usuarioSesion?.nombreRol || this.usuarioSesion?.role || '',
    ).toUpperCase();

    return !!token && rol.includes('MEDICO');
  }

  private guardarUsuarioSesionActualizado(): void {
    if (!this.esNavegador || !this.usuarioSesion) {
      return;
    }

    const usuarioSeguro = {
      idusuario:
        this.usuarioSesion?.idusuario ??
        this.usuarioSesion?.idUsuario ??
        this.usuarioSesion?.id_usuario,
      rol: this.usuarioSesion?.rol,
      username: this.usuarioSesion?.username,
      correo: this.usuarioSesion?.correo,
      nombre: this.usuarioSesion?.nombre,
      apellido: this.usuarioSesion?.apellido,
      cambiopass: this.usuarioSesion?.cambiopass,
      token: this.usuarioSesion?.token,
      idMedico: this.idMedicoSesion,
      idmedico: this.idMedicoSesion,
      medico: this.usuarioSesion?.medico,
    };

    const usuarioTexto = JSON.stringify(usuarioSeguro);

    if (localStorage.getItem('auth_user')) {
      localStorage.setItem('auth_user', usuarioTexto);
      return;
    }

    if (localStorage.getItem('usuario_sesion')) {
      localStorage.setItem('usuario_sesion', usuarioTexto);
      return;
    }

    if (sessionStorage.getItem('auth_user')) {
      sessionStorage.setItem('auth_user', usuarioTexto);
      return;
    }

    if (sessionStorage.getItem('usuario_sesion')) {
      sessionStorage.setItem('usuario_sesion', usuarioTexto);
      return;
    }

    localStorage.setItem('auth_user', usuarioTexto);
  }

  private esFechaHoy(fecha: string): boolean {
    if (!fecha) {
      return false;
    }

    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
      hoy.getDate(),
    ).padStart(2, '0')}`;

    return String(fecha).split('T')[0] === fechaHoy;
  }

  private horaParaApi(hora: string): string {
    if (!hora) {
      return '';
    }

    if (hora.length === 5) {
      return `${hora}:00`;
    }

    return hora;
  }

  private horaParaInput(hora: string): string {
    if (!hora) {
      return '';
    }

    return hora.substring(0, 5);
  }

  private mostrarAlertaMedico(mensaje: string, tipo: TipoAlerta): void {
    const icono =
      tipo === 'danger'
        ? 'error'
        : tipo === 'warning'
          ? 'warning'
          : tipo === 'success'
            ? 'success'
            : 'info';

    const titulo =
      tipo === 'danger'
        ? 'Error'
        : tipo === 'warning'
          ? 'Atención'
          : tipo === 'success'
            ? 'Correcto'
            : 'Información';

    Swal.fire({
      icon: icono,
      title: titulo,
      text: mensaje,
      timer: tipo === 'success' ? 1500 : undefined,
      showConfirmButton: tipo !== 'success',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0f766e',
    });
  }

  private mensajeErrorLimpio(error: any, mensajeDefault: string): string {
    return (
      error?.error?.message ||
      error?.error?.mensaje ||
      error?.mensajePersonalizado ||
      error?.message ||
      mensajeDefault
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

  private cerrarNavbarMovil(): void {
    const navbarElemento = document.getElementById('navbarMedico');

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
      // Evita errores si Angular ya destruyó la vista.
    }
  }

  private paginaVacia<T>(): MedicoPage<T> {
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
}
