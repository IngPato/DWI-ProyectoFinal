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
@Table(name = "estados_cita")
public class ModelEstadosCita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idestados_cita")
    private Integer idestadosCita;

    @Column(name = "nombre_estado", length = 50, nullable = false)
    private String nombreEstado;

    @Column(name = "descripcion_estado", length = 150)
    private String descripcionEstado;

    @OneToMany(mappedBy = "estadoCita")
    private List<ModelCitas> citas;

    public ModelEstadosCita() {
    }

    public Integer getIdestadosCita() {
        return idestadosCita;
    }

    public void setIdestadosCita(Integer idestadosCita) {
        this.idestadosCita = idestadosCita;
    }

    public String getNombreEstado() {
        return nombreEstado;
    }

    public void setNombreEstado(String nombreEstado) {
        this.nombreEstado = nombreEstado;
    }

    public String getDescripcionEstado() {
        return descripcionEstado;
    }

    public void setDescripcionEstado(String descripcionEstado) {
        this.descripcionEstado = descripcionEstado;
    }

    public List<ModelCitas> getCitas() {
        return citas;
    }

    public void setCitas(List<ModelCitas> citas) {
        this.citas = citas;
    }
}
