/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.service;

import com.citas.ney.dto.HorarioMedicoRequest;
import com.citas.ney.dto.HorarioMedicoResponse;
import com.citas.ney.model.ModelHorariosMedico;
import com.citas.ney.model.ModelMedicos;
import com.citas.ney.repository.HorarioMedicoRepository;
import com.citas.ney.repository.MedicosRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 *
 * @author kevin
 */
@Service
public class HorarioMedicoService {

    @Autowired
    private HorarioMedicoRepository horarioMedicoRepository;
    @Autowired
    private MedicosRepository medicosRepository;

    private HorarioMedicoResponse convertirHorarioMedico(ModelHorariosMedico horariosMedico) {
        HorarioMedicoResponse response = new HorarioMedicoResponse();
        response.setIdhorariosMedico(horariosMedico.getIdhorariosMedico());
        response.setIdmedico(horariosMedico.getMedico().getIdmedicos());
        response.setFecha(horariosMedico.getFecha());
        response.setHoraInicio(horariosMedico.getHoraInicio());
        response.setHoraFin(horariosMedico.getHoraFin());
        response.setCupo(horariosMedico.getCupo());
        response.setEstado(horariosMedico.getEstado());

        return response;
    }

    public Page<HorarioMedicoResponse> listarHorarioMedico(Integer id,LocalDate fecha, Pageable pageable) {
        Page<ModelHorariosMedico> horariosMedico = horarioMedicoRepository.listarHorarioMedicoPaginada(id,fecha, pageable);
        return horariosMedico.map(this::convertirHorarioMedico);
    }

    public boolean registrarHorarioMedico(HorarioMedicoRequest request) {
        try {
            if (request == null) {
                throw new RuntimeException("campos vacios enviar datos para guardar");
            }
            ModelMedicos medicos = medicosRepository.findById(request.getIdmedico()).orElseThrow(() -> new RuntimeException("medico no encontrado"));
            ModelHorariosMedico horariosMedico = new ModelHorariosMedico();
            horariosMedico.setMedico(medicos);
            horariosMedico.setFecha(request.getFecha());
            horariosMedico.setHoraInicio(request.getHoraInicio());
            horariosMedico.setHoraFin(request.getHoraFin());
            horariosMedico.setCupo(request.getCupo());
            horariosMedico.setEstado(1);
            horarioMedicoRepository.save(horariosMedico);
            return true;
        } catch (Exception e) {
            return false;
        }

    }

    public boolean actualizarHoramioMedico(Integer id, HorarioMedicoRequest request) {
        try {
            ModelHorariosMedico horariosMedico = horarioMedicoRepository.findById(id).orElseThrow(() -> new RuntimeException("horario del medico no encontrado"));
            if (request == null) {
                throw new RuntimeException("campos vacios enviar datos para guardar");
            }
            ModelMedicos medicos = medicosRepository.findById(request.getIdmedico()).orElseThrow(() -> new RuntimeException("medico no encontrado"));
            horariosMedico.setMedico(medicos);
            horariosMedico.setFecha(request.getFecha());
            horariosMedico.setHoraInicio(request.getHoraInicio());
            horariosMedico.setHoraFin(request.getHoraFin());
            horariosMedico.setCupo(request.getCupo());
            horarioMedicoRepository.save(horariosMedico);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean cambiarEstadoHorarioMedico(Integer id, Integer estado) {
        try {
            ModelHorariosMedico horariosMedico = horarioMedicoRepository.findById(id).orElseThrow(() -> new RuntimeException("horario del medico no encontrado"));
            horariosMedico.setEstado(estado);
            horarioMedicoRepository.save(horariosMedico);
            return true;
        } catch (Exception e) {
            return false;
        }

    }
}
