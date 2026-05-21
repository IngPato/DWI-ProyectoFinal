package com.citas.ney.rest;

import com.citas.ney.dto.PacienteResponse;
import com.citas.ney.dto.RegistrarPacienteRequest;
import com.citas.ney.service.PacienteService;
import java.time.LocalDate;
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
class PacienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PacienteService pacienteService;

    @Test
    public void testListarPacientesPaginadosConDatos() throws Exception {

        List<PacienteResponse> lista = new ArrayList<>();

        PacienteResponse paciente = PacienteResponse.builder()
                .idusuario(1)
                .usuarioPaciente("paciente01")
                .correoPaciente("paciente01@gmail.com")
                .fechaCreacion(LocalDateTime.of(2026, 5, 20, 10, 30))
                .estadoPaciente(1)
                .nombresPaciente("Juan")
                .apellidosPaciente("Pérez")
                .tipoDocumentoPaciente("DNI")
                .numeroDocumentoPaciente("12345678")
                .fechaNacimientoPaciente(LocalDate.of(2000, 3, 15))
                .grupoSanguineoPaciente("O+")
                .sexoPaciente("Masculino")
                .direccionPaciente("Jr. Amazonas 123")
                .telefonoPaciente("987654321")
                .build();

        lista.add(paciente);

        Page<PacienteResponse> page = new PageImpl<>(lista);

        when(pacienteService.listarPacientesActivosPaginados(isNull(), any(Pageable.class)))
                .thenReturn(page);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/pacientes"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Juan"));
        assertTrue(result.getResponse().getContentAsString().contains("Pérez"));
        assertTrue(result.getResponse().getContentAsString().contains("12345678"));
        assertTrue(result.getResponse().getContentAsString().contains("paciente01@gmail.com"));
        assertTrue(result.getResponse().getContentAsString().contains("987654321"));
    }

    @Test
    public void testListarPacientesPaginadosVacio() throws Exception {

        Page<PacienteResponse> page = new PageImpl<>(new ArrayList<>());

        when(pacienteService.listarPacientesActivosPaginados(isNull(), any(Pageable.class)))
                .thenReturn(page);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/pacientes"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"content\":[]"));
    }

    @Test
    public void testCrearNuevoPacienteCorrectamente() throws Exception {

        RegistrarPacienteRequest request = new RegistrarPacienteRequest();
        request.setIdusuario(1);
        request.setNombresPaciente("Luis");
        request.setApellidosPaciente("Ramírez");
        request.setTipoDocumentoPaciente("DNI");
        request.setNumeroDocumentoPaciente("87654321");
        request.setFechaNacimientoPaciente(LocalDate.of(1999, 6, 10));
        request.setSexoPaciente("Masculino");
        request.setTelefonoPaciente("999888777");
        request.setDireccionPaciente("Av. Perú 456");
        request.setGrupoSanguineoPaciente("A+");

        when(pacienteService.registrarPaciente(any())).thenReturn(true);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":true"));
        assertTrue(result.getResponse().getContentAsString().contains("Paciente creado con exito"));
    }

    @Test
    public void testCrearNuevoPacienteConError() throws Exception {

        RegistrarPacienteRequest request = new RegistrarPacienteRequest();
        request.setIdusuario(1);
        request.setNombresPaciente("Luis");
        request.setApellidosPaciente("Ramírez");
        request.setTipoDocumentoPaciente("DNI");
        request.setNumeroDocumentoPaciente("87654321");
        request.setFechaNacimientoPaciente(LocalDate.of(1999, 6, 10));
        request.setSexoPaciente("Masculino");
        request.setTelefonoPaciente("999888777");
        request.setDireccionPaciente("Av. Perú 456");
        request.setGrupoSanguineoPaciente("A+");

        when(pacienteService.registrarPaciente(any())).thenReturn(false);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":false"));
        assertTrue(result.getResponse().getContentAsString().contains("no se pudo crear el paciente"));
    }

    @Test
    public void testActualizarPacienteCorrectamente() throws Exception {

        RegistrarPacienteRequest request = new RegistrarPacienteRequest();
        request.setIdusuario(1);
        request.setNombresPaciente("Carlos");
        request.setApellidosPaciente("Gómez");
        request.setTipoDocumentoPaciente("DNI");
        request.setNumeroDocumentoPaciente("11223344");
        request.setFechaNacimientoPaciente(LocalDate.of(1998, 8, 25));
        request.setSexoPaciente("Masculino");
        request.setTelefonoPaciente("988776655");
        request.setDireccionPaciente("Jr. Lima 789");
        request.setGrupoSanguineoPaciente("B+");

        when(pacienteService.actualizarPaciente(eq(1), any())).thenReturn(true);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/api/pacientes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":true"));
        assertTrue(result.getResponse().getContentAsString().contains("Paciente actualizado con exito"));
    }

    @Test
    public void testActualizarPacienteConError() throws Exception {

        RegistrarPacienteRequest request = new RegistrarPacienteRequest();
        request.setIdusuario(1);
        request.setNombresPaciente("Carlos");
        request.setApellidosPaciente("Gómez");
        request.setTipoDocumentoPaciente("DNI");
        request.setNumeroDocumentoPaciente("11223344");
        request.setFechaNacimientoPaciente(LocalDate.of(1998, 8, 25));
        request.setSexoPaciente("Masculino");
        request.setTelefonoPaciente("988776655");
        request.setDireccionPaciente("Jr. Lima 789");
        request.setGrupoSanguineoPaciente("B+");

        when(pacienteService.actualizarPaciente(eq(1), any())).thenReturn(false);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.put("/api/pacientes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":false"));
        assertTrue(result.getResponse().getContentAsString().contains("no se pudo actualziar el paciente"));
    }
}