import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap, throwError } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service.ts';

type RolSistema = 'paciente' | 'medico' | 'administrador' | 'recepcionista';
type TipoAlerta = 'success' | 'warning' | 'info' | 'danger';
type PasoRegistroPaciente = 1 | 2 | 3;

declare const Swal: any;
declare const bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly ID_ROL_PACIENTE = 4;

  rolSeleccionado: RolSistema = 'paciente';
  navbarConSombra = false;

  alertaVisible = false;
  alertaMensaje = '';
  alertaTipo: TipoAlerta = 'info';

  ingresando = false;
  verPasswordLogin = false;

  pasoRegistroPaciente: PasoRegistroPaciente = 1;

  validandoDni = false;
  validandoUsuario = false;
  registrandoPaciente = false;

  usuarioPendienteCambioPassword: any = null;
  rolPendienteCambioPassword = '';

  passwordActualLogin = '';

  cambiandoPassword = false;
  verNuevaPassword = false;
  verConfirmarNuevaPassword = false;

  dniPacienteValidado = '';
  tipoDocumentoPacienteValidado = 'DNI';

  loginForm = this.fb.group({
    usuario: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rol: ['paciente', [Validators.required]],
  });

  validarDniForm = this.fb.group({
    tipoDocumentoPaciente: ['DNI', [Validators.required]],
    numeroDocumentoPaciente: ['', [Validators.required, this.validarNumeroDocumentoPaciente]],
  });

  registroUsuarioForm = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(4)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordsIguales,
    },
  );
  cambiarPasswordForm = this.fb.group(
    {
      nuevaPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/),
        ],
      ],
      confirmarNuevaPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordsCambioIguales,
    },
  );

pasoRecuperarPassword: 1 | 2 = 1;

validandoRecuperacion = false;
actualizandoPasswordRecuperacion = false;

  verNuevaPasswordRecuperacion = false;
  verConfirmarPasswordRecuperacion = false;

