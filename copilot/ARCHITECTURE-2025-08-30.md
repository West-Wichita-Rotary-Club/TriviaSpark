# TriviaSpark Architecture Review (2025-08-30)

This document summarizes the current architecture after migrating to ASP.NET Core hosting for the API and SPA.

## Topology

- Client: React 18 + Vite + TypeScript
  - Routing: Wouter
  - Server-state: TanStack Query
  - UI: shadcn/ui + Radix + Tailwind
  - Output: Built into `TriviaSpark.Api/wwwroot` (or `docs/` for static demo)
- API: ASP.NET Core 9 Web API (Minimal APIs)
  - Real-time: SignalR hub at `/ws`
  - Swagger/OpenAPI exposed at `/swagger`
  - Data access: Dapper over SQLite
  - JSON casing: preserves property names
- Database: SQLite (`./data/trivia.db`)
  - Connection via `SqliteDb` service
  - Dapper-based CRUD and analytics helpers in `Services/Storage.cs`
- Shared: TypeScript schema/types (used by FE and scripts)
- Static demo: `npm run build:static` → `docs/` for GitHub Pages

## Notable Behaviors

- ASP.NET Core serves the built SPA (UseDefaultFiles + UseStaticFiles + MapFallbackToFile("index.html"))
- REST endpoints are grouped under `/api/*` via `MapApiEndpoints()`
- SignalR hub maps to `/ws` for event-scoped broadcasts
- CORS is scoped to API calls only (static hosting is unaffected)
- On `dotnet build`, MSBuild targets run `npm install` and `npm run build` ensuring wwwroot stays in sync

## Developer Experience

- Local run: `dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj`
- Swagger: `http://localhost:5000/swagger`
- Hub: `ws://localhost:5000/ws`
- DB file: `./data/trivia.db`

## Quality Checks

- Build: .NET 9 SDK present; API builds successfully
- TypeScript: `npm run check` verifies TS types in the client and shared libs
- Lint: Markdown docs fixed for structure and headings

## Risks & Mitigations

- SQLite concurrency limits: acceptable for single-node; consider Turso/LibSQL for scale or multi-region
- Session handling: cookie-based; ensure HTTPS + Secure flags in production
- Asset cache-busting: handled by Vite hashed filenames

## Suggested Next Steps

- Add a solution file (`TriviaSpark.sln`) to group the API and potential test projects
- Expand unit tests for Storage and API endpoints
- Implement AI generation endpoints in the API mirroring legacy behavior, behind feature flags
- Add CI: build API + run `npm run check` and optional minimal Playwright smoke on SPA
- Consider adding Application Insights or OpenTelemetry for basic tracing
