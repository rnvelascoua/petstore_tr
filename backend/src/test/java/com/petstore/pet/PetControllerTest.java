package com.petstore.pet;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.petstore.config.GlobalExceptionHandler;
import com.petstore.pet.dto.PetDetailDto;
import com.petstore.pet.dto.PetSummaryDto;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PetController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class PetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PetService petService;

    @Test
    @SuppressWarnings("null")
    void listPets_returnsEnvelope() throws Exception {
        PetSummaryDto dto = new PetSummaryDto(1L, "Buddy", "Golden Retriever", BigDecimal.valueOf(850), "https://example.com/buddy.jpg", true, PetCategory.DOGS);
        Page<PetSummaryDto> page = new PageImpl<>(List.of(dto), PageRequest.of(0, 20), 1);
        when(petService.findPets(eq(null), eq(null), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/pets").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].name").value("Buddy"))
            .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void listPets_invalidCategory_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/pets").param("category", "INVALID"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void getPetById_notFound_returns404() throws Exception {
        when(petService.findById(9999L)).thenThrow(new EntityNotFoundException("Pet not found"));

        mockMvc.perform(get("/api/v1/pets/9999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error").value("Pet not found"));
    }

    @Test
    void getPetById_returnsDetail() throws Exception {
        PetDetailDto dto = new PetDetailDto(1L, "Buddy", "Golden Retriever", 18, BigDecimal.valueOf(850), "Friendly", "https://example.com/buddy.jpg", true, PetCategory.DOGS);
        when(petService.findById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/pets/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Buddy"));
    }
}
