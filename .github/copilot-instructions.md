# GitHub Copilot Instructions for TriviaSpark

## Project Overview

TriviaSpark is an intelligent event trivia platform that transforms gatherings into unforgettable, interactive experiences. The application combines AI-powered content generation with real-time multiplayer capabilities to create context-aware trivia events for wine dinners, corporate events, parties, educational sessions, and fundraisers.

## Architecture & Technology Stack

### Frontend

- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient server state management
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** with custom wine-themed design system
- **Framer Motion** for animations

### Backend

- **ASP.NET Core Web API** with C# for the main server
- **SignalR** for real-time WebSocket functionality
- **Entity Framework Core** with SQLite database
- **OpenAI GPT-4o** integration for AI content generation
- **Session-based authentication** with secure cookie management

### Database

- **SQLite** with local file storage (`./data/trivia.db`) for development/production
- **Entity Framework Core** for type-safe database operations
- **Turso/LibSQL** option for distributed deployments

### Deployment Options

1. **Local Development** - Full-featured ASP.NET Core API with SPA serving from `wwwroot`
2. **GitHub Pages** - Static site deployment (read-only demo)

## Coding Standards & Conventions

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper return types for all functions
- Leverage union types and type guards for type safety
- Use `const assertions` where appropriate

### React Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization when needed
- Prefer custom hooks for reusable logic
- Use proper dependency arrays in useEffect

### File Organization

**CRITICAL: Repository Organization Standards**

The repository follows a strict organizational structure. ALL new files must be placed in appropriate directories:

#### Root Directory Structure

```
TriviaSpark/
├── client/src/          # Frontend React application (detailed below)
├── TriviaSpark.Api/     # ASP.NET Core Web API + SignalR
├── tools/               # Development tools and scripts
├── tests/               # Testing files organized by type
├── copilot/             # Generated documentation
├── scripts/             # Database seeding and utility scripts
├── data/                # SQLite database files
├── docs/                # Static build output (GitHub Pages)
├── shared/              # Shared TypeScript types and schemas
├── temp/                # Temporary files (gitignored)
└── [config files]       # Configuration files (package.json, etc.)
```

#### Frontend Structure (client/src/)

```
client/src/
├── components/           # Reusable UI components
│   ├── ai/              # AI-powered content generation
│   ├── event/           # Event configuration components
│   ├── layout/          # Navigation and layout
│   └── ui/              # shadcn/ui component library
├── contexts/            # React context providers
├── data/                # Static demo data
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
└── pages/               # Page components and routing
```

#### File Placement Rules

**Development Tools & Scripts** → `tools/`

- Test scripts (`test-*.mjs`, `test-*.js`)
- Development utilities (`debug-*.js`, `setup.mjs`)
- Database scripts (`refresh-db.*`)
- Build and deployment tools

**Testing Files** → `tests/`

- HTTP test files → `tests/http/` (\*.http files)
- Unit test files → `tests/unit/`
- Integration tests → `tests/integration/`
- E2E tests → `tests/e2e/`

**Documentation** → `copilot/`

- All generated documentation (.md files)
- Technical specifications
- Architecture documents
- Code review reports

**Temporary Files** → `temp/`

- Cookies, sessions, cache files
- Platform-specific files (replit.md)
- Development artifacts
- Files that should not be committed

### Component Structure

- Use descriptive component names with PascalCase
- Include proper TypeScript props interfaces
- Add data-testid attributes for testing
- Implement proper accessibility attributes
- Use semantic HTML elements

### API Development

- RESTful API design patterns with ASP.NET Core
- Proper HTTP status codes
- Input validation using data annotations and custom validators
- Error handling middleware
- SignalR hubs for real-time features

## Key Features & Functionality

### Event Management

- Create, configure, and manage trivia events
- Dynamic theming for different event types (wine dinners, corporate events, parties)
- Custom branding with logos, colors, and messaging
- QR code generation for participant joining

