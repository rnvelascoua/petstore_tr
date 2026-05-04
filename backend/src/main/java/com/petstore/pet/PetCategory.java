package com.petstore.pet;

public enum PetCategory {
    CATS,
    DOGS,
    FISH,
    BIRDS;

    public static PetCategory fromQuery(String raw) {
        for (PetCategory category : values()) {
            if (category.name().equalsIgnoreCase(raw)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Invalid category value. Allowed: CATS, DOGS, FISH, BIRDS");
    }
}
