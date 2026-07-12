/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

import com.citas.ney.dto.RegistrarPacienteRequest;
import com.citas.ney.dto.PacienteResponse;
import com.citas.ney.dto.PacienteUnicoResponse;
import com.citas.ney.model.ModelPacientes;
import com.citas.ney.model.ModelUsuario;
import com.citas.ney.repository.PacienteRepository;
import com.citas.ney.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author GPatr
 */
@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;

    private PacienteResponse convertirAResponse(ModelPacientes paciente) {
        Integer idusuario = null;
        String usuarioPaciente = null;
        String correoPaciente = null;
        LocalDateTime fechaCreacion = null;
        Integer estadoPaciente = null;

        if (paciente.getUsuario() != null) {
            idusuario = paciente.getUsuario().getIdusuario();
            usuarioPaciente = paciente.getUsuario().getUsername();
            correoPaciente = paciente.getUsuario().getCorreo();
            fechaCreacion = paciente.getUsuario().getFechaCreacion();
            estadoPaciente = paciente.getUsuario().getEstadoUsario();
        }

        return PacienteResponse.builder()
                .idusuario(idusuario)
                .usuarioPaciente(usuarioPaciente)
                .correoPaciente(correoPaciente)
                .fechaCreacion(fechaCreacion)
                .estadoPaciente(estadoPaciente)
                .nombresPaciente(paciente.getNombresPaciente())
                .apellidosPaciente(paciente.getApellidosPaciente())
                .tipoDocumentoPaciente(paciente.getTipoDocumentoPaciente())
                .numeroDocumentoPaciente(paciente.getNumeroDocumentoPaciente())
                .fechaNacimientoPaciente(paciente.getFechaNacimientoPaciente())
                .grupoSanguineoPaciente(paciente.getGrupoSanguineoPaciente())
                .sexoPaciente(paciente.getSexoPaciente())
                .direccionPaciente(paciente.getDireccionPaciente())
                .telefonoPaciente(paciente.getTelefonoPaciente())
                .build();
    }

    public Page<PacienteResponse> listarPacientesActivosPaginados(String filtro, Pageable pageable) {
        Page<ModelPacientes> response = pacienteRepository.BuscarPacientesActivosPaginado(filtro, pageable);
        return response.map(this::convertirAResponse);
    }

    @Transactional(readOnly = true)
    public PacienteUnicoResponse pacienteunico(Integer idpaciente) {
        ModelPacientes paciente = pacienteRepository.findByUsuarioIdusuario(idpaciente).orElseThrow(() -> new RuntimeException(""));
        return PacienteUnicoResponse.builder()
                .idpacientes(paciente.getIdpacientes())
                .idusuario(paciente.getUsuario().getIdusuario())
                .nombresPaciente(paciente.getNombresPaciente() + " " + paciente.getApellidosPaciente())
                .tipoDocumentoPaciente(paciente.getTipoDocumentoPaciente())
                .numeroDocumentoPaciente(paciente.getNumeroDocumentoPaciente())
                .fechaNacimientoPaciente(paciente.getFechaNacimientoPaciente())
                .sexoPaciente(paciente.getSexoPaciente())
                .telefonoPaciente(paciente.getTelefonoPaciente())
                .direccionPaciente(paciente.getDireccionPaciente())
                .grupoSanguineoPaciente(paciente.getGrupoSanguineoPaciente())
                .build();
    }

    public boolean registrarPaciente(RegistrarPacienteRequest request) {
        try {
            if (pacienteRepository.existsByNumeroDocumentoPaciente(request.getNumeroDocumentoPaciente())) {
                throw new RuntimeException("El número de documento ya está registrado");
            }

            ModelPacientes paciente = new ModelPacientes();
            if (request.getIdusuario() != null) {
                ModelUsuario usuario = usuarioRepository.findById(request.getIdusuario())
                        .orElseThrow(() -> new RuntimeException("El usuario no existe"));

                paciente.setUsuario(usuario);
            } else {
                paciente.setUsuario(null);
            }
            paciente.setNombresPaciente(request.getNombresPaciente());
            paciente.setApellidosPaciente(request.getApellidosPaciente());
            paciente.setTipoDocumentoPaciente(request.getTipoDocumentoPaciente());
            paciente.setNumeroDocumentoPaciente(request.getNumeroDocumentoPaciente());
            paciente.setFechaNacimientoPaciente(request.getFechaNacimientoPaciente());
            paciente.setSexoPaciente(request.getSexoPaciente());
            paciente.setTelefonoPaciente(request.getTelefonoPaciente());
            paciente.setDireccionPaciente(request.getDireccionPaciente());
            paciente.setGrupoSanguineoPaciente(request.getGrupoSanguineoPaciente());
            pacienteRepository.save(paciente);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e);
        }

    }

    public boolean actualizarPaciente(Integer id, RegistrarPacienteRequest request) {
        ModelPacientes paciente = pacienteRepository.findById(id).orElseThrow(() -> new RuntimeException("paciente no encontrado"));
        try {
            paciente.setNombresPaciente(request.getNombresPaciente());
            paciente.setApellidosPaciente(request.getApellidosPaciente());
            paciente.setTipoDocumentoPaciente(request.getTipoDocumentoPaciente());
            paciente.setNumeroDocumentoPaciente(request.getNumeroDocumentoPaciente());
            paciente.setFechaNacimientoPaciente(request.getFechaNacimientoPaciente());
            paciente.setSexoPaciente(request.getSexoPaciente());
            paciente.setTelefonoPaciente(request.getTelefonoPaciente());
            paciente.setDireccionPaciente(request.getDireccionPaciente());
            paciente.setGrupoSanguineoPaciente(request.getGrupoSanguineoPaciente());
            pacienteRepository.save(paciente);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("error: " + e);
        }

    }

    public Boolean validardnipaciente(String dni) {
        return pacienteRepository.existsByNumeroDocumentoPaciente(dni);
    }

    public Integer validarPaciente(String dni, LocalDate fechaNacimientoPaciente) {
        ModelPacientes paciente = pacienteRepository.findByNumeroDocumentoPacienteAndFechaNacimientoPaciente(dni, fechaNacimientoPaciente)
                .orElseThrow(() -> new RuntimeException("Paciente no existe"));
        if (paciente.getUsuario() == null) {
            throw new RuntimeException("El paciente no tiene usuario asignado");
        }

        return paciente.getUsuario().getIdusuario();
    }

}
