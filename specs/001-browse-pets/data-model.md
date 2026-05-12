# Data Model: Pet Browsing MVP

**Branch**: `001-browse-pets` | **Date**: 2026-05-04
**Source**: spec.md Key Entities + research.md R-001, R-005

---

## Entities

### Pet

The central entity. Represents an individual animal available for browsing in the catalog.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `Long` | PK, auto-generated (`BIGSERIAL`) | — |
| `name` | `VARCHAR(100)` | NOT NULL | Pet's display name (e.g., "Buddy") |
| `breed` | `VARCHAR(100)` | NOT NULL | Breed or species (e.g., "Golden Retriever") |
| `age` | `INTEGER` | NOT NULL, ≥ 0 | Age in months (avoids decimal ambiguity). **Display format**: "X years Y months" for age ≥ 12; "X months" for age < 12. |
| `price` | `NUMERIC(10,2)` | NOT NULL, > 0 | Sale price in USD |
| `description` | `TEXT` | NOT NULL | Full descriptive text; searchable |
| `imageUrl` | `VARCHAR(500)` | NOT NULL | Primary display image URL |
| `available` | `BOOLEAN` | NOT NULL, DEFAULT true | Availability status |
| `category` | `VARCHAR(20)` | NOT NULL, FK-like enum | One of: `CATS`, `DOGS`, `FISH`, `BIRDS` |
| `createdAt` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | Used for default sort order |

**Search fields**: `name`, `breed`, `description` (case-insensitive ILIKE — R-001)

**Validation rules** (Jakarta Bean Validation on DTO):
- `name`: `@NotBlank`, `@Size(max=100)`
- `breed`: `@NotBlank`, `@Size(max=100)`
- `age`: `@NotNull`, `@Min(0)`
- `price`: `@NotNull`, `@DecimalMin("0.01")`
- `description`: `@NotBlank`
- `imageUrl`: `@NotBlank`, `@Size(max=500)`
- `category`: `@NotNull`

---

### PetCategory (Enum)

Fixed set of four categories. Stored as `VARCHAR` in the database (not integer code) so
SQL queries are human-readable.

| Value | Display Label |
|-------|--------------|
| `CATS` | Cats |
| `DOGS` | Dogs |
| `FISH` | Fish |
| `BIRDS` | Birds |

**Java enum**: `com.velasco.petstore.pet.PetCategory`  
**JPA mapping**: `@Enumerated(EnumType.STRING)` on `Pet.category`

---

## DTOs (Response Shapes)

### PetSummaryDto — Catalog card

Used by `GET /api/v1/pets` list response. Contains only fields needed to render a pet
card in the catalog grid.

```json
{
  "id": 1,
  "name": "Buddy",
  "breed": "Golden Retriever",
  "price": 850.00,
  "imageUrl": "https://cdn.example.com/pets/buddy.jpg",
  "available": true,
  "category": "DOGS"
}
```

### PetDetailDto — Detail page

Used by `GET /api/v1/pets/{id}` response. Contains all fields for the full pet profile
page.

```json
{
  "id": 1,
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 18,
  "price": 850.00,
  "description": "Buddy is a friendly, energetic Golden Retriever...",
  "imageUrl": "https://cdn.example.com/pets/buddy.jpg",
  "available": true,
  "category": "DOGS"
}
```

---

## Database Schema

### Flyway Migration: `V1__create_pets_table.sql`

```sql
CREATE TABLE pets (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    breed       VARCHAR(100)    NOT NULL,
    age         INTEGER         NOT NULL CHECK (age >= 0),
    price       NUMERIC(10, 2)  NOT NULL CHECK (price > 0),
    description TEXT            NOT NULL,
    image_url   VARCHAR(500)    NOT NULL,
    available   BOOLEAN         NOT NULL DEFAULT TRUE,
    category    VARCHAR(20)     NOT NULL
                                CHECK (category IN ('CATS','DOGS','FISH','BIRDS')),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Index to accelerate category filter queries
CREATE INDEX idx_pets_category ON pets (category);

-- Index to accelerate combined search + category queries
CREATE INDEX idx_pets_category_name ON pets (category, name);
```

