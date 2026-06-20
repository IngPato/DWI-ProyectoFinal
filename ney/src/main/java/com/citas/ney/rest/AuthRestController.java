package com.citas.ney.rest;

import com.citas.ney.dto.ApiResponse;
import com.citas.ney.dto.CambioContrasenaRequest;
import com.citas.ney.dto.LoginRequest;
import com.citas.ney.dto.LoginResponse;
import com.citas.ney.dto.RegistrarPacienteRequest;
import com.citas.ney.dto.UsuarioRequest;
import com.citas.ney.dto.UsuarioResponse;
import com.citas.ney.service.AuthService;
import com.citas.ney.service.MedicosService;
import com.citas.ney.service.PacienteService;
import com.citas.ney.service.UsuarioService;
import java.time.LocalDate;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthRestController {

    private final UsuarioService usuarioService;
    private final MedicosService medicosService;
    private final AuthService authService;
    private final PacienteService pacienteService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        ApiResponse<LoginResponse> response = authService.login(request);

        if (!response.isSuccess()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/validarDoc")
    public ResponseEntity<ApiResponse<?>> validarDocumento(@RequestParam String doc) {
        boolean existe = pacienteService.validardnipaciente(doc);

        if (existe) {
            return ResponseEntity.ok(ApiResponse.ok("documento existe"));
        }

        return ResponseEntity.ok(ApiResponse.error("documento no existe"));
    }

    @GetMapping("/validar-usuario-correo")
    public ResponseEntity<ApiResponse<?>> validarUsuarioCorreo(
            @RequestParam String usuario,
            @RequestParam String email
    ) {
        boolean existe = usuarioService.existeususario(usuario, email);

        if (existe) {
            return ResponseEntity.ok(ApiResponse.ok("usuario existe"));
        }

        return ResponseEntity.ok(ApiResponse.error("usuario no existe"));
    }

    @PostMapping("/registrar-paciente")
    public ResponseEntity<ApiResponse<?>> crearNuevoPaciente(
            @RequestBody RegistrarPacienteRequest pacienteRequest
    ) {
        boolean registrado = pacienteService.registrarPaciente(pacienteRequest);

        if (registrado) {
            return ResponseEntity.ok(ApiResponse.ok("Paciente creado con éxito"));
        }

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("No se pudo crear el paciente"));
    }

    @PostMapping("/registrar-usuario")
    public ResponseEntity<UsuarioResponse> registrarUsuario(@RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.registrarUsuario(request));
    }

    @PostMapping("/cambiar-password")
    public ResponseEntity<ApiResponse<?>> cambiarcontraseña(@RequestBody CambioContrasenaRequest request) {
        return usuarioService.cambioContraseña(request) == true
                ? ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada con exito"))
                : ResponseEntity.badRequest().body(ApiResponse.error("error en el proceso"));
    }

    @GetMapping("/validar-paciente")
    ResponseEntity<ApiResponse<?>> validadpaciente(@RequestParam String documento, @RequestParam LocalDate fechaNacimientoPaciente) {
        return pacienteService.validarPaciente(documento, fechaNacimientoPaciente) != 0
                ? ResponseEntity.ok(ApiResponse.ok("paciente correcto", Map.of(
                        "idusuario", pacienteService.validarPaciente(documento, fechaNacimientoPaciente)
                )))
                : ResponseEntity.badRequest().body(ApiResponse.error("no existe los datos del paciente"));
    }

    @GetMapping("/validar-medico")
    ResponseEntity<ApiResponse<?>> validadpaciente(@RequestParam String cmpMedico) {
        return medicosService.validarMedico(cmpMedico) != 0
                ? ResponseEntity.ok(ApiResponse.ok("medico correcto",Map.of("idusuario", medicosService.validarMedico(cmpMedico))))
                : ResponseEntity.badRequest().body(ApiResponse.error("no existe CMP del medico"));
    }
}
