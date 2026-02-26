# TriviaSpark Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-25

## Active Technologies
- C# / .NET 10.0 LTS (upgrading from .NET 9.0), TypeScript 5.9 + ASP.NET Core 10.0, EF Core 10.0, Serilog 10.0, Swashbuckle 10.x, OpenAI 2.8, React 19.x, Vite 7.x (002-dotnet10-lts-upgrade)
- SQLite via EF Core (production path: `C:\websites\TriviaSpark\trivia.db`) — no schema changes (002-dotnet10-lts-upgrade)
- C# / .NET 10 (backend), TypeScript strict (frontend) + ASP.NET Core 10, Entity Framework Core + SQLite, React 19, Wouter, TanStack Query, shadcn/ui, Tailwind CSS, Zod + react-hook-form (003-admin-login-system)
- SQLite at `C:\websites\TriviaSpark\trivia.db` via `TriviaSparkDbContext` (003-admin-login-system)



## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

# Add commands for 

## Code Style

General: Follow standard conventions

## Recent Changes
- 003-admin-login-system: Added C# / .NET 10 (backend), TypeScript strict (frontend) + ASP.NET Core 10, Entity Framework Core + SQLite, React 19, Wouter, TanStack Query, shadcn/ui, Tailwind CSS, Zod + react-hook-form
- 002-dotnet10-lts-upgrade: Added C# / .NET 10.0 LTS (upgrading from .NET 9.0), TypeScript 5.9 + ASP.NET Core 10.0, EF Core 10.0, Serilog 10.0, Swashbuckle 10.x, OpenAI 2.8, React 19.x, Vite 7.x



<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
