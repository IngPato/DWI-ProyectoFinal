/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.dto;
import java.time.LocalDate;
import java.time.LocalDateTime;
/**
 *
 * @author GPatr
 */
public class PacienteRequest {
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
    private LocalDateTime fechaRegistroPaciente;

    public PacienteRequest() {}

    // getters y setters

    public Integer getIdusuario() {
        return idusuario;
    }

    public void setIdusuario(Integer idusuario) {
        this.idusuario = idusuario;
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

    public String getTipoDocumentoPaciente() {
        return tipoDocumentoPaciente;
    }

    public void setTipoDocumentoPaciente(String tipoDocumentoPaciente) {
        this.tipoDocumentoPaciente = tipoDocumentoPaciente;
    }

    public String getNumeroDocumentoPaciente() {
        return numeroDocumentoPaciente;
    }

    public void setNumeroDocumentoPaciente(String numeroDocumentoPaciente) {
        this.numeroDocumentoPaciente = numeroDocumentoPaciente;
    }

    public LocalDate getFechaNacimientoPaciente() {
        return fechaNacimientoPaciente;
    }

    public void setFechaNacimientoPaciente(LocalDate fechaNacimientoPaciente) {
        this.fechaNacimientoPaciente = fechaNacimientoPaciente;
    }

    public String getSexoPaciente() {
        return sexoPaciente;
    }

    public void setSexoPaciente(String sexoPaciente) {
        this.sexoPaciente = sexoPaciente;
    }

    public String getTelefonoPaciente() {
        return telefonoPaciente;
    }

    public void setTelefonoPaciente(String telefonoPaciente) {
        this.telefonoPaciente = telefonoPaciente;
    }

    public String getDireccionPaciente() {
        return direccionPaciente;
    }

    public void setDireccionPaciente(String direccionPaciente) {
        this.direccionPaciente = direccionPaciente;
    }
    
    public String getGrupoSanguineoPaciente() {
        return grupoSanguineoPaciente;
    }

    public void setGrupoSanguineoPaciente(String grupoSanguineoPaciente) {
        this.grupoSanguineoPaciente = grupoSanguineoPaciente;
    }

    public LocalDateTime getFechaRegistroPaciente() {
        return fechaRegistroPaciente;
    }

    public void setFechaRegistroPaciente(LocalDateTime fechaRegistroPaciente) {
        this.fechaRegistroPaciente = fechaRegistroPaciente;
    }
    
}
