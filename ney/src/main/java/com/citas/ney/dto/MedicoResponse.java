/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
@AllArgsConstructor
@Builder
public class MedicoResponse {
    private Integer idusuario;
    private String usuarioMedico;
    private String correoMedico;
    private Integer idespecialidad;
    private String especialidad;
    private String nombresMedico;
    private String apellidosMedico;
    private String cmpMedico;
    private String telefonoMedico;
    private LocalDateTime fecha_creacion;
    private Integer estadoMedico;
}
