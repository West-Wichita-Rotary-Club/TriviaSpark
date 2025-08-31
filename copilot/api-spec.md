# TriviaSpark API Specification

Last updated: 2025-08-30

This document specifies the TriviaSpark backend API implemented in ASP.NET Core (see `TriviaSpark.Api/*`). It covers REST endpoints, authentication, core data models, and SignalR events.

## Overview

- Base URL: <http://localhost:5000>
- API prefix: `/api`
- Formats: JSON request/response
- CORS: Enabled for all origins on `/api/*` with credentials allowed
- Authentication:
  - Host/admin: Session cookie `sessionId`
  - Participant: Cookie `participantToken`
- Error format: `{ error: string, details?: any }`

## Core Models (conceptual)

Types align with `shared/schema.ts` (Drizzle ORM). Fields omitted below still exist in the DB; only the most relevant are listed.

- User: `{ id, username, email, password, fullName, createdAt }`
- Event: `{ id, title, description?, hostId, eventType, maxParticipants, difficulty, status, qrCode?, eventDate?, eventTime?, location?, sponsoringOrganization?, branding..., settings (JSON string), createdAt, startedAt?, completedAt? }`
- Question: `{ id, eventId, type, question, options (JSON string), correctAnswer, explanation?, points, timeLimit, difficulty, category?, backgroundImageUrl?, aiGenerated, orderIndex, createdAt }`
- Team: `{ id, eventId, name, tableNumber?, maxMembers, createdAt }`
- Participant: `{ id, eventId, teamId?, name, participantToken, joinedAt, lastActiveAt, isActive, canSwitchTeam }`
- Response: `{ id, participantId, questionId, answer, isCorrect, points, responseTime?, timeRemaining?, submittedAt }`
- FunFact: `{ id, eventId, title, content, orderIndex, isActive, createdAt }`

Notes:

- In API requests, question `options` are arrays; the server serializes to JSON for storage.

## Authentication

### POST /api/auth/login

- Body: `{ username: string, password: string }`
- Sets cookie: `sessionId`
- Response: `{ user: { id, username, email, fullName } }`
- Codes: 200, 400, 401, 500

### POST /api/auth/logout

- Clears `sessionId` cookie
- Response: `{ success: true }`
- Codes: 200

### GET /api/auth/me

- Auth: Host session cookie
- Response: `{ user: { id, username, email, fullName, createdAt } }`
- Codes: 200, 401, 404, 500

### PUT /api/auth/profile

- Auth: Host session cookie
- Body: `{ fullName: string, email: string, username: string }`
- Response: `{ user: { id, username, email, fullName, createdAt } }`
- Codes: 200, 401, 404, 500

## Dashboard

### GET /api/dashboard/stats

- Auth: Host session cookie
- Response: `{ totalEvents, totalParticipants, totalQuestions, averageRating }`
- Codes: 200, 401, 500

### GET /api/dashboard/insights

- Auth: Host session cookie
- Response: `{ insights: string[] }` (falls back to canned insights if OpenAI not configured)
- Codes: 200, 401, 500

## Events (host)

### GET /api/events

- Auth: Host session cookie
- Response: `Event[]`
- Codes: 200, 401, 500

### GET /api/events/active

- Auth: Host session cookie
- Response: `Event[]`
- Codes: 200, 401, 500

### POST /api/events

- Auth: Host session cookie
- Body: InsertEvent (hostId is overridden from session)
- Response: `Event`
- Codes: 201, 400, 401, 500

### POST /api/events/generate

- Auth: Host session cookie
- Body: `EventGenerationRequest`
- Behavior: Uses OpenAI to generate event + questions; creates both
- Response: `{ event: Event, questions: Question[] }`
- Codes: 201, 400, 401, 500

### GET /api/events/:id

- Auth: Host session cookie; demo bypass for ids starting with `seed-event-`
- Response: `Event`
- Codes: 200, 401, 403, 404, 500

### PUT /api/events/:id

- Auth: Host session cookie; must own event
- Body: Partial Event
- Response: `Event`
- Codes: 200, 401, 403, 404, 500

### PATCH /api/events/:id/status

- Auth: Host session cookie; must own event
- Body: `{ status: 'draft' | 'active' | 'completed' | 'cancelled' }`
- Response: `Event`
- Codes: 200, 400, 401, 403, 404, 500

### POST /api/events/:id/start

