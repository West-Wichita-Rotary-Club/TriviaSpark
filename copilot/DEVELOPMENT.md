# Development — TriviaSpark

This document describes local development setup and the validate-before-PR workflow.

## Prerequisites

- Windows 11
- VS Code or Visual Studio 2022+
- .NET SDK 9.x
- Node.js LTS (and pnpm or npm)
- SQLite

## First-time setup

1. Clone the repository.
2. Restore .NET and frontend dependencies.
3. Create a local appsettings.Development.json if needed (no secrets in source).

## Build and validate

- Backend
  - Build with .NET 9
  - Run unit tests with xUnit
- Frontend
  - Typecheck and lint
  - Run unit tests with Vitest/Jest

The agent is responsible for build, lint/typecheck, and unit tests after changes. Runtime/manual testing and long-running integration tests are deferred to the user. Provide clear, copyable commands when relevant.

## Conventions

- Follow `.github/copilot-instructions.md` for architecture, coding standards, and patterns.
- All new docs should live under `/copilot` unless otherwise specified.
- Commit messages: concise and descriptive (conventional commits preferred).

## Troubleshooting tips

- Ensure the ASP.NET Core Hosting Bundle is installed on the Windows 10 IIS target for deployment.
- If using SQLite with IIS, ensure the app pool identity has write access to the database path.
