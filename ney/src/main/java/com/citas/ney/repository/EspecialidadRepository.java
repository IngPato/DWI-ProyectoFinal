package com.citas.ney.repository;

import com.citas.ney.model.ModelEspecialidades;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EspecialidadRepository extends JpaRepository<ModelEspecialidades, Integer> {

    List<ModelEspecialidades> findByEstadoEspecialidad(Integer estadoEspecialidad);
}