- Auth: Host session cookie; must own event
- Behavior: Sets status to `active` and locks team switching
- Response: `Event`
- Codes: 200, 401, 403, 404, 500

### DELETE /api/events/:id/participants/inactive

- Auth: Host session cookie; must own event
- Query: `inactiveThresholdMinutes` (default 30)
- Response: `{ message, removedCount, thresholdMinutes, remainingParticipants }`
- Codes: 200, 401, 403, 500

## Questions (host)

### GET /api/events/:id/questions

- Auth: Host session cookie; demo bypass for `seed-event-*`
- Response: `Question[]`
- Codes: 200, 401, 403, 404, 500

### POST /api/questions/generate

- Auth: None enforced
- Body: `QuestionGenerationRequest`
- Behavior: Generates questions with OpenAI, avoids duplicates, stores them
- Response: `{ questions: Question[] }`
- Codes: 200, 400, 404, 500

### POST /api/questions/bulk

- Auth: Host session cookie; must own event
- Body: `BulkQuestionRequest`
- Response: `{ message: string, questions: Question[] }`
- Codes: 201, 400, 401, 403, 500

### PUT /api/events/:id/questions/reorder

- Auth: Host session cookie; must own event
- Body: `{ questionOrder: string[] }`
- Response: `{ message: string, questions: Question[] }`
- Codes: 200, 401, 403, 500

### PUT /api/questions/:id

- Auth: Host session cookie; must own event containing the question
- Body: `UpdateQuestionRequest`
- Response: `Question`
- Codes: 200, 401, 403, 404, 500

### DELETE /api/questions/:id

- Auth: Host session cookie; must own event containing the question
- Response: 204 No Content
- Codes: 204, 401, 403, 404, 500

## Teams

### GET /api/events/:id/teams

- Auth: Host session cookie; must own event
- Response: `Array<Team & { participantCount: number, participants: Participant[] }>`
- Codes: 200, 401, 403, 404, 500

### POST /api/events/:id/teams

- Auth: Host session cookie; must own event
- Body: `{ name: string, tableNumber?: number }`
- Response: `Team`
- Codes: 201, 400 (duplicate), 401, 403, 404, 500

### GET /api/events/:qrCode/teams-public

- Auth: Public
- Param: `qrCode`
- Response: `Array<Team & { participantCount: number }>`
- Codes: 200, 404, 500

## Participants

### GET /api/events/:id/participants

- Auth: Host session cookie; must own event
- Response: `Participant[]`
- Codes: 200, 401, 403, 404, 500

### GET /api/events/join/:qrCode/check

- Auth: Participant cookie `participantToken`
- Response: `{ participant, team?, event: { id, title, description, status }, returning: true }`
- Codes: 200, 404

### POST /api/events/join/:qrCode

- Auth: Public; sets participant cookie on success
- Body: `{ name: string, teamAction?: 'join'|'create', teamIdentifier?: string }`
- Behavior: Join existing team or create a new team for the event matched by QR code
- Response: `{ participant, team?, event: { id, title, description, status }, returning: false }`
- Codes: 201, 400, 404, 500

### PUT /api/participants/:id/team

- Auth: Participant cookie `participantToken` for the same participant id
- Body: `{ teamId: string | null }`
- Behavior: Switch team if `canSwitchTeam` is true
- Response: `Participant`
- Codes: 200, 400, 401, 403, 500

## Responses (answers)

### POST /api/responses

- Auth: Public (participant identity is in body)
- Body: `{ participantId: string, questionId: string, answer: string, responseTime?: number, timeRemaining?: number }`
- Behavior: Validates against question; assigns tiered points by time remaining
- Response: `Response`
- Codes: 201, 400, 404, 500

## Fun Facts

### GET /api/events/:id/fun-facts

- Auth: Host session cookie; demo bypass for `seed-event-*`
- Response: `FunFact[]`
- Codes: 200, 401, 403, 404, 500

### POST /api/events/:id/fun-facts

- Auth: Host session cookie; must own event
- Body: InsertFunFact (eventId from route)
- Response: `FunFact`
- Codes: 201, 400, 401, 403, 404, 500

### PUT /api/fun-facts/:id

- Auth: Host session cookie; must own event containing the fun fact
- Body: Partial FunFact
- Response: `FunFact`
- Codes: 200, 401, 403, 404, 500

