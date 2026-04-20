/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;
import java.time.LocalDate;
/**
 *
 * @author GPatr
 */
public class PacienteResponse {
    private Integer idpacientes;

    private String nombresPaciente;
    private String apellidosPaciente;
    private String numeroDocumentoPaciente;
    private Integer estadoPaciente;

    private Integer idusuario;
    private String username;

    public PacienteResponse() {}

    // getters y setters

    public Integer getIdpacientes() {
        return idpacientes;
    }

    public void setIdpacientes(Integer idpacientes) {
        this.idpacientes = idpacientes;
    }

    public String getNombresPaciente() {
        return nombresPaciente;
    }

    public void setNombresPaciente(String nombresPaciente) {
        this.nombresPaciente = nombresPaciente;
    }

    public String getApellidosPaciente() {
        return apellidosPaciente;
    }

    public void setApellidosPaciente(String apellidosPaciente) {
        this.apellidosPaciente = apellidosPaciente;
    }

    public String getNumeroDocumentoPaciente() {
        return numeroDocumentoPaciente;
    }

    public void setNumeroDocumentoPaciente(String numeroDocumentoPaciente) {
        this.numeroDocumentoPaciente = numeroDocumentoPaciente;
    }

    public Integer getEstadoPaciente() {
        return estadoPaciente;
    }

    public void setEstadoPaciente(Integer estadoPaciente) {
        this.estadoPaciente = estadoPaciente;
    }

    public Integer getIdusuario() {
        return idusuario;
    }

    public void setIdusuario(Integer idusuario) {
        this.idusuario = idusuario;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    
}
 