### Real-time Features

- WebSocket connections for live updates
- Real-time leaderboards and scoring
- Live participant monitoring
- Event state synchronization

### AI Integration

- OpenAI GPT-4o for question generation
- Event copy creation and content suggestions
- Difficulty assessment and categorization
- Analytics insights generation

### Multi-format Support

- Flexible team sizes and configurations
- Multiple question formats (text, images, audio, video)
- Rich media support and content management
- Comprehensive question arsenal

## Development Environment

### Build and Run Process

**IMPORTANT: Always use this exact process for running the application:**

1. **Build the frontend**: `npm run build` (builds React app to `TriviaSpark.Api/wwwroot`)
2. **Run the server**: `dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj`

The ASP.NET Core API serves the React SPA from its `wwwroot` directory. Never use other server options like `npm run dev` or separate frontend servers in production workflows.

### Scripts

- `npm run build` - Build React frontend and deploy to ASP.NET Core `wwwroot`
- `npm run build:static` - Build static version for GitHub Pages deployment only
- `npm run dev` - Development only - separate Vite dev server (for rapid frontend development)
- `npm run seed` - Seed database with sample data
- `npm run check` - TypeScript type checking

### Dotnet Commands

- `dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj` - Run the full application
- `dotnet build ./TriviaSpark.Api/TriviaSpark.Api.csproj` - Build the ASP.NET Core project
- `dotnet publish ./TriviaSpark.Api/TriviaSpark.Api.csproj -c Release` - Create production build

### Environment Variables

```bash
DATABASE_URL=file:./data/trivia.db
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

Note: ASP.NET Core uses `appsettings.json` and `appsettings.Development.json` for configuration.

### Development Workflow Guidelines

1. **Documentation Location**: All generated documentation (.md files) MUST be placed in `/copilot` folder at the project root
2. **Terminal Usage**: Reuse existing terminals whenever possible - do not create new terminals without asking the user first
3. **Testing Protocol**: When making changes that affect functionality, ASK the user to run the site and test the changes before proceeding with additional modifications
4. **File Organization**: ALWAYS place new files in the correct directory according to the repository structure
5. **Repository Cleanliness**: Keep the root directory clean - only configuration files, documentation, and solution files belong in root

### Development Tools Location

All development tools are now organized in the `tools/` directory:

- **Database Management**: `tools/refresh-db.ps1`, `tools/refresh-db.bat`
- **Project Setup**: `tools/setup.mjs`
- **Testing Scripts**: `tools/test-*.mjs`, `tools/test-*.js`
- **Debug Utilities**: `tools/debug-*.js`

**Usage**: Scripts should be run from project root:

```bash
# Database refresh
.\tools\refresh-db.ps1

# Project setup
npm run setup  # calls tools/setup.mjs

