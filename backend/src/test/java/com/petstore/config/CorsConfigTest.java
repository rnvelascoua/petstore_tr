package com.petstore.config;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.petstore.pet.PetController;
import com.petstore.pet.PetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PetController.class)
@AutoConfigureMockMvc
@Import({CorsConfig.class, SecurityConfig.class, GlobalExceptionHandler.class})
@TestPropertySource(properties = "cors.allowed-origins=https://petstore-web-wy4i.onrender.com")
class CorsConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PetService petService;

    @Test
    void preflightRequest_allowsConfiguredRenderFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/pets")
                .header("Origin", "https://petstore-web-wy4i.onrender.com")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "https://petstore-web-wy4i.onrender.com"));

        verifyNoInteractions(petService);
    }
}
