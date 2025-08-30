# Overview

TriviaSpark is an intelligent event trivia platform that transforms any gathering into an unforgettable, interactive experience. The application combines AI-powered content generation with real-time multiplayer capabilities to create context-aware trivia events for wine dinners, corporate events, parties, educational sessions, and fundraisers. Built as a full-stack web application with a React frontend and Express backend, it features QR code-based participant joining, live leaderboards, and adaptive theming based on event types.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React with TypeScript and implements a modern component-based architecture. The UI leverages shadcn/ui components with Radix UI primitives for accessibility and customization. Styling is handled through Tailwind CSS with custom wine-themed color palettes and variables. The application uses Wouter for lightweight client-side routing and TanStack Query for efficient server state management and caching.

## Backend Architecture
The server runs on Express.js with TypeScript in ESM format. It follows a RESTful API design pattern with centralized route registration and middleware for logging and error handling. The backend integrates with OpenAI's GPT-4o model for AI-powered trivia generation and provides real-time capabilities for live events. File uploads are handled through integration with cloud storage services.

## Database Strategy
The application uses Drizzle ORM with PostgreSQL as the primary database. The schema defines core entities including users, events, questions, participants, and responses with proper foreign key relationships. Database migrations are managed through Drizzle Kit, and the system is configured to work with Neon Database's serverless PostgreSQL offering.

## Authentication & User Management
The system implements a traditional user authentication model with username/email and password-based login. User sessions are managed through HTTP-only cookies with proper security headers. The application maintains user context for event hosting and participant management.

## AI Integration
OpenAI's GPT-4o model powers the intelligent content generation features. The system can generate complete trivia events with appropriate questions based on event type, difficulty level, and participant count. It also provides analytics insights and can generate individual questions on demand. The AI service is abstracted into a dedicated service layer for maintainability.

## Real-time Features
The application supports real-time multiplayer functionality for live trivia events. This includes synchronized participant joining, live score updates, and real-time question progression. The system handles connection resilience and automatic state recovery for disconnected participants.

# External Dependencies

## Core Runtime
- **Node.js**: Server runtime environment
- **Express.js**: Web application framework
- **React**: Frontend UI library with TypeScript support

## Database & ORM
- **PostgreSQL**: Primary database (configured for Neon Database)
- **Drizzle ORM**: Type-safe database ORM and query builder
- **@neondatabase/serverless**: Serverless PostgreSQL driver

## AI Services
- **OpenAI**: GPT-4o model for content generation and insights

## UI Framework
- **shadcn/ui**: Modern React component library
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with Zod validation

## File Management
- **Google Cloud Storage**: Cloud file storage service
- **Uppy**: File upload handling with multiple provider support

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit**: Development environment integration

## Validation & Utilities
- **Zod**: Runtime type validation and schema definition
- **class-variance-authority**: Utility for creating component variants
- **clsx & tailwind-merge**: Conditional CSS class utilities