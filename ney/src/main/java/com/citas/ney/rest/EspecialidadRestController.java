package com.citas.ney.rest;

import com.citas.ney.dto.ApiResponse;
import com.citas.ney.dto.EspecialidadResponse;
import com.citas.ney.dto.EstadoRequest;
import com.citas.ney.model.ModelEspecialidades;
import com.citas.ney.service.EspecialidadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/especialidades")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EspecialidadRestController {

    private final EspecialidadService especialidadService;

    @GetMapping("/activos")
    public ResponseEntity<ApiResponse<List<EspecialidadResponse>>> listarActivos() {
        List<EspecialidadResponse> lista = especialidadService.listarTodoEspecialidadActivos();
        if (lista != null) {
            return ResponseEntity.ok(ApiResponse.ok("Especialidades encontrada", lista));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Especialidades no encontrada"));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> registrarEspecialidad(@RequestBody ModelEspecialidades request) {
        return especialidadService.registrar(request) == true
                ? ResponseEntity.ok(ApiResponse.ok("Especialidad Registrada con exito"))
                : ResponseEntity.badRequest().body(ApiResponse.error("Error de registro de Especialidad"));

    }

    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<?>> actualizarEspecialidad(@PathVariable Integer id, @RequestBody ModelEspecialidades request) {
        return especialidadService.actualizar(id, request) == true
                ? ResponseEntity.ok(ApiResponse.ok("Especialidad Actualizada con exito"))
                : ResponseEntity.badRequest().body(ApiResponse.error("Error de actualizacion de especialidad"));

    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<?>> cambiarEstado(@PathVariable Integer id, @RequestBody EstadoRequest request) {
        return especialidadService.cambiarEstadoEspecialidad(id, request) == true
                ? ResponseEntity.ok(ApiResponse.ok("Estado actualizado correctamente"))
                : ResponseEntity.badRequest().body(ApiResponse.error("No se pudo cambiar el estado"));
    }
}
