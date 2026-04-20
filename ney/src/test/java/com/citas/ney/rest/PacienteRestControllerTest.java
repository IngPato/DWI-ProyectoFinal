/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.citas.ney.rest;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

import com.citas.ney.dto.PacienteEstadoRequest;
import com.citas.ney.dto.PacienteRequest;
import com.citas.ney.dto.PacienteResponse;
import com.citas.ney.service.PacienteService;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
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
/**
 *
 * @author GPatr
 */
@SpringBootTest
@AutoConfigureMockMvc
class PacienteRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PacienteService pacienteService;

    @Test
    public void testListarPacientesActivos() throws Exception {
        List<PacienteResponse> lista = new ArrayList<>();
        PacienteResponse p = new PacienteResponse();
        p.setIdpacientes(1);
        p.setNombresPaciente("Patrick");
        p.setEstadoPaciente(1);
        lista.add(p);

        when(pacienteService.listarPacientesActivos()).thenReturn(lista);

        URI uri = new URI("/api/pacientes/activos");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    @Test
    public void testListarPacientesVacio() throws Exception {
        when(pacienteService.listarPacientesActivos()).thenReturn(new ArrayList<>());

        URI uri = new URI("/api/pacientes/activos");
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.get(uri)).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("[]", result.getResponse().getContentAsString());
    }

    @Test
    public void testRegistrarPaciente() throws Exception {
        PacienteRequest request = new PacienteRequest();
        request.setIdusuario(1);
        request.setNombresPaciente("Kevin");
        request.setNumeroDocumentoPaciente("19202080");

        PacienteResponse response = new PacienteResponse();
        response.setIdpacientes(1);
        response.setNombresPaciente("Kevin");

        when(pacienteService.registrarPaciente(any(PacienteRequest.class))).thenReturn(response);

        URI uri = new URI("/api/pacientes");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request));

        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.CREATED.value(), result.getResponse().getStatus());
    }
    
    @Test
    public void testCambiarEstadoPaciente() throws Exception {
        PacienteEstadoRequest request = new PacienteEstadoRequest();
        request.setEstado(0);

        PacienteResponse response = new PacienteResponse();
        response.setIdpacientes(1);
        response.setEstadoPaciente(0);

        when(pacienteService.cambiarEstado(eq(1), any(PacienteEstadoRequest.class))).thenReturn(response);

        URI uri = new URI("/api/pacientes/1/estado");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.patch(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request));

        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    @Test
    public void testEliminarPaciente() throws Exception {
        doNothing().when(pacienteService).eliminarPaciente(1);

        URI uri = new URI("/api/pacientes/1");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.delete(uri);

        MvcResult result = mockMvc.perform(req).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("Paciente eliminado correctamente", result.getResponse().getContentAsString());
    }

    @Test
    public void testRegistrarPacienteFalla() throws Exception {
        PacienteRequest request = new PacienteRequest();
        
        when(pacienteService.registrarPaciente(any(PacienteRequest.class)))
                .thenThrow(new RuntimeException("Error interno"));

        URI uri = new URI("/api/pacientes");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request));

        MvcResult result = mockMvc.perform(req).andReturn();
        
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }
}