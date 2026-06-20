/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

import com.citas.ney.dto.CambioContrasenaRequest;
import com.citas.ney.dto.EstadoRequest;
import com.citas.ney.dto.UsuarioRequest;
import com.citas.ney.dto.UsuarioResponse;
import com.citas.ney.model.ModelRoles;
import com.citas.ney.model.ModelUsuario;
import com.citas.ney.repository.RolesRepository;
import com.citas.ney.repository.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 *
 * @author kevin
 */
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolesRepository rolesRepository;
    private final PasswordEncoder passwordEncoder;

    private UsuarioResponse convertirAresponse(ModelUsuario usuario) {
        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(usuario.getIdusuario());
        response.setIdRol(usuario.getRol().getIdroles());
        response.setNombreRol(usuario.getRol().getNombreRol());
        response.setUsername(usuario.getUsername());
        response.setCorreo(usuario.getCorreo());
        response.setEstado(usuario.getEstadoUsario());
        response.setFechaCreacion(usuario.getFechaCreacion());
        return response;
    }

    public List<UsuarioResponse> listaUsuariosActivos() {
        List<ModelUsuario> usuarios = usuarioRepository.findByEstadoUsario(1);
        return usuarios.stream().map(this::convertirAresponse).collect(Collectors.toList());
    }

    public UsuarioResponse registrarUsuario(UsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El usuario ya existe");

        }
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya existe");

        }
        ModelRoles rol = rolesRepository.findById(request.getIdRol()).orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        ModelUsuario usuario = new ModelUsuario();
        usuario.setRol(rol);
        usuario.setUsername(request.getUsername());
        usuario.setCorreo(request.getCorreo());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setEstadoUsario(1);
        usuario.setFechaCreacion(LocalDateTime.now());
        usuario.setCambiarContraseña(request.getCambiarContraseña());

        ModelUsuario guardado = usuarioRepository.save(usuario);
        return convertirAresponse(guardado);

    }

    public UsuarioResponse actualizarUsuario(Integer id, UsuarioRequest request) {
        ModelUsuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ModelRoles rol = rolesRepository.findById(request.getIdRol()).orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        usuario.setRol(rol);
        usuario.setUsername(request.getUsername());
        usuario.setCorreo(request.getCorreo());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            usuario.setPasswordHash(request.getPassword());
        }
        return convertirAresponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse cambiarEstadoUsuario(Integer id, EstadoRequest request) {

        ModelUsuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setEstadoUsario(request.getEstado());

        ModelUsuario actualizado = usuarioRepository.save(usuario);

        return convertirAresponse(actualizado);
    }

    public boolean existeususario(String usuario, String correo) {
        if (!usuario.equals(null)) {
            if (usuarioRepository.existsByUsername(usuario) != true) {
                if (!correo.equals(null)) {
                    if (usuarioRepository.existsByCorreo(correo) == true) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return false;
        }

    }

    public boolean cambioContraseña(CambioContrasenaRequest request) {
        try {
            ModelUsuario usuario = usuarioRepository.findById(request.getIdusuario()).orElseThrow(() -> new RuntimeException("usuario no existe"));
            usuario.setPasswordHash(passwordEncoder.encode(request.getNuevacontrasena()));
            usuario.setCambiarContraseña(Boolean.FALSE);
            usuarioRepository.save(usuario);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("error al actualizar contraseña");
        }

    }

}
