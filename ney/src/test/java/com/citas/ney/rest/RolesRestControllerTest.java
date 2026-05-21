package com.citas.ney.rest;

import com.citas.ney.model.ModelRoles;
import com.citas.ney.service.RolesService;
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
class RolesRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RolesService rolesService;

    @Test
    public void testListarRolesActivosConDatos() throws Exception {

        List<ModelRoles> lista = new ArrayList<>();

        ModelRoles rol = new ModelRoles();
        rol.setNombreRol("ADMIN");
        rol.setEstadoRol(1);

        lista.add(rol);

        when(rolesService.listaRolesActivos()).thenReturn(lista);

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/roles/activos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("ADMIN"));
        assertTrue(result.getResponse().getContentAsString().contains("\"estadoRol\":1"));
    }

    @Test
    public void testListarRolesActivosVacio() throws Exception {

        when(rolesService.listaRolesActivos()).thenReturn(new ArrayList<>());

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.get("/api/roles/activos"))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertEquals("[]", result.getResponse().getContentAsString());
    }
}