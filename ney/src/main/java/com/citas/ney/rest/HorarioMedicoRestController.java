/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;

import com.citas.ney.dto.ApiResponse;
import com.citas.ney.dto.EstadoRequest;
import com.citas.ney.dto.HorarioMedicoRequest;
import com.citas.ney.dto.HorarioMedicoResponse;
import com.citas.ney.service.HorarioMedicoService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author kevin
 */
@RestController
@RequestMapping("/api/horarioMedico")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HorarioMedicoRestController {

    private final HorarioMedicoService horarioMedicoService;

    @GetMapping("{idmedico}")
    public Page<HorarioMedicoResponse> listarHorarioMedicosPaginados(
            @PathVariable Integer idmedico,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @PageableDefault(size = 10, sort = "idhorariosMedico") Pageable pageable) {
        try {
            return horarioMedicoService.listarHorarioMedico(idmedico, fecha, pageable);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> registrarHorarioMedico(@RequestBody HorarioMedicoRequest request) {
        return horarioMedicoService.registrarHorarioMedico(request) == true
                ? ResponseEntity.ok(ApiResponse.ok("Horario registrado correctamente"))
                : ResponseEntity.badRequest().body(ApiResponse.error("No se pudo registrar el horario"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> actualizarHorarioMedico(@PathVariable Integer id, @RequestBody HorarioMedicoRequest request) {
        return horarioMedicoService.actualizarHoramioMedico(id, request) == true
                ? ResponseEntity.ok(ApiResponse.ok("Horario actualizado correctamente"))
                : ResponseEntity.badRequest().body(ApiResponse.error("No se pudo actualizar el horario"));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<?>> actualizarEstado(@PathVariable Integer id, @RequestBody EstadoRequest estado) {
        return horarioMedicoService.cambiarEstadoHorarioMedico(id, estado.getEstado()) == true
                ? ResponseEntity.ok(ApiResponse.ok("Estado de horario cambiado correctamente"))
                : ResponseEntity.badRequest().body(ApiResponse.error("No se pudo cambiar el estado"));
    }
}
