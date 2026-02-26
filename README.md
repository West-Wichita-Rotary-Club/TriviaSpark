# TriviaSpark

A modern, interactive trivia platform designed for wine dinners, corporate events, fundraisers, and social gatherings. TriviaSpark combines real-time participation, AI-powered content generation, and elegant presentation tools to create engaging trivia experiences.

## 🎯 Platform Overview

TriviaSpark offers two distinct deployment options:

1. **Local Development** - Complete server-side application with SQLite database, real-time features, and full event management
2. **GitHub Pages Demo** - Read-only static site deployment for showcasing platform capabilities

**Current Status**: The platform has recently migrated from Dapper to Entity Framework Core for improved type safety and maintainability. SignalR real-time features are temporarily disabled pending integration with the new EF Core data layer.

### Key Differences

| Feature | Local Development | GitHub Pages |
|---------|------------------|--------------|
| Database | ✅ SQLite persistent | ❌ Read-only static |
| Backend Server | ⚠️ ASP.NET Core Web API + EF Core (SignalR disabled) | ❌ Static files only |
| Data Persistence | ✅ Changes saved to .db file | ❌ No data persistence |
| User Authentication | ✅ Sessions & accounts | ❌ No login system |
| AI Generation | ✅ OpenAI integration | ❌ No backend API |
| Real-time Updates | ⚠️ SignalR connection (disabled) | ❌ Static content |
| CRUD Operations | ✅ Create/Edit/Delete | ❌ View-only |

**For development and production use**: Use local setup with SQLite database  
**For demos and showcasing**: Use GitHub Pages static deployment

---

## 🚀 Live Demo

