package com.citas.ney.rest;

import com.citas.ney.dto.EspecialidadResponse;
import com.citas.ney.model.ModelEspecialidades;
import com.citas.ney.service.EspecialidadService;
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
class EspecialidadRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EspecialidadService especialidadService;

    @Test
    public void testListarEspecialidadesActivasConDatos() throws Exception {

        List<EspecialidadResponse> lista = new ArrayList<>();

        EspecialidadResponse especialidad = new EspecialidadResponse();
        especialidad.setIdespecialidades(1);
        especialidad.setNombreEspecialidad("Cardiología");
        especialidad.setDescripcionEspecialidad("Especialidad médica del corazón");
        especialidad.setEstadoEspecialidad(1);

        lista.add(especialidad);

        when(especialidadService.listarTodoEspecialidadActivos()).thenReturn(lista);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/especialidades/activos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Especialidades encontrada"));
        assertTrue(result.getResponse().getContentAsString().contains("Cardiología"));
    }

    @Test
    public void testListarEspecialidadesActivasVacio() throws Exception {

        when(especialidadService.listarTodoEspecialidadActivos()).thenReturn(new ArrayList<>());

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/especialidades/activos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Especialidades encontrada"));
        assertTrue(result.getResponse().getContentAsString().contains("\"data\":[]"));
    }

    @Test
    public void testRegistrarEspecialidadCorrectamente() throws Exception {

        ModelEspecialidades especialidad = new ModelEspecialidades();
        especialidad.setNombreEspecialidad("Pediatría");
        especialidad.setDescripcionEspecialidad("Atención médica infantil");
        especialidad.setEstadoEspecialidad(1);

        when(especialidadService.registrar(any())).thenReturn(true);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/especialidades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(especialidad)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Especialidad Registrada con exito"));
    }

    @Test
    public void testRegistrarEspecialidadConError() throws Exception {

        ModelEspecialidades especialidad = new ModelEspecialidades();
        especialidad.setNombreEspecialidad("Pediatría");
        especialidad.setDescripcionEspecialidad("Atención médica infantil");
        especialidad.setEstadoEspecialidad(1);

        when(especialidadService.registrar(any())).thenReturn(false);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/especialidades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(especialidad)))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Error de registro de Especialidad"));
    }

    @Test
    public void testActualizarEspecialidadCorrectamente() throws Exception {

        ModelEspecialidades especialidad = new ModelEspecialidades();
        especialidad.setNombreEspecialidad("Urología");
        especialidad.setDescripcionEspecialidad("Especialidad del sistema urinario");

        when(especialidadService.actualizar(eq(1), any())).thenReturn(true);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/api/especialidades/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(especialidad)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Especialidad Actualizada con exito"));
    }

    @Test
    public void testActualizarEspecialidadConError() throws Exception {

        ModelEspecialidades especialidad = new ModelEspecialidades();
        especialidad.setNombreEspecialidad("Urología");
        especialidad.setDescripcionEspecialidad("Especialidad del sistema urinario");

        when(especialidadService.actualizar(eq(1), any())).thenReturn(false);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/api/especialidades/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(especialidad)))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Error de actualizacion de especialidad"));
    }

    @Test
    public void testCambiarEstadoCorrectamente() throws Exception {

        String requestBody = """
                {
                    "estado": 0
                }
                """;

        when(especialidadService.cambiarEstadoEspecialidad(eq(1), any())).thenReturn(true);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.patch("/api/especialidades/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Estado actualizado correctamente"));
    }

    @Test
    public void testCambiarEstadoConError() throws Exception {

        String requestBody = """
                {
                    "estado": 0
                }
                """;

        when(especialidadService.cambiarEstadoEspecialidad(eq(1), any())).thenReturn(false);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.patch("/api/especialidades/1/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("No se pudo cambiar el estado"));
    }
}