# Manual script execution
node tools/test-api-endpoints.mjs
```

## Code Generation Guidelines

### Documentation Standards

- All generated documentation (.md files) MUST be placed in `/copilot` folder
- Use clear, descriptive filenames for documentation
- Include proper markdown formatting and structure
- Reference existing project documentation when appropriate

### Repository Organization Enforcement

- **NO files in root except**: Configuration files (package.json, tsconfig.json, etc.), Documentation (README.md, LICENSE), and Solution files (TriviaSpark.Api.sln)
- **Development tools**: MUST go in `tools/` directory
- **Test files**: MUST go in appropriate `tests/` subdirectories
- **Temporary files**: MUST go in `temp/` directory (gitignored)
- **Generated docs**: MUST go in `copilot/` directory

### File Creation Best Practices

Before creating any new file, determine the correct location based on its purpose:

1. **Is it a development/testing script?** → `tools/`
2. **Is it a test file?** → `tests/http/`, `tests/unit/`, etc.
3. **Is it documentation?** → `copilot/`
4. **Is it temporary/cache?** → `temp/`
5. **Is it source code?** → `client/src/`, `TriviaSpark.Api/`, `shared/`
6. **Is it configuration?** → Root directory (only if tool expects it there)

### Development Workflow

- **Terminal Management**: Always reuse existing terminals - only create new terminals when explicitly requested by the user
- **Testing Integration**: After implementing features or fixes, ask the user to run the site and test functionality before proceeding
- **Code Review Protocol**: After any change with new code, perform a code review as an expert React developer, checking for best practices, performance, security, and maintainability
- **Incremental Development**: Make changes in small, testable increments rather than large bulk modifications
- **Repository Cleanliness**: Maintain organized file structure at all times - never place files in root unless they belong there according to the organization standards

### Testing and HTTP Files

All HTTP test files are now organized in `tests/http/`:

- `tests/http/api-tests.http` - Main API endpoint tests
- `tests/http/ef-core-v2-api-tests.http` - EF Core specific tests
- `tests/http/efcore-test.http` - Additional EF Core tests

Use VS Code REST Client extension to run these tests during development.

### When generating components:

1. Use TypeScript with proper type definitions
2. Include shadcn/ui components when appropriate
3. Apply wine-themed color scheme (`wine-`, `champagne-` prefixes)
4. Add proper accessibility attributes
5. Include data-testid attributes for testing
6. Use Tailwind CSS for styling
7. Implement responsive design patterns

### When generating API routes:

1. Use ASP.NET Core Controllers with C#
2. Implement proper error handling
3. Add input validation using data annotations or custom validators
4. Use proper HTTP status codes
5. Include proper authentication checks where needed
6. Add comprehensive logging

### When generating database operations:

1. Use Entity Framework Core with C#
2. Implement proper transaction handling
3. Add proper error handling
4. Use type-safe LINQ queries
5. Include proper foreign key relationships

### When generating AI integration:

1. Use OpenAI GPT-4o model
2. Implement proper error handling for API calls
3. Add fallback mechanisms
4. Use structured prompts for consistent output
5. Implement proper rate limiting

## Testing Considerations

### Unit Testing

- Use Jest for JavaScript/TypeScript testing
- React Testing Library for component testing
- Mock external API calls
- Test custom hooks in isolation

### Integration Testing

- Test API endpoints with proper database setup
- WebSocket connection testing
- Authentication flow testing
- File upload functionality testing

### E2E Testing

- Test complete trivia event flows
- Participant joining and team formation
- Real-time updates and scoring
- Presenter interface functionality

## Security Guidelines

### Authentication & Authorization

- Secure session management
- HTTP-only cookies for session storage
- Proper password hashing (if implementing user registration)
- Rate limiting for API endpoints

### Data Protection

- Input sanitization and validation
- SQL injection prevention through ORM
- XSS protection in frontend
- Secure file upload handling

### API Security

- Proper CORS configuration
- API key management for external services
- Secure WebSocket connections
- Request validation and sanitization

## Performance Optimization

### Frontend

- Code splitting and lazy loading
- Image optimization and lazy loading
- Efficient state management
- Minimize bundle size
- Implement proper caching strategies

### Backend

- Database query optimization
- Connection pooling for production
- Proper indexing strategies
- Caching for frequently accessed data
- WebSocket connection management

## UI/UX Design System

### Color Palette

- Primary: Wine-themed colors (`wine-50` to `wine-900`)
- Accent: Champagne colors (`champagne-50` to `champagne-900`)
- Neutral: Standard gray scale
- Semantic: Success, warning, error states

### Typography

- Use system font stack for performance
- Proper heading hierarchy (h1-h6)
- Readable font sizes for mobile devices
- Consistent line heights and spacing

### Component Patterns

- Use shadcn/ui as the foundation
- Consistent spacing using Tailwind classes
- Proper focus states for accessibility
- Loading states for async operations
- Error states with user-friendly messages

## Accessibility Requirements

- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG 2.1 AA)
- Focus management for dynamic content

## Common Patterns & Examples

### Creating Event Components

```typescript
interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  // Implementation
}
```

### API Route Structure

```csharp
[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetEvent(string id)
    {
        try
        {
            var eventItem = await _eventService.GetEventAsync(id);
            return Ok(eventItem);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}
```

### WebSocket Event Handling

```csharp
public class TriviaHub : Hub
{
    public async Task JoinEventGroup(string eventId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, eventId);
    }

    public async Task BroadcastScoreUpdate(string eventId, string teamId, int score)
    {
        await Clients.Group(eventId).SendAsync("ScoreUpdate", new { teamId, score, timestamp = DateTime.UtcNow });
    }
}
```

## Error Handling Patterns

### Frontend Error Boundaries

- Implement error boundaries for component trees
- Graceful degradation for failed features
- User-friendly error messages
- Retry mechanisms for transient failures

### Backend Error Handling

- Centralized error handling middleware
- Proper error logging
- Structured error responses
- Rate limiting for abuse prevention

## Deployment Considerations

### Static Build (GitHub Pages)

- No backend functionality
- Embedded demo data
- Read-only presenter interface
- Full responsive design

### Full Deployment

- Database migrations
- Environment variable configuration
- SSL/TLS setup for production
- Monitoring and logging setup

## AI Prompt Engineering

### For Question Generation

- Provide context about event type and audience
- Specify difficulty levels and categories
- Include format preferences (multiple choice, true/false)
- Request explanations for educational value

### For Event Copy

- Specify event theme and tone
- Include target audience demographics
- Request brand-appropriate language
- Ensure mobile-friendly formatting

This instruction file should guide GitHub Copilot to generate code that aligns with the TriviaSpark platform's architecture, coding standards, and best practices while maintaining consistency with the existing codebase.

## Repository Organization Best Practices

### Mandatory File Organization Rules

1. **NEVER place development scripts in root** - All scripts go in `tools/`
2. **NEVER place test files in root** - All tests go in `tests/` subdirectories
3. **NEVER place temporary files in root** - All temp files go in `temp/` (gitignored)
4. **ALWAYS document in copilot/** - All generated documentation goes in `copilot/`
5. **ROOT is for essentials only** - Configuration, documentation, and solution files only

### Quality Assurance Checklist

Before completing any task, verify:

- [ ] All new files are in correct directories
- [ ] No development scripts or tests in root
- [ ] Documentation is in `copilot/` folder
- [ ] Temporary files are in `temp/` folder
- [ ] Scripts are executable from project root with proper paths
- [ ] README files exist in new directories
- [ ] Updated references to moved files in documentation

### Directory Purpose Enforcement

| Directory          | Purpose                      | Examples                              |
| ------------------ | ---------------------------- | ------------------------------------- |
| Root               | Config, docs, solution files | package.json, README.md, \*.sln       |
| `tools/`           | Development and test scripts | test-_.mjs, debug-_.js, refresh-db.\* |
| `tests/`           | Testing files by type        | http/, unit/, integration/, e2e/      |
| `copilot/`         | Generated documentation      | \*.md files, specs, reviews           |
| `temp/`            | Temporary/cache files        | cookies.txt, platform files           |
| `client/`          | React frontend source        | src/, components/, pages/             |
| `TriviaSpark.Api/` | ASP.NET Core backend         | Controllers/, Services/, Data/        |

### Script Path Standards

All development scripts MUST be referenced with `tools/` prefix:

```bash
# Correct
.\tools\refresh-db.ps1
node tools/test-api-endpoints.mjs

# Incorrect (old paths)
.\refresh-db.ps1
node test-api-endpoints.mjs
```

### Documentation Standards for Generated Files

When creating documentation in `copilot/`:

- Use descriptive filenames with hyphens
- Include date context if time-sensitive
- Reference the organized file structure
- Update existing docs when moving files
- Maintain cross-references between related docs
