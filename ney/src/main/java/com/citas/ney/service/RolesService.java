/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

import com.citas.ney.model.ModelRoles;
import com.citas.ney.repository.RolesRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author kevin
 */
@Service
public class RolesService {
    
    @Autowired
    private RolesRepository rolesRepository;
    
    public List<ModelRoles> listaRolesActivos(){
        return rolesRepository.findByEstadoRol(1);
    }
}
