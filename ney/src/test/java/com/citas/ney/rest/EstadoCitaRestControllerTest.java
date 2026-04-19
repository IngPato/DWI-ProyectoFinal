package com.citas.ney.rest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.citas.ney.model.ModelEstadosCita;
import com.citas.ney.service.EstadoCitaService;
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

@SpringBootTest
@AutoConfigureMockMvc
class EstadoCitaRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EstadoCitaService estadoCitaService;

    // 1. Listar activos con datos
    @Test
    public void testListarEstadosConDatos() throws Exception {
        List<ModelEstadosCita> lista = new ArrayList<>();
        ModelEstadosCita estado = new ModelEstadosCita();
        estado.setNombreEstado("PROGRAMADA");
        lista.add(estado);

        when(estadoCitaService.listarTodos()).thenReturn(lista);

        URI uri = new URI("/api/estados-cita");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    // 2. Listar vacío
    @Test
    public void testListarVacio() throws Exception {
        when(estadoCitaService.listarTodos()).thenReturn(new ArrayList<>());

        URI uri = new URI("/api/estados-cita");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.get(uri).accept(MediaType.APPLICATION_JSON);
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("[]", result.getResponse().getContentAsString());
    }

    // 3. Registrar correctamente
    @Test
    public void testRegistrarCorrectamente() throws Exception {
        ModelEstadosCita estado = new ModelEstadosCita();
        estado.setNombreEstado("ATENDIDA");

        when(estadoCitaService.guardar(any(ModelEstadosCita.class))).thenReturn(estado);

        URI uri = new URI("/api/estados-cita");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(estado));
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    // 4. Actualizar correctamente
    @Test
    public void testActualizarCorrectamente() throws Exception {
        ModelEstadosCita estado = new ModelEstadosCita();
        estado.setNombreEstado("CANCELADA");

        // Asumiendo que tu método de actualizar recibe el ID y el objeto (o solo el objeto)
        when(estadoCitaService.guardar(any(ModelEstadosCita.class))).thenReturn(estado);

        URI uri = new URI("/api/estados-cita/1");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.put(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(estado));
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    // 5. Cambiar estado a inactivo
    @Test
    public void testCambiarEstadoInactivo() throws Exception {
        ModelEstadosCita estado = new ModelEstadosCita();
        // Simulamos un cambio de estado
        when(estadoCitaService.guardar(any(ModelEstadosCita.class))).thenReturn(estado);

        URI uri = new URI("/api/estados-cita/1/estado");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.patch(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"estado\": 0}"); // Enviando inactivo
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    // 6. Cambiar estado a activo
    @Test
    public void testCambiarEstadoActivo() throws Exception {
        ModelEstadosCita estado = new ModelEstadosCita();
        when(estadoCitaService.guardar(any(ModelEstadosCita.class))).thenReturn(estado);

        URI uri = new URI("/api/estados-cita/1/estado");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.patch(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"estado\": 1}"); // Enviando activo
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }

    // 7. Eliminar correctamente
    /*@Test
    public void testEliminarCorrectamente() throws Exception {
        doNothing().when(estadoCitaService).eliminar(1);

        URI uri = new URI("/api/estados-cita/1");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.delete(uri);
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
    }/* */

    // 8. Actualizar usuario inexistente (Caso de Error)
    @Test
    public void testActualizarInexistente() throws Exception {
        ModelEstadosCita estado = new ModelEstadosCita();
        // Simulamos que el servicio lanza una excepción al no encontrar el ID 999
        when(estadoCitaService.guardar(any())).thenThrow(new RuntimeException("No encontrado"));

        URI uri = new URI("/api/estados-cita/999");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.put(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(estado));
        MvcResult result = mockMvc.perform(req).andReturn();

        // Verificamos que el controlador devuelva un código de error (ej: 400 Bad Request o 404 Not Found)
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }

    // 9. Eliminar usuario inexistente (Caso de Error)
    /*@Test
    public void testEliminarInexistente() throws Exception {
        doThrow(new RuntimeException("No encontrado")).when(estadoCitaService).eliminar(999);

        URI uri = new URI("/api/estados-cita/999");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.delete(uri);
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }/* */

    // 10. Registrar usuario con datos inválidos (Caso de Error)
    @Test
    public void testRegistrarDatosInvalidos() throws Exception {
        // Simulamos el envío de un JSON vacío o malformado
        URI uri = new URI("/api/estados-cita");
        MockHttpServletRequestBuilder req = MockMvcRequestBuilders.post(uri)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"); 

        when(estadoCitaService.guardar(any())).thenThrow(new RuntimeException("Datos inválidos"));
        
        MvcResult result = mockMvc.perform(req).andReturn();

        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getResponse().getStatus());
    }
}