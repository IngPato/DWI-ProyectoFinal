package com.citas.ney.rest;

import com.citas.ney.dto.ApiResponse;
import com.citas.ney.dto.LoginResponse;
import com.citas.ney.service.AuthService;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
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

@SpringBootTest
@AutoConfigureMockMvc
class AuthRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    public void testLoginCorrectamente() throws Exception {

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setIdusuario(1);
        loginResponse.setUsername("juan123");
        loginResponse.setCorreo("juan@gmail.com");
        loginResponse.setRol("PACIENTE");
        loginResponse.setNombre("Juan");
        loginResponse.setApellido("Pérez");
        loginResponse.setToken("token-jwt-prueba");

        ApiResponse<LoginResponse> apiResponse =
                new ApiResponse<>(true, "Login exitoso.", loginResponse);

        when(authService.login(any())).thenReturn(apiResponse);

        String requestBody = """
                {
                    "login": "juan123",
                    "password": "123456"
                }
                """;

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andReturn();

        assertEquals(HttpStatus.OK.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Login exitoso."));
        assertTrue(result.getResponse().getContentAsString().contains("juan123"));
        assertTrue(result.getResponse().getContentAsString().contains("juan@gmail.com"));
        assertTrue(result.getResponse().getContentAsString().contains("PACIENTE"));
        assertTrue(result.getResponse().getContentAsString().contains("token-jwt-prueba"));
    }

    @Test
    public void testLoginConCredencialesInvalidas() throws Exception {

        ApiResponse<LoginResponse> apiResponse =
                new ApiResponse<>(false, "Credenciales inválidas.", null);

        when(authService.login(any())).thenReturn(apiResponse);

        String requestBody = """
                {
                    "login": "juan123",
                    "password": "claveIncorrecta"
                }
                """;

        MvcResult result = mockMvc.perform(
                MockMvcRequestBuilders.post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andReturn();

        assertEquals(HttpStatus.UNAUTHORIZED.value(), result.getResponse().getStatus());
        assertTrue(result.getResponse().getContentAsString().contains("Credenciales inválidas."));
        assertTrue(result.getResponse().getContentAsString().contains("\"success\":false"));
        assertTrue(result.getResponse().getContentAsString().contains("\"data\":null"));
    }
}