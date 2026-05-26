package com.citas.ney.rest;

import com.citas.ney.dto.HorarioMedicoRequest;
import com.citas.ney.dto.HorarioMedicoResponse;
import com.citas.ney.dto.EstadoRequest;
import com.citas.ney.service.HorarioMedicoService;
import java.time.LocalDate;
import java.time.LocalTime;
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
class HorarioMedicoRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private HorarioMedicoService horarioMedicoService;

    @Test
    public void testListarHorariosMedicosActivosConDatos() throws Exception {

        List<HorarioMedicoResponse> lista = new ArrayList<>();

        HorarioMedicoResponse horario = new HorarioMedicoResponse();
        horario.setIdhorariosMedico(1);
        horario.setIdmedico(1);
        horario.setFecha(LocalDate.of(2026, 5, 20));
        horario.setHoraInicio(LocalTime.of(8, 0));
        horario.setHoraFin(LocalTime.of(12, 0));
        horario.setCupo(10);
        horario.setEstado(1);

        lista.add(horario);

        when(horarioMedicoService.listarHorarioMedico()).thenReturn(lista);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/app/horarioMedico/activos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("horarios encontrados"));
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":true"));
        assertTrue(result.getResponse().getContentAsString().contains("2026-05-20"));
        assertTrue(result.getResponse().getContentAsString().contains("\"idmedico\":1"));
        assertTrue(result.getResponse().getContentAsString().contains("\"estado\":1"));
    }

   /* @Test
    public void testListarHorariosMedicosActivosVacio() throws Exception {

        when(horarioMedicoService.listarHorarioMedico()).thenReturn(new ArrayList<>());

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/app/horarioMedico/activos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("horarios encontrados"));
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":true"));
        assertTrue(result.getResponse().getContentAsString().contains("\"data\":[]"));
    }*/

    @Test
    public void testRegistrarHorarioMedicoCorrectamente() throws Exception {

        HorarioMedicoRequest request = new HorarioMedicoRequest();
        request.setIdmedico(1);
        request.setFecha(LocalDate.of(2026, 5, 20));
        request.setHoraInicio(LocalTime.of(8, 0));
        request.setHoraFin(LocalTime.of(12, 0));
        request.setCupo(10);

        when(horarioMedicoService.registrarHorarioMedico(any())).thenReturn(true);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/app/horarioMedico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":true"));
        assertTrue(result.getResponse().getContentAsString().contains("Horario registrado correctamente"));
    }

    @Test
    public void testRegistrarHorarioMedicoConError() throws Exception {

        HorarioMedicoRequest request = new HorarioMedicoRequest();
        request.setIdmedico(1);
        request.setFecha(LocalDate.of(2026, 5, 20));
        request.setHoraInicio(LocalTime.of(8, 0));
        request.setHoraFin(LocalTime.of(12, 0));
        request.setCupo(10);

        when(horarioMedicoService.registrarHorarioMedico(any())).thenReturn(false);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/app/horarioMedico")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":false"));
        assertTrue(result.getResponse().getContentAsString().contains("No se pudo registrar el horario"));
    }

    @Test
    public void testActualizarHorarioMedicoCorrectamente() throws Exception {

        HorarioMedicoRequest request = new HorarioMedicoRequest();
        request.setIdmedico(1);
        request.setFecha(LocalDate.of(2026, 5, 21));
        request.setHoraInicio(LocalTime.of(9, 0));
        request.setHoraFin(LocalTime.of(13, 0));
        request.setCupo(12);

        when(horarioMedicoService.actualizarHoramioMedico(eq(1), any())).thenReturn(true);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/app/horarioMedico/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":true"));
        assertTrue(result.getResponse().getContentAsString().contains("Horario actualizado correctamente"));
    }

    @Test
    public void testActualizarHorarioMedicoConError() throws Exception {

        HorarioMedicoRequest request = new HorarioMedicoRequest();
        request.setIdmedico(1);
        request.setFecha(LocalDate.of(2026, 5, 21));
        request.setHoraInicio(LocalTime.of(9, 0));
        request.setHoraFin(LocalTime.of(13, 0));
        request.setCupo(12);

        when(horarioMedicoService.actualizarHoramioMedico(eq(1), any())).thenReturn(false);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/app/horarioMedico/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":false"));
        assertTrue(result.getResponse().getContentAsString().contains("No se pudo actualizar el horario"));
    }

    @Test
    public void testCambiarEstadoHorarioMedicoCorrectamente() throws Exception {

        EstadoRequest estadoRequest = new EstadoRequest();
        estadoRequest.setEstado(0);

        when(horarioMedicoService.cambiarEstadoHorarioMedico(eq(1), eq(0))).thenReturn(true);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.patch("/app/horarioMedico/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(estadoRequest)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":true"));
        assertTrue(result.getResponse().getContentAsString().contains("Estado de horario cambiado correctamente"));
    }

    @Test
    public void testCambiarEstadoHorarioMedicoConError() throws Exception {

        EstadoRequest estadoRequest = new EstadoRequest();
        estadoRequest.setEstado(0);

        when(horarioMedicoService.cambiarEstadoHorarioMedico(eq(1), eq(0))).thenReturn(false);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.patch("/app/horarioMedico/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(estadoRequest)))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":false"));
        assertTrue(result.getResponse().getContentAsString().contains("No se pudo cambiar el estado"));
    }
}
