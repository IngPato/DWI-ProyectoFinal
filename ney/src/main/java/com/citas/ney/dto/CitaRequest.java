/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author kevin
 */
@Getter
@Setter
@NoArgsConstructor
public class CitaRequest {

    private Integer idPaciente;
    private Integer idMedico;
    private Integer idEspecialidad;
    private Integer idHorario;
    private LocalDate fechaCita;
    private LocalTime horaCita;
    private String motivoCita;
    private String observacionCita;

}
