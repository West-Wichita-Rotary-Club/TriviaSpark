# Development — TriviaSpark

This document describes local development setup and the validate-before-PR workflow.

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn package manager  
- VS Code (recommended) or any preferred IDE
- Git for version control

### Versions policy

- Prefer latest stable versions (npm packages). If there's a need to use an older version, document the reason and confirm first.

## First-time setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env`
4. Configure environment variables as needed (SQLite works out of the box)
5. Initialize database: `npm run db:push` (optional - auto-created on first run)

## Build and validate

- Backend
  - Build with TypeScript: `npm run check`
  - Run development server: `npm run dev`
- Frontend  
  - Typecheck and lint built into development workflow
  - Build for production: `npm run build`
  - Build static demo: `npm run build:static`

The agent is responsible for build, lint/typecheck, and code quality after changes. Runtime/manual testing and integration testing should be validated by the user. Provide clear, copyable commands when relevant.

## Conventions

- Follow `.github/copilot-instructions.md` for architecture, coding standards, and patterns.
- All new docs should live under `/copilot` unless otherwise specified.
- Commit messages: concise and descriptive (conventional commits preferred).

## Troubleshooting tips

- Ensure Node.js version is 18+ for ESM module support
- If database issues occur, delete `./data/trivia.db` and restart to recreate
- For WebSocket connection issues, check firewall settings and port availability

---

## Express.js + React Development Workflow

This repo uses Express.js with TypeScript for the backend and React with Vite for the frontend, combined into a single-origin application.

### Development modes

- **Full development (recommended)**:
  - Run `npm run dev` to start Express server with integrated Vite dev server
  - Hot reload for both frontend and backend changes
  - WebSocket connections and database persistence
  - Available at `http://localhost:5000`

- **Static demo build**:
  - Run `npm run build:static` to create GitHub Pages compatible build
  - Outputs to `./docs/` directory
  - Contains embedded demo data, no backend required

### Project structure

- `client/` - React + TypeScript frontend with Vite
- `server/` - Express.js + TypeScript backend  
- `shared/` - Shared TypeScript types and database schema
- `scripts/` - Build and database utility scripts
- `data/` - SQLite database file location

### Build processes

1) **Development build**:
   - `npm run dev` - Starts development server with hot reload

2) **Production build**:
   - `npm run build` - Builds both client and server for deployment

3) **Static demo build**:
   - `npm run build:static` - Creates static site for GitHub Pages

### Verification checklist

- Health endpoint responds: `http://localhost:5000/api/health`
- Frontend loads correctly at root URL: `http://localhost:5000`
- WebSocket connection established for real-time features
- Database operations work (create/read/update/delete events)
- Authentication flow functions (login/logout)

### Database & Storage

- **SQLite database**: `./data/trivia.db` (auto-created)
- **ORM**: Drizzle ORM with TypeScript integration
- **Migrations**: Schema changes via `npm run db:push`
- **Seeding**: `npm run seed` for sample data

### Environment Configuration

- `.env` file for local development settings
- `DATABASE_URL` - SQLite file path (default: `file:./data/trivia.db`)
- `OPENAI_API_KEY` - Optional for AI features
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

### Real-time Features

- **WebSocket server**: Integrated with Express.js on same port
- **Connection endpoint**: `ws://localhost:5000/ws`
- **Event-based messaging**: Updates by eventId for real-time features
- **Auto-reconnection**: Client-side reconnection logic included

### Quality gates

- **TypeScript**: Strict mode enabled with full type checking
- **Linting**: ESLint configuration for code quality
- **Testing**: React Testing Library + Vitest for frontend
- **Build verification**: All builds must complete without errors
