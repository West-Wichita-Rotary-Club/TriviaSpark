# Server Directory Audit

## Overview

The `server/` directory at the repository root contains legacy Node.js/Express backend code.

## Contents

| File | Purpose |
|------|---------|
| `index.ts` | Express server entry point |
| `routes.ts` | API route definitions |
| `storage.ts` | Data storage interface |
| `database-storage.ts` | Database storage implementation |
| `db.ts` | Database connection/setup |
| `openai.ts` | OpenAI integration |
| `websocket.ts` | WebSocket handling |
| `vite.ts` | Vite dev server integration |
| `README.md` | States the directory is archived |

## Status

- **README.md** explicitly states: "The legacy Node/Express backend has been archived."
- **No imports** from `client/src/` reference any `server/` files.
- **Current backend** is `TriviaSpark.Api/` (ASP.NET Core + SignalR).
- The `archive/server/` directory already exists as a preserved copy.

## Recommendation

The `server/` directory is **inactive archived code**. It has been superseded by `TriviaSpark.Api/` and already has a copy in `archive/server/`. See `copilot/server-directory-decision.md` for the disposition decision.
