/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

import com.citas.ney.dto.CambioEstadoCitaRequest;
import com.citas.ney.dto.CitasResponse;
import com.citas.ney.dto.DisponibilidadMedicaResponse;
import com.citas.ney.dto.CitaRequest;
import com.citas.ney.dto.CitaUnicaResponse;
import com.citas.ney.model.ModelCitas;
import com.citas.ney.model.ModelEspecialidades;
import com.citas.ney.model.ModelEstadosCita;
import com.citas.ney.model.ModelHorariosMedico;
import com.citas.ney.model.ModelMedicos;
import com.citas.ney.model.ModelPacientes;
import com.citas.ney.repository.CitasRepository;
import com.citas.ney.repository.EspecialidadRepository;
import com.citas.ney.repository.EstadoCitaRepository;
import com.citas.ney.repository.HorarioMedicoRepository;
import com.citas.ney.repository.MedicosRepository;
import com.citas.ney.repository.PacienteRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author kevin
 */
@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitasRepository citasRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicosRepository medicosRepository;
    private final EspecialidadRepository especialidadRepository;
    private final HorarioMedicoRepository horarioMedicoRepository;
    private final EstadoCitaRepository estadoCitaRepository;

    private CitasResponse convertir(ModelCitas citas) {
        return CitasResponse.builder()
                .idcita(citas.getIdcitas())
                .fechaRegistro(citas.getFechaRegistroCita())
                .paciente(citas.getPaciente().getNombresPaciente() + " " + citas.getPaciente().getApellidosPaciente())
                .medico(citas.getMedico().getNombresMedico() + " " + citas.getMedico().getApellidosMedico())
                .motivo(citas.getMotivoCita())
                .observacion(citas.getObservacionCita())
                .especialidad(citas.getEspecialidad().getNombreEspecialidad())
                .fechaCita(citas.getFechaCita())
                .horaCita(citas.getHoraCita())
                .estado(citas.getEstadoCita().getNombreEstado())
                .build();
    }

    public Page<CitasResponse> listascitaspaginadas(String buscar, Pageable pageable) {
        Page<ModelCitas> citas = citasRepository.buscarCitasPaginadas(buscar, pageable);
        return citas.map(this::convertir);
    }
     public Page<CitasResponse> listascitasPaginadasPacientes(Integer id,String buscar, Pageable pageable) {
        Page<ModelCitas> citas = citasRepository.buscarCitasPaginadaPacientes(id,buscar, pageable);
        return citas.map(this::convertir);
    }
      public Page<CitasResponse> listascitasPaginadasMedicos(Integer id,String buscar, Pageable pageable) {
        Page<ModelCitas> citas = citasRepository.buscarCitasPaginadaMedicos(id,buscar, pageable);
        return citas.map(this::convertir);
    }

    private CitaUnicaResponse convertirACitasResponse(ModelCitas cita) {

        return CitaUnicaResponse.builder()
                .idCita(cita.getIdcitas())
                .idPaciente(cita.getPaciente().getIdpacientes())
                .paciente(cita.getPaciente().getNombresPaciente() + " " + cita.getPaciente().getApellidosPaciente())
                .documento(cita.getPaciente().getTipoDocumentoPaciente()+": "+cita.getPaciente().getNumeroDocumentoPaciente())
                .telefono(cita.getPaciente().getTelefonoPaciente())
                .direccionPaciente(cita.getPaciente().getDireccionPaciente())
                .grupoSanSexo("Grupo: "+cita.getPaciente().getGrupoSanguineoPaciente()+"| Sexo: "+cita.getPaciente().getSexoPaciente())
                .idMedico(cita.getMedico().getIdmedicos())
                .medico(cita.getMedico().getNombresMedico() + " " + cita.getMedico().getApellidosMedico())
                .idEspecialidad(cita.getEspecialidad().getIdespecialidades())
                .especialidad(cita.getEspecialidad().getNombreEspecialidad())
                .idHorario(cita.getHorario().getIdhorariosMedico())
                .fechaHorario(cita.getHorario().getFecha())
                .horaInicio(cita.getHorario().getHoraInicio())
                .horaFin(cita.getHorario().getHoraFin())
                .idEstadoCita(cita.getEstadoCita().getIdestadosCita())
                .estadoCita(cita.getEstadoCita().getNombreEstado())
                .fechaCita(cita.getFechaCita())
                .horaCita(cita.getHoraCita())
                .motivoCita(cita.getMotivoCita())
                .observacionCita(cita.getObservacionCita())
                .fechaRegistroCita(cita.getFechaRegistroCita())
                .fechaActualizacionCita(cita.getFechaActualizacionCita())
                .build();
    }

    public CitaUnicaResponse ListarCitaUnicaid(Integer id) {
        ModelCitas cita = citasRepository.findById(id).orElseThrow(() -> new RuntimeException("No se encontró la cita con ID: " + id));
        return convertirACitasResponse(cita);
    }

    @Transactional
    public Boolean registrarCitaInteligente(CitaRequest request) {

        ModelPacientes paciente = pacienteRepository.findById(request.getIdPaciente())
                .orElseThrow(() -> new RuntimeException("El paciente seleccionado no existe."));

        ModelMedicos medico = medicosRepository.findById(request.getIdMedico())
                .orElseThrow(() -> new RuntimeException("El medico seleccionado no existe."));

        ModelEspecialidades especialidad = especialidadRepository.findById(request.getIdEspecialidad())
                .orElseThrow(() -> new RuntimeException("La especialidad seleccionada no existe."));

        ModelHorariosMedico horario = horarioMedicoRepository.findById(request.getIdHorario())
                .orElseThrow(() -> new RuntimeException("El horario medico seleccionado no existe."));

        if (!horario.getMedico().getIdmedicos().equals(medico.getIdmedicos())) {
            throw new RuntimeException("El horario seleccionado no pertenece al médico indicado.");
        }

        if (!horario.getFecha().equals(request.getFechaCita())) {
            throw new RuntimeException("La fecha de la cita no coincide con la fecha del horario médico.");
        }

        if (horario.getEstado() == null || horario.getEstado() == 0) {
            throw new RuntimeException("El horario médico se encuentra inactivo.");
        }

        if (horario.getCupo() == null || horario.getCupo() <= 0) {
            throw new RuntimeException("No existe cupo disponible para este horario.");
        }

        boolean existeCita = citasRepository.existsByPaciente_IdpacientesAndMedico_IdmedicosAndFechaCitaAndHoraCita(
                paciente.getIdpacientes(),
                medico.getIdmedicos(),
                request.getFechaCita(),
                request.getHoraCita()
        );

        if (existeCita) {
            throw new RuntimeException("El paciente ya tiene una cita registrada con este medico en la misma fecha y hora.");
        }

        ModelEstadosCita estadoPendiente = estadoCitaRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("No se encontró el estado inicial de la cita."));

        ModelCitas cita = new ModelCitas();
        cita.setPaciente(paciente);
        cita.setMedico(medico);
        cita.setEspecialidad(especialidad);
        cita.setHorario(horario);
        cita.setEstadoCita(estadoPendiente);
        cita.setFechaCita(request.getFechaCita());
        cita.setHoraCita(request.getHoraCita());
        cita.setMotivoCita(request.getMotivoCita());
        cita.setObservacionCita(request.getObservacionCita());
        cita.setFechaRegistroCita(LocalDateTime.now());
        cita.setFechaActualizacionCita(LocalDateTime.now());
        horario.setCupo(horario.getCupo() - 1);
        horario.setEstado(0);
        try {
            horarioMedicoRepository.save(horario);

            citasRepository.save(cita);
            return true;
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

    }

    @Transactional
    public Boolean cambiarEstadoCita(CambioEstadoCitaRequest request) {

        ModelCitas cita = citasRepository.findById(request.getIdCita())
                .orElseThrow(() -> new RuntimeException("La cita médica no existe."));

        ModelEstadosCita nuevoEstado = estadoCitaRepository.findById(request.getIdEstadoCita())
                .orElseThrow(() -> new RuntimeException("El estado seleccionado no existe."));

        Integer estadoActual = cita.getEstadoCita().getIdestadosCita();

        if (estadoActual == 3) {
            throw new RuntimeException("No se puede modificar una cita que ya fue atendida.");
        }

        if (estadoActual == 4) {
            throw new RuntimeException("No se puede modificar una cita que ya fue cancelada.");
        }

        if (request.getIdEstadoCita() == 5 && estadoActual == 4) {
            throw new RuntimeException("No se puede atender una cita cancelada.");
        }

        if (request.getIdEstadoCita() == 4) {
            ModelHorariosMedico horario = cita.getHorario();
            horario.setCupo(horario.getCupo() + 1);
            horario.setEstado(1);
            horarioMedicoRepository.save(horario);
        }
        try {
            cita.setEstadoCita(nuevoEstado);
            cita.setObservacionCita(request.getObservacion());
            cita.setFechaActualizacionCita(LocalDateTime.now());
            citasRepository.save(cita);
            return true;
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

    }

    public List<DisponibilidadMedicaResponse> consultarDisponibilidad(Integer idEspecialidad, java.time.LocalDate fecha) {

        List<ModelHorariosMedico> horarios
                = horarioMedicoRepository.findByMedico_Especialidad_IdespecialidadesAndFechaAndEstadoAndCupoGreaterThan(
                        idEspecialidad,
                        fecha,
                        1,
                        0
                );

        if (horarios.isEmpty()) {
            throw new RuntimeException("No existen horarios disponibles para la especialidad y fecha seleccionada.");
        }

        return horarios.stream()
                .map(h -> new DisponibilidadMedicaResponse(
                h.getMedico().getIdmedicos(),
                h.getMedico().getNombresMedico(),
                h.getMedico().getApellidosMedico(),
                h.getIdhorariosMedico(),
                h.getFecha(),
                h.getHoraInicio(),
                h.getHoraFin(),
                h.getCupo()
        ))
                .collect(Collectors.toList());
    }
}
