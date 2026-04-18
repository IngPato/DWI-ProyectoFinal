/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 *
 * @author kevin
 */


@Entity
@Table(name = "horarios_medico")
public class ModelHorariosMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idhorarios_medico")
    private Integer idhorariosMedico;

    @ManyToOne
    @JoinColumn(name = "id_medico", nullable = false)
    private ModelMedicos medico;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "cupo")
    private Integer cupo;

    @Column(name = "estado", columnDefinition = "TINYINT(1)")
    private Integer estado;

    @OneToMany(mappedBy = "horario")
    private List<ModelCitas> citas;

    public ModelHorariosMedico() {
    }

    public Integer getIdhorariosMedico() {
        return idhorariosMedico;
    }

    public void setIdhorariosMedico(Integer idhorariosMedico) {
        this.idhorariosMedico = idhorariosMedico;
    }

    public ModelMedicos getMedico() {
        return medico;
    }

    public void setMedico(ModelMedicos medico) {
        this.medico = medico;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public Integer getCupo() {
        return cupo;
    }

    public void setCupo(Integer cupo) {
        this.cupo = cupo;
    }

    public Integer getEstado() {
        return estado;
    }

    public void setEstado(Integer estado) {
        this.estado = estado;
    }

    public List<ModelCitas> getCitas() {
        return citas;
    }

    public void setCitas(List<ModelCitas> citas) {
        this.citas = citas;
    }
}
