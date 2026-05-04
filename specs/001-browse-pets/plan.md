# Implementation Plan: Pet Browsing MVP

**Branch**: `001-browse-pets` | **Date**: 2026-05-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-browse-pets/spec.md`

## Summary

Build a public pet catalog for the Petstore e-commerce application. Visitors can browse
pets across four categories (Cats, Dogs, Fish, Birds), search by name/breed/description
via a debounced live search bar, filter by category, and view a full detail page per pet.
No authentication is required. The backend exposes a `GET /api/v1/pets` REST endpoint
with optional `search` and `category` query parameters backed by PostgreSQL ILIKE queries.
The React frontend renders a responsive catalog with MUI + Tailwind CSS, deployed on
Render (Spring Boot Web Service + React Static Site + PostgreSQL managed instance).

## Technical Context

**Language/Version**: Java 21 (backend) · Node.js 20 / React 18 (frontend)  
**Primary Dependencies**: Spring Boot 3.3, Spring Security 6, Spring Data JPA, Hibernate 6, Flyway 10, Maven 3.9 (backend) · React 18, Vite 5, Tailwind CSS 3, MUI v5, React Router v6, Axios (frontend)  
**Storage**: PostgreSQL 16 (Render managed instance)  
**Testing**: JUnit 5, Mockito, Spring Boot Test, Testcontainers (backend) · Jest, React Testing Library (frontend)  
**Target Platform**: Linux server / Render Web Service (backend) · Modern web browsers / Render Static Site (frontend)  
**Project Type**: Full-stack web application (REST API + SPA)  
**Performance Goals**: Catalog page load <2 s (100 pets, broadband) · Search results visible <500 ms after debounce fires · Category filter <500 ms  
**Constraints**: 12-Factor env-var config; no hardcoded secrets; OWASP Top 10 mitigations; Render free/starter tier limits (512 MB RAM, shared CPU); search uses PostgreSQL ILIKE (no external search engine)  
**Scale/Scope**: ~100 pets initially across 4 categories; single-tenant public catalog; ~4 catalog pages + 1 detail page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. API-First Design | Backend `GET /api/v1/pets` contract defined before frontend work | ✅ PASS | contracts/pets-api.md generated in Phase 1 |
| II. TDD (NON-NEGOTIABLE) | JUnit 5 tests written before service/repository implementation | ✅ PASS | TDD tasks T021T/T022T/T023T (backend JUnit 5 + Testcontainers/Mockito/MockMvc) and T029T/T031T/T036T (frontend Jest + React Testing Library) precede their implementation counterparts, enforcing Red-Green-Refactor cycle |
| III. Security by Default | Spring Security configured; input validated at API boundary | ⚠️ JUSTIFIED | Catalog endpoints are intentionally public (no auth per spec). Spring Security is still configured with `permitAll()` for `/api/v1/pets/**` — the framework is present and enforces CORS, headers, and future auth. SQL injection prevented via JPA named parameters. See Complexity Tracking. |
| IV. Cloud-Native Configuration | Env vars for DB URL, JWT key, CORS origins; Render deployment | ✅ PASS | All config externalised via `application.yml` + env var overrides |
| V. Simplicity / YAGNI | No caching, no search engine, no pagination library beyond Spring Pageable | ✅ PASS | PostgreSQL ILIKE sufficient for ≤100 pets; no Redis/Elasticsearch added |

**Post-design re-check**: ✅ All gates pass after Phase 1 design (see data-model.md and contracts/).

## Project Structure

### Documentation (this feature)

```text
specs/001-browse-pets/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── pets-api.md      # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/                          ← Spring Boot Maven project (Java 21)
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/petstore/
│   │   │   ├── PetstoreApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java         # Spring Security — public catalog endpoints
│   │   │   │   └── CorsConfig.java
│   │   │   ├── pet/
│   │   │   │   ├── Pet.java                    # JPA entity
│   │   │   │   ├── PetCategory.java            # Enum: CATS, DOGS, FISH, BIRDS
│   │   │   │   ├── PetRepository.java          # Spring Data JPA + custom ILIKE query
│   │   │   │   ├── PetService.java             # Business logic
│   │   │   │   ├── PetController.java          # REST controller — GET /api/v1/pets
│   │   │   │   └── dto/
│   │   │   │       ├── PetSummaryDto.java      # Catalog card response
│   │   │   │       └── PetDetailDto.java       # Detail page response
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/
│   │           ├── V1__create_pets_table.sql
│   │           └── V2__seed_pets.sql
│   └── test/
│       └── java/com/petstore/
│           ├── pet/
│           │   ├── PetRepositoryTest.java       # Testcontainers — ILIKE queries
│           │   ├── PetServiceTest.java          # Mockito unit tests
│           │   └── PetControllerTest.java       # MockMvc integration tests
│           └── PetstoreApplicationTests.java

frontend/                         ← React 18 + Vite project
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── api/
    │   └── petsApi.js                          # Axios calls to GET /api/v1/pets
    ├── components/
    │   ├── catalog/
    │   │   ├── PetCatalog.jsx                  # Catalog grid container
    │   │   ├── PetCard.jsx                     # Individual pet card
    │   │   ├── CategoryFilter.jsx              # Category tab/button group
    │   │   ├── SearchBar.jsx                   # Debounced search input
    │   │   └── EmptyState.jsx                  # Zero-result message
    │   └── common/
    │       ├── LoadingSpinner.jsx
    │       └── ImageWithFallback.jsx
    ├── pages/
    │   ├── CatalogPage.jsx                     # Home / browse page
    │   └── PetDetailPage.jsx                   # Individual pet profile
    └── tests/
        ├── PetCard.test.jsx
        ├── SearchBar.test.jsx
        ├── CategoryFilter.test.jsx
        └── CatalogPage.test.jsx
```

**Structure Decision**: Web application layout (`backend/` + `frontend/`) as defined in the
constitution. The backend uses a feature-package structure (`pet/`) rather than a
layered structure to keep related classes co-located and enable independent feature
development.

## Complexity Tracking

| Situation | Justification | Simpler Alternative Rejected Because |
|-----------|---------------|--------------------------------------|
| Spring Security configured with `permitAll()` on public catalog endpoints | Constitution III mandates the framework be present; CORS, security headers, and future auth hooks require it | Removing Spring Security entirely would require re-adding it when auth features land, creating migration debt and leaving the API without any HTTP security headers |
