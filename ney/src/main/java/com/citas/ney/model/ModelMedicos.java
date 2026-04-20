/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.model;

import jakarta.persistence.*;
import java.util.List;

/**
 *
 * @author kevin
 */


@Entity
@Table(name = "medicos")
public class ModelMedicos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idmedicos")
    private Integer idmedicos;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_usuario", unique = true)
    private ModelUsuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_especialidad", nullable = false)
    private ModelEspecialidades especialidad;

    @Column(name = "nombres_medico", length = 80, nullable = false)
    private String nombresMedico;

    @Column(name = "apellidos_medico", length = 80, nullable = false)
    private String apellidosMedico;

    @Column(name = "cmp_medico", length = 30, nullable = false, unique = true)
    private String cmpMedico;

    @Column(name = "telefono_medico", length = 20)
    private String telefonoMedico;

    @Column(name = "estado_medico", columnDefinition = "TINYINT(1)")
    private Integer estadoMedico;

    @OneToMany(mappedBy = "medico")
    private List<ModelHorariosMedico> horarios;

    @OneToMany(mappedBy = "medico")
    private List<ModelCitas> citas;

    public ModelMedicos() {
    }

    public Integer getIdmedicos() {
        return idmedicos;
    }

    public void setIdmedicos(Integer idmedicos) {
        this.idmedicos = idmedicos;
    }

    public ModelUsuario getUsuario() {
        return usuario;
    }

    public void setUsuario(ModelUsuario usuario) {
        this.usuario = usuario;
    }

    public ModelEspecialidades getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(ModelEspecialidades especialidad) {
        this.especialidad = especialidad;
    }

    public String getNombresMedico() {
        return nombresMedico;
    }

    public void setNombresMedico(String nombresMedico) {
        this.nombresMedico = nombresMedico;
    }

    public String getApellidosMedico() {
        return apellidosMedico;
    }

    public void setApellidosMedico(String apellidosMedico) {
        this.apellidosMedico = apellidosMedico;
    }

    public String getCmpMedico() {
        return cmpMedico;
    }

    public void setCmpMedico(String cmpMedico) {
        this.cmpMedico = cmpMedico;
    }

    public String getTelefonoMedico() {
        return telefonoMedico;
    }

    public void setTelefonoMedico(String telefonoMedico) {
        this.telefonoMedico = telefonoMedico;
    }

    public Integer getEstadoMedico() {
        return estadoMedico;
    }

    public void setEstadoMedico(Integer estadoMedico) {
        this.estadoMedico = estadoMedico;
    }

    public List<ModelHorariosMedico> getHorarios() {
        return horarios;
    }

    public void setHorarios(List<ModelHorariosMedico> horarios) {
        this.horarios = horarios;
    }

    public List<ModelCitas> getCitas() {
        return citas;
    }

    public void setCitas(List<ModelCitas> citas) {
        this.citas = citas;
    }
}
