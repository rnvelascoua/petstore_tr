---
description: "Task list for Pet Browsing MVP"
---

# Tasks: Pet Browsing MVP

**Input**: Design documents from `specs/001-browse-pets/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/pets-api.md ✅ · quickstart.md ✅

**Tests**: Included — TDD required by Constitution Principle II (NON-NEGOTIABLE). Test tasks are marked `[TEST]` and MUST precede their corresponding implementation tasks to enforce the Red-Green-Refactor cycle.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold both projects and configure all shared tooling before any feature work.

- [X] T001 Initialise Spring Boot 3.3 Maven project with dependencies (spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-security, flyway-core, postgresql, spring-boot-starter-validation, lombok, spring-boot-starter-test, testcontainers) in `backend/pom.xml`
- [X] T002 Create Spring Boot entry point `backend/src/main/java/com/petstore/PetstoreApplication.java`
- [X] T003 [P] Create `backend/src/main/resources/application.yml` with datasource, JPA, Flyway, and server config using env-var placeholders (`${DATABASE_URL}`, `${CORS_ALLOWED_ORIGINS}`)
- [X] T004 [P] Create `backend/src/main/resources/application-dev.yml` pointing to `jdbc:postgresql://localhost:5432/petstore` with hardcoded local credentials
- [X] T005 Initialise React 18 + Vite project with `npm create vite@latest frontend -- --template react` and install dependencies: `axios`, `react-router-dom`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `tailwindcss`, `postcss`, `autoprefixer` in `frontend/package.json`
- [X] T006 [P] Configure Tailwind CSS — create `frontend/tailwind.config.js` and `frontend/postcss.config.js`; add Tailwind directives to `frontend/src/index.css`
- [X] T007 [P] Create `frontend/vite.config.js` with dev proxy forwarding `/api` to `http://localhost:8080`
- [X] T008 [P] Create `frontend/.env.example` with `VITE_API_BASE_URL=http://localhost:8080`
- [X] T009 Create root `render.yaml` defining three Render services: `petstore-api` (web), `petstore-web` (static), `petstore-db` (pgsql) per research.md R-004

**Checkpoint**: Both projects scaffold cleanly (`mvn compile` and `npm run build` pass).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, security config, CORS, and base project wiring that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 Create Flyway migration `backend/src/main/resources/db/migration/V1__create_pets_table.sql` — full schema per data-model.md (pets table, CHECK constraints, indexes on `category` and `category+name`)
- [X] T011 Create Flyway migration `backend/src/main/resources/db/migration/V2__seed_pets.sql` — 12 seed pets (3 per category) per data-model.md seed script
- [X] T012 Create `PetCategory` enum `backend/src/main/java/com/petstore/pet/PetCategory.java` with values `CATS`, `DOGS`, `FISH`, `BIRDS`
- [X] T013 Create `Pet` JPA entity `backend/src/main/java/com/petstore/pet/Pet.java` — all fields per data-model.md, `@Enumerated(EnumType.STRING)` on `category`, `@Table(name="pets")`
- [X] T014 [P] Create `PetSummaryDto` record `backend/src/main/java/com/petstore/pet/dto/PetSummaryDto.java` — fields: `id`, `name`, `breed`, `price`, `imageUrl`, `available`, `category`
- [X] T015 [P] Create `PetDetailDto` record `backend/src/main/java/com/petstore/pet/dto/PetDetailDto.java` — all Pet fields
- [X] T016 Create `SecurityConfig` `backend/src/main/java/com/petstore/config/SecurityConfig.java` — stateless, CSRF disabled, `permitAll()` on `/api/v1/pets/**`, `denyAll()` on all others, security headers per research.md R-002
- [X] T017 [P] Create `CorsConfig` `backend/src/main/java/com/petstore/config/CorsConfig.java` — reads `CORS_ALLOWED_ORIGINS` env var, allows `GET` and `OPTIONS` on `/api/**`
- [X] T018 Create global exception handler `backend/src/main/java/com/petstore/config/GlobalExceptionHandler.java` — `@RestControllerAdvice` returning `{"error": "..."}` JSON for `EntityNotFoundException` (404), `MethodArgumentNotValidException` (400), and generic `Exception` (500) per contracts/pets-api.md error shapes
- [X] T019 Bootstrap React app shell — update `frontend/src/main.jsx` with `BrowserRouter`, update `frontend/src/App.jsx` with React Router routes: `/` → `CatalogPage`, `/pets/:id` → `PetDetailPage`
- [X] T020 [P] Create Axios instance `frontend/src/api/petsApi.js` with `baseURL` from `VITE_API_BASE_URL` env var; export `getPets({ search, category, page, size })` and `getPetById(id)` functions

