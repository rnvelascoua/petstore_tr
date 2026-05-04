# Research: Pet Browsing MVP

**Branch**: `001-browse-pets` | **Date**: 2026-05-04
**Purpose**: Resolve all NEEDS CLARIFICATION items from Technical Context and document
technology decisions with rationale.

---

## R-001 — PostgreSQL ILIKE Search in Spring Data JPA

**Question**: What is the correct, injection-safe pattern for case-insensitive partial
matching across multiple text fields in Spring Data JPA + PostgreSQL?

**Decision**: Use a JPQL `@Query` with `LOWER()` function comparisons and a named
`:search` bind parameter. Alternatively, use Spring Data JPA's `Specification` API for
composable predicates. For this MVP, a single `@Query` on the repository is simpler and
sufficient (YAGNI).

**Pattern chosen**:
```java
@Query("""
    SELECT p FROM Pet p
    WHERE (:search IS NULL OR
           LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
           LOWER(p.breed) LIKE LOWER(CONCAT('%', :search, '%')) OR
           LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
    AND (:category IS NULL OR p.category = :category)
    ORDER BY p.name ASC
""")
Page<Pet> findBySearchAndCategory(
    @Param("search") String search,
    @Param("category") PetCategory category,
    Pageable pageable
);
```

**Why this is injection-safe**: Spring Data JPA uses parameterized bind variables
(`:search`, `:category`). The SQL driver never interpolates user input into the query
string. PostgreSQL ILIKE via `LOWER() LIKE LOWER(CONCAT('%', ?, '%'))` is equivalent
and equally safe.

**Rationale**: Single repository method handles the combined search+filter requirement
(FR-013, FR-014). Null checks (`IS NULL OR`) mean the same method serves all four
use cases: no filter, search only, category only, combined.

**Alternatives considered**:
- Spring Data JPA `Specification` API — more flexible but over-engineered for a fixed
  two-parameter query at this scale.
- PostgreSQL `tsvector` / full-text search — provides ranking and typo tolerance but
  requires a separate index, additional migration complexity, and is explicitly out of
  scope (spec Assumptions).
- Elasticsearch — out of scope.

---

## R-002 — Spring Security: Public Endpoints with Framework Present

**Question**: How to satisfy Constitution Principle III (Spring Security mandatory) while
the spec requires unauthenticated public access to all catalog endpoints?

**Decision**: Configure `SecurityFilterChain` with `permitAll()` for `/api/v1/pets/**`
and disable CSRF for the stateless REST API. Spring Security remains fully active,
providing HTTP security headers (HSTS, X-Content-Type-Options, X-Frame-Options) and
CORS enforcement. No JWT authentication is wired for this MVP feature — that gate is
satisfied by having the framework present and ready for future auth.

