/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.repository;

import com.citas.ney.model.ModelUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author kevin
 */
@Repository
public interface UsuarioRepository extends JpaRepository<ModelUsuario, Integer> {

    List<ModelUsuario> findByEstadoUsario(Integer estadoUsario);

    Optional<ModelUsuario> findByUsernamer(String username);

    Optional<ModelUsuario> findByCorreo(String correo);

    boolean existsByUsername(String username);

    boolean existsByCorreo(String correo);

}
