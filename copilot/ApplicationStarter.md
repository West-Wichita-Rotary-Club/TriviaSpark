# Application Starter: Express.js + React TypeScript SPA Blueprint

This document provides a clear blueprint for understanding and reproducing the TriviaSpark architecture. It describes the Express.js + React + TypeScript stack from an agent's perspective and provides a step-by-step playbook to scaffold, implement, and validate a unified single-server SPA + API system.

*Based on TriviaSpark by Mark Hazleton - [https://markhazleton.com](https://markhazleton.com)*

## Scope

- Audience: autonomous or semi-autonomous coding agents and engineers
- Goal: build a production-ready, single-origin app where a React TypeScript SPA is served by Express.js alongside REST/WebSocket APIs
- Technology: Express.js + TypeScript (ESM) + React + SQLite + Drizzle ORM

---

## System Architecture (High-Level)

- Pattern: single-server deployment serving both static SPA assets and REST/WebSocket API
- Client: React 19 + TypeScript 5, Vite 7 build, Tailwind 3, shadcn/ui (Radix primitives), Wouter routing, TanStack Query for server state, React Hook Form + Zod validation
- Server: Express.js + TypeScript (ESM), WebSocket, SQLite + Drizzle ORM, session-based authentication, OpenAI integration
- Output: client build artifacts served by Express.js; SPA and API endpoints from same origin

### ASCII Overview

```text
┌──────────────────────────────────────────────────────────────────┐
│                        Single-Origin Server                       │
│                                                                  │
│  Express.js + TypeScript (ESM) + WebSocket                       │
│  ├─ API Routes ─ Services ─ Data (Drizzle ORM + SQLite)          │
│  ├─ Static hosting (Vite integration)                            │
│  ├─ WebSocket server (real-time features)                        │
│  └─ SPA fallback → index.html                                     │
│                                                                  │
│  Frontend Assets:                                                 │
│  └─ React + TS SPA (Vite build)                                  │
│     ├─ Routing (Wouter)                                          │
│     ├─ Server state (TanStack Query)                             │
│     ├─ Forms (RHF + Zod)                                         │
│     └─ UI: Tailwind + shadcn/ui (Radix)                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture (Agent View)

- **Stack**: React 19, TypeScript 5, Vite 7, Tailwind 3, shadcn/ui (Radix), TanStack Query, React Hook Form, Zod, Wouter routing, Framer Motion
- **Structure**:
  - `client/src/components`: Reusable UI components
  - `client/src/components/ui`: shadcn/ui generated primitives
  - `client/src/contexts`: React Context providers (WebSocket, auth)
  - `client/src/hooks`: Custom hooks (useWebSocket, useAuth)
  - `client/src/lib`: API config, query client, utils
  - `client/src/pages`: Route components
  - `client/src/data`: Static demo data for GitHub Pages builds
- **Path aliases**:
  - `@/*` → `client/src/*`
  - `@shared/*` → `shared/*`
- **Data flow**:
  - TanStack Query for server state management
  - WebSocket context for real-time updates
  - RHF + Zod schema validation for forms
- **Theming/UI**:
  - Tailwind CSS with custom wine-themed color scheme
  - shadcn/ui for accessible, consistent components

---

## Backend Architecture (Agent View)

- **Stack**: Express.js + TypeScript (ESM), WebSocket, SQLite + Drizzle ORM, session-based auth, OpenAI integration
- **Structure**:
  - `server/index.ts`: Main server entry point
  - `server/routes.ts`: API route definitions
  - `server/storage.ts`: Data access layer
  - `server/websocket.ts`: WebSocket server implementation
  - `server/openai.ts`: AI integration services
  - `shared/schema.ts`: Database schema with Drizzle ORM
- **Persistence**:
  - SQLite database with Drizzle ORM for type safety
  - Schema-first approach with Zod validation
- **API conventions**:
  - RESTful routes with proper HTTP status codes
  - JSON responses with structured error handling
  - Session-based authentication with HTTP-only cookies
- **Real-time features**:
  - WebSocket server for live updates
  - Event-based messaging by eventId

---

## Build, Dev, and Deployment Workflow

- **Development**: Single command `npm run dev` starts Express server with integrated Vite dev server
- **Production build**: `npm run build` creates optimized client and server builds
- **Static build**: `npm run build:static` creates GitHub Pages compatible static site
- **Database**: Auto-created SQLite file, seeded with sample data

---

## Agent Execution Playbook (Step-by-Step)

### 1) Repository Scaffold

- Create monorepo layout:
  - `client/` for React SPA source
  - `server/` for Express.js API
  - `shared/` for TypeScript types and database schema
  - `scripts/` for build and database utilities
  - `copilot/` for documentation
- Initialize npm workspace with TypeScript configuration

### 2) Frontend Setup

- Scaffold React + TypeScript via Vite
- Install and configure:
  - Tailwind CSS with custom wine theme
  - shadcn/ui components (New York style)
  - TanStack Query for server state
  - React Hook Form + Zod for forms
  - Wouter for lightweight routing
  - Framer Motion for animations
- Configure path aliases in `vite.config.ts` and `tsconfig.json`
- Create base structure with components, pages, hooks, contexts

### 3) Backend Setup

- Create Express.js server with TypeScript (ESM)
- Install and configure:
  - Drizzle ORM with SQLite
  - WebSocket server integration
  - Session management with cookies
  - OpenAI API integration (optional)
- Implement database schema in `shared/schema.ts`
- Create API routes with proper error handling
- Add health endpoint and development logging

### 4) Database & ORM Integration

- Define database schema using Drizzle ORM
- Implement type-safe database operations
- Create database seeding scripts
- Add migration support with `drizzle-kit`

### 5) Real-time Features

- Implement WebSocket server alongside Express
- Create event-based messaging system
- Add client-side WebSocket context and hooks
- Implement reconnection logic

### 6) Client↔API Integration

- Create centralized API service layer
- Wrap endpoints with TanStack Query hooks
- Implement optimistic updates for real-time features
- Add proper error handling and loading states

### 7) Authentication System

- Implement session-based authentication
- Create secure cookie management
- Add protected route guards
- Implement user context and hooks

### 8) UI System & Theming

- Configure Tailwind with wine-themed colors
- Implement shadcn/ui component system
- Create responsive, mobile-first layouts
- Add dark/light theme support

### 9) Testing & Quality Gates

- Add TypeScript strict mode configuration
- Implement component testing with React Testing Library
- Create API endpoint tests
- Add WebSocket connection testing

### 10) Deployment Configuration

- Configure dual build modes (full vs static)
- Add environment variable management
- Implement GitHub Pages deployment
- Add Node.js hosting configuration

---

## Key File Structure

```
TriviaSpark/
├── client/
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route components  
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utilities
│   │   └── data/          # Static demo data
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── server/
│   ├── index.ts           # Main server
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data layer
│   ├── websocket.ts       # WebSocket server
│   └── openai.ts          # AI integration
├── shared/
│   └── schema.ts          # Database schema
├── scripts/
│   ├── seed-database.mjs  # Database seeding
│   └── extract-data.mjs   # Static build data
└── package.json           # Dependencies & scripts
```

---

## Success Criteria

**Development Mode:**

- `npm run dev` starts server on port 5000
- Frontend hot reload works
- WebSocket connections establish
- Database operations function
- Authentication flow works

**Production Build:**

- `npm run build` completes without errors
- Client and server builds are optimized
- Health endpoint responds
- Deep linking works with SPA fallback

**Static Build:**

- `npm run build:static` creates GitHub Pages build
- Demo data embedded correctly
- Static assets load properly
- Responsive design works

---

## Common Patterns & Solutions

**WebSocket Integration:**

```typescript
// Server-side event broadcasting
wsManager.broadcast(eventId, {
  type: "SCORE_UPDATE",
  payload: { teamId, score, timestamp: Date.now() }
});

// Client-side event handling
const { sendMessage, lastMessage } = useWebSocket();
```

**Database Operations:**

```typescript
// Type-safe database queries with Drizzle
const events = await db.select().from(eventsTable)
  .where(eq(eventsTable.hostId, userId));
```

**API Error Handling:**

```typescript
// Consistent error responses
res.status(404).json({ 
  error: "Event not found",
  code: "EVENT_NOT_FOUND"
});
```

---

## Quality Gates Checklist

- ✅ TypeScript builds without errors (strict mode)
- ✅ All API endpoints respond correctly
- ✅ WebSocket connections establish
- ✅ Database operations work
- ✅ Authentication system functions
- ✅ Frontend components render properly
- ✅ Mobile responsiveness verified
- ✅ Static build generates correctly

This blueprint provides the foundation for creating a robust, real-time trivia platform with modern web technologies.
