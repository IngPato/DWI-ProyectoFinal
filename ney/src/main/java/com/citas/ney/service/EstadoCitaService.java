package com.citas.ney.service;

import com.citas.ney.model.ModelEstadosCita;
import com.citas.ney.repository.EstadoCitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EstadoCitaService {
    @Autowired
    private EstadoCitaRepository repository;

    public List<ModelEstadosCita> listarTodos() {
        return repository.findAll();
    }

    public ModelEstadosCita guardar(ModelEstadosCita estado) {
        return repository.save(estado);
    }
}