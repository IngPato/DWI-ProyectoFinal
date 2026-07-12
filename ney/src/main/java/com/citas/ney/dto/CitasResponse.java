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
public class CitasResponse {
    private Integer idcita;
    private LocalDateTime fechaRegistro;
    private String paciente;
    private String medico;
    private String especialidad;
    private LocalDate fechaCita;
    private LocalTime horaCita;
    private String motivo;
    private String observacion;
    private String estado;
}
