# Copilot Instructions — TriviaSpark (Event Trivia Application)

Purpose: Steer Copilot to produce code and guidance aligned with this repository’s goals, stack, and conventions.

Keep responses concise, production-minded, and focused on the real-time event trivia context.

## Top 8 Rules (Read First)

- Stack: ASP.NET Core 9 + EF Core + SignalR + SQLite; React 18 + TypeScript + Tailwind CSS (latest). Don’t add heavy dependencies without approval.
- Backend-first and API-driven: return ActionResult<T> with ProblemDetails for errors; never leak EF entities—map to DTOs.
- Real-time only via SignalR: group by gameId and tableId; enable client auto-reconnect; handlers must be idempotent. Avoid polling.
- Mobile-first UI: small, accessible components using Tailwind; fast time-to-interaction; no SSR, GraphQL, or gRPC.
- EF Core performance: no lazy-loading; AsNoTracking for reads; projection to DTOs; avoid N+1; use explicit transactions for multi-step updates.
- Validation & security: validate all inputs; short-lived, scoped tokens for join flows; no secrets in source or logs; structured logging without PII.
- Deployment: develop on Windows 11 (VS Code/Visual Studio); deploy to Windows 10 IIS (Hosting Bundle). Prefer framework-dependent publish; include web.config; ensure IIS app pool can write to SQLite path when needed.
- Client state & types: prefer local state and a thin fetch client; ask before adding React Query/Redux; mirror backend DTO types in TypeScript.

## Docs & Workflow Rules

- Documentation placement: generate all new Markdown docs under `copilot/` at the repo root. Exceptions: `README.md` stays at root; `.github/copilot-instructions.md` stays here. Don’t scatter docs elsewhere without explicit request.
- Build/validation ownership: run build, lint/typecheck, and unit tests yourself after changes. Defer runtime/manual or long-running integration testing to the user; provide clear, copyable commands when relevant.
- Clarifications: when any instruction is ambiguous or under-specified, ask 1–2 targeted questions before proceeding. If a tiny assumption is required to move forward, state it explicitly and keep changes minimal.
- Post-change review: after any code edits, include a short self-review (what/why, risks, affected areas, follow-ups) and report quality gates status.

## Project Context

- Real-time event trivia system with admin, player, and presentation UIs.
- Development: Windows 11 using VS Code or Visual Studio.
- Backend: ASP.NET Core 9, EF Core, SignalR, SQLite.
- Frontend: React 18, TypeScript, Tailwind CSS (latest), SignalR client.
- Deployment target: Windows 10 IIS (ASP.NET Core Hosting Bundle).

## Architecture Principles (Always Honor)

- Backend first: solid domain, services, and persistence before UI scaffolding.
- API-driven: RESTful endpoints for CRUD + SignalR hubs for real-time state.
- Mobile-first: responsive, touch-friendly player UI; fast time-to-interaction.
- Real-time: live scoring, timers, and game state change via SignalR groups.

## Development Order (Default Suggestion Flow)

1. Models & Database (EF Core entities, relationships, migrations)
2. Core Services (game logic, scoring, team management)
3. API Controllers (REST; validation; DTO mapping)
4. SignalR Hubs (typed hubs, groups per game/table)
5. React Foundation (routing, state handling, API client)
6. UI Components (admin, player, presentation)

## Coding Standards

- C#
  - Use .NET 9, nullable enabled, async/await, cancellation tokens.
  - DTOs as record types.
  - Services depend on interfaces; register in DI with AddScoped/AddSingleton as appropriate.
  - Prefer minimal APIs or conventional controllers consistently; do not mix without reason.
  - EF Core: no lazy-loading; write explicit includes; use AsNoTracking for queries.
- TypeScript/React
  - Functional components with hooks; avoid class components.
  - Strong typing with TypeScript; define clear DTO types mirroring backend.
  - State: prefer local state + lightweight patterns; if adding libs, ask before adding.
  - Styling via Tailwind CSS (latest); keep components small, accessible, and responsive.
- Naming
  - C#: PascalCase for types/members; snake_case not allowed.
  - TS/JS: camelCase for vars/functions; PascalCase for components/types.
- Error Handling
  - Backend: problem-details responses for errors; log context-rich messages; never leak secrets.
  - Frontend: surface actionable user feedback; retry transient real-time issues.

## Domain Notes (Key Features)

- Players/teams join tables via QR code or short code.
- Event-themed categories (themeable per event); elegant, accessible UI.
- Pause/resume rounds or segments between event activities.
- Fullscreen presentation mode for hosts.

## API & Real-Time Guidelines

