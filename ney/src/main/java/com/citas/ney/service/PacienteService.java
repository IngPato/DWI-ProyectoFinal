/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

import com.citas.ney.dto.PacienteEstadoRequest;
import com.citas.ney.dto.PacienteRequest;
import com.citas.ney.dto.PacienteResponse;
import com.citas.ney.model.ModelPacientes;
import com.citas.ney.model.ModelUsuario;
import com.citas.ney.repository.PacienteRepository;
import com.citas.ney.repository.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author GPatr
 */
@Service
public class PacienteService {

    @Autowired
    private PacienteRepository pacienteRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    private PacienteResponse convertirAResponse(ModelPacientes paciente) {
        PacienteResponse response = new PacienteResponse();
        response.setIdpacientes(paciente.getIdpacientes());
        response.setNombresPaciente(paciente.getNombresPaciente());
        response.setApellidosPaciente(paciente.getApellidosPaciente());
        response.setNumeroDocumentoPaciente(paciente.getNumeroDocumentoPaciente());
        response.setEstadoPaciente(paciente.getEstadoPaciente());

        if (paciente.getUsuario() != null) {
            response.setIdusuario(paciente.getUsuario().getIdusuario());
            response.setUsername(paciente.getUsuario().getUsername());
        }
        return response;
    }

    public List<PacienteResponse> listarPacientesActivos() {
        List<ModelPacientes> pacientes = pacienteRepository.findByEstadoPaciente(1);
        return pacientes.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }

    public PacienteResponse registrarPaciente(PacienteRequest request) {

        if (pacienteRepository.existsByNumeroDocumentoPaciente(request.getNumeroDocumentoPaciente())) {
            throw new RuntimeException("El número de documento ya está registrado");
        }

        ModelUsuario usuario = usuarioRepository.findById(request.getIdusuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + request.getIdusuario()));

        ModelPacientes paciente = new ModelPacientes();
        paciente.setUsuario(usuario);
        paciente.setNombresPaciente(request.getNombresPaciente());
        paciente.setApellidosPaciente(request.getApellidosPaciente());
        paciente.setTipoDocumentoPaciente(request.getTipoDocumentoPaciente());
        paciente.setNumeroDocumentoPaciente(request.getNumeroDocumentoPaciente());
        paciente.setFechaNacimientoPaciente(request.getFechaNacimientoPaciente());
        paciente.setSexoPaciente(request.getSexoPaciente());
        paciente.setTelefonoPaciente(request.getTelefonoPaciente());
        paciente.setDireccionPaciente(request.getDireccionPaciente());
        paciente.setGrupoSanguineoPaciente(request.getGrupoSanguineoPaciente());
        paciente.setEstadoPaciente(1);
        paciente.setFechaRegistroPaciente(LocalDateTime.now());

        ModelPacientes guardado = pacienteRepository.save(paciente);
        return convertirAResponse(guardado);
    }

    public PacienteResponse cambiarEstado(Integer id, PacienteEstadoRequest request) {
        ModelPacientes paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        System.out.println(request.getEstadoPaciente() + " data de prueba ");
        paciente.setEstadoPaciente(request.getEstadoPaciente());

        ModelPacientes actualizado = pacienteRepository.save(paciente);
        return convertirAResponse(actualizado);
    }

    @Transactional
    public void eliminarPaciente(Integer id) {
        ModelPacientes paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        pacienteRepository.delete(paciente);
    }
}
