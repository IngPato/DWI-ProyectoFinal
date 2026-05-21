package com.citas.ney.rest;

import com.citas.ney.dto.EstadoRequest;
import com.citas.ney.dto.UsuarioRequest;
import com.citas.ney.dto.UsuarioResponse;
import com.citas.ney.service.UsuarioService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class UsuarioRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    @Test
    public void testListarUsuariosActivosConDatos() throws Exception {

        List<UsuarioResponse> lista = new ArrayList<>();

        UsuarioResponse usuario = new UsuarioResponse();
        usuario.setIdusuario(1);
        usuario.setIdRol(1);
        usuario.setNombreRol("ADMIN");
        usuario.setUsername("admin01");
        usuario.setCorreo("admin01@gmail.com");
        usuario.setEstado(1);
        usuario.setFechaCreacion(LocalDateTime.of(2026, 5, 20, 10, 30));

        lista.add(usuario);

        when(usuarioService.listaUsuariosActivos()).thenReturn(lista);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/usuarios/activos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("admin01"));
        assertTrue(result.getResponse().getContentAsString().contains("admin01@gmail.com"));
        assertTrue(result.getResponse().getContentAsString().contains("ADMIN"));
        assertTrue(result.getResponse().getContentAsString().contains("\"estado\":1"));
    }

    @Test
    public void testListarUsuariosActivosVacio() throws Exception {

        when(usuarioService.listaUsuariosActivos()).thenReturn(new ArrayList<>());

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/usuarios/activos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("[]", result.getResponse().getContentAsString());
    }

    @Test
    public void testRegistrarUsuarioCorrectamenteAdmin() throws Exception {

        UsuarioRequest request = new UsuarioRequest();
        request.setIdRol(1);
        request.setUsername("admin01");
        request.setCorreo("admin01@gmail.com");
        request.setPassword("123456");

        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(1);
        response.setIdRol(1);
        response.setNombreRol("ADMIN");
        response.setUsername("admin01");
        response.setCorreo("admin01@gmail.com");
        response.setEstado(1);
        response.setFechaCreacion(LocalDateTime.of(2026, 5, 20, 10, 30));

        when(usuarioService.registrarUsuario(any())).thenReturn(response);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("admin01"));
        assertTrue(result.getResponse().getContentAsString().contains("admin01@gmail.com"));
        assertTrue(result.getResponse().getContentAsString().contains("ADMIN"));
        assertTrue(result.getResponse().getContentAsString().contains("\"estado\":1"));
    }

    @Test
    public void testRegistrarUsuarioCorrectamenteRecepcionista() throws Exception {

        UsuarioRequest request = new UsuarioRequest();
        request.setIdRol(2);
        request.setUsername("recepcion01");
        request.setCorreo("recepcion01@gmail.com");
        request.setPassword("123456");

        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(2);
        response.setIdRol(2);
        response.setNombreRol("RECEPCIONISTA");
        response.setUsername("recepcion01");
        response.setCorreo("recepcion01@gmail.com");
        response.setEstado(1);
        response.setFechaCreacion(LocalDateTime.of(2026, 5, 20, 11, 0));

        when(usuarioService.registrarUsuario(any())).thenReturn(response);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("recepcion01"));
        assertTrue(result.getResponse().getContentAsString().contains("recepcion01@gmail.com"));
        assertTrue(result.getResponse().getContentAsString().contains("RECEPCIONISTA"));
        assertTrue(result.getResponse().getContentAsString().contains("\"estado\":1"));
    }

    @Test
    public void testActualizarUsuarioCorrectamenteConPassword() throws Exception {

        UsuarioRequest request = new UsuarioRequest();
        request.setIdRol(1);
        request.setUsername("adminActualizado");
        request.setCorreo("adminactualizado@gmail.com");
        request.setPassword("nuevaClave123");

        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(1);
        response.setIdRol(1);
        response.setNombreRol("ADMIN");
        response.setUsername("adminActualizado");
        response.setCorreo("adminactualizado@gmail.com");
        response.setEstado(1);
        response.setFechaCreacion(LocalDateTime.of(2026, 5, 20, 10, 30));

        when(usuarioService.actualizarUsuario(eq(1), any())).thenReturn(response);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/api/usuarios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("adminActualizado"));
        assertTrue(result.getResponse().getContentAsString().contains("adminactualizado@gmail.com"));
        assertTrue(result.getResponse().getContentAsString().contains("ADMIN"));
    }

    @Test
    public void testActualizarUsuarioCorrectamenteSinPassword() throws Exception {

        UsuarioRequest request = new UsuarioRequest();
        request.setIdRol(2);
        request.setUsername("recepcionActualizado");
        request.setCorreo("recepcionactualizado@gmail.com");
        request.setPassword("");

        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(2);
        response.setIdRol(2);
        response.setNombreRol("RECEPCIONISTA");
        response.setUsername("recepcionActualizado");
        response.setCorreo("recepcionactualizado@gmail.com");
        response.setEstado(1);
        response.setFechaCreacion(LocalDateTime.of(2026, 5, 20, 11, 0));

        when(usuarioService.actualizarUsuario(eq(2), any())).thenReturn(response);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/api/usuarios/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("recepcionActualizado"));
        assertTrue(result.getResponse().getContentAsString().contains("recepcionactualizado@gmail.com"));
        assertTrue(result.getResponse().getContentAsString().contains("RECEPCIONISTA"));
    }

    @Test
    public void testCambiarEstadoUsuarioAInactivo() throws Exception {

        EstadoRequest request = new EstadoRequest();
        request.setEstado(0);

        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(1);
        response.setIdRol(1);
        response.setNombreRol("ADMIN");
        response.setUsername("admin01");
        response.setCorreo("admin01@gmail.com");
        response.setEstado(0);
        response.setFechaCreacion(LocalDateTime.of(2026, 5, 20, 10, 30));

        when(usuarioService.cambiarEstadoUsuario(eq(1), any())).thenReturn(response);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.patch("/api/usuarios/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("admin01"));
        assertTrue(result.getResponse().getContentAsString().contains("\"estado\":0"));
    }

    @Test
    public void testCambiarEstadoUsuarioAActivo() throws Exception {

        EstadoRequest request = new EstadoRequest();
        request.setEstado(1);

        UsuarioResponse response = new UsuarioResponse();
        response.setIdusuario(1);
        response.setIdRol(1);
        response.setNombreRol("ADMIN");
        response.setUsername("admin01");
        response.setCorreo("admin01@gmail.com");
        response.setEstado(1);
        response.setFechaCreacion(LocalDateTime.of(2026, 5, 20, 10, 30));

        when(usuarioService.cambiarEstadoUsuario(eq(1), any())).thenReturn(response);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.patch("/api/usuarios/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("admin01"));
        assertTrue(result.getResponse().getContentAsString().contains("\"estado\":1"));
    }
}