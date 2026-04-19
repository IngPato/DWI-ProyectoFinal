/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

import com.citas.ney.dto.UsuarioEstadoRequest;
import com.citas.ney.dto.UsuarioRequest;
import com.citas.ney.dto.UsuarioResponse;
import com.citas.ney.model.ModelRoles;
import com.citas.ney.model.ModelUsuario;
import com.citas.ney.repository.RolesRepository;
import com.citas.ney.repository.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 *
 * @author kevin
 */
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private RolesRepository rolesRepository;

    /* @Autowired
    private PasswordEncoder passwordEncoder;*/
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
        usuario.setPasswordHash(request.getPassword());
        usuario.setEstadoUsario(request.getEstado() != null ? request.getEstado() : 1);
        usuario.setFechaCreacion(LocalDateTime.now());

        ModelUsuario guardado = usuarioRepository.save(usuario);
        return convertirAresponse(guardado);

    }

    public UsuarioResponse actualizarUsuario(Integer id, UsuarioRequest request) {
        ModelUsuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getUsername().equals(request.getUsername()) && usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El usuario ya existe");
        }
        if (usuario.getCorreo().equals(request.getCorreo()) && usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya existe");
        }

        ModelRoles rol = rolesRepository.findById(request.getIdRol()).orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        usuario.setRol(rol);
        usuario.setUsername(request.getUsername());
        usuario.setCorreo(request.getCorreo());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            usuario.setPasswordHash(request.getPassword());
        }

        if (request.getEstado() != null) {
            usuario.setEstadoUsario(request.getEstado());
        }

        ModelUsuario actualizado = usuarioRepository.save(usuario);
        return convertirAresponse(actualizado);
    }

    public UsuarioResponse cambiarEstadoUsuario(Integer id, UsuarioEstadoRequest request) {

        ModelUsuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setEstadoUsario(request.getEstado());

        ModelUsuario actualizado = usuarioRepository.save(usuario);

        return convertirAresponse(actualizado);
    }

    public void eliminarUsuario(Integer id) {
        ModelUsuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuarioRepository.delete(usuario);
    }

}