**Checkpoint**: Backend starts (`mvn spring-boot:run -Dspring-boot.run.profiles=dev`), Flyway migrations apply, `GET http://localhost:8080/api/v1/pets` returns seeded JSON. Frontend starts (`npm run dev`) and routes render without errors.

---

## Phase 3: User Story 1 — Browse Pet Catalog (Priority: P1) 🎯 MVP

**Goal**: Visitors can open the home page and see a grid of pet cards with image, name, breed, and price. Empty-category state is handled.

**Independent Test**: Run backend + frontend locally. Open `http://localhost:5173` — a grid of seeded pet cards loads. Each card shows image, name, breed, price. A category with no pets shows "No pets available".

- [X] T021T [TEST] [US1] Write failing `PetRepositoryTest` `backend/src/test/java/com/petstore/pet/PetRepositoryTest.java` — Testcontainers PostgreSQL; assert: search-only, category-only, combined, and null-param queries return correct results; ILIKE is case-insensitive; pagination `totalElements` is correct. **Must fail before T021 is started.**
- [X] T021 [US1] Create `PetRepository` `backend/src/main/java/com/petstore/pet/PetRepository.java` — extends `JpaRepository<Pet, Long>`; add `findBySearchAndCategory` JPQL `@Query` with `:search` and `:category` nullable params + `Pageable` per research.md R-001. (T021T must be failing first.)
- [X] T022T [TEST] [US1] Write failing `PetServiceTest` `backend/src/test/java/com/petstore/pet/PetServiceTest.java` — Mockito; assert: blank/whitespace search is treated as null; `findPets` maps `Pet` → `PetSummaryDto`; `findById` throws `EntityNotFoundException` for missing ID. **Must fail before T022 is started.**
- [X] T022 [US1] Create `PetService` `backend/src/main/java/com/petstore/pet/PetService.java` — `findPets(String search, PetCategory category, Pageable pageable)` trims/nullifies blank search, returns `Page<PetSummaryDto>`; `findById(Long id)` returns `PetDetailDto` or throws `EntityNotFoundException`. (T022T must be failing first.)
- [X] T023T [TEST] [US1] Write failing `PetControllerTest` `backend/src/test/java/com/petstore/pet/PetControllerTest.java` — MockMvc; assert: `GET /api/v1/pets` returns 200 with pagination envelope; `search` > 100 chars returns 400; invalid `category` returns 400; `GET /api/v1/pets/{id}` returns detail dto; `GET /api/v1/pets/9999` returns 404. **Must fail before T023 is started.**
- [X] T023 [US1] Create `PetController` `backend/src/main/java/com/petstore/pet/PetController.java` — `GET /api/v1/pets` with `@RequestParam` `search` (`@Size(max=100)`), `category` (`@RequestParam(required=false)`), `page`, `size`; `GET /api/v1/pets/{id}`; delegates to `PetService`; returns paginated envelope per contracts/pets-api.md. (T023T must be failing first.)
- [X] T024 [P] [US1] Create `LoadingSpinner` component `frontend/src/components/common/LoadingSpinner.jsx` — MUI `CircularProgress` centred in a full-width container
- [X] T025 [P] [US1] Create `ImageWithFallback` component `frontend/src/components/common/ImageWithFallback.jsx` — renders `<img>` with `onError` replacing src with a placeholder icon (MUI `PetsIcon`)
- [X] T026 [US1] Create `PetCard` component `frontend/src/components/catalog/PetCard.jsx` — MUI `Card` showing `ImageWithFallback`, pet name, breed, formatted price, availability badge; clicking navigates to `/pets/:id` via React Router `useNavigate`
- [X] T027 [US1] Create `EmptyState` component `frontend/src/components/catalog/EmptyState.jsx` — accepts `message` and optional `onClear` prop; renders MUI `Typography` + optional "Clear search" `Button`
- [X] T028 [US1] Create `PetCatalog` component `frontend/src/components/catalog/PetCatalog.jsx` — accepts `pets`, `loading`, `emptyMessage` props; renders MUI `Grid` of `PetCard` components or `LoadingSpinner` or `EmptyState`
- [X] T029T [TEST] [US1] Write failing `CatalogPage.test.jsx` `frontend/src/tests/CatalogPage.test.jsx` — React Testing Library; assert: pet cards render from mocked API response; loading spinner shown while fetching; empty-state message shown when API returns zero results. **Must fail before T029 is started.**
- [X] T029 [US1] Create `CatalogPage` `frontend/src/pages/CatalogPage.jsx` — calls `getPets()` on mount via `useEffect`; manages `search`, `activeCategory`, `page` in URL query params (React Router `useSearchParams`); renders `PetCatalog`; handles `AbortController` cleanup per research.md R-003. (T029T must be failing first.)
- [X] T030 [US1] Create `PetDetailPage` stub `frontend/src/pages/PetDetailPage.jsx` — wire route param `id` to `getPetById(id)` call; show `LoadingSpinner` while loading; show "Pet not found" on 404; back button returns to catalog preserving URL params. **Scope: routing and data-fetch only; full field rendering is completed in T039.**

