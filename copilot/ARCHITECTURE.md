# Architecture — TriviaSpark

High-level system overview for the Event Trivia Application.

## Overview

- Real-time event trivia: admin, player, and presentation UIs
- Backend: ASP.NET Core 9 + EF Core + SignalR + SQLite
- Frontend: React 18 + TypeScript + Tailwind CSS (latest) + SignalR client
- Dev: Windows 11 (VS Code/Visual Studio)
- Deploy: Windows 10 IIS (Hosting Bundle)

## Core principles

- Backend first; API-driven
- Real-time via SignalR; groups per gameId and tableId
- Mobile-first UI; accessibility and performance
- DTOs only over the wire; ProblemDetails for errors

## Data model (brief)

- Game, Round, Question, Team, Submission
- Relationships: Game -> Rounds -> Questions; Team -> Submissions; Game <-> Teams

## Key flows

1. Join flow
   - Player scans QR or enters short code; server validates and issues short-lived token; client joins SignalR groups
2. Answer submission
   - Player submits; server validates, stores, and emits updates to game/table groups
3. Scoring and presentation
   - Admin scores; presentation updates in real-time

## Performance & reliability

- No EF lazy loading; AsNoTracking for reads; projection to DTOs
- Idempotent real-time handlers; client auto-reconnect
- Explicit transactions for multi-step updates

## Security

- Validate all inputs
- Short-lived scoped tokens for join flows
- No secrets in source or logs; structured logging without PII

## Testing strategy

- Backend: xUnit + FluentAssertions (services and critical controllers)
- Frontend: RTL + Vitest/Jest (join, answer, score updates)
- Mock SignalR where possible
