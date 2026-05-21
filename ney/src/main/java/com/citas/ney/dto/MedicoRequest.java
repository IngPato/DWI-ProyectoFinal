/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;

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
public class MedicoRequest {
    private Integer idespecialidad;
    private String nombresMedico;
    private String apellidosMedico;
    private String cmpMedico;
    private String telefonoMedico;
    private Integer idRol;
    private String username;
    private String correo;
}
