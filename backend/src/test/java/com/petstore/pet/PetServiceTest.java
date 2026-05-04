package com.petstore.pet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.petstore.pet.dto.PetDetailDto;
import com.petstore.pet.dto.PetSummaryDto;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    @Mock
    private PetRepository petRepository;

    private PetService petService;

    @BeforeEach
    void setUp() {
        petService = new PetService(petRepository);
    }

    @Test
    void findPets_trimsBlankSearchToNull() {
        PageRequest pageable = PageRequest.of(0, 20);
        when(petRepository.findBySearchAndCategory(null, null, pageable)).thenReturn(Page.empty());

        petService.findPets("   ", null, pageable);

        verify(petRepository).findBySearchAndCategory(null, null, pageable);
    }

    @Test
    @SuppressWarnings("null")
    void findPets_mapsEntityToSummaryDto() {
        Pet pet = new Pet();
        pet.setId(1L);
        pet.setName("Buddy");
        pet.setBreed("Golden Retriever");
        pet.setPrice(BigDecimal.valueOf(850));
        pet.setImageUrl("https://example.com/buddy.jpg");
        pet.setAvailable(true);
        pet.setCategory(PetCategory.DOGS);

        PageRequest pageable = PageRequest.of(0, 20);
        when(petRepository.findBySearchAndCategory(eq("golden"), eq(PetCategory.DOGS), eq(pageable)))
            .thenReturn(new PageImpl<>(Collections.singletonList(pet)));

        Page<PetSummaryDto> result = petService.findPets("golden", PetCategory.DOGS, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("Buddy", result.getContent().getFirst().name());
    }

    @Test
    void findById_throwsWhenMissing() {
        when(petRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> petService.findById(999L));
    }

    @Test
    void findById_returnsDetailDto() {
        Pet pet = new Pet();
        pet.setId(1L);
        pet.setName("Buddy");
        pet.setBreed("Golden Retriever");
        pet.setAge(18);
        pet.setPrice(BigDecimal.valueOf(850));
        pet.setDescription("Friendly dog");
        pet.setImageUrl("https://example.com/buddy.jpg");
        pet.setAvailable(true);
        pet.setCategory(PetCategory.DOGS);

        when(petRepository.findById(1L)).thenReturn(Optional.of(pet));

        PetDetailDto dto = petService.findById(1L);
        assertEquals("Buddy", dto.name());
        assertEquals(18, dto.age());
    }
}
