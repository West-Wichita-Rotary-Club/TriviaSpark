# Contributing — TriviaSpark

Thank you for your interest in contributing! This guide keeps contributions consistent and fast.

## Quick Start

- Fork the repo and create a feature branch.
- Keep PRs focused and small; include a brief rationale and test notes.
- Use conventional commits if possible (feat:, fix:, docs:, chore:, refactor:).

## Development Environment

- Cross-platform development (Windows, macOS, Linux) with VS Code recommended
- Node.js 18+ LTS, npm or yarn
- Frontend: React 19 + TypeScript 5 + Vite 7 + Tailwind 3 + shadcn/ui
- Backend: Express.js + TypeScript (ESM) + WebSocket + Drizzle ORM
- SQLite for local development

## Workflow

1. Open an issue or discuss in a PR draft.
2. Follow repository Copilot instructions in `.github/copilot-instructions.md`. For the single-origin SPA + API blueprint, see `copilot/ApplicationStarter.md`.
3. Build and validate locally (build, lint/typecheck, unit tests).
4. Defer runtime/manual testing to maintainers when requested.
5. Submit PR with:

- What/why summary
- Testing notes (what you validated)
- Screenshots or short clips for UI changes (optional)

## Code Style

- Backend: Express.js + TypeScript (ESM) + WebSocket + SQLite + Drizzle ORM
  - Type-safe database operations with Drizzle ORM
  - Proper error handling with HTTP status codes
  - Session-based authentication with secure cookies
  - WebSocket connections for real-time features
- Frontend: React 19 + TypeScript 5 + Vite 7 + Tailwind 3 + shadcn/ui
  - Functional components; strong typing; TS strict mode
  - TanStack Query for server state management
  - Small, accessible components; mobile-first design

## Tests

- Backend: Unit tests for API endpoints and services
- Frontend: React Testing Library + Vitest for component testing
- WebSocket connection testing for real-time features

## Docs

- New docs go in `/copilot`. Root `README.md` and `.github/copilot-instructions.md` are exceptions.

## License

- By contributing, you agree your contributions are licensed under the project license in `LICENSE`.
