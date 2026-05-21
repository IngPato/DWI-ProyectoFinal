/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

import com.citas.ney.dto.ApiResponse;
import com.citas.ney.dto.LoginRequest;
import com.citas.ney.dto.LoginResponse;
import com.citas.ney.model.ModelUsuario;
import com.citas.ney.repository.UsuarioRepository;
import com.citas.ney.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

/**
 *
 * @author kevin
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final AuthenticationManager authenticationManager;

    public ApiResponse<LoginResponse> login(LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.login(),
                            request.password()
                    )
            );
        } catch (BadCredentialsException e) {
            return new ApiResponse<>(false, "Credenciales inválidas.", null);
        } catch (AuthenticationException e) {
            return new ApiResponse<>(false, "Credenciales inválidas.", null);
        }

         ModelUsuario usuario = usuarioRepository
                .findByUsernameOrCorreo(request.login(), request.login())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        String rol = usuario.getRol().getNombreRol().toUpperCase();

        String token = jwtUtil.generarToken(
                usuario.getCorreo(),
                usuario.getIdusuario(),
                rol
        );

        LoginResponse response = new LoginResponse();
        response.setIdusuario(usuario.getIdusuario());
        response.setRol(rol);
        response.setUsername(usuario.getUsername());
        response.setCorreo(usuario.getCorreo());
        response.setToken(token);

        switch (rol) {
            case "PACIENTE" -> {
                response.setNombre(usuario.getPaciente().getNombresPaciente());
                response.setApellido(usuario.getPaciente().getApellidosPaciente());
            }
            case "MEDICO" -> {
                response.setNombre(usuario.getMedico().getNombresMedico());
                response.setApellido(usuario.getMedico().getApellidosMedico());
            }
            case "ADMIN" -> {
                response.setNombre("User");
                response.setApellido("Admin");
            }
            case "RECEPCIONISTA" -> {
                response.setNombre("User");
                response.setApellido("Recepcionista");
            }
            default -> {
                response.setNombre("");
                response.setApellido("");
            }
        }
        return new ApiResponse<>(true, "Login exitoso.", response);
    }
}
