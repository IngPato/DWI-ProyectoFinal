package com.citas.ney.rest;

import com.citas.ney.model.ModelEstadosCita;
import com.citas.ney.service.EstadoCitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/estados-cita")
@CrossOrigin(origins = "*")
public class EstadoCitaRestController {
    
    @Autowired
    private EstadoCitaService service;

    @GetMapping
    public List<ModelEstadosCita> listar() {
        return service.listarTodos();
    }

    @PostMapping
    public ModelEstadosCita crear(@RequestBody ModelEstadosCita estado) {
        return service.guardar(estado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody ModelEstadosCita estado) {
        try {
            estado.setIdestadosCita(id);
            return ResponseEntity.ok(service.guardar(estado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer id, @RequestBody Map<String, Integer> request) {
        try {
            ModelEstadosCita estado = new ModelEstadosCita();
            return ResponseEntity.ok(service.guardar(estado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}