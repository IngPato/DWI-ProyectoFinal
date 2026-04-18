/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.citas.ney.repository;

import com.citas.ney.model.ModelRoles;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author kevin
 */
@Repository
public interface RolesRepository extends JpaRepository<ModelRoles, Integer> {

    List<ModelRoles> findByEstadoRol(Integer estadoRol);
}