**Pattern chosen**:
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/v1/pets/**").permitAll()
            .anyRequest().denyAll()
        )
        .headers(headers -> headers
            .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
            .contentTypeOptions(Customizer.withDefaults())
        )
        .build();
}
```

**Rationale**: CSRF is disabled because the API is stateless (no session cookies).
`denyAll()` on `anyRequest()` ensures no unintended endpoint exposure as the app grows.

**Alternatives considered**:
- No Spring Security at all — rejected because Constitution III is non-negotiable; also
  leaves the API without security headers and makes future auth a major migration.
- HTTP Basic auth on catalog endpoints — adds friction for public browsing with no
  security benefit.

---

## R-003 — React Debounced Search Pattern

**Question**: What is the idiomatic, library-free approach to debouncing a controlled
input in React 18 before issuing a backend API call?

**Decision**: Use `useState` for the raw input value and a separate `useEffect` with
`setTimeout` / `clearTimeout` to produce the debounced query value. The API call is
triggered only from the debounced value change.

**Pattern chosen**:
```jsx
const [inputValue, setInputValue] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(inputValue.trim());
  }, 300);
  return () => clearTimeout(timer);
}, [inputValue]);

// API call triggered by debouncedSearch change
useEffect(() => {
  fetchPets({ search: debouncedSearch, category: activeCategory });
}, [debouncedSearch, activeCategory]);
```

**Whitespace handling**: `.trim()` before setting `debouncedSearch` satisfies FR-017
(whitespace-only input treated as no query).

**Stale response handling**: Use an `AbortController` in the fetch `useEffect` and call
`controller.abort()` in the cleanup. This cancels in-flight requests when a new query
fires before the previous response arrives — satisfying the rapid-typing edge case
(CHK028).

**Rationale**: No additional library needed (use-debounce, lodash.debounce) — plain
React hooks are sufficient. Consistent with Constitution V (YAGNI).

**Alternatives considered**:
- `use-debounce` npm package — adds a dependency for a pattern trivially implemented
  with hooks.
- Debouncing inside the `onChange` handler with `useCallback` + `useRef` timer —
  functionally equivalent but harder to test in isolation.

---

## R-004 — Render Deployment Architecture

**Question**: What is the correct Render service configuration for a Spring Boot backend
(Web Service), React frontend (Static Site), and PostgreSQL database?

**Decision**: Use a `render.yaml` (Infrastructure as Code) file at the repository root
defining three services:

| Service | Type | Build command | Notes |
|---------|------|---------------|-------|
| `petstore-api` | `web` (Web Service) | `cd backend && mvn package -DskipTests` | Start: `java -jar target/*.jar` |
| `petstore-web` | `static` (Static Site) | `cd frontend && npm ci && npm run build` | Publish dir: `frontend/dist` |
| `petstore-db` | `pgsql` (PostgreSQL) | N/A | Render managed; env var auto-injected |

**Environment variables** on `petstore-api`:
- `DATABASE_URL` — auto-injected by Render from the linked PostgreSQL instance
- `CORS_ALLOWED_ORIGINS` — set to the Render static site URL
- `SPRING_PROFILES_ACTIVE=prod`

**CORS**: Backend `CorsConfig` reads `CORS_ALLOWED_ORIGINS` from env to allow the
frontend domain. This satisfies Constitution IV (12-Factor, no hardcoded origins).

**Flyway**: Runs automatically on application startup in the `prod` profile using the
`DATABASE_URL` env var. No manual migration step needed.

**Rationale**: `render.yaml` enables declarative, reproducible deployments. The three-
service split matches the constitution's required topology.

**Alternatives considered**:
- Docker Compose on Render — not supported for Static Sites; adds container complexity.
- Manual Render dashboard configuration — not reproducible; violates 12-Factor intent.

---

## R-005 — Pagination for Catalog and Search Results

**Question**: How should pagination be implemented given the spec assumption of 20 pets
per page?

**Decision**: Use Spring Data's `Pageable` + `Page<T>` on the backend. Default page size
= 20, configurable via query param `?page=0&size=20`. The frontend renders a simple
"Load more" button or page number strip using MUI `Pagination` component.

**Response envelope**:
```json
{
  "content": [ /* PetSummaryDto[] */ ],
  "page": 0,
  "size": 20,
  "totalElements": 87,
  "totalPages": 5
}
```

**Rationale**: Spring Data `Pageable` is built into the framework — zero additional
dependencies. Page size of 20 is consistent with the spec assumption. Cursor-based
pagination is not needed at this scale.

**Alternatives considered**:
- No pagination (return all pets) — risks slow renders for large catalogs; violates
  SC-002 performance target if catalog grows.
- Infinite scroll — more complex frontend implementation; "Load more" satisfies the
  requirement with less complexity (YAGNI).

---

## R-006 — Frontend State Management

**Question**: Is a global state manager (Redux, Zustand) needed for search + filter state?

**Decision**: No global state manager. The `CatalogPage` component owns `inputValue`,
`debouncedSearch`, and `activeCategory` as local `useState`. This state is passed as
props to `SearchBar` and `CategoryFilter`. On navigation to `PetDetailPage` and back,
React Router's URL search params (`?search=golden&category=DOGS`) preserve state so the
browser back button restores the previous filter state.

**Rationale**: Two pieces of filter state in one page do not justify a global store.
URL search params provide persistence and shareability for free. YAGNI.

**Alternatives considered**:
- Zustand — lightweight but unnecessary for this scope.
- Redux Toolkit — over-engineered for a single catalog page.
- React Context — would work but adds indirection for state that is local to one page.
