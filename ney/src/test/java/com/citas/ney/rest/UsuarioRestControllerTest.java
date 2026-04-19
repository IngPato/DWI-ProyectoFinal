/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;

/**
 *
 * @author kevin
 */

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.citas.ney.dto.UsuarioEstadoRequest;
import com.citas.ney.dto.UsuarioRequest;
import com.citas.ney.dto.UsuarioResponse;
import com.citas.ney.service.UsuarioService;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class UsuarioRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    @Test
    public void testListarUsuariosActivos() throws Exception {
        List<UsuarioResponse> lista = new ArrayList<>();

        UsuarioResponse u1 = new UsuarioResponse();
        u1.setIdusuario(1);
        u1.setIdRol(1);
        u1.setNombreRol("ADMIN");
        u1.setUsername("admin01");
        u1.setCorreo("admin01@clinica.com");
        u1.setEstado(1);

        UsuarioResponse u2 = new UsuarioResponse();
        u2.setIdusuario(2);
        u2.setIdRol(2);
        u2.setNombreRol("PACIENTE");
        u2.setUsername("paciente01");
        u2.setCorreo("paciente01@clinica.com");
        u2.setEstado(1);

        lista.add(u1);
        lista.add(u2);

        when(usuarioService.listaUsuariosActivos()).thenReturn(lista);

        URI uri = new URI("/api/usuarios/activos");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders
                .get(uri)
                .accept(MediaType.APPLICATION_JSON);

        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    @Test
    public void testRegistrarUsuario() throws Exception {
        UsuarioRequest request = new UsuarioRequest();
        request.setIdRol(1);
        request.setUsername("admin01");
        request.setCorreo("admin01@clinica.com");
        request.setPassword("123456");
        request.setEstado(1);

        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(1);
        response.setIdRol(1);
        response.setNombreRol("ADMIN");
        response.setUsername("admin01");
        response.setCorreo("admin01@clinica.com");
        response.setEstado(1);

        when(usuarioService.registrarUsuario(any(UsuarioRequest.class))).thenReturn(response);

        URI uri = new URI("/api/usuarios");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders
                .post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .accept(MediaType.APPLICATION_JSON);

        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
    }

    @Test
    public void testActualizarUsuario() throws Exception {
        UsuarioRequest request = new UsuarioRequest();
        request.setIdRol(2);
        request.setUsername("usuarioEditado");
        request.setCorreo("editado@clinica.com");
        request.setPassword("654321");
        request.setEstado(1);

        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(1);
        response.setIdRol(2);
        response.setNombreRol("PACIENTE");
        response.setUsername("usuarioEditado");
        response.setCorreo("editado@clinica.com");
        response.setEstado(1);

        when(usuarioService.actualizarUsuario(eq(1), any(UsuarioRequest.class))).thenReturn(response);

        URI uri = new URI("/api/usuarios/1");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders
                .put(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .accept(MediaType.APPLICATION_JSON);

        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    @Test
    public void testCambiarEstadoUsuario() throws Exception {
        UsuarioEstadoRequest request = new UsuarioEstadoRequest();
        request.setEstado(0);

        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(1);
        response.setIdRol(1);
        response.setNombreRol("ADMIN");
        response.setUsername("admin01");
        response.setCorreo("admin01@clinica.com");
        response.setEstado(0);

        when(usuarioService.cambiarEstadoUsuario(eq(1), any(UsuarioEstadoRequest.class))).thenReturn(response);

        URI uri = new URI("/api/usuarios/1/estado");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders
                .patch(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .accept(MediaType.APPLICATION_JSON);

        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    @Test
    public void testEliminarUsuario() throws Exception {
        doNothing().when(usuarioService).eliminarUsuario(1);

        URI uri = new URI("/api/usuarios/1");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders
                .delete(uri)
                .accept(MediaType.TEXT_PLAIN);

        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("Usuario eliminado correctamente", result.getResponse().getContentAsString());
    }
}