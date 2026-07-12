/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;

import com.citas.ney.dto.ApiResponse;
import com.citas.ney.dto.PacienteResponse;
import com.citas.ney.dto.RegistrarPacienteRequest;
import com.citas.ney.service.PacienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 *
 * @author GPatr
 */
@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @GetMapping
    public Page<PacienteResponse> listarPacientePaginados(
            @RequestParam(required = false) String filtro,
            @PageableDefault(size = 10, sort = "idpacientes") Pageable pageable) {
        return pacienteService.listarPacientesActivosPaginados(filtro, pageable);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> listarpacienteunico(@PathVariable Integer id){
        try {
            return ResponseEntity.ok(ApiResponse.ok("paciente", pacienteService.pacienteunico(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    @PostMapping
    public ResponseEntity<ApiResponse<?>> crearNuevopaciente(@RequestBody RegistrarPacienteRequest pacienteRequest) {
        return pacienteService.registrarPaciente(pacienteRequest) == true
                ? ResponseEntity.ok(ApiResponse.ok("Paciente creado con exito"))
                : ResponseEntity.badRequest().body(ApiResponse.error("no se pudo crear el paciente"));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> actualizarPaciente(@PathVariable Integer id, @RequestBody RegistrarPacienteRequest pacienteRequest){
        return pacienteService.actualizarPaciente(id, pacienteRequest)==true
                ? ResponseEntity.ok(ApiResponse.ok("Paciente actualizado con exito"))
                : ResponseEntity.badRequest().body(ApiResponse.error("no se pudo actualziar el paciente"));
    }
}
