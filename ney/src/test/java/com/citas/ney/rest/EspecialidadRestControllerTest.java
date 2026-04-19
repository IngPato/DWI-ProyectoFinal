package com.citas.ney.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

import com.citas.ney.model.ModelEspecialidades;
import com.citas.ney.service.EspecialidadService;
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class EspecialidadRestControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private EspecialidadService especialidadService;

    // 1. Listar activos con datos
    @Test
    public void testListarEspecialidadesConDatos() throws Exception {
        List<ModelEspecialidades> lista = new ArrayList<>();
        ModelEspecialidades e = new ModelEspecialidades();
        e.setNombreEspecialidad("Cardiología");
        lista.add(e);
        when(especialidadService.listarTodas()).thenReturn(lista);
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.get("/api/especialidades")).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    // 2. Listar vacío
    @Test
    public void testListarVacio() throws Exception {
        when(especialidadService.listarTodas()).thenReturn(new ArrayList<>());
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.get("/api/especialidades")).andReturn();
        assertEquals("[]", result.getResponse().getContentAsString());
    }

    // 3. Registrar correctamente
    @Test
    public void testRegistrarCorrectamente() throws Exception {
        ModelEspecialidades e = new ModelEspecialidades();
        e.setNombreEspecialidad("Pediatría");
        when(especialidadService.guardar(any())).thenReturn(e);
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/especialidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(e))).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    // 4. Actualizar correctamente
    @Test
    public void testActualizarCorrectamente() throws Exception {
        ModelEspecialidades e = new ModelEspecialidades();
        e.setNombreEspecialidad("Urología");
        when(especialidadService.guardar(any())).thenReturn(e);
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/especialidades")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(e))).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    // 7. Eliminar correctamente
    @Test
    public void testEliminarCorrectamente() throws Exception {
        doNothing().when(especialidadService).eliminar(1);
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.delete("/api/especialidades/1")).andReturn();
        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }
}