**GitHub Pages Demo**: [https://west-wichita-rotary-club.github.io/TriviaSpark/](https://west-wichita-rotary-club.github.io/TriviaSpark/)

Experience the TriviaSpark platform with a pre-configured wine country trivia event featuring:

- Interactive presenter interface (read-only)
- 5 engaging trivia questions with explanations
- Fun facts about wine and the Pacific Northwest
- Mobile-responsive design
- No backend server or database

**Note**: This is a static demo. For full functionality including data persistence, user accounts, and real-time features, run the application locally.

---

## 🏗️ Architecture Overview

### Frontend Architecture

- **React 19** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient server state management
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** with custom wine-themed design system

### Backend Architecture

- **ASP.NET Core 9 Web API** with C#
- **Entity Framework Core** for database operations with SQLite
- **SignalR** for real-time features (Hub at `/ws`) - *Currently disabled, pending EF Core integration*
- **SQLite** data store via Entity Framework Core
- **OpenAPI/Swagger** at `/swagger` for live API documentation
- **Session-based authentication** with secure cookies
- Optional AI integrations (OpenAI endpoints available where applicable)

### Database

- **SQLite** with production file storage at `C:\websites\TriviaSpark\trivia.db`
- **Entity Framework Core** for type-safe database operations and migrations
- Optional **Turso/LibSQL** for distributed SQLite deployments
- **Local Persistence**: Data saved between restarts when running locally
- **Static Deployment**: No database — read-only content embedded in the application
- Comprehensive schema covering users, events, questions, participants, teams, and analytics

---

## 📦 Installation & Setup

### Prerequisites

- Node.js 22+ (Node.js 18+ supported)
- npm or yarn
- .NET 9 SDK for ASP.NET Core
- SQLite (embedded - no external database required)
- OpenAI API key (optional, for AI features)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/West-Wichita-Rotary-Club/TriviaSpark.git
   cd TriviaSpark
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   # Configure your environment variables (SQLite is used by default)
   DATABASE_URL=file:C:\websites\TriviaSpark\trivia.db
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Database setup (optional)**

   ```bash
   # Entity Framework Core will create the database automatically
   # Optionally seed with sample data
   npm run seed
   ```

5. **Start development**

   ```bash
   # Recommended: Build frontend and run the API
   npm run build
   dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj

   # Alternative: API will auto-build frontend during startup (may be slower)
   dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj
   ```

The application will be available at `http://localhost:5000`.

### Data Persistence

**Local Development**:

- ✅ All data persists in the production SQLite database at `C:\websites\TriviaSpark\trivia.db`
- ✅ Changes survive server restarts
- ✅ Full CRUD operations available
- ✅ User accounts and sessions maintained

**GitHub Pages Deployment**:

- ❌ No database - static content only  
- ❌ No data persistence between visits
- ❌ Read-only demonstration mode
- ✅ Fast loading and global CDN delivery

---

## 🎮 Platform Features

### Core Functionality

- **Event Management** - Create, configure, and manage trivia events
- **Real-time Participation** - Live SignalR connections for instant updates (*currently disabled*)
- **Team Management** - Organize participants into teams with scoring
- **Question Library** - Extensive question database with multiple categories
- **AI Content Generation** - OpenAI-powered question and event copy creation
- **QR Code Integration** - Easy participant joining via QR codes
- **Multi-format Support** - Wine dinners, corporate events, fundraisers, parties

### Presenter Tools

- **Live Presenter Interface** - Full-screen presentation mode with timer controls
- **Question Management** - Real-time question display with answer reveals
- **Participant Monitoring** - Live view of participant responses and team scores
- **Event Controls** - Start, pause, and manage event flow
- **Custom Branding** - Event-specific themes, logos, and messaging

### Participant Experience

- **Mobile-First Design** - Optimized for smartphones and tablets
- **Team Collaboration** - Real-time team communication during events
- **Progress Tracking** - Live scoring and leaderboard updates
- **Instant Feedback** - Immediate answer confirmation and explanations
- **Social Features** - Team creation and participant networking

### Administrative Features

- **User Management** - Account creation, authentication, and permissions
- **Event Analytics** - Detailed participation metrics and insights
- **Content Moderation** - Question approval and event oversight
- **Export Capabilities** - Event data and participant reports
- **API Documentation** - Complete REST API and SignalR reference

---

## 🚦 Running the Platform

### Local Development (Full Features)

```bash
# Start the API (builds SPA into wwwroot automatically during startup)
dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj

# App: http://localhost:5000 (or other port as configured)
# Swagger: http://localhost:5000/swagger
# SignalR Hub: ws://localhost:5000/ws (currently disabled)
# Database: C:\websites\TriviaSpark\trivia.db
```

### Production Build (Full Features)

```bash
# Publish the ASP.NET Core API (includes the SPA in wwwroot)
dotnet publish ./TriviaSpark.Api/TriviaSpark.Api.csproj -c Release

# Output folder will contain all files needed to deploy the API
# Database: Uses C:\websites\TriviaSpark\trivia.db (configurable via DATABASE_URL)
```

### Static Demo Build (GitHub Pages)

```bash
# Build read-only static version for GitHub Pages
npm run build:static

# Output: ./docs/ folder ready for GitHub Pages
# Features: Demo content only, no database, no persistence
```

---

## 📁 Project Structure

```text
TriviaSpark/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ai/            # AI-powered content generation
│   │   │   ├── event/         # Event configuration components
│   │   │   ├── layout/        # Navigation and layout
│   │   │   └── ui/            # shadcn/ui component library
│   │   ├── contexts/          # React context providers
│   │   ├── data/              # Static demo data
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and configurations
│   │   └── pages/             # Page components and routing
│   └── index.html             # HTML template
├── TriviaSpark.Api/            # ASP.NET Core Web API + SignalR (hosts SPA in wwwroot)
│   ├── Program.cs             # App bootstrap and configuration
│   ├── ApiEndpoints.EfCore.cs # Entity Framework Core API endpoints
│   ├── Controllers/           # ASP.NET Core controllers
│   ├── Data/                  # EF Core DbContext and data models
│   ├── Services/              # Application services and business logic
│   ├── SignalR/               # SignalR hubs (currently disabled)
│   └── wwwroot/               # Built SPA files served by ASP.NET Core
├── shared/                     # Shared TypeScript types and schemas
│   └── schema.ts              # Database schema definitions (Zod)
├── scripts/                    # Database seeding and utility scripts
├── tools/                      # Development tools and scripts
├── tests/                      # Testing files organized by type
│   ├── http/                  # HTTP test files (REST Client)
│   └── TriviaSpark.Tests/     # MSTest backend tests
├── docs/                       # Static build output (GitHub Pages)
├── copilot/                    # Generated documentation and project notes
├── data/                       # Database documentation and schema files
├── .github/workflows/          # GitHub Actions CI/CD
├── package.json               # Frontend dependencies and scripts
├── vite.config.ts             # Vite build configuration
└── tailwind.config.ts         # Tailwind CSS configuration
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite database path (default: `file:C:\websites\TriviaSpark\trivia.db`) | No |
| `TURSO_AUTH_TOKEN` | Auth token for Turso distributed SQLite (optional) | No |
| `OPENAI_API_KEY` | OpenAI API key for content generation | No |
| `NODE_ENV` | Environment mode (development/production) | No |

### Database Configuration

The platform uses Entity Framework Core with SQLite. Two deployment options:

**Local SQLite** (Default)

- File-based database stored at `C:\websites\TriviaSpark\trivia.db`
- Perfect for single-server deployments
- No external dependencies

**Distributed SQLite** (Optional)

- Turso/LibSQL for multi-region replication
- Set `DATABASE_URL=libsql://your-db.turso.io`
- Requires `TURSO_AUTH_TOKEN`

Schema includes:

- **Users** - Authentication and user management
- **Events** - Trivia event configuration and metadata
- **Questions** - Question library with categories and difficulty
- **Participants** - Event participation tracking
- **Teams** - Team organization and scoring
- **Responses** - Answer submissions and analytics

### AI Integration

Optional OpenAI integration provides:

- Automated question generation
- Event copy creation
- Content suggestions and improvements
- Difficulty assessment and categorization

---

## 🌐 API Reference

### API Surface

- REST routes are served under `/api/*` from the ASP.NET Core API
- Real-time updates via **SignalR** hub at `/ws` (currently disabled, pending EF Core integration)
- Live API documentation available at **`/swagger`** when the server is running
- A complete, versioned API spec is maintained in the documentation

---

## 🎨 Theming & Customization

### Color Scheme

- **Primary (Wine)**: `#7C2D12` - Elegant wine-inspired primary color
- **Secondary (Champagne)**: `#FEF3C7` - Complementary champagne accent
- **Backgrounds**: Gradient combinations for visual depth
- **Typography**: Inter font family for modern readability

### Custom Branding

Events support customization including:

- Custom logos and background images
- Event-specific color schemes
- Personalized welcome and thank-you messages
- Organization branding and contact information

---

## 🚀 Deployment Options

### 1. Full Platform Deployment (ASP.NET Core API + SPA)

Recommended for complete functionality with real-time features and persistence.

Common targets:

- Windows (IIS or Windows Service)
- Linux (systemd)
- Docker containers
- Cloud hosts (e.g., Azure App Service, Render)

Key steps:

1) `dotnet publish ./TriviaSpark.Api/TriviaSpark.Api.csproj -c Release`
2) Deploy the publish output folder to your host
3) Ensure `./data/trivia.db` is writable (or configure an alternate path)

