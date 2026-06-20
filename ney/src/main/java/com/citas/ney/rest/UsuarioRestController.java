/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;

import com.citas.ney.dto.EstadoRequest;
import com.citas.ney.dto.UsuarioRequest;
import com.citas.ney.dto.UsuarioResponse;
import com.citas.ney.service.UsuarioService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

/**
 *
 * @author kevin
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UsuarioRestController {

    private final UsuarioService usuarioService;

    @GetMapping("/activos")
    public ResponseEntity<List<UsuarioResponse>> ListarUsuariosActivos() {
        return ResponseEntity.ok(usuarioService.listaUsuariosActivos());
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> registrarUsuario(@RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.registrarUsuario(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> actualizaUsuario(@PathVariable Integer id, @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, request));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<UsuarioResponse> cambiarEstadoUsuario(@PathVariable Integer id, @RequestBody EstadoRequest request) {
        return ResponseEntity.ok(usuarioService.cambiarEstadoUsuario(id, request));
    }
}
