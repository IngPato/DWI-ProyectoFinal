/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.citas.ney.repository;

import com.citas.ney.model.ModelMedicos;
import java.util.List;
import java.util.Optional;
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
public interface MedicosRepository extends JpaRepository<ModelMedicos, Integer> {

    @Query("""
           SELECT m FROM ModelMedicos m
           JOIN m.usuario u
           WHERE u.estadoUsario = 1
           AND(
              :filtro IS NULL OR :filtro = '' OR 
              LOWER(m.nombresMedico) LIKE LOWER(CONCAT('%',:filtro,'%')) OR
              LOWER(m.apellidosMedico) LIKE LOWER(CONCAT('%',:filtro,'%'))
           )
           """)
    Page<ModelMedicos> buscarMedicosActivosPaginado(@Param("filtro") String buscar, Pageable pageable);

    boolean existsByCmpMedico(String cmpMedico);

    Optional<ModelMedicos> findByCmpMedico(String cmpMedico);
    
    Optional<ModelMedicos> findByUsuarioIdusuario(Integer idUsuario);
}
