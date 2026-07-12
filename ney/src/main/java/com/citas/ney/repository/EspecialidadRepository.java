package com.citas.ney.repository;

import com.citas.ney.model.ModelEspecialidades;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EspecialidadRepository extends JpaRepository<ModelEspecialidades, Integer> {

    List<ModelEspecialidades> findByEstadoEspecialidad(Integer estadoEspecialidad);

    @Query("""
        SELECT e FROM ModelEspecialidades e
        WHERE (
            :filtro IS NULL OR :filtro = '' OR
            LOWER(e.nombreEspecialidad) LIKE LOWER(CONCAT('%', :filtro, '%'))
        )
    """)
    Page<ModelEspecialidades> buscarEspecialidadesPaginado(
            @Param("filtro") String filtro,
            Pageable pageable
    );
}
