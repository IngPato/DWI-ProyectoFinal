/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
/**
 *
 * @author kevin
 */


@Entity
@Table(name = "citas")
public class ModelCitas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idcitas")
    private Integer idcitas;

    @ManyToOne
    @JoinColumn(name = "id_paciente", nullable = false)
    private ModelPacientes paciente;

    @ManyToOne
    @JoinColumn(name = "id_medico", nullable = false)
    private ModelMedicos medico;

    @ManyToOne
    @JoinColumn(name = "id_especialidad", nullable = false)
    private ModelEspecialidades especialidad;

    @ManyToOne
    @JoinColumn(name = "id_horario", nullable = false)
    private ModelHorariosMedico horario;

    @ManyToOne
    @JoinColumn(name = "id_estado_cita", nullable = false)
    private ModelEstadosCita estadoCita;

    @Column(name = "fecha_cita", nullable = false)
    private LocalDate fechaCita;

    @Column(name = "hora_cita", nullable = false)
    private LocalTime horaCita;

    @Column(name = "motivo_cita", length = 250)
    private String motivoCita;

    @Column(name = "observacion_cita", length = 250)
    private String observacionCita;

    @Column(name = "fecha_registro_cita")
    private LocalDateTime fechaRegistroCita;

    @Column(name = "fecha_actualizacion_cita")
    private LocalDateTime fechaActualizacionCita;

    public ModelCitas() {
    }

    public Integer getIdcitas() {
        return idcitas;
    }

    public void setIdcitas(Integer idcitas) {
        this.idcitas = idcitas;
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

    public ModelEspecialidades getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(ModelEspecialidades especialidad) {
        this.especialidad = especialidad;
    }

    public ModelHorariosMedico getHorario() {
        return horario;
    }

    public void setHorario(ModelHorariosMedico horario) {
        this.horario = horario;
    }

    public ModelEstadosCita getEstadoCita() {
        return estadoCita;
    }

    public void setEstadoCita(ModelEstadosCita estadoCita) {
        this.estadoCita = estadoCita;
    }

    public LocalDate getFechaCita() {
        return fechaCita;
    }

    public void setFechaCita(LocalDate fechaCita) {
        this.fechaCita = fechaCita;
    }

    public LocalTime getHoraCita() {
        return horaCita;
    }

    public void setHoraCita(LocalTime horaCita) {
        this.horaCita = horaCita;
    }

    public String getMotivoCita() {
        return motivoCita;
    }

    public void setMotivoCita(String motivoCita) {
        this.motivoCita = motivoCita;
    }

    public String getObservacionCita() {
        return observacionCita;
    }

    public void setObservacionCita(String observacionCita) {
        this.observacionCita = observacionCita;
    }

    public LocalDateTime getFechaRegistroCita() {
        return fechaRegistroCita;
    }

    public void setFechaRegistroCita(LocalDateTime fechaRegistroCita) {
        this.fechaRegistroCita = fechaRegistroCita;
    }

    public LocalDateTime getFechaActualizacionCita() {
        return fechaActualizacionCita;
    }

    public void setFechaActualizacionCita(LocalDateTime fechaActualizacionCita) {
        this.fechaActualizacionCita = fechaActualizacionCita;
    }
}
