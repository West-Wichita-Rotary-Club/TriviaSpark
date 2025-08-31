# TriviaSpark Deployment Guide

## Overview

TriviaSpark supports two deployment modes:

1. Local Development — Full-featured ASP.NET Core API + SPA with persistent SQLite
2. GitHub Pages — Static site deployment (read-only demo)

## Local Development (Read-Write)

### Features

- Full backend server with ASP.NET Core Web API + SignalR
- SQLite database with persistent storage
- Real-time updates via SignalR
- CRUD operations (Create, Read, Update, Delete)
- Optional AI-powered content generation
- User authentication via secure cookies

### Setup

```powershell
# Install dependencies (frontend/scripts)
npm install

# (Optional) Set up environment for scripts
# copy .env.example to .env and edit as needed

# Start the ASP.NET Core API (builds SPA into wwwroot during build)
dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj
```

### Database

- Location: ./data/trivia.db (SQLite file)
- Persistence: Data persists between server restarts
- Migrations/Schema: Repo includes scripts and seed utilities; optional
- Backup: Copy the .db file

### Environment Variables (optional)

```bash
DATABASE_URL=file:./data/trivia.db
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
PORT=5000
```

## GitHub Pages (Read-Only Static)

### Demo Features

- Frontend React application
- Static demo content (no backend)
- Responsive design
- No database, no persistence, no auth

### Build & Deploy

```powershell
# Build static site for GitHub Pages
npm run build:static

# Output directory: ./docs/
# GitHub Pages serves from /docs directory
```

### Configuration

- Base Path: /TriviaSpark/ (configured in vite.config.ts when STATIC_BUILD=true)
- Output: ./docs/ directory

### GitHub Pages Setup

1. Go to repository Settings > Pages
2. Set source to "Deploy from a branch"
3. Select branch: main
4. Select folder: /docs
5. Save configuration

## Production Deployment Options

### Option 1: ASP.NET Core Hosting (Recommended)

- Platforms: IIS, Linux + systemd, Docker, Azure App Service, Render, etc.
- Database: SQLite file or Turso/LibSQL (distributed SQLite)
- Publish: `dotnet publish ./TriviaSpark.Api/TriviaSpark.Api.csproj -c Release`

### Option 2: Serverless + Turso (Advanced)

- Frontend: Vercel, Netlify
- Database: Turso (distributed SQLite)
- API: Serverless functions re-implementing needed endpoints

### Option 3: GitHub Pages (Demo Only)

- Platform: GitHub Pages
- Limitations: Static content only

## Migration Between Modes

### From GitHub Pages to Full Platform

1. Clone repository locally
2. Run `npm install`
3. (Optional) Create `.env`
4. Run `dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj`

### From Local to GitHub Pages

1. Ensure latest changes are committed
2. Run `npm run build:static`
3. Commit the updated ./docs directory
4. GitHub Pages will auto-deploy

## Data Considerations

### Local Development

- Database file: ./data/trivia.db
- Backup strategy: Copy the .db file
- Version control: Keep .db out of git

### GitHub Pages

- No persistent data storage
- Demo data embedded in the build

## Troubleshooting

### Local Development Issues

```powershell
# Clear database and restart (Windows PowerShell)
Remove-Item -Force ./data/trivia.db

# Rebuild SPA and run API
npm run build
dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj
```

### GitHub Pages Issues

```powershell
# Rebuild static site
npm run build:static

# Verify base path in vite.config.ts → base: "/TriviaSpark/" when STATIC_BUILD=true
```

## Best Practices

1. Use local development for full features
2. Use GitHub Pages for demos only
3. Keep database files out of version control
4. Configure environment variables per environment
5. Test both static and dynamic builds before deployment
