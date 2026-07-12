/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
/**
 *
 * @author kevin
 */


@Entity
@Table(name = "citas")
@Getter
@Setter
@NoArgsConstructor
public class ModelCitas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idcitas")
    private Integer idcitas;

    @ManyToOne
    @JoinColumn(name = "id_paciente", nullable = false)
    private ModelPacientes paciente;

    @ManyToOne
    @JoinColumn(name = "id_medico", nullable = false)
    private ModelMedicos medico;

    @ManyToOne
    @JoinColumn(name = "id_especialidad", nullable = false)
    private ModelEspecialidades especialidad;

    @ManyToOne
    @JoinColumn(name = "id_horario", nullable = false)
    private ModelHorariosMedico horario;

    @ManyToOne
    @JoinColumn(name = "id_estado_cita", nullable = false)
    private ModelEstadosCita estadoCita;

    @Column(name = "fecha_cita", nullable = false)
    private LocalDate fechaCita;

    @Column(name = "hora_cita", nullable = false)
    private LocalTime horaCita;

    @Column(name = "motivo_cita", length = 250)
    private String motivoCita;

    @Column(name = "observacion_cita", length = 250)
    private String observacionCita;

    @Column(name = "fecha_registro_cita")
    private LocalDateTime fechaRegistroCita;

    @Column(name = "fecha_actualizacion_cita")
    private LocalDateTime fechaActualizacionCita;
}
