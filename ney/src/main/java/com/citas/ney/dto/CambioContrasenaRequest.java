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
public class CambioContrasenaRequest {
    private Integer idusuario;
    private String nuevacontrasena;
}
