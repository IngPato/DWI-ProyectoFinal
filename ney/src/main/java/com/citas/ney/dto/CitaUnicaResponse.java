/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
/**
 *
 * @author kevin
 */
@Getter
@Setter
@Builder
public class CitaUnicaResponse {
    private Integer idCita;

    private Integer idPaciente;
    private String paciente;
    private String documento;
    private String telefono;
    private String direccionPaciente;
    private String grupoSanSexo;

    private Integer idMedico;
    private String medico;

    private Integer idEspecialidad;
    private String especialidad;

    private Integer idHorario;
    private LocalDate fechaHorario;
    private LocalTime horaInicio;
    private LocalTime horaFin;

    private Integer idEstadoCita;
    private String estadoCita;

    private LocalDate fechaCita;
    private LocalTime horaCita;

    private String motivoCita;
    private String observacionCita;

    private LocalDateTime fechaRegistroCita;
    private LocalDateTime fechaActualizacionCita;
}
