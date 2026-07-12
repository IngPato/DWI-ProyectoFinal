/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.citas.ney.repository;

import com.citas.ney.model.ModelCitas;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 *
 * @author kevin
 */
public interface CitasRepository extends JpaRepository<ModelCitas, Integer> {

    @Query("""
       SELECT c FROM ModelCitas c
       JOIN c.paciente p
       JOIN c.medico m
       JOIN c.especialidad e
       JOIN c.horario h
       JOIN c.estadoCita ec
       WHERE (:filtro IS NULL OR :filtro = '' OR
       LOWER(p.nombresPaciente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR
       LOWER(p.apellidosPaciente) LIKE LOWER(CONCAT('%', :filtro, '%')) OR
       LOWER(p.numeroDocumentoPaciente) LIKE LOWER(CONCAT('%',:filtro, '%')) OR
       LOWER(m.nombresMedico) LIKE LOWER(CONCAT('%', :filtro, '%')) OR
       LOWER(m.apellidosMedico) LIKE LOWER(CONCAT('%', :filtro, '%')))
       """)
    Page<ModelCitas> buscarCitasPaginadas(@Param("filtro") String filtro, Pageable pageable);

    @Query("""
    SELECT c
    FROM ModelCitas c
    JOIN c.paciente p
    JOIN c.medico m
    JOIN c.especialidad e
    JOIN c.horario h
    JOIN c.estadoCita ec
    WHERE p.idpacientes = :idPaciente
      AND (
          :filtro IS NULL
          OR TRIM(:filtro) = ''
          OR LOWER(p.nombresPaciente)
                LIKE LOWER(CONCAT('%', TRIM(:filtro), '%'))
          OR LOWER(p.apellidosPaciente)
                LIKE LOWER(CONCAT('%', TRIM(:filtro), '%'))
           OR LOWER(p.numeroDocumentoPaciente)
                LIKE LOWER(CONCAT('%', TRIM(:filtro), '%'))
          OR LOWER(m.nombresMedico)
                LIKE LOWER(CONCAT('%', TRIM(:filtro), '%'))
          OR LOWER(m.apellidosMedico)
                LIKE LOWER(CONCAT('%', TRIM(:filtro), '%'))
      )
    """)
    Page<ModelCitas> buscarCitasPaginadaPacientes(
            @Param("idPaciente") Integer idPaciente,
            @Param("filtro") String filtro,
            Pageable pageable);
    
      @Query("""
    SELECT c
    FROM ModelCitas c
    JOIN c.paciente p
    JOIN c.medico m
    JOIN c.especialidad e
    JOIN c.horario h
    JOIN c.estadoCita ec
    WHERE m.idmedicos = :idMedico
      AND (
          :filtro IS NULL
          OR TRIM(:filtro) = ''
          OR LOWER(p.nombresPaciente)
                LIKE LOWER(CONCAT('%', TRIM(:filtro), '%'))
          OR LOWER(p.apellidosPaciente)
                LIKE LOWER(CONCAT('%', TRIM(:filtro), '%'))
          OR LOWER(p.numeroDocumentoPaciente)
                LIKE LOWER(CONCAT('%', TRIM(:filtro), '%'))
      )
    """)
    Page<ModelCitas> buscarCitasPaginadaMedicos(
            @Param("idMedico") Integer idMedico,
            @Param("filtro") String filtro,
            Pageable pageable);

    boolean existsByPaciente_IdpacientesAndMedico_IdmedicosAndFechaCitaAndHoraCita(
            Integer idPaciente,
            Integer idMedico,
            LocalDate fechaCita,
            LocalTime horaCita
    );
    Optional<ModelCitas> findByPacienteUsuarioIdusuario(Integer idusuario);
}
