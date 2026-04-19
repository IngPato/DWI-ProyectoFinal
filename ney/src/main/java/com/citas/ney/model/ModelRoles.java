/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import java.util.List;

/**
 *
 * @author kevin
 */

@Entity
@Table(name = "roles")
public class ModelRoles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idroles")
    private Integer idroles;

    @Column(name = "nombre", length = 255, nullable = false)
    private String nombreRol;

    @Column(name = "descripcion", length = 100)
    private String descripcionRol;

    @Column(name = "estado", columnDefinition = "TINYINT(1)")
    private Integer estadoRol;

    @OneToMany(mappedBy = "rol")
    @JsonIgnore
    private List<ModelUsuario> usuarios;

    public ModelRoles() {
    }

    public Integer getIdroles() {
        return idroles;
    }

    public void setIdroles(Integer idroles) {
        this.idroles = idroles;
    }

    public String getNombreRol() {
        return nombreRol;
    }

    public void setNombreRol(String nombreRol) {
        this.nombreRol = nombreRol;
    }

    public String getDescripcionRol() {
        return descripcionRol;
    }

    public void setDescripcionRol(String descripcionRol) {
        this.descripcionRol = descripcionRol;
    }

    public Integer getEstadoRol() {
        return estadoRol;
    }

    public void setEstadoRol(Integer estadoRol) {
        this.estadoRol = estadoRol;
    }

    public List<ModelUsuario> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(List<ModelUsuario> usuarios) {
        this.usuarios = usuarios;
    }

  
}