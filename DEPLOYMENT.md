# TriviaSpark Deployment Guide

## Overview

TriviaSpark supports two distinct deployment modes:

1. **Local Development** - Full-featured with persistent SQLite database
2. **GitHub Pages** - Static site deployment (read-only)

## Local Development (Read-Write)

### Features

- ✅ Full backend server with Express.js
- ✅ SQLite database with persistent storage
- ✅ WebSocket support for real-time updates
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ AI-powered question generation
- ✅ File uploads and management
- ✅ User authentication and sessions

### Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Database

- **Location**: `./data/trivia.db` (SQLite file)
- **Persistence**: Data persists between server restarts
- **Migrations**: Automatic schema creation on first run
- **Backup**: Simply copy the `.db` file

### Environment Variables

```bash
DATABASE_URL=file:./data/trivia.db
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
PORT=5000
```

## GitHub Pages (Read-Only Static)

### Features

- ✅ Frontend React application
- ✅ Static trivia content display
- ✅ Responsive design
- ❌ No backend server
- ❌ No database persistence
- ❌ No real-time updates
- ❌ No user authentication
- ❌ No CRUD operations

### Build & Deploy

```bash
# Build static site for GitHub Pages
npm run build:static

# Output directory: ./docs/
# GitHub Pages serves from /docs directory
```

### Configuration

- **Base Path**: `/TriviaSpark/` (configured in vite.config.ts)
- **Output**: `./docs/` directory
- **Assets**: Self-contained static files

### GitHub Pages Setup

1. Go to repository Settings > Pages
2. Set source to "Deploy from a branch"
3. Select branch: `main`
4. Select folder: `/docs`
5. Save configuration

## Key Differences

| Feature | Local Development | GitHub Pages |
|---------|------------------|--------------|
| Backend Server | ✅ Express.js | ❌ Static only |
| Database | ✅ SQLite persistent | ❌ No database |
| WebSockets | ✅ Real-time updates | ❌ No WebSocket |
| CRUD Operations | ✅ Full functionality | ❌ Read-only |
| AI Generation | ✅ OpenAI integration | ❌ No backend API |
| User Auth | ✅ Sessions/cookies | ❌ No authentication |
| File Uploads | ✅ Server storage | ❌ No uploads |
| Data Persistence | ✅ SQLite file | ❌ No persistence |

## Production Deployment Options

### Option 1: Full-Stack Hosting (Recommended for full features)

- **Platforms**: Railway, Render, DigitalOcean, AWS, etc.
- **Database**: SQLite file or Turso (distributed SQLite)
- **Features**: All functionality available
- **Command**: `npm run build && npm start`

### Option 2: Serverless + Turso

- **Frontend**: Vercel, Netlify
- **Database**: Turso (distributed SQLite)
- **API**: Serverless functions
- **Features**: Full functionality with auto-scaling

### Option 3: GitHub Pages (Current)

- **Platform**: GitHub Pages
- **Limitations**: Static content only
- **Best for**: Demos, portfolios, documentation
- **Command**: `npm run build:static`

## Migration Between Modes

### From GitHub Pages to Full-Stack

1. Clone repository locally
2. Run `npm install`
3. Set up `.env` file
4. Run `npm run dev`
5. Database will be created automatically

### From Local to GitHub Pages

1. Ensure latest changes are committed
2. Run `npm run build:static`
3. Commit the updated `./docs/` directory
4. GitHub Pages will auto-deploy

## Data Considerations

### Local Development

- Database file: `./data/trivia.db`
- Backup strategy: Copy `.db` file
- Version control: Add `*.db` to `.gitignore`
- Sharing: Export/import SQL or use Turso

### GitHub Pages

- No persistent data storage
- Consider embedding sample data in code
- Use localStorage for temporary client-side data
- Link to full-featured version for data entry

## Troubleshooting

### Local Development Issues

```bash
# Clear database and restart
rm -rf ./data/trivia.db
npm run dev

# Check dependencies
npm run check

# Rebuild
npm run build
```

### GitHub Pages Issues

```bash
# Rebuild static site
npm run build:static

# Check output
ls -la ./docs/

# Verify base path in vite.config.ts
# Should be: base: "/TriviaSpark/"
```

## Best Practices

1. **Development**: Always use local setup for development
2. **Demo**: Use GitHub Pages for public demos
3. **Production**: Use full-stack hosting for real applications
4. **Data**: Keep `.db` files out of version control
5. **Environment**: Use different `.env` files for different environments
6. **Testing**: Test both static and dynamic builds before deployment
