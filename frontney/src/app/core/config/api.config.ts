import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiUrl;

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    validarDoc: `${API_BASE_URL}/auth/validarDoc`,
    validarUsuarioCorreo: `${API_BASE_URL}/auth/validar-usuario-correo`,
    registrarUsuario: `${API_BASE_URL}/auth/registrar-usuario`,
    registrarPaciente: `${API_BASE_URL}/auth/registrar-paciente`,
    validarPacienteRecuperacion: `${API_BASE_URL}/auth/validar-paciente`,
    validarMedicoRecuperacion: `${API_BASE_URL}/auth/validar-medico`,
    cambiarPassword: `${API_BASE_URL}/auth/cambiar-password`,
  },
};
