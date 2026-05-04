<!--
SYNC IMPACT REPORT
==================
Version change: (new) → 1.0.0
Added sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Development Workflow
  - Governance
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gates apply
  ✅ .specify/templates/spec-template.md — no structural changes needed
  ✅ .specify/templates/tasks-template.md — no structural changes needed
Deferred TODOs: none
-->

# Petstore Constitution

## Core Principles

### I. API-First Design
The backend MUST expose all functionality through well-defined RESTful JSON APIs before
any frontend work begins. Spring Boot controllers define the contract; no business logic
MUST leak into HTTP handlers. API contracts are documented and versioned under
`backend/src/main/resources/openapi/`. Every API endpoint MUST be reachable and testable
independently of the frontend.

### II. Test-Driven Development (NON-NEGOTIABLE)
TDD is mandatory for all backend service and repository layers. The Red-Green-Refactor
cycle MUST be followed: write a failing JUnit 5 test, get user approval, make it pass,
then refactor. Frontend components MUST have Jest/React Testing Library tests covering
critical user flows before a feature is considered done.

### III. Security by Default
All endpoints MUST be protected by Spring Security. Authentication MUST use JWT tokens.
Input validation MUST be enforced at the API boundary using Jakarta Bean Validation.
Secrets (DB credentials, JWT keys) MUST be supplied via environment variables — never
hardcoded. SQL injection MUST be prevented via JPA/Hibernate parameterized queries only.
OWASP Top 10 mitigations are non-negotiable.

### IV. Cloud-Native Configuration
The application MUST be deployable to Render with zero code changes between environments.
All environment-specific settings (database URLs, API keys, CORS origins) MUST be
externalized via environment variables following the 12-Factor App methodology.
The backend and frontend MUST each have a dedicated Render service. Database MUST run
as a Render PostgreSQL managed instance.

### V. Simplicity and YAGNI
Start with the simplest solution that satisfies the user story. Do not add abstraction
layers, caching, or optimizations that are not demanded by a concrete requirement.
Complexity MUST be justified in the PR description. Prefer Spring Data JPA repositories
over custom query builders unless performance profiling proves otherwise.

## Technology Stack

**Backend**: Java 21, Spring Boot 3.x, Spring Security, Spring Data JPA, Hibernate,
Flyway (DB migrations), Maven

**Frontend**: React 18, Vite, Tailwind CSS 3.x, MUI (Material UI) v5

**Database**: PostgreSQL 16 (Render managed)

**Testing — Backend**: JUnit 5, Mockito, Spring Boot Test, Testcontainers (integration)

**Testing — Frontend**: Jest, React Testing Library

**Deployment**: Render (backend as Web Service, frontend as Static Site,
database as PostgreSQL)

**Repository layout**:
```
backend/   ← Spring Boot Maven project
frontend/  ← React + Vite project
```

## Development Workflow

1. All work begins from a feature branch created by `/speckit.git.feature`.
2. A spec MUST exist in `specs/<branch>/spec.md` before implementation starts.
3. A plan MUST exist in `specs/<branch>/plan.md` before tasks are generated.
4. Database schema changes MUST be delivered as Flyway migration scripts
   (`backend/src/main/resources/db/migration/V*.sql`).
5. Pull requests require passing CI (build + unit + integration tests) before merge.
6. Every merged PR triggers a Render deploy preview; production deploy requires
   explicit promotion.
7. Commit messages MUST follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.).

## Governance

This constitution supersedes all other informal practices. Amendments require:
1. A documented rationale describing what changed and why.
2. Version bump following semantic versioning rules encoded in this file.
3. Propagation of the change to all affected templates and docs.

All PRs and code reviews MUST verify compliance with the principles above.
Complexity that cannot be justified against a concrete requirement MUST be removed.

**Version**: 1.0.0 | **Ratified**: 2026-05-04 | **Last Amended**: 2026-05-04
