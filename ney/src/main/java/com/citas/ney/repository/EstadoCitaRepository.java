package com.citas.ney.repository;

import com.citas.ney.model.ModelEstadosCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoCitaRepository extends JpaRepository<ModelEstadosCita, Integer> {
}