### DELETE /api/fun-facts/:id

- Auth: Host session cookie; must own event containing the fun fact
- Response: 204 No Content
- Codes: 204, 401, 403, 404, 500

## Analytics and Leaderboards

### GET /api/events/:id/analytics

- Auth: Host session cookie; must own event
- Response:
  - `event`: `{ id, title, status, participantCount, teamCount, questionCount }`
  - `performance`: `{ totalResponses, correctResponses, overallAccuracy, totalPoints, averagePointsPerResponse }`
  - `questionPerformance[]`: `{ id, question, totalResponses, correctResponses, accuracy, averagePoints, difficulty }`
  - `teamPerformance[]`: `{ id, name, participantCount, totalPoints, totalResponses, averagePointsPerParticipant }`
- Codes: 200, 401, 403, 500

### GET /api/events/:id/leaderboard

- Auth: Host session cookie; must own event
- Query: `type=teams|participants` (default `teams`)
- Response (teams): `{ type: 'teams', leaderboard: Array<{ rank, team: { id, name, tableNumber? }, participantCount, totalPoints, totalResponses, correctResponses, accuracy, averagePointsPerParticipant }> }`
- Response (participants): `{ type: 'participants', leaderboard: Array<{ rank, participant: { id, name }, team?: { id, name }, totalPoints, totalResponses, correctResponses, accuracy }> }`
- Codes: 200, 401, 403, 500

### GET /api/events/:id/responses/summary

- Auth: Host session cookie; must own event
- Response: `{ eventId: string, summary: Array<{ question: { id, text, correctAnswer, type, difficulty, orderIndex }, responses: { total, correct, incorrect, accuracy }, scoring: { totalPoints, averagePoints, maxPossiblePoints }, timing: { fastestResponseTime?, slowestResponseTime?, averageResponseTime? }, answerDistribution: Record<string, number> }> }`
- Codes: 200, 401, 403, 500

## AI Event Copy

### POST /api/events/:id/generate-copy

- Auth: None enforced
- Body: `{ type: 'promotional' | 'welcome' | 'thankyou' | 'rules' | string }`
- Response: `{ type, copy: string, eventId }`
- Codes: 200, 400, 404, 500

## Utility

### GET /api/debug/cookies

- Auth: None
- Response: `{ rawCookies, parsedCookies, sessionCount, availableSessions }`
- Codes: 200

## WebSocket API

- URL: `ws://localhost:5000/ws`
- Query params: `?eventId=<id>&role=host|participant&userId=<hostUserId>`
- Message envelope: `{ type: string, eventId?: string, data?: any, timestamp?: number }`

### Client → Server message types

- `join_event` `{ eventId, data: { participantId? } }` — subscribe to event updates
- `participant_answer` `{ data: { questionId, selectedAnswer } }` — live selection (not final)
- `lock_answer` `{ data: { questionId, selectedAnswer, timeRemaining } }` — finalizes answer; server computes correctness/points and broadcasts
- `next_question` (host) `{ data: { questionIndex, question, timeLimit } }` — start next question
- `timer_update` (host) `{ data: { timeLeft, finalCountdown } }` — broadcast timer
- `event_status_change` (host) `{ data: { status, message? } }`

### Server → Client broadcasts

- `connection_confirmed` `{ data: { eventId, role } }`
- `participant_joined` `{ data: { participantId?, participantCount } }`
- `answer_selected` `{ data: { participantId?, questionId, selectedAnswer, isLocked: false } }`
- `answer_locked` `{ data: { participantId?, questionId, selectedAnswer, score, timeRemaining, isCorrect } }`
- `question_started` `{ data: { questionIndex, question, timeLimit } }`
- `timer_update` `{ data: { timeLeft, finalCountdown } }`
- `event_status_changed` `{ data: { status, message? } }`
- `participant_left` `{ data: { participantId?, participantCount } }`

Scoring: Max 20 points if correct with ≥20s remaining, then 15/10/5/1 for ≥15/≥10/≥5/1–4s respectively.

## Notes & Caveats

- Demo access: Event IDs starting with `seed-event-` bypass host auth for select read endpoints.
- QR join and teams-public endpoints currently resolve events via a fixed demo host id; this is a known limitation and may change to direct QR lookup.
- Team switching is locked automatically when an event is started.
- Question `options` are arrays in requests but stored as JSON strings in the DB.
