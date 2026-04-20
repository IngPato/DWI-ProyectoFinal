package com.citas.ney.service;

import com.citas.ney.model.ModelEspecialidades;
import com.citas.ney.repository.EspecialidadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EspecialidadService {
    @Autowired
    private EspecialidadRepository repository;

    public List<ModelEspecialidades> listarTodas() {
        return repository.findAll();
    }

    public ModelEspecialidades guardar(ModelEspecialidades especialidad) {
        return repository.save(especialidad);
    }

    public void eliminar(Integer id) {
        repository.deleteById(id);
    }
}