**Checkpoint**: `http://localhost:5173` renders pet cards with image/name/breed/price. Clicking a card shows the detail page. Back button restores the catalog view.

---

## Phase 4: User Story 2 — Search Pets (Priority: P2)

**Goal**: Visitors can type in a search bar and see results update live (debounced ~300 ms) matching name, breed, or description. Empty-state shows "No pets found for '...'" with a Clear button. Search + category filter are combinable.

**Independent Test**: Type "golden" in the search bar — only pets with "golden" in name/breed/description appear within ~300 ms. Type in a nonsense string — empty-state message and Clear button appear.

- [X] T031T [TEST] [US2] Write failing `SearchBar.test.jsx` `frontend/src/tests/SearchBar.test.jsx` — React Testing Library; assert: input renders with `aria-label="Search pets"`; clear button appears only when value is non-empty; onChange fires on user input; input enforces maxLength 100. **Must fail before T031 is started.**
- [X] T031 [US2] Create `SearchBar` component `frontend/src/components/catalog/SearchBar.jsx` — MUI `TextField` with `inputProps={{ maxLength: 100 }}`; controlled by `value` + `onChange` props; shows clear `IconButton` when value is non-empty; accessible `aria-label="Search pets"`. (T031T must be failing first.)
- [X] T032 [US2] Add debounce logic to `CatalogPage` `frontend/src/pages/CatalogPage.jsx` — `useState` for `inputValue`; `useEffect` with 300 ms `setTimeout`/`clearTimeout` producing `debouncedSearch`; whitespace trimming before setting debounced value per research.md R-003; wire `SearchBar` into page
- [X] T033 [US2] Update `getPets` in `frontend/src/api/petsApi.js` to pass `search` and `category` params; add `AbortController` support (accept optional `signal` argument)
- [X] T034 [US2] Update `CatalogPage` `frontend/src/pages/CatalogPage.jsx` — pass `AbortController.signal` to `getPets`; cancel in-flight request in `useEffect` cleanup when `debouncedSearch` or `activeCategory` changes
- [X] T035 [US2] Update `EmptyState` usage in `CatalogPage` to show "No pets found for '[query]'" when `debouncedSearch` is non-empty and results are empty; wire `onClear` to reset `inputValue` and `debouncedSearch` to empty string

**Checkpoint**: Typing "golden" updates catalog within ~300 ms. Typing gibberish shows empty-state with Clear button. Clicking Clear restores full catalog.

---

## Phase 5: User Story 3 — Filter Pets by Category (Priority: P3)

**Goal**: Visitors can click a category chip/tab to filter the catalog. Active filter is visually highlighted. Selecting "All" restores the full catalog. Filter and search can be combined.

**Independent Test**: Click "Dogs" — only dog cards are shown and the Dogs chip is highlighted. Click "All" — all categories return. Type "golden" while Dogs is active — only golden dogs appear.

- [X] T036T [TEST] [US3] Write failing `CategoryFilter.test.jsx` `frontend/src/tests/CategoryFilter.test.jsx` — React Testing Library; assert: all 5 options (All, Cats, Dogs, Fish, Birds) render; clicking a category fires onChange with the correct value; active option has a visually distinct style. **Must fail before T036 is started.**
- [X] T036 [US3] Create `CategoryFilter` component `frontend/src/components/catalog/CategoryFilter.jsx` — MUI `ToggleButtonGroup` (or Tabs) with options: All, Cats, Dogs, Fish, Birds; `value` and `onChange` props; active option visually highlighted per MUI theme; accessible `aria-label`. (T036T must be failing first.)
- [X] T037 [US3] Wire `CategoryFilter` into `CatalogPage` `frontend/src/pages/CatalogPage.jsx` — `activeCategory` stored in URL query param (`?category=DOGS`); changing category fires new `getPets` request with current `debouncedSearch` + new `activeCategory`; clearing category sets param to absent (not empty string)
- [X] T038 [US3] Update `EmptyState` message in `CatalogPage` — when both `debouncedSearch` and `activeCategory` are set and results are empty, show "No [Category Label] found for '[query]'" per spec Edge Cases; Clear button resets search only (preserves category)

**Checkpoint**: Category filter chips appear. Clicking Dogs shows only dogs. Combined search+filter returns correct intersection. Clear search restores category-filtered view.

---

## Phase 6: User Story 4 — View Pet Detail Page (Priority: P4)

**Goal**: Visitors click a pet card and land on a full detail page showing all pet fields. Unavailable pets show an "Unavailable" indicator. Back navigation restores the catalog with active filter/search.

