
/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.citas.ney.repository;

import com.citas.ney.model.ModelPacientes;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author GPatr
 */
@Repository
public interface PacienteRepository extends JpaRepository<ModelPacientes, Integer> {

    @Query(
            """
            SELECT p FROM ModelPacientes p
            JOIN p.usuario u
            WHERE u.estadoUsario = 1
            AND(
                :filtro IS NULL OR :filtro = '' OR
                LOWER(p.nombresPaciente) LIKE LOWER(CONCAT('%',:filtro,'%')) OR
                LOWER(p.apellidosPaciente) LIKE LOWER(CONCAT('%',:filtro,'%')) OR
                LOWER(p.numeroDocumentoPaciente) LIKE LOWER(CONCAT('%',:filtro,'%'))
            )
    """
    )
    Page<ModelPacientes> BuscarPacientesActivosPaginado(@Param("filtro") String buscar, Pageable pageable);

    Optional<ModelPacientes> findByNumeroDocumentoPaciente(String numeroDocumentoPaciente);

    boolean existsByNumeroDocumentoPaciente(String numeroDocumentoPaciente);

}