- REST
  - Consistent resource paths: /api/teams, /api/games/{id}/questions.
  - Use proper status codes; validation errors -> 400 with problem details.
  - Avoid over-fetching; add pagination for list endpoints if needed.
- SignalR
  - Strongly-typed hubs when possible.
  - Group by gameId and by tableId to scope updates.
  - Reconnect handling and idempotent message processing on client.

## Data & EF Core

- SQLite for dev and simple prod; keep migrations atomic and named (yyyyMMddHHmm_Description).
- Avoid N+1; prefer projection (Select) DTOs; keep transactions explicit for multi-step updates.
- On IIS, ensure the app pool identity has write access to the SQLite file/folder when needed.
- Seed minimal demo data behind a dev-only flag.

## UI & Theming

- Mobile-first layouts; large tap targets; readable at arm’s length.
- Tailwind: use a neutral, event-friendly palette; support theme tokens and high contrast.
- Presentation mode: fullscreen, large typography, animated but non-distracting transitions.

## Deployment

- Target Windows 10 IIS (ASP.NET Core Hosting Bundle, InProcess hosting).
- Publish framework-dependent unless self-contained is required; include web.config as needed.
- Use environment variables or appSettings with transforms; no secrets in source.
- Expose a health endpoint; enable structured logging (files/Event Log) appropriate for IIS.

## Security & Privacy

- No secrets or credentials in code, logs, or examples.
- Validate all input; rate-limit admin-sensitive operations if applicable.
- Keep tokens short-lived (e.g., for QR join flows) and scoped.

## Testing

- Backend: xUnit + FluentAssertions; unit-test services and critical controllers.
- Frontend: React Testing Library + Vitest/Jest; test critical flows (join, answer, score updates).
- Favor fast, deterministic tests; mock SignalR where possible.

## Do / Don’t (Absolute)

- Do focus on real-time performance, minimal allocations, and non-blocking I/O.
- Do keep changes small and composable; prefer incremental diffs.
- Do add input validation and error handling in all examples.
- Do ask before introducing new dependencies or moving away from the stack.
- Don’t introduce GraphQL, gRPC, or SSR frameworks without explicit approval.
- Don’t add heavy state managers unless asked (Redux, MobX, etc.).
- Don’t invent database schema or business rules if unspecified—ask first.

## Default Patterns to Suggest

- Controller signatures return ActionResult<T> with typed results.
- Map domain -> DTOs explicitly; don’t leak EF entities to API.
- Use CancellationToken in async methods.
- SignalR client with automatic reconnect and backoff.
- Tailwind components with aria-attributes and keyboard navigation.

## Example Contracts (Reference)

- C# DTOs (records)

```csharp
public sealed record CreateTeamRequest(string Name, string TableCode);
public sealed record TeamDto(Guid Id, string Name, string TableCode, int Score);
```

- Controller outline

```csharp
[ApiController]
[Route("api/[controller]")]
public sealed class TeamsController : ControllerBase
{
    private readonly ITeamService _teams;
    public TeamsController(ITeamService teams) => _teams = teams;

    [HttpPost]
    public async Task<ActionResult<TeamDto>> Create(CreateTeamRequest request, CancellationToken ct)
    {
        // validate, create, map to DTO, return 201 with location
    }
}
```

- SignalR hub outline

```csharp
public sealed class GameHub : Hub<IGameClient>
{
    public async Task JoinTable(Guid gameId, string tableCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"game:{gameId}");
        await Groups.AddToGroupAsync(Context.ConnectionId, $"table:{tableCode}");
    }
}
```

- React component shape

```tsx
function JoinTable() {
  // uses QR code payload or manual entry
  // calls POST /api/teams and then connects to SignalR
  return (
    <form className="p-4 flex flex-col gap-3">{/* inputs + submit */}</form>
  );
}
```

## Frontend Interaction Hints

- Prefer fetch or a thin API client; if suggesting React Query, ask first.
- Debounce inputs; optimistic UI when safe; reconcile with server events.
- Use CSS transitions for polished but subtle animations.

## Performance Notes

- Avoid polling; use SignalR for updates.
- Batch updates server-side where possible; throttle noisy events client-side.
- Use AsNoTracking for read-only queries and minimal JSON payloads.

## Review & PR Guidance

- Keep PRs focused; include brief rationale and test notes.
- Ensure API changes update TS types and client calls.
- Provide migration scripts alongside model changes.

## When Ambiguity Exists

- Ask targeted questions before making assumptions about domain rules, schema, or UX.
- Propose 1–2 minimal options with trade-offs when suggesting new patterns.

## Copilot Output Style

- Provide complete, compilable snippets.
- Include necessary imports/usings and minimal wiring.
- Keep comments actionable; avoid verbose narration.
