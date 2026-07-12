import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';

import { API_ENDPOINTS } from '../../../core/config/api.config';
import { AuthService } from '../../../core/services/auth.service.ts';
import { PacienteService } from '../../../core/services/paciente.service';
import {
  CitaPacienteResponse,
  DiaCalendarioPaciente,
  DisponibilidadCitaOption,
  EspecialidadPacienteOption,
  MedicoDisponibilidadPaciente,
  PacientePage,
  RegistrarCitaPacienteRequest,
} from '../../../core/models/paciente.model';

declare const bootstrap: any;
declare const Swal: any;

type TipoAlerta = 'success' | 'warning' | 'info' | 'danger';
type SeccionPaciente = 'resumen' | 'mis-citas' | 'perfil';

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './paciente.html',
  styleUrl: './paciente.css',
})
export class Paciente implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly pacienteService = inject(PacienteService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroy$ = new Subject<void>();
  private readonly buscarCita$ = new Subject<string>();
  private readonly platformId = inject(PLATFORM_ID);
  private readonly esNavegador = isPlatformBrowser(this.platformId);

  private readonly pacientesUrl = API_ENDPOINTS.paciente.pacientes;

  alertaVisible = false;
  alertaMensaje = '';
  alertaTipo: TipoAlerta = 'info';

  seccionActual: SeccionPaciente = 'resumen';

  buscarCita = '';

  citas: CitaPacienteResponse[] = [];
  pageCitas: PacientePage<CitaPacienteResponse> | null = null;
  pageCitasActual = 0;
  size = 10;

  cargandoCitas = false;
  cargandoDetalleCita = false;
  cargandoPerfilPaciente = false;
  registrandoCita = false;
  cancelandoCita = false;

  citaSeleccionada: CitaPacienteResponse | null = null;
  citaDetalle: CitaPacienteResponse | null = null;

  usuarioSesion = this.obtenerUsuarioSesion();
  idPacienteSesion = 0;

  paciente = {
    nombres: '',
    apellidos: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    fechaNacimiento: '',
    sexo: '',
    grupoSanguineo: '',
    telefono: '',
    direccion: '',
  };

  especialidades: EspecialidadPacienteOption[] = [];

  disponibilidades: DisponibilidadCitaOption[] = [];
  medicosDisponibles: MedicoDisponibilidadPaciente[] = [];

  diasCalendario: DiaCalendarioPaciente[] = [];
  fechaSeleccionada = '';
  mesCalendario = new Date();

  cargandoEspecialidades = false;
  cargandoDisponibilidad = false;

  slotSeleccionado: DisponibilidadCitaOption | null = null;

  nuevaCitaForm = this.fb.group({
    id_especialidad: ['', [Validators.required]],
    id_medico: ['', [Validators.required]],
    fecha_cita: ['', [Validators.required]],
    id_horario: ['', [Validators.required]],
    motivo_cita: ['', [Validators.required, Validators.maxLength(250)]],
    observacion_cita: ['', [Validators.maxLength(250)]],
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
    direccion_paciente: [''],
  });

  ngOnInit(): void {
    if (!this.esNavegador) {
      return;
    }

    this.usuarioSesion = this.obtenerUsuarioSesion();

    if (!this.esPacienteValido()) {
      this.router.navigateByUrl('/', {
        replaceUrl: true,
      });
      return;
    }

    this.idPacienteSesion = this.obtenerIdPacienteSesion();

    this.inicializarDatosPaciente();
    this.configurarBusquedaCitas();
    this.generarCalendario();
    this.cargarDatosInicialesPaciente();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    return this.pageCitas?.totalElements ?? this.citas.length;
  }

  get citasPendientes(): number {
    return this.citas.filter((cita) => this.estadoNormalizado(cita) === 'PENDIENTE').length;
  }

  get citasConfirmadas(): number {
    return this.citas.filter((cita) => this.estadoNormalizado(cita) === 'CONFIRMADA').length;
  }

  get citasAtendidas(): number {
    return this.citas.filter((cita) => this.estadoNormalizado(cita) === 'ATENDIDA').length;
  }

  get proximaCita(): CitaPacienteResponse | null {
    return (
      this.citas.find((cita) => {
        const estado = this.estadoNormalizado(cita);
        return estado === 'CONFIRMADA' || estado === 'PENDIENTE';
      }) ?? null
    );
  }

  get citasFiltradas(): CitaPacienteResponse[] {
    return this.citas;
  }

  get puedeVerDetalleSeleccionado(): boolean {
    return !!this.citaSeleccionada && !this.cargandoDetalleCita;
  }

  get puedeCancelarSeleccionado(): boolean {
    if (!this.citaSeleccionada || this.cancelandoCita) {
      return false;
    }

    const estado = this.estadoNormalizado(this.citaSeleccionada);

    return estado === 'PENDIENTE' || estado === 'CONFIRMADA';
  }

  private cargarDatosInicialesPaciente(): void {
    this.cargarEspecialidadesActivas(true);

    const idPacienteActual = this.obtenerIdPacienteSesion();

    if (idPacienteActual) {
      this.idPacienteSesion = idPacienteActual;
      this.cargarCitas(0, true);
    }

    this.cargarPacienteDesdeUsuarioSesion();
  }

  private configurarBusquedaCitas(): void {
    this.buscarCita$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageCitasActual = 0;
        this.cargarCitas(0, true);
      });
  }

  buscarCitasServidor(valor: string): void {
    this.buscarCita = valor ?? '';
    this.buscarCita$.next(this.buscarCita);
  }

  cargarCitas(page = this.pageCitasActual, forzar = true): void {
    if (!this.esNavegador || this.cargandoCitas) {
      return;
    }

    const idPaciente = this.obtenerIdPacienteSesion();

    if (!idPaciente) {
      this.pageCitas = this.paginaVacia<CitaPacienteResponse>();
      this.citas = [];
      this.citaSeleccionada = null;
      this.citaDetalle = null;
      this.refrescarVista();
      return;
    }

    this.idPacienteSesion = idPaciente;
    this.cargandoCitas = true;
    this.pageCitasActual = Math.max(page, 0);
    this.refrescarVista();

    this.pacienteService
      .listarCitasPaciente(idPaciente, this.pageCitasActual, this.size, this.buscarCita)
      .pipe(
        finalize(() => {
          this.cargandoCitas = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (pageData) => {
          this.pageCitas = pageData;
          this.citas = pageData.content ?? [];
          this.citaSeleccionada = null;
          this.citaDetalle = null;
          this.refrescarVista();
        },
        error: (error) => {
          this.citas = [];
          this.pageCitas = this.paginaVacia<CitaPacienteResponse>();
          this.citaSeleccionada = null;
          this.citaDetalle = null;

          this.mostrarAlertaPaciente(
            this.mensajeErrorLimpio(error, 'No se pudo cargar las citas.'),
            'danger',
          );

          this.refrescarVista();
        },
      });
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

  seleccionarCita(cita: CitaPacienteResponse, event?: Event): void {
    event?.stopPropagation();

    this.citaSeleccionada = cita;
    this.citaDetalle = null;
    this.refrescarVista();
  }

 abrirDetalleCitaSeleccionada(): void {
  const idCita = this.idCita(this.citaSeleccionada);

  if (!idCita) {
    this.mostrarAlertaPaciente('Seleccione una cita válida.', 'warning');
    return;
  }

  this.citaDetalle = null;
  this.cargandoDetalleCita = true;
  this.abrirModal('modalDetalleCita');
  this.refrescarVista();

  this.pacienteService
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
          this.mostrarAlertaPaciente(
            'No se encontró información de la cita seleccionada.',
            'warning',
          );
          return;
        }

        this.citaDetalle = detalle;
        this.refrescarVista();
      },
      error: (error) => {
        this.mostrarAlertaPaciente(
          this.mensajeErrorLimpio(error, 'No se pudo obtener el detalle de la cita.'),
          'danger',
        );
        this.refrescarVista();
      },
    });
}

  async cancelarCitaSeleccionada(): Promise<void> {
    const idCita = this.idCita(this.citaSeleccionada);

    if (!idCita) {
      this.mostrarAlertaPaciente('Seleccione una cita válida.', 'warning');
      return;
    }

    if (!this.puedeCancelarSeleccionado) {
      this.mostrarAlertaPaciente(
        'Solo se pueden cancelar citas pendientes o confirmadas.',
        'warning',
      );
      return;
    }

    const respuesta = await Swal.fire({
      icon: 'question',
      title: '¿Cancelar cita médica?',
      text: 'La cita seleccionada cambiará al estado CANCELADA.',
      input: 'textarea',
      inputLabel: 'Observación',
      inputPlaceholder: 'Motivo de cancelación',
      inputValue: 'Cita cancelada por el paciente.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar cita',
      cancelButtonText: 'Volver',
      reverseButtons: true,
      confirmButtonColor: '#0f766e',
      cancelButtonColor: '#6b7280',
      inputValidator: (value: string) => {
        if (!value || value.trim().length < 3) {
          return 'Ingrese una observación para cancelar la cita.';
        }

        return null;
      },
    });

    if (!respuesta.isConfirmed) {
      return;
    }

    this.cancelandoCita = true;
    this.refrescarVista();

    this.pacienteService
      .cancelarCita(idCita, respuesta.value.trim())
      .pipe(
        finalize(() => {
          this.cancelandoCita = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: async (response) => {
          if (response?.success !== true) {
            this.mostrarAlertaPaciente(
              response?.message || 'No se pudo cancelar la cita.',
              'warning',
            );
            return;
          }

          this.actualizarCitaCanceladaEnVista(idCita, respuesta.value.trim());

          await Swal.fire({
            icon: 'success',
            title: 'Cita cancelada',
            text: response.message || 'La cita fue cancelada correctamente.',
            timer: 1400,
            showConfirmButton: false,
          });

          this.citaSeleccionada = null;
          this.citaDetalle = null;
          this.datosTablaDespuesDeCancelar();
        },
        error: (error) => {
          this.mostrarAlertaPaciente(
            this.mensajeErrorLimpio(error, 'No se pudo cancelar la cita.'),
            'danger',
          );
          this.refrescarVista();
        },
      });
  }

  private actualizarCitaCanceladaEnVista(idCita: number, observacion: string): void {
    this.citas = this.citas.map((cita) => {
      if (this.idCita(cita) !== idCita) {
        return cita;
      }

      return {
        ...cita,
        estado: 'CANCELADA',
        estadoCita: 'CANCELADA',
        estadocita: 'CANCELADA',
        idEstadoCita: 4,
        observacionCita: observacion,
        observacioncita: observacion,
        observacion: observacion,
      } as CitaPacienteResponse;
    });

    if (this.pageCitas) {
      this.pageCitas = {
        ...this.pageCitas,
        content: this.citas,
      };
    }

    this.refrescarVista();
  }

  private datosTablaDespuesDeCancelar(): void {
    this.pageCitasActual = Math.max(this.pageCitasActual, 0);

    setTimeout(() => {
      this.cargarCitas(this.pageCitasActual, true);
      this.refrescarVista();
    }, 150);
  }

  abrirNuevaCita(): void {
    this.nuevaCitaForm.reset({
      id_especialidad: '',
      id_medico: '',
      fecha_cita: '',
      id_horario: '',
      motivo_cita: '',
      observacion_cita: '',
    });

    this.disponibilidades = [];
    this.medicosDisponibles = [];
    this.fechaSeleccionada = '';
    this.slotSeleccionado = null;
    this.mesCalendario = new Date();

    this.generarCalendario();

    if (this.especialidades.length === 0) {
      this.cargarEspecialidadesActivas(true);
    }

    if (!this.idPacienteSesion) {
      this.cargarPacienteDesdeUsuarioSesion();
    }

    this.refrescarVista();
    this.abrirModal('modalNuevaCita');
  }

  private cargarEspecialidadesActivas(forzar = false): void {
    if (!this.esNavegador) {
      return;
    }

    if (this.cargandoEspecialidades) {
      return;
    }

    if (!forzar && this.especialidades.length > 0) {
      return;
    }

    this.cargandoEspecialidades = true;
    this.refrescarVista();

    this.pacienteService
      .listarEspecialidadesActivas()
      .pipe(
        finalize(() => {
          this.cargandoEspecialidades = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (data) => {
          this.especialidades = data ?? [];
          this.refrescarVista();
        },
        error: (error) => {
          this.especialidades = [];
          this.mostrarAlertaPaciente(
            this.mensajeErrorLimpio(error, 'No se pudo cargar especialidades.'),
            'danger',
          );
          this.refrescarVista();
        },
      });
  }

  onEspecialidadChange(idEspecialidad: string | number): void {
    this.nuevaCitaForm.patchValue({
      id_especialidad: String(idEspecialidad || ''),
      id_medico: '',
      fecha_cita: '',
      id_horario: '',
    });

    this.disponibilidades = [];
    this.medicosDisponibles = [];
    this.fechaSeleccionada = '';
    this.slotSeleccionado = null;

    this.generarCalendario();
    this.refrescarVista();
  }

  seleccionarFechaCalendario(fecha: string): void {
    if (!fecha) {
      return;
    }

    const idEspecialidad = Number(this.nuevaCitaForm.get('id_especialidad')?.value || 0);

    if (!idEspecialidad) {
      this.mostrarAlertaPaciente('Primero seleccione una especialidad.', 'warning');
      return;
    }

    this.fechaSeleccionada = fecha;

    this.nuevaCitaForm.patchValue({
      fecha_cita: fecha,
      id_medico: '',
      id_horario: '',
    });

    this.slotSeleccionado = null;
    this.disponibilidades = [];
    this.medicosDisponibles = [];
    this.cargandoDisponibilidad = true;

    this.generarCalendario();
    this.refrescarVista();

    setTimeout(() => {
      this.consultarDisponibilidad();
    }, 0);
  }

  private consultarDisponibilidad(): void {
    const idEspecialidad = Number(this.nuevaCitaForm.get('id_especialidad')?.value || 0);

    const fecha = this.fechaSeleccionada;

    if (!idEspecialidad || !fecha) {
      this.cargandoDisponibilidad = false;
      this.refrescarVista();
      return;
    }

    this.pacienteService
      .consultarDisponibilidadCita(idEspecialidad, fecha)
      .pipe(
        finalize(() => {
          this.cargandoDisponibilidad = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (data) => {
          this.disponibilidades = data ?? [];
          this.medicosDisponibles = this.agruparDisponibilidadPorMedico(this.disponibilidades);

          this.slotSeleccionado = null;

          this.nuevaCitaForm.patchValue({
            id_medico: '',
            id_horario: '',
          });

          if (this.medicosDisponibles.length === 0) {
            this.mostrarAlertaPaciente(
              'No existen horarios disponibles para la especialidad y fecha seleccionada.',
              'warning',
            );
          }

          this.refrescarVista();
        },
        error: (error) => {
          this.disponibilidades = [];
          this.medicosDisponibles = [];
          this.slotSeleccionado = null;

          this.nuevaCitaForm.patchValue({
            id_medico: '',
            id_horario: '',
          });

          this.mostrarAlertaPaciente(
            this.mensajeErrorLimpio(error, 'No se pudo consultar la disponibilidad.'),
            'danger',
          );

          this.refrescarVista();
        },
      });
  }

  private agruparDisponibilidadPorMedico(
    disponibilidades: DisponibilidadCitaOption[],
  ): MedicoDisponibilidadPaciente[] {
    const mapa = new Map<number, MedicoDisponibilidadPaciente>();

    for (const item of disponibilidades) {
      if (!mapa.has(item.idMedico)) {
        mapa.set(item.idMedico, {
          idMedico: item.idMedico,
          nombreCompleto: item.medico,
          horarios: [],
        });
      }

      mapa.get(item.idMedico)?.horarios.push(item);
    }

    return Array.from(mapa.values());
  }

  seleccionarDisponibilidad(slot: DisponibilidadCitaOption): void {
    this.slotSeleccionado = slot;

    this.nuevaCitaForm.patchValue({
      id_medico: String(slot.idMedico),
      id_horario: String(slot.idHorario),
      fecha_cita: slot.fecha,
    });

    this.refrescarVista();
  }

  slotEstaSeleccionado(slot: DisponibilidadCitaOption): boolean {
    return (
      Number(this.nuevaCitaForm.get('id_medico')?.value || 0) === slot.idMedico &&
      Number(this.nuevaCitaForm.get('id_horario')?.value || 0) === slot.idHorario
    );
  }

  mesAnterior(): void {
    this.mesCalendario = new Date(
      this.mesCalendario.getFullYear(),
      this.mesCalendario.getMonth() - 1,
      1,
    );

    this.generarCalendario();
    this.refrescarVista();
  }

  mesSiguiente(): void {
    this.mesCalendario = new Date(
      this.mesCalendario.getFullYear(),
      this.mesCalendario.getMonth() + 1,
      1,
    );

    this.generarCalendario();
    this.refrescarVista();
  }

  nombreMesCalendario(): string {
    return this.mesCalendario.toLocaleDateString('es-PE', {
      month: 'long',
      year: 'numeric',
    });
  }

  private generarCalendario(): void {
    const anio = this.mesCalendario.getFullYear();
    const mes = this.mesCalendario.getMonth();

    const primerDiaMes = new Date(anio, mes, 1);
    const ultimoDiaMes = new Date(anio, mes + 1, 0);

    const inicioSemana = primerDiaMes.getDay() === 0 ? 6 : primerDiaMes.getDay() - 1;
    const totalDiasMes = ultimoDiaMes.getDate();

    const dias: DiaCalendarioPaciente[] = [];

    for (let i = 0; i < inicioSemana; i++) {
      dias.push({
        fecha: '',
        dia: 0,
        esMesActual: false,
        disponible: false,
        seleccionado: false,
      });
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      dias.push({
        fecha,
        dia,
        esMesActual: true,
        disponible: this.fechaEsConsultable(fecha),
        seleccionado: this.fechaSeleccionada === fecha,
      });
    }

    this.diasCalendario = dias;
  }

  private fechaEsConsultable(fecha: string): boolean {
    const idEspecialidad = Number(this.nuevaCitaForm.get('id_especialidad')?.value || 0);

    if (!idEspecialidad) {
      return false;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaActual = new Date(`${fecha}T00:00:00`);

    return fechaActual >= hoy;
  }

  guardarNuevaCita(): void {
    if (this.nuevaCitaForm.invalid) {
      this.nuevaCitaForm.markAllAsTouched();
      this.mostrarAlertaPaciente('Complete todos los campos obligatorios de la cita.', 'warning');
      return;
    }

    const idPaciente = this.obtenerIdPacienteSesion();

    if (!idPaciente) {
      this.mostrarAlertaPaciente(
        'No se pudo obtener el ID del paciente. Espere que cargue su información o vuelva a iniciar sesión.',
        'danger',
      );

      this.cargarPacienteDesdeUsuarioSesion();
      return;
    }

    if (!this.slotSeleccionado) {
      this.mostrarAlertaPaciente('Seleccione un horario disponible.', 'warning');
      return;
    }

    const form = this.nuevaCitaForm.getRawValue();

    const request: RegistrarCitaPacienteRequest = {
      idPaciente,
      idMedico: Number(form.id_medico),
      idEspecialidad: Number(form.id_especialidad),
      idHorario: Number(form.id_horario),
      fechaCita: form.fecha_cita || '',
      horaCita: this.slotSeleccionado.horaInicio,
      motivoCita: form.motivo_cita?.trim() || '',
      observacionCita: form.observacion_cita?.trim() || 'Paciente solicita atención médica.',
    };

    this.registrandoCita = true;
    this.refrescarVista();

    this.pacienteService
      .registrarCitaInteligente(request)
      .pipe(
        finalize(() => {
          this.registrandoCita = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (response) => {
          if (response?.success !== true) {
            this.mostrarAlertaPaciente(
              response?.message || 'No se pudo registrar la cita.',
              'warning',
            );
            return;
          }

          this.mostrarAlertaPaciente(
            response.message || 'Cita registrada correctamente.',
            'success',
          );

          setTimeout(() => {
            this.cerrarModal('modalNuevaCita');
            this.nuevaCitaForm.reset();

            this.disponibilidades = [];
            this.medicosDisponibles = [];
            this.fechaSeleccionada = '';
            this.slotSeleccionado = null;

            this.pageCitasActual = 0;
            this.cargarCitas(0, true);
            this.refrescarVista();
          }, 700);
        },
        error: (error) => {
          this.mostrarAlertaPaciente(
            this.mensajeErrorLimpio(error, 'No se pudo registrar la cita.'),
            'danger',
          );
          this.refrescarVista();
        },
      });
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
      direccion: form.direccion_paciente || '',
    };

    this.mostrarAlertaPaciente('Datos del paciente actualizados correctamente.', 'success');
    this.refrescarVista();

    setTimeout(() => {
      this.cerrarModal('modalEditarPerfil');
    }, 900);
  }

  campoInvalidoFormularioCita(campo: string): boolean {
    const control = this.nuevaCitaForm.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  campoInvalidoPerfil(campo: string): boolean {
    const control = this.editarPerfilForm.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  claseEstadoCita(cita: CitaPacienteResponse | null): string {
    const estado = this.estadoNormalizado(cita);

    const clases: Record<string, string> = {
      PENDIENTE: 'bg-warning text-dark',
      CONFIRMADA: 'bg-success',
      ATENDIDA: 'bg-info text-dark',
      CANCELADA: 'bg-danger',
    };

    return clases[estado] ?? 'bg-secondary';
  }

  claseEstado(estado: string | undefined): string {
    const estadoNormalizado = String(estado || '').toUpperCase();

    const clases: Record<string, string> = {
      PENDIENTE: 'bg-warning text-dark',
      CONFIRMADA: 'bg-success',
      ATENDIDA: 'bg-info text-dark',
      CANCELADA: 'bg-danger',
    };

    return clases[estadoNormalizado] ?? 'bg-secondary';
  }

  estadoTexto(cita: CitaPacienteResponse | null): string {
    const estado = this.estadoNormalizado(cita);

    const textos: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      CONFIRMADA: 'Confirmada',
      ATENDIDA: 'Atendida',
      CANCELADA: 'Cancelada',
    };

    return textos[estado] ?? 'Sin estado';
  }

  idCita(cita: CitaPacienteResponse | null): number {
    return Number(cita?.idCita ?? cita?.idcita ?? cita?.idCitas ?? cita?.idcitas ?? cita?.id ?? 0);
  }

  fechaCita(cita: CitaPacienteResponse | null): string {
    const fecha = cita?.fechaCita ?? cita?.fechacita ?? cita?.fecha_cita ?? cita?.fecha ?? '';
    return this.formatearFechaVisual(fecha);
  }

  horaCita(cita: CitaPacienteResponse | null): string {
    const data: any = cita;

    const horaInicio =
      data?.horaInicio ??
      data?.horainicio ??
      data?.hora_inicio ??
      data?.horaCita ??
      data?.horacita ??
      data?.hora_cita ??
      data?.hora ??
      '';

    const horaFin = data?.horaFin ?? data?.horafin ?? data?.hora_fin ?? '';

    if (horaInicio && horaFin) {
      return `${horaInicio} - ${horaFin}`;
    }

    return horaInicio || '-';
  }

  medicoCita(cita: CitaPacienteResponse | null): string {
    return cita?.medico || '-';
  }

  especialidadCita(cita: CitaPacienteResponse | null): string {
    return cita?.especialidad || '-';
  }

  pacienteCita(cita: CitaPacienteResponse | null): string {
    return cita?.paciente || this.nombreCompletoPaciente || '-';
  }

motivoCita(cita: CitaPacienteResponse | null): string {
  const data: any = cita;

  const motivo =
    data?.motivoCita ||
    data?.motivocita ||
    data?.motivo_cita ||
    data?.motivo ||
    '';

  return String(motivo).trim() || '-';
}

observacionCita(cita: CitaPacienteResponse | null): string {
  const data: any = cita;

  const observacion =
    data?.observacionCita ||
    data?.observacioncita ||
    data?.observacion_cita ||
    data?.observacion ||
    '';

  return String(observacion).trim() || 'Sin observaciones.';
}

  detalleActual(): CitaPacienteResponse | null {
    return this.citaDetalle ?? this.citaSeleccionada;
  }

  cerrarSesion(): void {
    this.authService.logout();

    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('usuario_sesion');

    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('usuario_sesion');

    this.router.navigateByUrl('/', {
      replaceUrl: true,
    });
  }

  irASeccion(seccion: SeccionPaciente): void {
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

  private inicializarDatosPaciente(): void {
    const pacienteStorage =
      this.usuarioSesion?.paciente ?? this.usuarioSesion?.data?.paciente ?? null;

    if (pacienteStorage) {
      this.aplicarDatosPacienteDesdeApi(pacienteStorage, false);
      return;
    }

    this.paciente.nombres =
      this.usuarioSesion?.nombre ||
      this.usuarioSesion?.nombres ||
      this.usuarioSesion?.username ||
      'Paciente';

    this.paciente.apellidos = this.usuarioSesion?.apellido || this.usuarioSesion?.apellidos || '';

    this.paciente.numeroDocumento =
      this.usuarioSesion?.numeroDocumento ||
      this.usuarioSesion?.numeroDocumentoPaciente ||
      this.usuarioSesion?.documento ||
      '';

    this.editarPerfilForm.patchValue({
      nombres_paciente: this.paciente.nombres,
      apellidos_paciente: this.paciente.apellidos,
      tipo_documento_paciente: this.paciente.tipoDocumento,
      numero_documento_paciente: this.paciente.numeroDocumento,
      fecha_nacimiento_paciente: this.normalizarFechaInput(this.paciente.fechaNacimiento),
      sexo_paciente: this.paciente.sexo,
      grupo_sanguineo_paciente: this.paciente.grupoSanguineo,
      telefono_paciente: this.paciente.telefono,
      direccion_paciente: this.paciente.direccion,
    });
  }

  private cargarPacienteDesdeUsuarioSesion(): void {
    if (!this.esNavegador || this.cargandoPerfilPaciente) {
      return;
    }

    const idUsuario = this.obtenerIdUsuarioSesion();

    if (!idUsuario) {
      this.mostrarAlertaPaciente('No se pudo obtener el ID del usuario de la sesión.', 'warning');
      return;
    }

    this.cargandoPerfilPaciente = true;
    this.refrescarVista();

    this.http
      .get<any>(`${this.pacientesUrl}/${idUsuario}`)
      .pipe(
        finalize(() => {
          this.cargandoPerfilPaciente = false;
          this.refrescarVista();
        }),
      )
      .subscribe({
        next: (response) => {
          if (response?.success === false) {
            this.mostrarAlertaPaciente(
              response?.message || 'No se pudo cargar la información del paciente.',
              'warning',
            );
            return;
          }

          const data = response?.data ?? response;

          if (!data) {
            this.mostrarAlertaPaciente('No se encontró información del paciente.', 'warning');
            return;
          }

          this.aplicarDatosPacienteDesdeApi(data, true);
          this.refrescarVista();
        },
        error: (error) => {
          this.mostrarAlertaPaciente(
            this.mensajeErrorLimpio(error, 'No se pudo cargar la información del paciente.'),
            'danger',
          );
          this.refrescarVista();
        },
      });
  }

  private aplicarDatosPacienteDesdeApi(data: any, recargarCitas = true): void {
    const idPacienteApi = Number(
      data?.idpacientes ?? data?.idPaciente ?? data?.idpaciente ?? data?.id_paciente ?? 0,
    );

    if (idPacienteApi) {
      this.idPacienteSesion = idPacienteApi;
    }

    const nombresApi =
      data?.nombresPaciente ?? data?.nombres_paciente ?? data?.nombrespaciente ?? '';

    const apellidosApi =
      data?.apellidosPaciente ?? data?.apellidos_paciente ?? data?.apellidospaciente ?? '';

    this.paciente = {
      nombres:
        this.usuarioSesion?.nombre || this.usuarioSesion?.nombres || nombresApi || 'Paciente',
      apellidos:
        this.usuarioSesion?.apellido || this.usuarioSesion?.apellidos || apellidosApi || '',
      tipoDocumento:
        data?.tipoDocumentoPaciente ??
        data?.tipo_documento_paciente ??
        data?.tipodocumentopaciente ??
        'DNI',
      numeroDocumento:
        data?.numeroDocumentoPaciente ??
        data?.numero_documento_paciente ??
        data?.numerodocumentopaciente ??
        '',
      fechaNacimiento:
        data?.fechaNacimientoPaciente ??
        data?.fecha_nacimiento_paciente ??
        data?.fechanacimientopaciente ??
        '',
      sexo: data?.sexoPaciente ?? data?.sexo_paciente ?? data?.sexopaciente ?? '',
      grupoSanguineo:
        data?.grupoSanguineoPaciente ??
        data?.grupo_sanguineo_paciente ??
        data?.gruposanguineopaciente ??
        '',
      telefono: data?.telefonoPaciente ?? data?.telefono_paciente ?? data?.telefonopaciente ?? '',
      direccion:
        data?.direccionPaciente ?? data?.direccion_paciente ?? data?.direccionpaciente ?? '',
    };

    this.editarPerfilForm.patchValue({
      nombres_paciente: this.paciente.nombres,
      apellidos_paciente: this.paciente.apellidos,
      tipo_documento_paciente: this.paciente.tipoDocumento,
      numero_documento_paciente: this.paciente.numeroDocumento,
      fecha_nacimiento_paciente: this.normalizarFechaInput(this.paciente.fechaNacimiento),
      sexo_paciente: this.paciente.sexo,
      grupo_sanguineo_paciente: this.paciente.grupoSanguineo,
      telefono_paciente: this.paciente.telefono,
      direccion_paciente: this.paciente.direccion,
    });

    this.usuarioSesion = {
      ...this.usuarioSesion,
      idPaciente: this.idPacienteSesion,
      idpaciente: this.idPacienteSesion,
      paciente: data,
    };

    this.guardarUsuarioSesionActualizado();

    if (recargarCitas && this.idPacienteSesion) {
      this.pageCitasActual = 0;
      setTimeout(() => {
        this.cargarCitas(0, true);
      }, 0);
    }
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
      idPaciente: this.idPacienteSesion,
      idpaciente: this.idPacienteSesion,
      paciente: this.usuarioSesion?.paciente,
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
        this.usuarioSesion?.usuario?.idusuario ??
        0,
    );
  }

  private obtenerIdPacienteSesion(): number {
    return Number(
      this.idPacienteSesion ||
        this.usuarioSesion?.idPaciente ||
        this.usuarioSesion?.idpaciente ||
        this.usuarioSesion?.id_paciente ||
        this.usuarioSesion?.paciente?.idpacientes ||
        this.usuarioSesion?.paciente?.idPaciente ||
        this.usuarioSesion?.paciente?.idpaciente ||
        this.usuarioSesion?.data?.idPaciente ||
        this.usuarioSesion?.data?.idpaciente ||
        0,
    );
  }

  private esPacienteValido(): boolean {
    if (!this.esNavegador) {
      return true;
    }

    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    const rol = String(
      this.usuarioSesion?.rol || this.usuarioSesion?.nombreRol || this.usuarioSesion?.role || '',
    ).toUpperCase();

    return !!token && rol.includes('PACIENTE');
  }

  private estadoNormalizado(cita: CitaPacienteResponse | null): string {
    return String(cita?.estado ?? cita?.estadoCita ?? cita?.estadocita ?? '')
      .toUpperCase()
      .trim();
  }

  private mostrarAlertaPaciente(mensaje: string, tipo: TipoAlerta): void {
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
      timer: tipo === 'success' ? 1600 : undefined,
      showConfirmButton: tipo !== 'success',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0f766e',
    });

    this.alertaVisible = false;
    this.alertaMensaje = '';
    this.alertaTipo = tipo;
    this.refrescarVista();
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
    const navbarElemento = document.getElementById('navbarPaciente');

    if (!navbarElemento) {
      return;
    }

    const collapse =
      bootstrap.Collapse.getInstance(navbarElemento) ||
      new bootstrap.Collapse(navbarElemento, { toggle: false });

    collapse.hide();
  }

  private formatearFechaVisual(fecha: string): string {
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

  private normalizarFechaInput(fecha: string): string {
    if (!fecha) {
      return '';
    }

    return fecha.split('T')[0];
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

  private paginaVacia<T>(): PacientePage<T> {
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
