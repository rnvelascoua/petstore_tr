# API Contract: Pets

**Service**: `petstore-api` (Spring Boot backend)
**Base URL (local)**: `http://localhost:8080`
**Base URL (production)**: `https://petstore-api.onrender.com`
**Version**: `v1`
**Auth**: None (all endpoints publicly accessible — `permitAll()`)
**Content-Type**: `application/json`

---

## Endpoints

### 1. List / Search Pets

```
GET /api/v1/pets
```

Returns a paginated list of pets. All query parameters are optional. When both `search`
and `category` are provided, results satisfy **both** constraints simultaneously (AND
logic).

#### Query Parameters

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `search` | `string` | No | `""` (no filter) | Max 100 chars; whitespace-only treated as absent | Case-insensitive partial match against `name`, `breed`, and `description` |
| `category` | `string` | No | `null` (all categories) | One of: `CATS`, `DOGS`, `FISH`, `BIRDS` (case-insensitive) | Filter by pet category |
| `page` | `integer` | No | `0` | ≥ 0 | Zero-based page number |
| `size` | `integer` | No | `20` | 1–100 | Number of results per page |

#### Success Response — `200 OK`

```json
{
  "content": [
    {
      "id": 1,
      "name": "Buddy",
      "breed": "Golden Retriever",
      "price": 850.00,
      "imageUrl": "https://cdn.example.com/pets/buddy.jpg",
      "available": true,
      "category": "DOGS"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

**Zero results** also returns `200 OK` with `content: []` and `totalElements: 0`. The
frontend renders the empty-state message; the API never returns 404 for an empty list.

#### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| `400 Bad Request` | `category` value not in allowed enum set | `{"error": "Invalid category value. Allowed: CATS, DOGS, FISH, BIRDS"}` |
| `400 Bad Request` | `search` exceeds 100 characters | `{"error": "search parameter must not exceed 100 characters"}` |
| `400 Bad Request` | `page` < 0 or `size` < 1 or `size` > 100 | `{"error": "Invalid pagination parameters"}` |
| `500 Internal Server Error` | Unexpected server error | `{"error": "An unexpected error occurred"}` |

#### Example Requests

```
# All pets (default)
GET /api/v1/pets

# Search across all categories
GET /api/v1/pets?search=golden

# Filter by category only
GET /api/v1/pets?category=DOGS

# Combined search + category filter
GET /api/v1/pets?search=golden&category=DOGS

# Combined with pagination
GET /api/v1/pets?search=golden&category=DOGS&page=0&size=20

# Category case-insensitive (also valid)
GET /api/v1/pets?category=dogs
```

---

### 2. Get Pet by ID

```
GET /api/v1/pets/{id}
```

Returns full details for a single pet. Used by the detail page.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `long` | Yes | Unique pet identifier |

#### Success Response — `200 OK`

```json
{
  "id": 1,
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 18,
  "price": 850.00,
  "description": "Buddy is a friendly, energetic Golden Retriever who loves outdoor play.",
  "imageUrl": "https://cdn.example.com/pets/buddy.jpg",
  "available": true,
  "category": "DOGS"
}
```

#### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| `404 Not Found` | No pet with the given `id` exists | `{"error": "Pet not found"}` |
| `400 Bad Request` | `id` is not a valid long integer | `{"error": "Invalid pet ID"}` |
| `500 Internal Server Error` | Unexpected server error | `{"error": "An unexpected error occurred"}` |

#### Example Requests

```
# Get pet with ID 1
GET /api/v1/pets/1

# Non-existent pet (returns 404)
GET /api/v1/pets/9999
```

---

## CORS Policy

| Header | Value |
|--------|-------|
| `Access-Control-Allow-Origin` | Value of `CORS_ALLOWED_ORIGINS` env var (Render static site URL) |
| `Access-Control-Allow-Methods` | `GET, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type` |

---

## Security Headers (applied by Spring Security)

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Cache-Control` | `no-store` |

---

## Input Sanitisation Notes

- The `search` parameter is bound as a named JPA parameter (`:search`). It is **never**
  string-interpolated into SQL. PostgreSQL parameterized queries prevent SQL injection.
- The `category` parameter is validated against the `PetCategory` enum before the query
  executes. Invalid values return `400` before reaching the database.
- The `search` maximum length (100 chars) is enforced at the controller level via
  `@RequestParam @Size(max=100)` before the service is invoked.

---

## Pagination Notes

- `page` is **zero-based** (first page = `page=0`).
- `totalPages` and `totalElements` reflect the full filtered result set, not just the
  current page.
- Clients MUST check `totalPages` to determine whether additional pages exist before
  issuing a subsequent request.
