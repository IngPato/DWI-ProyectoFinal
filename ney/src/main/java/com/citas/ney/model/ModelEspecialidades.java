/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.model;

import jakarta.persistence.*;
import java.util.List;

/**
 *
 * @author kevin
 */


@Entity
@Table(name = "especialidades")
public class ModelEspecialidades {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idespecialidades")
    private Integer idespecialidades;

    @Column(name = "nombre_especialidad", length = 150, nullable = false)
    private String nombreEspecialidad;

    @Column(name = "descripcion_especialidad", length = 255)
    private String descripcionEspecialidad;

    @Column(name = "estado_especialidad", columnDefinition = "TINYINT(1)")
    private Integer estadoEspecialidad;

    @OneToMany(mappedBy = "especialidad")
    private List<ModelMedicos> medicos;

    @OneToMany(mappedBy = "especialidad")
    private List<ModelCitas> citas;

    public ModelEspecialidades() {
    }

    public Integer getIdespecialidades() {
        return idespecialidades;
    }

    public void setIdespecialidades(Integer idespecialidades) {
        this.idespecialidades = idespecialidades;
    }

    public String getNombreEspecialidad() {
        return nombreEspecialidad;
    }

    public void setNombreEspecialidad(String nombreEspecialidad) {
        this.nombreEspecialidad = nombreEspecialidad;
    }

    public String getDescripcionEspecialidad() {
        return descripcionEspecialidad;
    }

    public void setDescripcionEspecialidad(String descripcionEspecialidad) {
        this.descripcionEspecialidad = descripcionEspecialidad;
    }

    public Integer getEstadoEspecialidad() {
        return estadoEspecialidad;
    }

    public void setEstadoEspecialidad(Integer estadoEspecialidad) {
        this.estadoEspecialidad = estadoEspecialidad;
    }

    public List<ModelMedicos> getMedicos() {
        return medicos;
    }

    public void setMedicos(List<ModelMedicos> medicos) {
        this.medicos = medicos;
    }

    public List<ModelCitas> getCitas() {
        return citas;
    }

    public void setCitas(List<ModelCitas> citas) {
        this.citas = citas;
    }
}