idUsuarioRecuperacion: number | null = null;
tipoUsuarioRecuperacion: 'paciente' | 'medico' = 'paciente';

  recuperarPasswordForm = this.fb.group({
    tipoUsuario: ['paciente', [Validators.required]],
    documento: [''],
    fechaNacimientoPaciente: [''],
    cmpMedico: [''],
  });

  nuevaPasswordRecuperacionForm = this.fb.group(
    {
      nuevaPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/),
        ],
      ],
      confirmarPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordsRecuperacionIguales,
    },
  );

  registroPacienteForm = this.fb.group({
    nombresPaciente: ['', [Validators.required]],
    apellidosPaciente: ['', [Validators.required]],
    tipoDocumentoPaciente: [{ value: 'DNI', disabled: true }, [Validators.required]],
    numeroDocumentoPaciente: [{ value: '', disabled: true }, [Validators.required]],
    fechaNacimientoPaciente: ['', [Validators.required]],
    sexoPaciente: ['', [Validators.required]],
    grupoSanguineoPaciente: [''],
    telefonoPaciente: ['', [Validators.pattern(/^[0-9]{9}$/)]],
    direccionPaciente: [''],
  });

  @HostListener('window:scroll')
  onScroll(): void {
    this.navbarConSombra = window.scrollY > 80;
  }

  seleccionarRol(rol: RolSistema): void {
    this.rolSeleccionado = rol;
    this.loginForm.patchValue({ rol });

    if (rol === 'paciente') {
      this.mostrarAlerta('Has seleccionado el acceso para pacientes.', 'info');
    }

    if (rol === 'medico') {
      this.mostrarAlerta('Has seleccionado el acceso para médicos.', 'info');
    }

    if (rol === 'administrador') {
      this.mostrarAlerta('Has seleccionado el acceso para administrador.', 'info');
    }

    if (rol === 'recepcionista') {
      this.mostrarAlerta('Has seleccionado el acceso para recepcionista.', 'info');
    }

    const seccionAcceso = document.getElementById('acceso');
    seccionAcceso?.scrollIntoView({ behavior: 'smooth' });
  }

  ingresarSistema(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Ingrese su usuario, contraseña y seleccione el tipo de acceso.',
        confirmButtonText: 'Entendido',
      });

      return;
    }

    const usuario = this.loginForm.value.usuario?.trim() ?? '';
    const password = this.loginForm.value.password ?? '';
    const rolFormulario = this.loginForm.value.rol as RolSistema;

    this.ingresando = true;

    this.authService
      .login({
        login: usuario,
        password: password,
      })
      .pipe(
        finalize(() => {
          this.ingresando = false;
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            Swal.fire({
              icon: 'error',
              title: 'Acceso denegado',
              text: response.message || 'Credenciales inválidas.',
              confirmButtonText: 'Intentar nuevamente',
            });

            return;
          }

          const rolBackend = response.data.rol;
          const rolEsperado = this.convertirRolFormulario(rolFormulario);

          if (rolBackend !== rolEsperado) {
            this.authService.logout();

            Swal.fire({
              icon: 'error',
              title: 'Rol incorrecto',
              text: `Este usuario pertenece al rol ${rolBackend}, pero seleccionó ${rolFormulario}.`,
              confirmButtonText: 'Corregir',
            });

            return;
          }

          const debeCambiarPassword = this.debeCambiarPassword(response.data);

          if (debeCambiarPassword) {
            this.usuarioPendienteCambioPassword = response.data;
            this.rolPendienteCambioPassword = rolBackend;
            this.passwordActualLogin = password;

            this.cambiarPasswordForm.reset({
              nuevaPassword: '',
              confirmarNuevaPassword: '',
            });

            Swal.fire({
              icon: 'info',
              title: 'Cambio de contraseña requerido',
              text: 'Debe actualizar su contraseña para continuar.',
              timer: 1200,
              showConfirmButton: false,
            }).then(() => {
              this.abrirModalCambiarPassword();
            });

            return;
          }

          Swal.fire({
            icon: 'success',
            title: 'Bienvenido',
            text: `${response.data.nombre} ${response.data.apellido}`,
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            this.router.navigate([this.obtenerRutaPorRol(rolBackend)]);
          });
        },

        error: (error) => {
          let mensaje =
            'No se pudo conectar con el servidor. Verifique que sistema esté ejecutándose.';

          if (error.status === 401) {
            mensaje = 'Credenciales inválidas.';
          }

          if (error.error?.message) {
            mensaje = error.error.message;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error de acceso',
            text: mensaje,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  validarDniPaciente(): void {
    if (this.validarDniForm.invalid) {
      this.validarDniForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Documento inválido',
        text: this.mensajeDocumentoInvalido(),
        confirmButtonText: 'Entendido',
      });

      return;
    }

    const tipoDocumento = this.validarDniForm.value.tipoDocumentoPaciente?.trim() ?? 'DNI';

    const numeroDocumento = this.validarDniForm.value.numeroDocumentoPaciente?.trim() ?? '';

    this.validandoDni = true;

    this.authService
      .validarDniPaciente(numeroDocumento)
      .pipe(
        finalize(() => {
          this.validandoDni = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (respuesta: any) => {
          console.log('Respuesta validación documento:', respuesta);

          const documentoExiste = this.normalizarRespuestaExistencia(
            respuesta,
            'documento existe',
            'documento no existe',
          );

          if (documentoExiste === true) {
            Swal.fire({
              icon: 'warning',
              title: 'Paciente ya registrado',
              text: 'El número de documento ingresado ya existe como paciente.',
              confirmButtonText: 'Aceptar',
            });

            return;
          }

          this.pasarAPasoUsuario(tipoDocumento, numeroDocumento);
        },

        error: (error) => {
          console.error('Error real al validar documento:', error);

          const mensaje = this.obtenerMensajeError(error);

          if (mensaje.includes('documento no existe')) {
            this.pasarAPasoUsuario(tipoDocumento, numeroDocumento);
            return;
          }

          if (mensaje.includes('documento existe')) {
            Swal.fire({
              icon: 'warning',
              title: 'Paciente ya registrado',
              text: 'El número de documento ingresado ya existe como paciente.',
              confirmButtonText: 'Aceptar',
            });

            return;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error de validación',
            text: 'No se pudo validar el documento con el servidor.',
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  validarUsuarioPaciente(): void {
    if (this.registroUsuarioForm.invalid) {
      this.registroUsuarioForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Complete el usuario, correo y contraseña correctamente.',
        confirmButtonText: 'Entendido',
      });

      return;
    }

    const usuario = this.registroUsuarioForm.value.username?.trim() ?? '';
    const email = this.registroUsuarioForm.value.correo?.trim() ?? '';

    this.validandoUsuario = true;

    this.authService
      .validarUsuarioCorreo(usuario, email)
      .pipe(
        finalize(() => {
          this.validandoUsuario = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (respuesta: any) => {
          console.log('Respuesta validación usuario/correo:', respuesta);

          const existeUsuarioOCorreo = this.normalizarRespuestaExistencia(
            respuesta,
            'usuario existe',
            'usuario no existe',
          );

          if (existeUsuarioOCorreo === true) {
            Swal.fire({
              icon: 'warning',
              title: 'Usuario o correo no disponible',
              text: 'El usuario o correo ya se encuentra registrado en el sistema.',
              confirmButtonText: 'Corregir',
            });

            return;
          }

          this.pasoRegistroPaciente = 3;
          this.cdr.detectChanges();

          Swal.fire({
            icon: 'success',
            title: 'Datos disponibles',
            text: 'Ahora complete los datos personales del paciente.',
            timer: 1000,
            showConfirmButton: false,
          });
        },

        error: (error) => {
          console.error('Error real al validar usuario/correo:', error);

          const mensaje = this.obtenerMensajeError(error);

          if (mensaje.includes('usuario no existe')) {
            this.pasoRegistroPaciente = 3;
            this.cdr.detectChanges();

            Swal.fire({
              icon: 'success',
              title: 'Datos disponibles',
              text: 'Ahora complete los datos personales del paciente.',
              timer: 1000,
              showConfirmButton: false,
            });

            return;
          }

          if (mensaje.includes('usuario existe')) {
            Swal.fire({
              icon: 'warning',
              title: 'Usuario o correo no disponible',
              text: 'El usuario o correo ya se encuentra registrado en el sistema.',
              confirmButtonText: 'Corregir',
            });

            return;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error de validación',
            text: 'No se pudo validar el usuario y correo con el servidor.',
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  registrarPaciente(): void {
    if (this.registroUsuarioForm.invalid || this.registroPacienteForm.invalid) {
      this.registroUsuarioForm.markAllAsTouched();
      this.registroPacienteForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Complete correctamente todos los datos requeridos.',
        confirmButtonText: 'Entendido',
      });

      return;
    }

    const usuario = this.registroUsuarioForm.getRawValue();
    const paciente = this.registroPacienteForm.getRawValue();

    this.registrandoPaciente = true;

    this.authService
      .registrarUsuario({
        username: usuario.username?.trim() ?? '',
        correo: usuario.correo?.trim() ?? '',
        password: usuario.password ?? '',
        idRol: this.ID_ROL_PACIENTE,
        cambiarContraseña: false,
      })
      .pipe(
        switchMap((usuarioResponse: any) => {
          const idusuarioCreado = usuarioResponse?.idusuario;

          if (!idusuarioCreado) {
            return throwError(
              () => new Error('El usuario fue creado, pero no se recibió el idusuario.'),
            );
          }

          return this.authService.registrarPaciente({
            idusuario: idusuarioCreado,
            nombresPaciente: paciente.nombresPaciente?.trim() ?? '',
            apellidosPaciente: paciente.apellidosPaciente?.trim() ?? '',
            tipoDocumentoPaciente:
              paciente.tipoDocumentoPaciente ?? this.tipoDocumentoPacienteValidado ?? 'DNI',
            numeroDocumentoPaciente: paciente.numeroDocumentoPaciente ?? this.dniPacienteValidado,
            fechaNacimientoPaciente: paciente.fechaNacimientoPaciente ?? '',
            grupoSanguineoPaciente: paciente.grupoSanguineoPaciente ?? '',
            sexoPaciente: paciente.sexoPaciente ?? '',
            direccionPaciente: paciente.direccionPaciente?.trim() ?? '',
            telefonoPaciente: paciente.telefonoPaciente?.trim() ?? '',
          });
        }),

        finalize(() => {
          this.registrandoPaciente = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (pacienteResponse: any) => {
          if (pacienteResponse?.success !== true) {
            Swal.fire({
              icon: 'error',
              title: 'Paciente no registrado',
              text:
                pacienteResponse?.message ||
                'El usuario fue creado, pero no se pudo registrar el paciente.',
              confirmButtonText: 'Aceptar',
            });

            return;
          }

          Swal.fire({
            icon: 'success',
            title: 'Paciente registrado',
            text: 'La cuenta del paciente fue creada correctamente.',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            this.limpiarRegistroPaciente();
            this.cerrarModalRegistroPaciente();
          });
        },

        error: (error) => {
          console.error('Error al registrar usuario/paciente:', error);

          Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text:
              error.error?.message ||
              error.message ||
              'No se pudo completar el registro del paciente.',
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  cambiarTipoDocumentoPaciente(): void {
    this.validarDniForm.patchValue({
      numeroDocumentoPaciente: '',
    });

    this.validarDniForm.get('numeroDocumentoPaciente')?.updateValueAndValidity();
  }

  mensajeDocumentoInvalido(): string {
    const tipoDocumento = this.validarDniForm.value.tipoDocumentoPaciente;

    if (tipoDocumento === 'DNI') {
      return 'Ingrese un DNI válido de 8 dígitos.';
    }

    if (tipoDocumento === 'CEDULA') {
      return 'Ingrese una cédula válida de 6 a 20 caracteres.';
    }

    if (tipoDocumento === 'PASAPORTE') {
      return 'Ingrese un pasaporte válido de 6 a 20 caracteres.';
    }

    return 'Ingrese un número de documento válido de 4 a 20 caracteres.';
  }

  volverPasoRegistro(): void {
    if (this.pasoRegistroPaciente > 1) {
      this.pasoRegistroPaciente = (this.pasoRegistroPaciente - 1) as PasoRegistroPaciente;
      this.cdr.detectChanges();
    }
  }

  limpiarRegistroPaciente(): void {
    this.pasoRegistroPaciente = 1;

    this.validandoDni = false;
    this.validandoUsuario = false;
    this.registrandoPaciente = false;

    this.dniPacienteValidado = '';
    this.tipoDocumentoPacienteValidado = 'DNI';

    this.validarDniForm.reset({
      tipoDocumentoPaciente: 'DNI',
      numeroDocumentoPaciente: '',
    });

    this.registroUsuarioForm.reset();

    this.registroPacienteForm.reset({
      nombresPaciente: '',
      apellidosPaciente: '',
      tipoDocumentoPaciente: {
        value: 'DNI',
        disabled: true,
      },
      numeroDocumentoPaciente: {
        value: '',
        disabled: true,
      },
      fechaNacimientoPaciente: '',
      sexoPaciente: '',
      grupoSanguineoPaciente: '',
      telefonoPaciente: '',
      direccionPaciente: '',
    });

    this.cdr.detectChanges();
  }

  cerrarModalRegistroPaciente(): void {
    const modalElemento = document.getElementById('modalRegistrarPaciente');

    if (!modalElemento) {
      return;
    }

    const modal = bootstrap.Modal.getInstance(modalElemento) || new bootstrap.Modal(modalElemento);

    modal.hide();
  }

  campoInvalido(campo: 'usuario' | 'password' | 'rol'): boolean {
    const control = this.loginForm.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  campoInvalidoRegistro(formulario: AbstractControl, campo: string): boolean {
    const control = formulario.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private pasarAPasoUsuario(tipoDocumento: string, numeroDocumento: string): void {
    this.dniPacienteValidado = numeroDocumento;
    this.tipoDocumentoPacienteValidado = tipoDocumento;

    this.registroPacienteForm.patchValue({
      tipoDocumentoPaciente: tipoDocumento,
      numeroDocumentoPaciente: numeroDocumento,
    });

    this.pasoRegistroPaciente = 2;
    this.cdr.detectChanges();

    setTimeout(() => {
      document.getElementById('usernameRegistro')?.focus();
    }, 250);

    Swal.fire({
      icon: 'success',
      title: 'Documento disponible',
      text: 'Ahora complete los datos de acceso del usuario.',
      timer: 900,
      showConfirmButton: false,
    });
  }

  private normalizarRespuestaExistencia(
    respuesta: any,
    mensajeExiste: string,
    mensajeNoExiste: string,
  ): boolean {
    if (typeof respuesta === 'boolean') {
      return respuesta;
    }

    const mensaje = respuesta?.message?.toLowerCase() || respuesta?.mensaje?.toLowerCase() || '';

    if (mensaje.includes(mensajeNoExiste)) {
      return false;
    }

    if (respuesta?.success === true || mensaje.includes(mensajeExiste)) {
      return true;
    }

    if (respuesta?.success === false) {
      return false;
    }

    return false;
  }

  private obtenerMensajeError(error: any): string {
    return (
      error?.error?.message?.toLowerCase() ||
      error?.error?.mensaje?.toLowerCase() ||
      error?.mensajePersonalizado?.toLowerCase() ||
      error?.message?.toLowerCase() ||
      ''
    );
  }

  private convertirRolFormulario(rol: RolSistema): string {
    const roles: Record<RolSistema, string> = {
      paciente: 'PACIENTE',
      medico: 'MEDICO',
      administrador: 'ADMIN',
      recepcionista: 'RECEPCIONISTA',
    };

    return roles[rol];
  }

  private obtenerRutaPorRol(rol: string): string {
    const rutas: Record<string, string> = {
      PACIENTE: '/paciente',
      MEDICO: '/medico',
      ADMIN: '/admin',
      RECEPCIONISTA: '/recepcionista',
    };

    return rutas[rol] ?? '/';
  }
  private mostrarAlerta(mensaje: string, tipo: TipoAlerta): void {
    this.alertaMensaje = mensaje;
    this.alertaTipo = tipo;
    this.alertaVisible = true;

    setTimeout(() => {
      this.alertaVisible = false;
    }, 3000);
  }

  private passwordsIguales(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmarPassword = control.get('confirmarPassword')?.value;

    if (!password || !confirmarPassword) {
      return null;
    }

    return password === confirmarPassword ? null : { passwordsNoCoinciden: true };
  }

  private validarNumeroDocumentoPaciente(control: AbstractControl): ValidationErrors | null {
    const numero = String(control.value ?? '').trim();

    if (!numero) {
      return null;
    }

    const tipoDocumento = control.parent?.get('tipoDocumentoPaciente')?.value;

    if (tipoDocumento === 'DNI') {
      return /^[0-9]{8}$/.test(numero) ? null : { documentoInvalido: true };
    }

    if (tipoDocumento === 'CEDULA') {
      return /^[A-Za-z0-9-]{6,20}$/.test(numero) ? null : { documentoInvalido: true };
    }

    if (tipoDocumento === 'PASAPORTE') {
      return /^[A-Za-z0-9-]{6,20}$/.test(numero) ? null : { documentoInvalido: true };
    }

    return /^[A-Za-z0-9-]{4,20}$/.test(numero) ? null : { documentoInvalido: true };
  }
  cambiarPasswordObligatorio(): void {
    if (this.cambiarPasswordForm.invalid) {
      this.cambiarPasswordForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Contraseña no válida',
        text: 'Ingrese una contraseña válida y confirme correctamente.',
        confirmButtonText: 'Entendido',
      });

      return;
    }

    if (!this.usuarioPendienteCambioPassword?.idusuario) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario no identificado',
        text: 'No se pudo identificar al usuario para cambiar la contraseña.',
        confirmButtonText: 'Aceptar',
      });

      return;
    }

    const nuevaPassword = this.cambiarPasswordForm.value.nuevaPassword ?? '';

    if (nuevaPassword === this.passwordActualLogin) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña repetida',
        text: 'La nueva contraseña debe ser diferente a la contraseña actual.',
        confirmButtonText: 'Corregir',
      });

      return;
    }

    this.cambiandoPassword = true;

    this.authService
      .cambiarPasswordPrimerAcceso({
        idusuario: this.usuarioPendienteCambioPassword.idusuario,
        nuevacontrasena: nuevaPassword,
      })
      .pipe(
        finalize(() => {
          this.cambiandoPassword = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response: any) => {
          if (response?.success !== true) {
            Swal.fire({
              icon: 'error',
              title: 'No se pudo cambiar la contraseña',
              text: response?.message || 'Intente nuevamente.',
              confirmButtonText: 'Aceptar',
            });

            return;
          }

          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: response.message || 'Ahora puede ingresar al sistema.',
            timer: 1300,
            showConfirmButton: false,
          }).then(() => {
            this.cerrarModalCambiarPassword();

            this.cambiarPasswordForm.reset({
              nuevaPassword: '',
              confirmarNuevaPassword: '',
            });

            this.router.navigate([this.obtenerRutaPorRol(this.rolPendienteCambioPassword)]);
          });
        },

        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al cambiar contraseña',
            text: error.error?.message || error.message || 'No se pudo actualizar la contraseña.',
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  alternarVerNuevaPassword(): void {
    this.verNuevaPassword = !this.verNuevaPassword;
  }

  alternarVerConfirmarNuevaPassword(): void {
    this.verConfirmarNuevaPassword = !this.verConfirmarNuevaPassword;
  }

  campoInvalidoCambioPassword(campo: 'nuevaPassword' | 'confirmarNuevaPassword'): boolean {
    const control = this.cambiarPasswordForm.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private debeCambiarPassword(usuario: any): boolean {
    const valor =
      usuario?.cambiopass ??
      usuario?.cambioPass ??
      usuario?.cambiarPass ??
      usuario?.cambiarPassword ??
      usuario?.cambiarContrasena ??
      usuario?.cambiarContraseña ??
      usuario?.cambiar_password ??
      usuario?.cambiar_contraseña ??
      false;

    return valor === true || valor === 1 || valor === 'true' || valor === '1';
  }

  private abrirModalCambiarPassword(): void {
    const modalElemento = document.getElementById('modalCambiarPassword');

    if (!modalElemento) {
      return;
    }

    const modal =
      bootstrap.Modal.getInstance(modalElemento) ||
      new bootstrap.Modal(modalElemento, {
        backdrop: 'static',
        keyboard: false,
      });

    modal.show();

    setTimeout(() => {
      document.getElementById('nuevaPassword')?.focus();
    }, 300);
  }

  private cerrarModalCambiarPassword(): void {
    const modalElemento = document.getElementById('modalCambiarPassword');

    if (!modalElemento) {
      return;
    }

    const modal = bootstrap.Modal.getInstance(modalElemento) || new bootstrap.Modal(modalElemento);
    modal.hide();
  }

  private passwordsCambioIguales(control: AbstractControl): ValidationErrors | null {
    const nuevaPassword = control.get('nuevaPassword')?.value;
    const confirmarNuevaPassword = control.get('confirmarNuevaPassword')?.value;

    if (!nuevaPassword || !confirmarNuevaPassword) {
      return null;
    }

    return nuevaPassword === confirmarNuevaPassword ? null : { passwordsCambioNoCoinciden: true };
  }
  alternarVerPasswordLogin(): void {
    this.verPasswordLogin = !this.verPasswordLogin;
  }

  cambiarTipoRecuperacion(): void {
  const tipo = this.recuperarPasswordForm.value.tipoUsuario as 'paciente' | 'medico';

  this.tipoUsuarioRecuperacion = tipo;
  this.idUsuarioRecuperacion = null;
  this.pasoRecuperarPassword = 1;

  this.recuperarPasswordForm.patchValue({
    documento: '',
    fechaNacimientoPaciente: '',
    cmpMedico: ''
  });
}

validarUsuarioParaRecuperarPassword(): void {
  const tipo = this.recuperarPasswordForm.value.tipoUsuario as 'paciente' | 'medico';

  this.validandoRecuperacion = true;

  if (tipo === 'paciente') {
    const documento = this.recuperarPasswordForm.value.documento?.trim() ?? '';
    const fechaNacimiento = this.recuperarPasswordForm.value.fechaNacimientoPaciente ?? '';

    if (!documento || !fechaNacimiento) {
      this.validandoRecuperacion = false;

      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Ingrese el documento y la fecha de nacimiento del paciente.',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    this.authService
      .validarPacienteRecuperacion(documento, fechaNacimiento)
      .pipe(
        finalize(() => {
          this.validandoRecuperacion = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Validación paciente:', response);

          if (response?.success !== true) {
            Swal.fire({
              icon: 'error',
              title: 'Paciente no validado',
              text: response?.message || 'Los datos ingresados no coinciden.',
              confirmButtonText: 'Aceptar'
            });

            return;
          }

          const idusuario = response?.data?.idusuario;

          if (!idusuario) {
            Swal.fire({
              icon: 'error',
              title: 'Usuario no identificado',
              text: 'El backend validó al paciente, pero no devolvió el idusuario.',
              confirmButtonText: 'Aceptar'
            });

            return;
          }

          this.idUsuarioRecuperacion = idusuario;
          this.pasoRecuperarPassword = 2;

          this.nuevaPasswordRecuperacionForm.reset({
            nuevaPassword: '',
            confirmarPassword: ''
          });

          this.cdr.detectChanges();

          setTimeout(() => {
            document.getElementById('nuevaPasswordRecuperacion')?.focus();
          }, 250);

          Swal.fire({
            icon: 'success',
            title: 'Paciente validado',
            text: 'Ahora registre su nueva contraseña.',
            timer: 900,
            showConfirmButton: false
          });
        },

        error: (error) => {
          console.error('Error validando paciente:', error);

          Swal.fire({
            icon: 'error',
            title: 'Error de validación',
            text:
              error.error?.message ||
              'No se pudo validar al paciente con el servidor.',
            confirmButtonText: 'Aceptar'
          });
        }
      });

    return;
  }

  const cmpMedico = this.recuperarPasswordForm.value.cmpMedico?.trim() ?? '';

  if (!cmpMedico) {
    this.validandoRecuperacion = false;

    Swal.fire({
      icon: 'warning',
      title: 'Dato incompleto',
      text: 'Ingrese el CMP del médico.',
      confirmButtonText: 'Entendido'
    });

    return;
  }

  this.authService
    .validarMedicoRecuperacion(cmpMedico)
    .pipe(
      finalize(() => {
        this.validandoRecuperacion = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: any) => {
        console.log('Validación médico:', response);

        if (response?.success !== true) {
          Swal.fire({
            icon: 'error',
            title: 'Médico no validado',
            text: response?.message || 'El CMP ingresado no corresponde a un médico registrado.',
            confirmButtonText: 'Aceptar'
          });

          return;
        }

        const idusuario = response?.data?.idusuario;

        if (!idusuario) {
          Swal.fire({
            icon: 'error',
            title: 'Usuario no identificado',
            text: 'El backend validó al médico, pero no devolvió el idusuario.',
            confirmButtonText: 'Aceptar'
          });

          return;
        }

        this.idUsuarioRecuperacion = idusuario;
        this.pasoRecuperarPassword = 2;

        this.nuevaPasswordRecuperacionForm.reset({
          nuevaPassword: '',
          confirmarPassword: ''
        });

        this.cdr.detectChanges();

        setTimeout(() => {
          document.getElementById('nuevaPasswordRecuperacion')?.focus();
        }, 250);

        Swal.fire({
          icon: 'success',
          title: 'Médico validado',
          text: 'Ahora registre su nueva contraseña.',
          timer: 900,
          showConfirmButton: false
        });
      },

      error: (error) => {
        console.error('Error validando médico:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text:
            error.error?.message ||
            'No se pudo validar al médico con el servidor.',
          confirmButtonText: 'Aceptar'
        });
      }
    });
}

actualizarPasswordRecuperacion(): void {
  if (this.nuevaPasswordRecuperacionForm.invalid) {
    this.nuevaPasswordRecuperacionForm.markAllAsTouched();

    Swal.fire({
      icon: 'warning',
      title: 'Contraseña no válida',
      text: 'Ingrese una contraseña válida y confirme correctamente.',
      confirmButtonText: 'Entendido'
    });

    return;
  }

  if (!this.idUsuarioRecuperacion) {
    Swal.fire({
      icon: 'error',
      title: 'Usuario no identificado',
      text: 'No se pudo identificar el usuario para cambiar la contraseña.',
      confirmButtonText: 'Aceptar'
    });

    return;
  }

  const nuevaPassword = this.nuevaPasswordRecuperacionForm.value.nuevaPassword ?? '';

  this.actualizandoPasswordRecuperacion = true;

  this.authService
    .cambiarPasswordPrimerAcceso({
      idusuario: this.idUsuarioRecuperacion,
      nuevacontrasena: nuevaPassword
    })
    .pipe(
      finalize(() => {
        this.actualizandoPasswordRecuperacion = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (response: any) => {
        console.log('Cambio de contraseña:', response);

        if (response?.success !== true) {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo actualizar',
            text: response?.message || 'No se pudo cambiar la contraseña.',
            confirmButtonText: 'Aceptar'
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: response.message || 'Ahora puede iniciar sesión con su nueva contraseña.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.limpiarRecuperacionPassword();
          this.cerrarModalRecuperarPassword();
        });
      },

      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text:
            error.error?.message ||
            error.message ||
            'No se pudo cambiar la contraseña.',
          confirmButtonText: 'Aceptar'
        });
      }
    });
}

alternarVerNuevaPasswordRecuperacion(): void {
  this.verNuevaPasswordRecuperacion = !this.verNuevaPasswordRecuperacion;
}

alternarVerConfirmarPasswordRecuperacion(): void {
  this.verConfirmarPasswordRecuperacion = !this.verConfirmarPasswordRecuperacion;
}

campoInvalidoRecuperacion(campo: 'nuevaPassword' | 'confirmarPassword'): boolean {
  const control = this.nuevaPasswordRecuperacionForm.get(campo);
  return !!control && control.invalid && (control.touched || control.dirty);
}

limpiarRecuperacionPassword(): void {
  this.pasoRecuperarPassword = 1;
  this.validandoRecuperacion = false;
  this.actualizandoPasswordRecuperacion = false;
  this.idUsuarioRecuperacion = null;
  this.tipoUsuarioRecuperacion = 'paciente';
  this.verNuevaPasswordRecuperacion = false;
  this.verConfirmarPasswordRecuperacion = false;

  this.recuperarPasswordForm.reset({
    tipoUsuario: 'paciente',
    documento: '',
    fechaNacimientoPaciente: '',
    cmpMedico: ''
  });

  this.nuevaPasswordRecuperacionForm.reset({
    nuevaPassword: '',
    confirmarPassword: ''
  });

  this.cdr.detectChanges();
}

private cerrarModalRecuperarPassword(): void {
  const modalElemento = document.getElementById('modalRecuperarPassword');

  if (!modalElemento) {
    return;
  }

  const modal = bootstrap.Modal.getInstance(modalElemento) || new bootstrap.Modal(modalElemento);
  modal.hide();
}

private passwordsRecuperacionIguales(control: AbstractControl): ValidationErrors | null {
  const nuevaPassword = control.get('nuevaPassword')?.value;
  const confirmarPassword = control.get('confirmarPassword')?.value;

  if (!nuevaPassword || !confirmarPassword) {
    return null;
  }

  return nuevaPassword === confirmarPassword
    ? null
    : { passwordsRecuperacionNoCoinciden: true };
}
}
