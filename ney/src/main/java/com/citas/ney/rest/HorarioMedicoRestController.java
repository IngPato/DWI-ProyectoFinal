/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;

import com.citas.ney.dto.HorarioMedicoRequest;
import com.citas.ney.dto.HorarioMedicoResponse;
import com.citas.ney.service.HorarioMedicoService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author kevin
 */
@RestController
@RequestMapping("/app/horarioMedico")
@CrossOrigin(origins = "*")
public class HorarioMedicoRestController {

    @Autowired
    private HorarioMedicoService horarioMedicoService;

    @GetMapping("/activos")
    public ResponseEntity<List<HorarioMedicoResponse>> listarHorarioMedicosActivos() {
        return ResponseEntity.ok(horarioMedicoService.listarHorarioMedico());
    }

    @PostMapping
    public ResponseEntity<?> registrarHorarioMedico(@RequestBody HorarioMedicoRequest request) {
        return horarioMedicoService.registrarHorarioMedico(request) == true
                ? ResponseEntity.ok("Horario registrado correctamente")
                : ResponseEntity.badRequest().body("No se pudo registrar el horario");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarHorarioMedico(@PathVariable Integer id, @RequestBody HorarioMedicoRequest request) {
        return horarioMedicoService.actualizarHoramioMedico(id, request) == true
                ? ResponseEntity.ok("Horario actualizado correctamente")
                : ResponseEntity.ok("No se pudo actualizar el horario");
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(@PathVariable Integer id, @PathVariable Integer estado) {
        return horarioMedicoService.cambiarEstadoHorarioMedico(id, estado) == true
                ? ResponseEntity.ok("Estado de horario cambiado correctamente")
                : ResponseEntity.ok("No se pudo cambiar el estado");
    }
}
