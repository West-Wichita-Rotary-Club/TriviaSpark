# Contributing — TriviaSpark

Thank you for your interest in contributing! This guide keeps contributions consistent and fast.

## Quick Start

- Fork the repo and create a feature branch.
- Keep PRs focused and small; include a brief rationale and test notes.
- Use conventional commits if possible (feat:, fix:, docs:, chore:, refactor:).

## Development Environment

- Windows 11 with VS Code or Visual Studio.
- .NET 9 SDK, Node.js LTS, pnpm or npm, latest Tailwind CSS.
- SQLite for local development.

## Workflow

1) Open an issue or discuss in a PR draft.
2) Follow repository Copilot instructions in `.github/copilot-instructions.md`.
3) Build and validate locally (build, lint/typecheck, unit tests).
4) Defer runtime/manual testing to maintainers when requested.
5) Submit PR with:
   - What/why summary
   - Testing notes (what you validated)
   - Screenshots or short clips for UI changes (optional)

## Code Style

- Backend: ASP.NET Core 9, EF Core, SignalR, SQLite
  - DTOs as record types; no EF entities in APIs
  - AsNoTracking for read queries; avoid N+1
  - CancellationToken in async methods
- Frontend: React 18 + TypeScript + Tailwind (latest)
  - Functional components; strong typing
  - Small, accessible components; mobile-first

## Tests

- Backend: xUnit + FluentAssertions
- Frontend: React Testing Library + Vitest/Jest
- Mock SignalR in unit tests; keep tests fast and deterministic

## Docs

- New docs go in `/copilot`. Root `README.md` and `.github/copilot-instructions.md` are exceptions.

## License

- By contributing, you agree your contributions are licensed under the project license in `LICENSE`.