### Flyway Migration: `V2__seed_pets.sql`

Seeds a representative set of pets across all four categories for development, demo, and
acceptance testing. Minimum 3 pets per category (12 total) with overlapping
name/breed terms to enable combined search+filter test scenarios (CHK044).

```sql
INSERT INTO pets (name, breed, age, price, description, image_url, available, category) VALUES
-- DOGS
('Buddy',   'Golden Retriever', 18, 850.00,  'Friendly golden retriever puppy.',           'https://placedog.net/400/300?id=1',  TRUE,  'DOGS'),
('Max',     'Labrador Mix',     24, 650.00,  'Calm and gentle Labrador cross breed.',      'https://placedog.net/400/300?id=2',  TRUE,  'DOGS'),
('Bella',   'Beagle',           12,  750.00, 'Playful beagle with golden ears.',           'https://placedog.net/400/300?id=3',  FALSE, 'DOGS'),
-- CATS
('Luna',    'Siamese',           8,  450.00, 'Elegant Siamese cat with bright blue eyes.', 'https://placekitten.com/400/300',    TRUE,  'CATS'),
('Oliver',  'Maine Coon',       14,  600.00, 'Large and fluffy Maine Coon.',               'https://placekitten.com/401/300',    TRUE,  'CATS'),
('Milo',    'British Shorthair',10,  550.00, 'Quiet and affectionate British Shorthair.',  'https://placekitten.com/402/300',    TRUE,  'CATS'),
-- FISH
('Nemo',    'Clownfish',         3,   35.00, 'Vibrant orange clownfish.',                  'https://placeimg.com/400/300/nature?1', TRUE, 'FISH'),
('Bubbles', 'Betta',             2,   25.00, 'Stunning blue and red Betta fish.',          'https://placeimg.com/400/300/nature?2', TRUE, 'FISH'),
('Goldie',  'Goldfish',          1,   15.00, 'Classic goldfish, great for beginners.',     'https://placeimg.com/400/300/nature?3', TRUE, 'FISH'),
-- BIRDS
('Kiwi',    'Parakeet',          6,   80.00, 'Cheerful green parakeet.',                   'https://placeimg.com/400/300/animals?1', TRUE, 'BIRDS'),
('Sunny',   'Canary',            4,   95.00, 'Bright yellow canary with a beautiful song.','https://placeimg.com/400/300/animals?2', TRUE, 'BIRDS'),
('Rio',     'Cockatiel',        18,  150.00, 'Friendly cockatiel that loves to whistle.',  'https://placeimg.com/400/300/animals?3', TRUE, 'BIRDS');
```

---

## State Transitions

### Pet Availability

```
AVAILABLE ──(admin marks unavailable)──► UNAVAILABLE
UNAVAILABLE ──(admin marks available)──► AVAILABLE
```

*Note: Admin operations are out of scope for this MVP. `available` is set at seed time
and read-only from the catalog/search API.*

---

## Relationships

```
PetCategory (enum)
    │  1
    │  has-many
    ▼  N
  Pet ──────── PetSummaryDto (catalog list)
               PetDetailDto  (detail page)
```

No foreign key relationships to other tables in this MVP. The `category` column stores
the enum string value directly on the `pets` table.

---

## Pagination Model

Search and list responses are paginated using Spring Data `Page<PetSummaryDto>`:

| Field | Type | Description |
|-------|------|-------------|
| `content` | `PetSummaryDto[]` | Pets on the current page |
| `page` | `integer` | Zero-based current page number |
| `size` | `integer` | Requested page size (default: 20) |
| `totalElements` | `long` | Total matching pets across all pages |
| `totalPages` | `integer` | Total number of pages |
