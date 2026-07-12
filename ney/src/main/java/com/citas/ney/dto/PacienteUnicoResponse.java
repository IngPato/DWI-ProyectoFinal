/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;

import java.time.LocalDate;
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
public class PacienteUnicoResponse {

    private Integer idpacientes;
    private Integer idusuario;
    private String nombresPaciente;
    private String tipoDocumentoPaciente;
    private String numeroDocumentoPaciente;
    private LocalDate fechaNacimientoPaciente;
    private String sexoPaciente;
    private String telefonoPaciente;
    private String direccionPaciente;
    private String grupoSanguineoPaciente;

}
