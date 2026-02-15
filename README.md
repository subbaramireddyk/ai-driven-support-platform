# AI-Driven Support Platform

A complete AI-driven support platform that serves as an alternative to ServiceNow/JSM for DevOps teams. The platform intelligently handles toolchain access requests (AWS, Azure, GitHub, Jira, Harness, SonarQube) by using AI to analyze documentation and detect self-service options vs. requiring manual tickets.

## 🚀 Features

### Core Features
- **AI-Powered Ticket Analysis**: Automatically classifies incoming requests and routes them appropriately
- **Self-Service Detection**: Checks documentation for existing workflows and provides direct links
- **Real-time Collaboration**: Live updates for ticket changes and new comments via WebSocket
- **@Mention System**: Tag users in comments with real-time notifications
- **Role-Based Access Control**: User, Support, and Admin roles
- **Rich Commenting**: Markdown support with @mention capabilities
- **Analytics Dashboard**: Track ticket deflection, response times, and user satisfaction
- **Toolchain Integrations**: Pre-built connectors for AWS, Azure, GitHub, Jira, Harness, SonarQube

### Technical Stack

#### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for sessions and real-time data
- **AI**: OpenAI SDK for intent classification and response generation
- **Real-time**: Socket.io for WebSocket communication
- **Authentication**: JWT with Passport.js

#### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React with TypeScript
- **Styling**: Tailwind CSS
- **Components**: Custom UI components with Radix UI primitives
- **Real-time**: Socket.io client for live updates

## 📁 Project Structure

```
ai-driven-support-platform/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── prisma/       # Database schema and migrations
│   │   └── src/
│   │       ├── auth/     # Authentication module
│   │       ├── users/    # User management
│   │       ├── tickets/  # Ticket CRUD operations
│   │       ├── comments/ # Comment system with mentions
│   │       ├── notifications/ # Notification handling
│   │       ├── ai/       # AI integration (OpenAI)
│   │       ├── websocket/ # WebSocket gateway
│   │       └── prisma/   # Prisma service
│   └── frontend/         # Next.js web application
│       ├── app/          # Next.js app router pages
│       ├── components/   # React components
│       └── lib/          # Utilities and API client
├── packages/
│   └── shared/           # Shared types and utilities
└── infrastructure/
    └── docker/           # Docker and docker-compose configs
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)
- OpenAI API key

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-driven-support-platform
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env and add your OpenAI API key
   ```

3. **Start services with Docker Compose**
   ```bash
   npm run docker:up
   ```

   This will start:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Backend API on port 3001
   - Frontend app on port 3000

4. **Run database migrations**
   ```bash
   cd apps/backend
   npx prisma migrate dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Manual Setup (without Docker)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL and Redis**
   - Install PostgreSQL and create a database
   - Install Redis

3. **Configure environment variables**
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   # Edit and update DATABASE_URL, REDIS_HOST, OPENAI_API_KEY
   ```

4. **Run database migrations**
   ```bash
   cd apps/backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the backend**
   ```bash
   cd apps/backend
   npm run dev
   ```

6. **Start the frontend** (in a new terminal)
   ```bash
   cd apps/frontend
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_support_platform
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
REDIS_HOST=localhost
REDIS_PORT=6379
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
PORT=3001
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## 📖 API Documentation

### Authentication
- `POST /auth/login` - Login with email and password
- `POST /auth/register` - Register a new user

### Tickets
- `GET /tickets` - Get all tickets (with filters)
- `GET /tickets/:id` - Get a specific ticket
- `POST /tickets` - Create a new ticket (AI analysis included)
- `PUT /tickets/:id` - Update a ticket
- `DELETE /tickets/:id` - Delete a ticket
- `GET /tickets/metrics` - Get ticket analytics

### Comments
- `GET /comments/ticket/:ticketId` - Get comments for a ticket
- `POST /comments` - Create a comment (supports @mentions)

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read

### Users
- `GET /users/search?q=query` - Search users for @mentions

## 🤖 AI Features

### Intent Classification
The AI analyzes ticket titles and descriptions to classify intent:
- `access_request` - User requesting access to a tool
- `bug_report` - Reporting a bug or issue
- `question` - General question
- `feature_request` - Requesting a new feature

### Self-Service Detection
The AI checks if the request can be handled through self-service:
- Analyzes against knowledge base documentation
- Provides direct links to relevant guides
- Suggests next steps for self-resolution

### Entity Extraction
Extracts key information:
- Toolchain type (AWS, Azure, GitHub, etc.)
- Specific resources requested
- User context and requirements

## 🧪 Testing

### Backend Tests
```bash
cd apps/backend
npm test                 # Run unit tests
npm run test:e2e        # Run e2e tests
npm run test:cov        # Run with coverage
```

### Frontend Tests
```bash
cd apps/frontend
npm test
```

## 📦 Deployment

### Production Build

1. **Build the backend**
   ```bash
   cd apps/backend
   npm run build
   ```

2. **Build the frontend**
   ```bash
   cd apps/frontend
   npm run build
   ```

3. **Run migrations**
   ```bash
   cd apps/backend
   npx prisma migrate deploy
   ```

### Docker Production
```bash
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

## 🔒 Security Considerations

- JWT tokens for authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with class-validator
- SQL injection protection with Prisma
- XSS protection in frontend

## 🎯 Future Enhancements

- [ ] Vector database integration (Pinecone/Chroma) for semantic search
- [ ] Email notifications
- [ ] Slack integration
- [ ] Advanced analytics and reporting
- [ ] File attachments
- [ ] Ticket templates
- [ ] SLA tracking
- [ ] Multi-tenancy support
- [ ] Advanced role permissions
- [ ] Audit logs

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please create an issue in the GitHub repository.

