# Architecture — TriviaSpark

High-level system overview for the Event Trivia Application.

*Designed and developed by Mark Hazleton - [https://markhazleton.com](https://markhazleton.com)*

## Overview

- Real-time event trivia: admin, player, and presentation UIs
- Backend: ASP.NET Core 9 Web API (C#) + SignalR + SQLite (Dapper)
- Frontend: React 19 + TypeScript 5 + Vite 7 + Tailwind 3 + shadcn/ui + TanStack Query
- Dev: Cross-platform (VS Code recommended)
- Deploy: ASP.NET Core hosting (IIS, Linux systemd, Docker, Azure App Service) or GitHub Pages (static demo)

### Hosting model

- Single-origin SPA + API: the SPA is built via Vite and served by ASP.NET Core alongside REST/SignalR endpoints
- SPA fallback to `index.html` ensures deep links work
- Dual deployment modes: Full-featured (with database) or Static demo (GitHub Pages)

## Core principles

- Backend first; API-driven with ASP.NET Core minimal APIs
- Real-time via SignalR; event-based updates per eventId
- Mobile-first UI; accessibility and performance optimized
- JSON APIs only; structured error responses with proper HTTP status codes

## Data model (brief)

- User, Event, Question, Team, Participant, Response, Session
- Relationships: Event -> Questions; Team -> Participants -> Responses; Event <-> Teams
- SQLite; Dapper in the API for data access. Drizzle used in scripts and shared types for FE.

## Key flows

1. Authentication flow
   - User login with session management; server validates and creates session cookies
2. Event creation and management  
   - Host creates event; configures settings, questions, and branding
3. Participant joining
   - Participant scans QR or enters event code; joins via WebSocket connection
4. Question flow
   - Host presents questions; participants submit answers in real-time
5. Scoring and results
   - Real-time score updates via WebSocket; live leaderboards

## Performance & reliability

- Dapper-based queries with prepared statements where relevant
- SignalR connection management with automatic reconnection on the client
- Session-based authentication with secure cookie management
- Error boundaries and graceful degradation

## Security

- Input validation via DTOs and guards in API code; Zod is used on the frontend where applicable
- Session-based authentication with HTTP-only cookies
- No secrets in source code; environment variable configuration
- Rate limiting and request validation

## Testing strategy

- Backend: Unit tests for services and API endpoints
- Frontend: React Testing Library + Vitest for component testing
- Integration: WebSocket connection and real-time feature testing
- E2E: Complete trivia event workflows
