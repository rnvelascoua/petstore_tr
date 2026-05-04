# Quickstart: Pet Browsing MVP

**Branch**: `001-browse-pets` | **Date**: 2026-05-04
**Purpose**: Get a fully working local development environment running from a fresh clone.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Java JDK | 21 | [adoptium.net](https://adoptium.net) |
| Maven | 3.9+ | Bundled with most IDEs, or [maven.apache.org](https://maven.apache.org) |
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org) |
| Docker Desktop | Latest | Required for Testcontainers (PostgreSQL) in tests |
| Git | Any | — |

> **No local PostgreSQL installation needed.** The backend uses Docker via
> Testcontainers for tests. Local dev runs against a Docker container started
> by the backend's dev profile.

---

## 1. Clone the Repository

```bash
git clone <repo-url>
cd petstore
git checkout 001-browse-pets
```

---

## 2. Start the Database (Docker)

```bash
docker run -d \
  --name petstore-db \
  -e POSTGRES_USER=petstore \
  -e POSTGRES_PASSWORD=petstore \
  -e POSTGRES_DB=petstore \
  -p 5432:5432 \
  postgres:16
```

The backend's `application-dev.yml` is pre-configured to connect to this container.
Flyway will create the schema and seed data on first startup.

---

## 3. Start the Backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Expected output:
```
Flyway Community ... DB: jdbc:postgresql://localhost:5432/petstore
Successfully applied 2 migrations to schema "public"
Started PetstoreApplication in X.XXX seconds
```

Verify the API is running:
```bash
curl http://localhost:8080/api/v1/pets
```

You should receive a JSON response with seeded pets.

---

## 4. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
  VITE vX.X.X  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser to see the pet catalog.

---

## 5. Run Backend Tests

```bash
cd backend
mvn test
```

> Requires Docker to be running (Testcontainers starts a PostgreSQL container
> automatically for integration tests).

---

## 6. Run Frontend Tests

```bash
cd frontend
npm test
```

---

## Environment Variables Reference

### Backend (`backend/src/main/resources/application-dev.yml`)

Pre-configured for local Docker. Override any value with an environment variable:

| Env Var | Default (dev) | Description |
|---------|---------------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/petstore` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `petstore` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | `petstore` | DB password |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Frontend origin for CORS |

### Frontend (`frontend/.env.local` — create manually, not committed)

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## Project Layout Reference

```
petstore/
├── backend/          Spring Boot backend (Java 21, Maven)
├── frontend/         React 18 + Vite frontend
├── specs/            Feature specs, plans, research, contracts
│   └── 001-browse-pets/
│       ├── spec.md
│       ├── plan.md   ← this feature's implementation plan
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md  ← you are here
│       └── contracts/
│           └── pets-api.md
└── render.yaml       Render deployment configuration
```

---

## API Quick Reference

| Operation | Request |
|-----------|---------|
| All pets | `GET http://localhost:8080/api/v1/pets` |
| Search | `GET http://localhost:8080/api/v1/pets?search=golden` |
| Filter by category | `GET http://localhost:8080/api/v1/pets?category=DOGS` |
| Combined | `GET http://localhost:8080/api/v1/pets?search=golden&category=DOGS` |
| Pet detail | `GET http://localhost:8080/api/v1/pets/1` |

See [contracts/pets-api.md](contracts/pets-api.md) for the full API contract.

---

## Common Issues

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| `Connection refused` on port 5432 | Docker container not running | Run `docker start petstore-db` |
| `Port 8080 already in use` | Another process on 8080 | `lsof -ti:8080 \| xargs kill` (macOS/Linux) or change `server.port` in `application-dev.yml` |
| `Port 5173 already in use` | Another Vite dev server | `lsof -ti:5173 \| xargs kill` |
| CORS errors in browser | Frontend URL not in `CORS_ALLOWED_ORIGINS` | Set `CORS_ALLOWED_ORIGINS=http://localhost:5173` in your shell |
| Flyway migration fails | Stale DB state | `docker rm -f petstore-db` then restart from Step 2 |
