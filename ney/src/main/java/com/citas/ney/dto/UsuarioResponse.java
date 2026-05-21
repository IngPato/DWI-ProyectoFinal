/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;

import java.time.LocalDateTime;
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
public class UsuarioResponse {
    private Integer idusuario;
    private Integer idRol;
    private String nombreRol;
    private String username;
    private String correo;
    private Integer estado;
    private LocalDateTime fechaCreacion;
}