### 2. Static Demo Deployment

**Recommended for**: Showcasing platform capabilities, demonstrations

**Platforms**: GitHub Pages, Netlify, Vercel (static), CDN

**Features**:

- No server required
- Embedded demo data
- Full presenter interface
- Mobile responsive

#### GitHub Pages Setup

1. Fork/clone repository
2. Enable GitHub Pages in repository settings
3. Set source to "Deploy from branch: main, folder: /docs"
4. Push changes to trigger automatic deployment

---

## 🧪 Testing & Development

### Development Tools

- **TypeScript** - Full type safety across the frontend and shared scripts
- **Entity Framework Core** - Database migrations and type-safe queries
- **ESLint v10** - Code quality and consistency (flat config)
- **Prettier** - Code formatting (printWidth: 100, singleQuote, semi)
- **Vitest** - Frontend unit testing with React Testing Library
- **MSTest** - Backend unit testing with EF Core InMemory

### Code Quality Commands

```bash
# Lint frontend code (zero console.log enforced)
npm run lint
npm run lint:fix

# Format frontend code
npm run format
npm run format:check

# Run frontend tests
npm test              # Watch mode
npm run test:coverage # With coverage report

# Run backend tests
dotnet test

# Build and verify
npm run build
dotnet build ./TriviaSpark.Api/TriviaSpark.Api.csproj
```

### Testing Strategy

- **Frontend**: Vitest + React Testing Library for component testing
- **Backend**: MSTest with EF Core InMemory for service testing
- API endpoint testing via `/swagger`
- HTTP test files in `tests/http/`

### Development Workflow

1. Run `npm run dev` for frontend-only development with hot-reload
2. Run `npm run lint` and `npm run format` before committing
3. Use `/swagger` for API testing and documentation
4. Run `npm test` and `dotnet test` to verify changes

---

## 📈 Performance & Scalability

### Frontend Optimization

- **Lazy Loading** - Components loaded on demand
- **Code Splitting** - Optimized bundle sizes
- **Caching** - Efficient query caching with TanStack Query
- **Image Optimization** - Responsive images and lazy loading

### Backend Performance

- **Connection Pooling** - Efficient database connections
- **Session Management** - Optimized session storage
- **SignalR Scaling** - Real-time connection management
- **API Rate Limiting** - Request throttling and protection

### Scalability Considerations

- Stateless API instances with sticky sessions when required
- Database file I/O considerations for SQLite; consider Turso/LibSQL for distributed needs
- CDN integration for static asset delivery
- Load balancer compatibility for multi-instance deployment

---

## 🤝 Contributing

We welcome contributions to TriviaSpark! Please read our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain component documentation
- Include tests for new features
- Follow existing code style and conventions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Project Creator

**Mark Hazleton** - *Lead Developer & Architect*

- Website: [https://markhazleton.com](https://markhazleton.com)
- GitHub: [@markhazleton](https://github.com/markhazleton)

*TriviaSpark was conceived and developed by Mark Hazleton to create engaging, AI-powered trivia experiences for wine dinners, corporate events, and fundraisers.*

---

## 🆘 Support & Contact

- **Documentation**: Complete API docs available at `/swagger`
- **Issues**: [GitHub Issues](https://github.com/West-Wichita-Rotary-Club/TriviaSpark/issues)
- **Discussions**: [GitHub Discussions](https://github.com/West-Wichita-Rotary-Club/TriviaSpark/discussions)

---

## 🔗 Related Projects

- **Demo Repository**: Static demo deployment
- **API Client Libraries**: TypeScript client for external integrations
- **Mobile App**: React Native companion app (coming soon)

---

*TriviaSpark - Where knowledge meets entertainment* 🍷✨
