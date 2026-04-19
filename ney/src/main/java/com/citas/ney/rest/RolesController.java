/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;

import com.citas.ney.model.ModelRoles;
import com.citas.ney.service.RolesService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author kevin
 */
@RestController
@RequestMapping(name = "/api/roles")
@CrossOrigin(origins = "*")
public class RolesController {

    @Autowired
    private RolesService rolesService;

    @GetMapping("/activos")
    public List<ModelRoles> listaRolesActivos() {
        return rolesService.listaRolesActivos();
    }
}
