/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

/**
 *
 * @author kevin
 */
import com.citas.ney.model.ModelUsuario;
import com.citas.ney.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {

        ModelUsuario usuario = usuarioRepository
                .findByUsernameOrCorreo(login, login)
                .orElseThrow(() -> new UsernameNotFoundException(
                "Usuario no encontrado con username o correo: " + login
        ));

        String rol = usuario.getRol().getNombreRol();

        return User.builder()
                .username(usuario.getCorreo())
                .password(usuario.getPasswordHash())
                .authorities("ROLE_" + rol.toUpperCase())
                .disabled(!usuario.getEstadoUsario().equals(1))
                .build();
    }
}
