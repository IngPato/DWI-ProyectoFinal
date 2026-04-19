/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

import com.citas.ney.DTO.UsuarioResponse;
import com.citas.ney.model.ModelUsuario;
import com.citas.ney.repository.RolesRepository;
import com.citas.ney.repository.UsuarioRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
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
    

}
