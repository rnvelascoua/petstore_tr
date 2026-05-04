package com.petstore.pet;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("dev")
class PetRepositoryTest {

    @Autowired
    private PetRepository petRepository;

    @Test
    void findBySearchAndCategory_searchOnly() {
        Page<Pet> result = petRepository.findBySearchAndCategory("golden", null, PageRequest.of(0, 20));
        assertFalse(result.isEmpty());
        assertTrue(result.getContent().stream().anyMatch(p -> p.getName().equals("Buddy")));
    }

    @Test
    void findBySearchAndCategory_categoryOnly() {
        Page<Pet> result = petRepository.findBySearchAndCategory(null, PetCategory.DOGS, PageRequest.of(0, 20));
        assertFalse(result.isEmpty());
        assertTrue(result.getContent().stream().allMatch(p -> p.getCategory() == PetCategory.DOGS));
    }
}
