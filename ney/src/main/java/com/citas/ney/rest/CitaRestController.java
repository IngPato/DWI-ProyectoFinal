/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;

import com.citas.ney.dto.ApiResponse;
import com.citas.ney.dto.CambioEstadoCitaRequest;
import com.citas.ney.dto.CitaRequest;
import com.citas.ney.dto.CitaUnicaResponse;
import com.citas.ney.dto.CitasResponse;
import com.citas.ney.dto.DisponibilidadMedicaResponse;
import com.citas.ney.service.CitaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

/**
 *
 * @author kevin
 */
@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CitaRestController {

    private final CitaService citaService;

    @GetMapping
    public Page<CitasResponse> listarcitaspaginadas(
            @RequestParam(required = false) String filtro,
            @PageableDefault(size = 10, sort = "idcitas") Pageable pageable) {
        try {
            return citaService.listascitaspaginadas(filtro, pageable);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

    }

    @GetMapping("/paciente/{id}")
    public Page<CitasResponse> listarcitaspaginadasPacientes(
            @PathVariable Integer id,
            @RequestParam(required = false) String filtro,
            @PageableDefault(size = 10, sort = "idcitas") Pageable pageable) {
        try {
            return citaService.listascitasPaginadasPacientes(id, filtro, pageable);

        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

    }

    @GetMapping("/medico/{id}")
    public Page<CitasResponse> listarcitaspaginadasMedicos(
            @PathVariable Integer id,
            @RequestParam(required = false) String filtro,
            @PageableDefault(size = 10, sort = "idcitas") Pageable pageable) {
        try {
            return citaService.listascitasPaginadasMedicos(id, filtro, pageable);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CitaUnicaResponse>> listarCitaPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("cita", citaService.ListarCitaUnicaid(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }

    }

    @PostMapping("/registrar-inteligente")
    public ResponseEntity<ApiResponse<?>> registrarCitaInteligente(@RequestBody CitaRequest request) {
        try {
            citaService.registrarCitaInteligente(request);
            return ResponseEntity.ok(ApiResponse.ok("cita inteligente registrada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/cambiar-estado")
    public ResponseEntity<ApiResponse<?>> cambiarEstadoCita(@RequestBody CambioEstadoCitaRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("estado de cita cambiado", citaService.cambiarEstadoCita(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/disponibilidad")
    public ResponseEntity<ApiResponse<?>> consultarDisponibilidad(
            @RequestParam Integer idEspecialidad,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        try {
            List<DisponibilidadMedicaResponse> lista = citaService.consultarDisponibilidad(idEspecialidad, fecha);
            if (!lista.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.ok("citas disponibles", lista));
            } else {
                return ResponseEntity.ok(ApiResponse.error("No existen horarios disponibles"));
            }

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
