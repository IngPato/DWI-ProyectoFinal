package com.citas.ney.rest;

import com.citas.ney.dto.MedicoRequest;
import com.citas.ney.dto.MedicoResponse;
import com.citas.ney.service.MedicosService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class MedicoRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MedicosService medicosService;

    @Test
    public void testListarMedicosActivosConDatos() throws Exception {

        List<MedicoResponse> lista = new ArrayList<>();

        MedicoResponse medico = MedicoResponse.builder()
                .idusuario(1)
                .usuarioMedico("carlos123")
                .correoMedico("carlos@gmail.com")
                .idespecialidad(1)
                .especialidad("Cardiología")
                .nombresMedico("Carlos")
                .apellidosMedico("Ramírez")
                .cmpMedico("CMP12345")
                .telefonoMedico("987654321")
                .fecha_creacion(LocalDateTime.of(2026, 5, 20, 10, 30))
                .estadoMedico(1)
                .build();

        lista.add(medico);

        Page<MedicoResponse> page = new PageImpl<>(lista);

        when(medicosService.litarMedicosActivos(isNull(), any(Pageable.class))).thenReturn(page);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/medicos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Carlos"));
        assertTrue(result.getResponse().getContentAsString().contains("Ramírez"));
        assertTrue(result.getResponse().getContentAsString().contains("Cardiología"));
        assertTrue(result.getResponse().getContentAsString().contains("CMP12345"));
        assertTrue(result.getResponse().getContentAsString().contains("carlos@gmail.com"));
    }

    @Test
    public void testListarMedicosActivosVacio() throws Exception {

        Page<MedicoResponse> page = new PageImpl<>(new ArrayList<>());

        when(medicosService.litarMedicosActivos(isNull(), any(Pageable.class))).thenReturn(page);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/medicos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"content\":[]"));
    }

    @Test
    public void testCrearNuevoMedicoCorrectamente() throws Exception {

        MedicoRequest request = new MedicoRequest();
        request.setUsername("medico01");
        request.setCorreo("medico01@gmail.com");
        request.setNombresMedico("Luis");
        request.setApellidosMedico("Torres");
        request.setCmpMedico("CMP98765");
        request.setTelefonoMedico("987123456");
        request.setIdRol(2);
        request.setIdespecialidad(1);

        when(medicosService.registrarNuevoMedico(any())).thenReturn("12354");

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/medicos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":true"));
        assertTrue(result.getResponse().getContentAsString().contains("Médico creado con éxito"));
        assertTrue(result.getResponse().getContentAsString().contains("12354"));
    }

    @Test
    public void testCrearNuevoMedicoConError() throws Exception {

        MedicoRequest request = new MedicoRequest();
        request.setUsername("medico01");
        request.setCorreo("medico01@gmail.com");
        request.setNombresMedico("Luis");
        request.setApellidosMedico("Torres");
        request.setCmpMedico("CMP98765");
        request.setTelefonoMedico("987123456");
        request.setIdRol(2);
        request.setIdespecialidad(1);

        when(medicosService.registrarNuevoMedico(any()))
                .thenThrow(new RuntimeException("Rol no existe"));

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/medicos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":false"));
        assertTrue(result.getResponse().getContentAsString().contains("No se pudo crear el nuevo médico"));
    }

    @Test
    public void testActualizarMedicoCorrectamente() throws Exception {

        MedicoRequest request = new MedicoRequest();
        request.setUsername("medicoactualizado");
        request.setCorreo("medicoactualizado@gmail.com");
        request.setNombresMedico("Pedro");
        request.setApellidosMedico("Gómez");
        request.setCmpMedico("CMP11111");
        request.setTelefonoMedico("999888777");
        request.setIdRol(2);
        request.setIdespecialidad(1);

        when(medicosService.actualziarMedico(eq(1), any())).thenReturn(true);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/api/medicos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":true"));
        assertTrue(result.getResponse().getContentAsString().contains("Medico actualizado con exito"));
    }

    @Test
    public void testActualizarMedicoConError() throws Exception {

        MedicoRequest request = new MedicoRequest();
        request.setUsername("medicoactualizado");
        request.setCorreo("medicoactualizado@gmail.com");
        request.setNombresMedico("Pedro");
        request.setApellidosMedico("Gómez");
        request.setCmpMedico("CMP11111");
        request.setTelefonoMedico("999888777");
        request.setIdRol(2);
        request.setIdespecialidad(1);

        when(medicosService.actualziarMedico(eq(1), any())).thenReturn(false);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/api/medicos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":false"));
        assertTrue(result.getResponse().getContentAsString().contains("no se pudo realizar cambios"));
    }
}
