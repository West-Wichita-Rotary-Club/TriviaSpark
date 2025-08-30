# Application Starter: Agent-Oriented Architecture and Execution Playbook

This document gives an agent a clear, domain-agnostic blueprint to understand and reproduce a similar full‑stack application. It describes the architecture from an agent’s perspective and provides a concise, step-by-step playbook to scaffold, implement, and validate a unified single‑server SPA + API system.

## Scope

- Audience: autonomous or semi‑autonomous coding agents and engineers.
- Goal: build a production‑ready, single‑origin app where a React TypeScript SPA is served by a .NET Web API from the API’s `wwwroot` folder.
- Constraint: no domain-specific details; keep the guidance general and reusable.

---

## System architecture (high‑level)

- Pattern: single‑server deployment serving both static SPA assets and REST API.
- Client: React 19 + TypeScript 5, Vite 7 build, Tailwind 3, shadcn/ui (Radix primitives), lightweight routing, TanStack Query 5 for server state, React Hook Form 7 with Zod 4 for validation, optional charts/animations.
- Server: .NET 9 Web API, EF Core 9 with SQLite, BCrypt for password hashing, Swagger/OpenAPI, CORS tuned for dev/prod.
- Output: client build artifacts emitted into API `wwwroot/`; API serves SPA and endpoints from the same origin.

### ASCII overview

