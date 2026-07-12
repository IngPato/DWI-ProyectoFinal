/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.citas.ney.repository;

import com.citas.ney.model.ModelHorariosMedico;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author kevin
 */
@Repository
public interface HorarioMedicoRepository extends JpaRepository<ModelHorariosMedico, Integer> {

    @Query("""
    SELECT h
    FROM ModelHorariosMedico h
    WHERE h.medico.idmedicos = :idMedico
      AND (
          :fecha IS NULL
          OR h.fecha = :fecha
      )
    ORDER BY h.horaInicio ASC
    """)
    Page<ModelHorariosMedico> listarHorarioMedicoPaginada(
            @Param("idMedico") Integer idMedico,
            @Param("fecha") LocalDate fecha,
            Pageable pageable
    );

    List<ModelHorariosMedico> findByEstado(Integer estado);

    List<ModelHorariosMedico> findByMedico_IdmedicosAndFechaAndEstadoAndCupoGreaterThan(
            Integer idMedico,
            LocalDate fecha,
            Integer estado,
            Integer cupo
    );

    List<ModelHorariosMedico> findByMedico_Especialidad_IdespecialidadesAndFechaAndEstadoAndCupoGreaterThan(
            Integer idEspecialidad,
            LocalDate fecha,
            Integer estado,
            Integer cupo
    );
}
