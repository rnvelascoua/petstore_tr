package com.petstore.pet.dto;

import com.petstore.pet.PetCategory;
import java.math.BigDecimal;

public record PetDetailDto(
    Long id,
    String name,
    String breed,
    Integer age,
    BigDecimal price,
    String description,
    String imageUrl,
    Boolean available,
    PetCategory category
) {
}
