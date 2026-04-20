/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;
import com.citas.ney.dto.PacienteEstadoRequest;
import com.citas.ney.dto.PacienteRequest;
import com.citas.ney.dto.PacienteResponse;
import com.citas.ney.service.PacienteService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
/**
 *
 * @author GPatr
 */
@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "*")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;
    
    @GetMapping("/activos")
    public ResponseEntity<List<PacienteResponse>> listarActivos() {
        return ResponseEntity.ok(pacienteService.listarPacientesActivos());
    }

    @PostMapping
    public ResponseEntity<PacienteResponse> registrar(@RequestBody PacienteRequest request) {
        return new ResponseEntity<>(pacienteService.registrarPaciente(request), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<PacienteResponse> cambiarEstado(@PathVariable Integer id, @RequestBody PacienteEstadoRequest request) {
        return ResponseEntity.ok(pacienteService.cambiarEstado(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Integer id) {
        pacienteService.eliminarPaciente(id);
        return ResponseEntity.ok("Paciente eliminado correctamente");
    }
}