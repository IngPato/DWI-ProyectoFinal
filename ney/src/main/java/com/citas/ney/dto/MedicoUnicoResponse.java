/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;

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
public class MedicoUnicoResponse {
    private Integer idmedicos;
    private Integer idusuario;
    private Integer idespecilidad;
    private String especialidad;
    private String nombresMedico;
    private String cmpMedico;
    private String telefonoMedico;

}
