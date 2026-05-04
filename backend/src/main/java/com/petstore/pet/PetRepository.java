package com.petstore.pet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PetRepository extends JpaRepository<Pet, Long> {

    @Query("""
        SELECT p FROM Pet p
        WHERE (:search IS NULL OR
                             LOWER(p.name) LIKE LOWER(CONCAT('%', COALESCE(:search, ''), '%')) OR
                             LOWER(p.breed) LIKE LOWER(CONCAT('%', COALESCE(:search, ''), '%')) OR
                             LOWER(p.description) LIKE LOWER(CONCAT('%', COALESCE(:search, ''), '%')))
          AND (:category IS NULL OR p.category = :category)
        """)
    Page<Pet> findBySearchAndCategory(
        @Param("search") String search,
        @Param("category") PetCategory category,
        Pageable pageable
    );
}
