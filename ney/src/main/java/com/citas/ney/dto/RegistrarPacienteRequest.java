/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;

import java.time.LocalDate;
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
public class RegistrarPacienteRequest {

    private Integer idusuario;

    private String nombresPaciente;
    private String apellidosPaciente;
    private String tipoDocumentoPaciente;
    private String numeroDocumentoPaciente;
    private LocalDate fechaNacimientoPaciente;
    private String sexoPaciente;
    private String telefonoPaciente;
    private String direccionPaciente;
    private String grupoSanguineoPaciente;

}
