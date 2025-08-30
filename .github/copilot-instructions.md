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

- **Express.js** server with TypeScript (ESM format)
- **WebSocket** integration for real-time features
- **Drizzle ORM** with SQLite database
- **OpenAI GPT-4o** integration for AI content generation
- **Google Cloud Storage** for file uploads
- **Session-based authentication** with secure cookie management

### Database

- **SQLite** with local file storage (`./data/trivia.db`) for development/production
- **Turso/LibSQL** option for distributed deployments
- **Drizzle ORM** for type-safe database operations

### Deployment Options

1. **Local Development** - Full-featured with persistent SQLite database
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

### Component Structure

- Use descriptive component names with PascalCase
- Include proper TypeScript props interfaces
- Add data-testid attributes for testing
- Implement proper accessibility attributes
- Use semantic HTML elements

### API Development

- RESTful API design patterns
- Proper HTTP status codes
- Input validation using Zod schemas
- Error handling middleware
- WebSocket events for real-time features

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

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production deployment
- `npm run build:static` - Build static version for GitHub Pages
- `npm run seed` - Seed database with sample data
- `npm run check` - TypeScript type checking

### Environment Variables

```bash
DATABASE_URL=file:./data/trivia.db
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLOUD_STORAGE_BUCKET=your_bucket_name
NODE_ENV=development
PORT=5000
```

### Development Workflow Guidelines

1. **Documentation Location**: All generated documentation (.md files) should be placed in a `/copilot` folder at the project root
2. **Terminal Usage**: Reuse existing terminals whenever possible - do not create new terminals without asking the user first
3. **Testing Protocol**: When making changes that affect functionality, ASK the user to run the site and test the changes before proceeding with additional modifications

## Code Generation Guidelines

### Documentation Standards

- All generated documentation (.md files) must be placed in `/copilot` folder
- Use clear, descriptive filenames for documentation
- Include proper markdown formatting and structure
- Reference existing project documentation when appropriate

### Development Workflow

- **Terminal Management**: Always reuse existing terminals - only create new terminals when explicitly requested by the user
- **Testing Integration**: After implementing features or fixes, ask the user to run the site and test functionality before proceeding
- **Code Review Protocol**: After any change with new code, perform a code review as an expert React developer, checking for best practices, performance, security, and maintainability
- **Incremental Development**: Make changes in small, testable increments rather than large bulk modifications

### When generating components:

1. Use TypeScript with proper type definitions
2. Include shadcn/ui components when appropriate
3. Apply wine-themed color scheme (`wine-`, `champagne-` prefixes)
4. Add proper accessibility attributes
5. Include data-testid attributes for testing
6. Use Tailwind CSS for styling
7. Implement responsive design patterns

### When generating API routes:

1. Use Express.js with TypeScript
2. Implement proper error handling
3. Add input validation with Zod
4. Use proper HTTP status codes
5. Include proper authentication checks
6. Add comprehensive logging

### When generating database operations:

1. Use Drizzle ORM syntax
2. Implement proper transaction handling
3. Add proper error handling
4. Use type-safe queries
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

```typescript
app.get("/api/events/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await storage.getEvent(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
```

### WebSocket Event Handling

```typescript
wsManager.broadcast(eventId, {
  type: "SCORE_UPDATE",
  payload: { teamId, score, timestamp: Date.now() },
});
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
