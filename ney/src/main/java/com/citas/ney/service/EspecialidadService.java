package com.citas.ney.service;

import com.citas.ney.dto.EspecialidadResponse;
import com.citas.ney.dto.EstadoRequest;
import com.citas.ney.model.ModelEspecialidades;
import com.citas.ney.repository.EspecialidadRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    private EspecialidadResponse convertirEspecialidad(ModelEspecialidades especialidades) {
        EspecialidadResponse response = new EspecialidadResponse();
        response.setIdespecialidades(especialidades.getIdespecialidades());
        response.setNombreEspecialidad(especialidades.getNombreEspecialidad());
        response.setDescripcionEspecialidad(especialidades.getDescripcionEspecialidad());
        response.setEstadoEspecialidad(especialidades.getEstadoEspecialidad());
        return response;
    }

    public List<EspecialidadResponse> listarTodoEspecialidadActivos() {
        List<ModelEspecialidades> response = especialidadRepository.findByEstadoEspecialidad(1);
        return response.stream().map(this::convertirEspecialidad).collect(Collectors.toList());
    }

    public boolean registrar(ModelEspecialidades especialidad) {
        try {
            especialidad.setEstadoEspecialidad(1);
            especialidadRepository.save(especialidad);
            return true;
        } catch (Exception e) {
            return false;
        }

    }

    public boolean actualizar(Integer id, ModelEspecialidades especialidades) {
        try {
            ModelEspecialidades especialidad = especialidadRepository.findById(id).orElseThrow(() -> new RuntimeException("especialidad no encontrada"));
            especialidad.setNombreEspecialidad(especialidades.getNombreEspecialidad());
            especialidad.setDescripcionEspecialidad(especialidades.getDescripcionEspecialidad());
            especialidadRepository.save(especialidad);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean cambiarEstadoEspecialidad(Integer id, EstadoRequest estado) {
        try {
            ModelEspecialidades especialidades = especialidadRepository.findById(id).orElseThrow(() -> new RuntimeException("especialidad no encontrada"));
            especialidades.setEstadoEspecialidad(estado.getEstado());
            especialidadRepository.save(especialidades);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
