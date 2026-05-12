package com.velasco.petstore.pet;

import com.velasco.petstore.pet.dto.PetDetailDto;
import com.velasco.petstore.pet.dto.PetSummaryDto;
import jakarta.persistence.EntityNotFoundException;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PetService {

    private final PetRepository petRepository;

    public PetService(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    public Page<PetSummaryDto> findPets(String search, PetCategory category, Pageable pageable) {
        String normalizedSearch = normalizeSearch(search);
        return petRepository.findBySearchAndCategory(normalizedSearch, category, pageable)
            .map(this::toSummaryDto);
    }

    public PetDetailDto findById(Long id) {
        Long requiredId = Objects.requireNonNull(id, "id must not be null");
        Pet pet = petRepository.findById(requiredId)
            .orElseThrow(() -> new EntityNotFoundException("Pet not found"));
        return toDetailDto(pet);
    }

    private String normalizeSearch(String search) {
        if (search == null) {
            return "";
        }
        String trimmed = search.trim();
        return trimmed;
    }

    private PetSummaryDto toSummaryDto(Pet pet) {
        return new PetSummaryDto(
            pet.getId(),
            pet.getName(),
            pet.getBreed(),
            pet.getPrice(),
            pet.getImageUrl(),
            pet.getAvailable(),
            pet.getCategory()
        );
    }

    private PetDetailDto toDetailDto(Pet pet) {
        return new PetDetailDto(
            pet.getId(),
            pet.getName(),
            pet.getBreed(),
            pet.getAge(),
            pet.getPrice(),
            pet.getDescription(),
            pet.getImageUrl(),
            pet.getAvailable(),
            pet.getCategory()
        );
    }
}