```text
┌──────────────────────────────────────────────────────────────────┐
│                        Single-Origin Server                       │
│                                                                  │
│  .NET Web API (REST, Auth, EF Core, Swagger)                     │
│  ├─ Controllers  ─ services  ─ data (DbContext + SQLite)         │
│  ├─ Static hosting (wwwroot/)                                    │
│  └─ SPA fallback → index.html                                     │
│                                                                  │
│  wwwroot/                                                         │
│  └─ React + TS SPA (Vite build)                                  │
│     ├─ Routing (client-side)                                     │
│     ├─ Server state (TanStack Query)                             │
│     ├─ Forms (RHF + Zod)                                         │
│     └─ UI: Tailwind + shadcn/ui (Radix)                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend architecture (agent view)

- Stack: React 19, TypeScript 5.x, Vite 7, Tailwind 3, shadcn/ui (Radix), TanStack Query 5, React Hook Form 7, Zod 4, optional charts (e.g., Recharts) and animations (Framer Motion).
- Structure:
  - `client/src/components`: Reusable UI components.
  - `client/src/components/ui`: shadcn/ui generated primitives (New York style).
  - `client/src/contexts`: React Context providers (theme, auth).
  - `client/src/hooks`: Custom hooks.
  - `client/src/lib`: API config/service, query client, themes, utils.
  - `client/src/pages`: Route components.
  - `client/src/types`: Shared TS types and DTOs.
- Path aliases (configure in Vite + TS):
  - `@/*` → `client/src/*`
  - `@shared/*` → `shared/*`
  - `@assets/*` → `attached_assets/*` (optional)
- Data flow:
  - Centralized `apiService` module for all network calls.
  - TanStack Query for caching, retries, invalidation, and optimistic updates.
  - RHF + Zod schema validation for forms.
- Theming/UI:
  - Tailwind CSS with CSS variables; themes persisted in storage.
  - shadcn/ui for consistent, accessible primitives.

---

## Backend architecture (agent view)

- Stack: .NET 9 Web API, EF Core 9 (SQLite provider), BCrypt password hashing, Swagger/OpenAPI, environment‑specific CORS.
- Structure:
  - `Controllers/`: Attribute‑routed REST endpoints.
  - `Data/`: `DbContext` and EF configuration.
  - `DTOs/`: Input/output contracts.
  - `Models/`: EF entities and relationships.
  - `Services/`: Business logic through DI.
  - `wwwroot/`: Static SPA assets served by ASP.NET Core.
- Persistence:
  - EF Core migrations; SQLite for local/dev simplicity.
- API conventions:
  - RESTful routes, proper status codes, consistent error responses.
  - Health endpoint for liveness/readiness.
- SPA hosting:
  - Static files middleware and SPA fallback to `index.html` for client‑side routing.

---

## Build, dev, and deployment workflow

- Dev (fast iteration): run Vite dev server with proxy to API; keep CORS permissive in dev.
- Unified run (production‑like): build client assets into API `wwwroot/` and start API; SPA and API share an origin.
- Scripts (typical):
  - Client: `dev`, `build`, `check` (typecheck), `clean`.
  - Server: `build`, `run`.
  - Root: unified `build‑and‑serve` orchestration.

---

## Agent execution playbook (step‑by‑step)

The following steps are the minimal, reproducible path for an agent to create a similar application from scratch.

### 1) Repository scaffold

- Create a monorepo layout:
  - `client/` for SPA source.
  - `Server.Api/` for the .NET Web API.
  - `shared/` (optional) for cross‑cutting types.
  - `copilot/` for internal docs/playbooks.
- Initialize Node/PNPM/NPM workspace for client and a .NET solution for the API.

### 2) Frontend setup

- Scaffold React + TypeScript via Vite.
- Install and configure Tailwind, shadcn/ui (New York style), Radix UI, icon set, animation and charting libs.
- Install TanStack Query, React Hook Form, Zod, and resolver.
- Configure path aliases in `vite.config.ts` and `tsconfig.json`.
- Create base structure:
  - `components/`, `components/ui/` (generate shadcn components), `contexts/`, `hooks/`, `lib/` (`apiConfig.ts`, `apiService.ts`, `queryClient.ts`, `themes.ts`, `utils.ts`), `pages/`, `types/`.
- Ensure Vite build outputs to API `wwwroot/` (e.g., `outDir` points to `Server.Api/wwwroot`).

### 3) Backend setup

- Create a .NET 9 Web API project.
- Add EF Core 9 with SQLite provider and BCrypt.Net for hashing.
- Implement `DbContext`, entities, relationships; add migrations.
- Add `Services/` with DI for business logic; keep controllers thin.
- Configure Swagger/OpenAPI and CORS (dev permissive, prod restricted).
- Enable static file hosting and SPA fallback to `index.html`.
- Provide a health endpoint.

### 4) Client↔API integration

- In `lib/apiService.ts`, centralize all fetch logic:
  - Base URL resolution (proxy in dev, same origin in prod).
  - Typed request/response handling and error normalization.
- Wrap endpoints with TanStack Query hooks; define cache keys, stale times, and retry strategies.
- For mutations, implement optimistic updates and precise invalidation where appropriate.

### 5) Theming and UI system

- Use Tailwind + CSS variables for theme tokens.
- Implement a ThemeContext that stores theme choice in persistent storage.
- Base UI components on shadcn/ui; avoid rewriting primitives.

### 6) Data and migrations

- Create initial EF Core migration; apply on app start or via scripted step.
- Implement a seeding service for local/dev data that’s idempotent.

### 7) Testing and quality gates

- Client: unit tests for utilities and components; minimal integration tests using a testing library.
- Server: unit tests for services; integration tests for controllers (test host and SQLite/in‑memory DB).
- Add CI gates to restore/install deps, build client and server, run typecheck, and run tests.

### 8) Security and auth

- Hash credentials with BCrypt (or equivalent) on the server.
- Validate all inputs; sanitize user‑controlled data; return consistent error codes/messages.
- Client auth context manages session/token state; guard protected routes.

### 9) Observability and ops

- Keep Swagger available for dev; consider disabling or securing in prod.
- Add structured logging; instrument critical paths.
- Provide liveness/readiness endpoints.

### 10) Production hardening

- Lock CORS to the production origin.
- Configure environment‑specific settings: API base URL, DB connection, secrets.
- Ensure SPA fallback works across deep links.
- Optimize bundle size and enable caching headers for static assets.

---

## Minimal target file map (reference)

- Root
  - `build-and-serve.ps1` (or equivalent orchestrator)
  - `package.json` (root scripts delegating to client + orchestration)
- Client
  - `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`
  - `src/components/`, `src/components/ui/`, `src/contexts/`, `src/hooks/`, `src/lib/`, `src/pages/`, `src/types/`
- Server.Api
  - `Program.cs`, `appsettings*.json`
  - `Controllers/`, `Data/`, `DTOs/`, `Models/`, `Services/`, `wwwroot/`

---

## Contract and success criteria

- Inputs:
  - Client and server scaffolds, config files, and dependency manifests are present.
  - Vite and TS aliases resolve correctly.
  - EF Core migrations exist and apply successfully.
- Outputs:
  - Client build artifacts emitted under `Server.Api/wwwroot/`.
  - API serves SPA root and REST endpoints from the same origin.
- Success:
  - Dev: client proxy to API; hot reload works; basic End‑to‑End flow succeeds.
  - Unified: navigating to root serves SPA; API endpoints reachable; health endpoint returns OK.
  - Build/typecheck/tests: no errors; minimal tests pass.

---

## Common edge cases (and mitigations)

- SPA deep-link 404s → ensure server fallback to `index.html` is configured.
- CORS in dev → verify Vite proxy path and API CORS settings match.
- Path aliases not resolving → align `vite.config.ts` and `tsconfig.json` paths.
- Migration errors → run clean migrations; verify connection string and file permissions (SQLite).
- Over‑eager query invalidation → use scoped cache keys; prefer targeted invalidation.

---

## Quality gates checklist

- Build: client build and API build complete without errors.
- Typecheck: TypeScript strict mode passes.
- Tests: client utils/components and server services/controllers minimal tests pass.
- Smoke: health endpoint OK; SPA served; at least one client→API call succeeds.

---

## Quickstart tasks summary (for agents)

1) Initialize repo with `client/` and `Server.Api/` skeletons and shared config.
2) Set up React+TS (Vite), Tailwind, shadcn/ui, TanStack Query, RHF+Zod.
3) Set up .NET Web API with EF Core (SQLite), BCrypt, Swagger, CORS.
4) Wire Vite build output to `Server.Api/wwwroot/`; enable SPA fallback.
5) Implement `apiService` and representative endpoints; integrate with TanStack Query.
6) Add theme context and basic UI pages/components.
7) Create and apply EF migrations; seed dev data idempotently.
8) Add minimal tests; set up CI checks for build, typecheck, and tests.
9) Validate dev proxy and unified build; confirm health and one end‑to‑end flow.
10) Harden CORS, env configs, and logging for production.
