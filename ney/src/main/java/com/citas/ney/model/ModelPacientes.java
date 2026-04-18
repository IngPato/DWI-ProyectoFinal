/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 *
 * @author kevin
 */
@Entity
@Table(name = "pacientes")
public class ModelPacientes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idpacientes")
    private Integer idpacientes;

    @OneToOne
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private ModelUsuario usuario;

    @Column(name = "nombres_paciente", length = 80, nullable = false)
    private String nombresPaciente;

    @Column(name = "apellidos_paciente", length = 80, nullable = false)
    private String apellidosPaciente;

    @Column(name = "tipo_documento_paciente", length = 20)
    private String tipoDocumentoPaciente;

    @Column(name = "numero_documento_paciente", length = 20, unique = true)
    private String numeroDocumentoPaciente;

    @Column(name = "fecha_nacimiento_paciente")
    private LocalDate fechaNacimientoPaciente;

    @Column(name = "sexo_paciente", length = 20)
    private String sexoPaciente;

    @Column(name = "telefono_paciente", length = 20)
    private String telefonoPaciente;

    @Column(name = "direccion_paciente", length = 150)
    private String direccionPaciente;

    @Column(name = "fecha_registro_paciente")
    private LocalDateTime fechaRegistroPaciente;

    @Column(name = "estado_paciente", columnDefinition = "TINYINT(1)")
    private Integer estadoPaciente;

    @Column(name = "grupo_sanguineo_paciente", length = 45)
    private String grupoSanguineoPaciente;

    @OneToMany(mappedBy = "paciente")
    private List<ModelCitas> citas;

    public ModelPacientes() {
    }

    public Integer getIdpacientes() {
        return idpacientes;
    }

    public void setIdpacientes(Integer idpacientes) {
        this.idpacientes = idpacientes;
    }

    public ModelUsuario getUsuario() {
        return usuario;
    }

    public void setUsuario(ModelUsuario usuario) {
        this.usuario = usuario;
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

    public LocalDateTime getFechaRegistroPaciente() {
        return fechaRegistroPaciente;
    }

    public void setFechaRegistroPaciente(LocalDateTime fechaRegistroPaciente) {
        this.fechaRegistroPaciente = fechaRegistroPaciente;
    }

    public Integer getEstadoPaciente() {
        return estadoPaciente;
    }

    public void setEstadoPaciente(Integer estadoPaciente) {
        this.estadoPaciente = estadoPaciente;
    }

    public String getGrupoSanguineoPaciente() {
        return grupoSanguineoPaciente;
    }

    public void setGrupoSanguineoPaciente(String grupoSanguineoPaciente) {
        this.grupoSanguineoPaciente = grupoSanguineoPaciente;
    }

    public List<ModelCitas> getCitas() {
        return citas;
    }

    public void setCitas(List<ModelCitas> citas) {
        this.citas = citas;
    }


}
