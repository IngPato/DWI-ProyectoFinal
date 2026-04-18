/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 *
 * @author kevin
 */

@Entity
@Table(name = "usuario")
public class ModelUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idusuario")
    private Integer idusuario;

    @ManyToOne
    @JoinColumn(name = "id_rol", nullable = false)
    private ModelRoles rol;

    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String username;

    @Column(name = "correo", length = 100, nullable = false, unique = true)
    private String correo;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "estado_Usuario", columnDefinition = "TINYINT(1)")
    private Integer estadoUsario;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @OneToOne(mappedBy = "usuario")
    private ModelPacientes paciente;

    @OneToOne(mappedBy = "usuario")
    private ModelMedicos medico;

    public ModelUsuario() {
    }

    public Integer getIdusuario() {
        return idusuario;
    }

    public void setIdusuario(Integer idusuario) {
        this.idusuario = idusuario;
    }

    public ModelRoles getRol() {
        return rol;
    }

    public void setRol(ModelRoles rol) {
        this.rol = rol;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Integer getEstadoUsario() {
        return estadoUsario;
    }

    public void setEstadoUsario(Integer estadoUsario) {
        this.estadoUsario = estadoUsario;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public ModelPacientes getPaciente() {
        return paciente;
    }

    public void setPaciente(ModelPacientes paciente) {
        this.paciente = paciente;
    }

    public ModelMedicos getMedico() {
        return medico;
    }

    public void setMedico(ModelMedicos medico) {
        this.medico = medico;
    }
}
