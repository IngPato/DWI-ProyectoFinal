package com.citas.ney.rest;

import com.citas.ney.dto.EstadocitaResponse;
import com.citas.ney.service.EstadoCitaService;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

@SpringBootTest
@AutoConfigureMockMvc
class EstadoCitaRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EstadoCitaService estadoCitaService;

    @Test
    public void testListarEstadosCitaConDatos() throws Exception {

        List<EstadocitaResponse> lista = new ArrayList<>();

        EstadocitaResponse estado = new EstadocitaResponse();
        estado.setIdestadosCita(1);
        estado.setNombreEstado("Pendiente");
        estado.setDescripcionEstado("Cita registrada pendiente de atención");

        lista.add(estado);

        when(estadoCitaService.listarEstadoCitas()).thenReturn(lista);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/estados-cita"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Estados de citas encontradas"));
        assertTrue(result.getResponse().getContentAsString().contains("Pendiente"));
        assertTrue(result.getResponse().getContentAsString().contains("Cita registrada pendiente de atención"));
    }

   /*@Test
    public void testListarEstadosCitaVacio() throws Exception {

        when(estadoCitaService.listarEstadoCitas()).thenReturn(new ArrayList<>());

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/estados-cita"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Estados de citas encontradas"));
        assertTrue(result.getResponse().getContentAsString().contains("\"data\":[]"));
    }*/
}