**Independent Test**: Navigate directly to `/pets/1` — full profile renders (name, breed, age, price, description, image, availability). Navigate to `/pets/9999` — "Pet not found" message with back link. Click back on a detail page — catalog restores with previous URL params.

- [X] T039 [US4] Complete `PetDetailPage` `frontend/src/pages/PetDetailPage.jsx` — render all `PetDetailDto` fields: pet image via `ImageWithFallback`; name (MUI Typography h4); breed (subtitle); age formatted as "X years Y months" for age ≥ 12 months or "X months" for age < 12 months; price formatted as USD; description; availability MUI `Chip` (green "Available" / red "Unavailable"). **Scope: full field rendering on top of T030 routing stub.**
- [X] T040 [US4] Ensure back navigation in `PetDetailPage` uses `navigate(-1)` (React Router) so URL params (`?search=&category=`) are preserved in browser history
- [X] T041 [P] [US4] Verify `GlobalExceptionHandler` `backend/src/main/java/com/petstore/config/GlobalExceptionHandler.java` covers `EntityNotFoundException` → HTTP 404 `{"error": "Pet not found"}`. T018 creates this handler; T041 adds the `EntityNotFoundException` case if not present and confirms `PetControllerTest` (T023T) passes the 404 assertion.

**Checkpoint**: `/pets/1` shows complete pet profile. `/pets/9999` shows "Pet not found". Browser back from detail page returns to catalog with correct `?search=&category=` params.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Responsive layout, loading states, error boundary, Render deployment config.

- [X] T042 Add responsive grid breakpoints to `PetCatalog` `frontend/src/components/catalog/PetCatalog.jsx` — MUI `Grid` with `xs=12`, `sm=6`, `md=4`, `lg=3` so catalog works on mobile and desktop (FR-009)
- [X] T043 [P] Add MUI `Pagination` component to `CatalogPage` `frontend/src/pages/CatalogPage.jsx` — render below grid when `totalPages > 1`; clicking a page number updates `?page=N` URL param and triggers new `getPets` request
- [X] T044 [P] Add API error state handling to `CatalogPage` `frontend/src/pages/CatalogPage.jsx` — catch non-abort errors from `getPets`; display MUI `Alert` severity="error" with retry button (CHK032)
- [X] T045 [P] Add `<title>` and meta tags to `frontend/index.html` — "Petstore — Find Your Perfect Pet"; add MUI `CssBaseline` to `frontend/src/main.jsx`
- [X] T046 Verify `render.yaml` at repository root is complete — correct build commands, start commands, env var references (`DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `SPRING_PROFILES_ACTIVE=prod`), and Render PostgreSQL link per research.md R-004
- [X] T047 [P] Create `backend/src/main/resources/application-prod.yml` — sets `spring.flyway.locations=classpath:db/migration`, disables `ddl-auto`, configures connection pool size appropriate for Render starter tier

---

## Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Foundation)
            ├── Phase 3 (US1 — Browse) 🎯 MVP
            │       ├── Phase 4 (US2 — Search)
            │       ├── Phase 5 (US3 — Filter)
            │       └── Phase 6 (US4 — Detail)
            └── Final Phase (Polish) — can begin after Phase 3
```

**US2 (Search) and US3 (Filter) are independent of each other** — they can be
implemented in parallel once US1 is complete. US4 (Detail) depends on US1 only (the
detail page reuses the same backend endpoint).

---

## Parallel Execution Examples

### After Phase 2 completes, the following can run in parallel:

**Track A — US1 Backend** (T021T → T021 → T022T → T022 → T023T → T023)
**Track B — US1 Frontend common** (T024, T025 in parallel)  
**Track C — US1 Frontend components** (T026 → T027 → T028 → T029 → T030)

*(Track B feeds Track C; Track A and Track C are independent until integration)*

### After Phase 3 (US1) completes:

**Track A — US2 Search** (T031T → T031 → T032 → T033 → T034 → T035)  
**Track B — US3 Filter** (T036T → T036 → T037 → T038)  
**Track C — US4 Detail** (T039 → T040 → T041)  
**Track D — Polish** (T042, T043, T044, T045 in parallel → T046 → T047)

---

## Implementation Strategy

**MVP scope = Phase 1 + Phase 2 + Phase 3 (US1 only)**

Completing through Phase 3 delivers a fully working, deployable pet catalog:
the backend serves seeded pets over a REST API and the frontend renders a responsive
grid of pet cards. Every subsequent phase adds an independently shippable increment.

| Milestone | Phases | What's deliverable |
|-----------|--------|-------------------|
| MVP | 1–3 | Public catalog — browse all pets, click for detail |
| +Search | 1–4 | Live debounced search across name/breed/description |
| +Filter | 1–5 | Category filtering, combinable with search |
| +Detail | 1–6 | Full pet profile page with availability status |
| +Polish | All | Responsive layout, pagination, error handling, Render deploy |
