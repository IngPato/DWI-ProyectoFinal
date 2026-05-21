/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;

import com.citas.ney.dto.ApiResponse;
import com.citas.ney.dto.MedicoRequest;
import com.citas.ney.dto.MedicoResponse;
import com.citas.ney.service.MedicosService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
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
@RequestMapping("/api/medicos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MedicoRestController {

    private final MedicosService medicosService;

    @GetMapping
    public Page<MedicoResponse> listarMedicosActivos(
            @RequestParam(required = false) String filtro,
            @PageableDefault(size = 10, sort = "idmedicos") Pageable pageable) {
        return medicosService.litarMedicosActivos(filtro, pageable);

    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> crearNuevoMedico(@RequestBody MedicoRequest request) {
        try {
            String contrasenaGenerada = medicosService.registrarNuevoMedico(request);
            return ResponseEntity.ok(
                    ApiResponse.ok("Médico creado con éxito. Contraseña generada: " + contrasenaGenerada)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No se pudo crear el nuevo médico: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> actualizarMedico(@PathVariable Integer id, @RequestBody MedicoRequest request) {
        return medicosService.actualziarMedico(id, request) == true
                ? ResponseEntity.ok(ApiResponse.ok("Medico actualizado con exito"))
                : ResponseEntity.badRequest().body(ApiResponse.error("no se pudo realizar cambios"));
    }
}
