package com.velasco.petstore.pet.dto;

import com.velasco.petstore.pet.PetCategory;
import java.math.BigDecimal;

public record PetSummaryDto(
    Long id,
    String name,
    String breed,
    BigDecimal price,
    String imageUrl,
    Boolean available,
    PetCategory category
) {
}
