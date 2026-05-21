package com.citas.ney.rest;

import com.citas.ney.dto.ApiResponse;
import com.citas.ney.dto.EstadocitaResponse;
import com.citas.ney.service.EstadoCitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/estados-cita")
@CrossOrigin(origins = "*")
public class EstadoCitaRestController {

    @Autowired
    private EstadoCitaService estadoCitaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EstadocitaResponse>>> listarEstadoCitas() {
        return estadoCitaService.listarEstadoCitas().size()!= 0
                ? ResponseEntity.ok(ApiResponse.ok("Estados de citas encontradas", estadoCitaService.listarEstadoCitas()))
                : ResponseEntity.badRequest().body(ApiResponse.error("Estado de citas no encontradas"));
    }
}
