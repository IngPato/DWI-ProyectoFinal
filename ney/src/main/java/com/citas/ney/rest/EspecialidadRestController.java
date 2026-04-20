package com.citas.ney.rest;

import com.citas.ney.model.ModelEspecialidades;
import com.citas.ney.service.EspecialidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/especialidades")
@CrossOrigin(origins = "*")
public class EspecialidadRestController {
    
    @Autowired
    private EspecialidadService service;

    @GetMapping
    public List<ModelEspecialidades> listar() {
        return service.listarTodas();
    }

    @PostMapping
    public ModelEspecialidades crear(@RequestBody ModelEspecialidades especialidad) {
        return service.guardar(especialidad);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody ModelEspecialidades especialidad) {
        try {
            especialidad.setIdespecialidades(id);
            return ResponseEntity.ok(service.guardar(especialidad));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            service.eliminar(id);
            return ResponseEntity.ok("Especialidad eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar (quizás el ID no existe): " + e.getMessage());
        }
    }
}