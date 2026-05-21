package com.citas.ney.service;

import com.citas.ney.dto.EstadocitaResponse;
import com.citas.ney.model.ModelEstadosCita;
import com.citas.ney.repository.EstadoCitaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EstadoCitaService {

    private final EstadoCitaRepository estadoCitaRepository;

    private EstadocitaResponse convertirEstadoCita(ModelEstadosCita estadosCita) {
        EstadocitaResponse response = new EstadocitaResponse();
        response.setIdestadosCita(estadosCita.getIdestadosCita());
        response.setNombreEstado(estadosCita.getNombreEstado());
        response.setDescripcionEstado(estadosCita.getDescripcionEstado());
        return response;
    }

    public List<EstadocitaResponse> listarEstadoCitas() {
        List<ModelEstadosCita> estadosCitas = estadoCitaRepository.findAll();
        return estadosCitas.stream().map(this::convertirEstadoCita).collect(Collectors.toList());
    }
}
