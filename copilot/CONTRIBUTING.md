# Contributing — TriviaSpark

Thank you for your interest in contributing! This guide keeps contributions consistent and fast.

*Original project by Mark Hazleton - [https://markhazleton.com](https://markhazleton.com)*

## Quick Start

- Fork the repo and create a feature branch.
- Keep PRs focused and small; include a brief rationale and test notes.
- Use conventional commits if possible (feat:, fix:, docs:, chore:, refactor:).

## Development Environment

- Cross-platform development (Windows, macOS, Linux) with VS Code recommended
- Node.js 22+ (18+ supported), npm
- Frontend: React 19 + TypeScript 5 + Vite 7 + Tailwind CSS 4 + shadcn/ui
- Backend: ASP.NET Core 9 Web API + Entity Framework Core + SQLite + Serilog
- Database: SQLite at `C:\websites\TriviaSpark\trivia.db` (production path)

## Workflow

1. Open an issue or discuss in a PR draft.
2. Follow repository Copilot instructions in `.github/copilot-instructions.md`. For the single-origin SPA + API blueprint, see `copilot/ApplicationStarter.md`.
3. Build and validate locally (build, lint/typecheck, unit tests).
4. Defer runtime/manual testing to maintainers when requested.
5. Submit PR with:

- What/why summary
- Testing notes (what you validated)
- Screenshots or short clips for UI changes (optional)

## Code Quality Standards

### Before Every PR

```bash
# Frontend: lint + format + test
npm run lint          # Zero errors required (no-console enforced)
npm run format:check  # Verify formatting
npm test              # Run Vitest tests

# Backend: build + test
dotnet build ./TriviaSpark.Api/TriviaSpark.Api.csproj
dotnet test
```

### Frontend Rules

- **No `console.log`** — enforced by ESLint `no-console: error`. Use toast notifications for user feedback.
- **TypeScript strict mode** — no implicit any, proper return types.
- **ESLint v10 flat config** — `eslint.config.js` at repo root.
- **Prettier formatting** — printWidth: 100, singleQuote, semi, trailingComma: es5.

### Backend Rules

- **XML documentation** — all public classes, interfaces, and methods in `Services/` and `Controllers/` must have `<summary>` XML docs.
- **EF Core** — use LINQ, avoid raw SQL. Type-safe database operations.
- **Serilog logging** — use `ILoggingService` for structured logging, never `Console.WriteLine`.
- **Production database path** — always `C:\websites\TriviaSpark\trivia.db`, never `./data/trivia.db`.

## Code Style

- Backend: ASP.NET Core 9 + C# + EF Core + SQLite + Serilog
  - Type-safe database operations with Entity Framework Core
  - Proper error handling with HTTP status codes
  - Session-based authentication with secure cookies
  - SignalR hubs for real-time features (when enabled)
- Frontend: React 19 + TypeScript 5 + Vite 7 + Tailwind CSS 4 + shadcn/ui
  - Functional components; strong typing; TS strict mode
  - TanStack Query for server state management
  - Small, accessible components; mobile-first design

## File Organization

- **Development scripts** → `tools/`
- **HTTP test files** → `tests/http/` (ALL `.http` files)
- **Backend tests** → `tests/TriviaSpark.Tests/`
- **Frontend tests** → `client/src/**/*.test.tsx`
- **Documentation** → `copilot/`
- **Temporary files** → `temp/` (gitignored)

## Tests

- Frontend: Vitest + React Testing Library for component testing
- Backend: MSTest with EF Core InMemory for service/integration testing
- HTTP tests: `tests/http/` with VS Code REST Client extension

## Docs

- New docs go in `/copilot`. Root `README.md` and `.github/copilot-instructions.md` are exceptions.

## License

- By contributing, you agree your contributions are licensed under the project license in `LICENSE`.
