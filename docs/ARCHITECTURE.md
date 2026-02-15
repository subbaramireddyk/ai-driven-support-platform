# Architecture Overview

This document provides a comprehensive overview of the AI-Driven Support Platform architecture.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Pages   │  │  Dashboard   │  │Ticket Portal │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Comment System│  │Notifications │  │  WebSocket   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                      HTTPS/WSS
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Auth Module   │  │Tickets Module│  │Comments Module│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   AI Module  │  │  WebSocket   │  │Notifications │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                │                        │
         │                │                        │
    ┌────▼─────┐   ┌─────▼──────┐        ┌───────▼────────┐
    │PostgreSQL│   │   Redis    │        │  OpenAI API    │
    └──────────┘   └────────────┘        └────────────────┘
```

## Technology Stack

### Backend Stack
- **Runtime**: Node.js 20+
- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **ORM**: Prisma 7
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Real-time**: Socket.IO
- **Authentication**: JWT with Passport.js
- **AI**: OpenAI SDK
- **Validation**: class-validator, class-transformer

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Runtime**: React 18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **State Management**: React hooks (useState, useEffect)

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Kubernetes-ready

## Core Modules

### 1. Authentication Module

**Purpose**: Handle user registration, login, and JWT-based authentication

**Components**:
- `AuthController`: Login and registration endpoints
- `AuthService`: Business logic for authentication
- `JwtStrategy`: Passport strategy for JWT validation
- `JwtAuthGuard`: Guard for protected routes

**Flow**:
```
User → Login/Register → AuthService → Generate JWT → Return Token
Protected Route → JwtAuthGuard → Validate Token → Allow/Deny
```

### 2. Tickets Module

**Purpose**: Manage support tickets with AI analysis

**Components**:
- `TicketsController`: CRUD endpoints for tickets
- `TicketsService`: Business logic and AI integration
- `AIService`: OpenAI integration for ticket analysis

**AI Features**:
- Intent classification (access_request, bug_report, question, feature_request)
- Entity extraction (toolchain, resources)
- Self-service detection
- Suggestion generation

**Flow**:
```
User Creates Ticket → TicketsService → AIService Analyzes
                                    ↓
                    Store in DB with AI Suggestions
                                    ↓
                    Return Ticket with Self-Service Info
```

### 3. Comments Module

**Purpose**: Handle comments with @mention support

**Components**:
- `CommentsController`: Comment CRUD endpoints
- `CommentsService`: Business logic and mention parsing

**Mention Flow**:
```
User Posts Comment with @username → Parse Mentions
                                  ↓
                    Find Mentioned Users in DB
                                  ↓
                    Create Notifications for Each User
                                  ↓
                    Emit WebSocket Event
```

### 4. Notifications Module

**Purpose**: Manage user notifications

**Components**:
- `NotificationsController`: Get and mark notifications
- `NotificationsService`: Notification management

**Notification Types**:
- `MENTION`: User mentioned in comment
- `ASSIGNMENT`: Ticket assigned to user
- `STATUS_CHANGE`: Ticket status changed
- `NEW_COMMENT`: New comment on user's ticket

### 5. WebSocket Module

**Purpose**: Real-time updates via Socket.IO

**Components**:
- `WebsocketGateway`: Socket.IO event handlers

**Events**:
- `joinTicket`: Join a ticket room
- `leaveTicket`: Leave a ticket room
- `newComment`: Broadcast new comment
- `ticketUpdated`: Broadcast ticket updates
- `notification`: Send notification to specific user

### 6. AI Module

**Purpose**: OpenAI integration for intelligent features

**Components**:
- `AIService`: OpenAI API integration

**Functions**:
- `analyzeTicket()`: Classify intent and extract entities
- `generateResponse()`: Generate AI responses
- `searchKnowledgeBase()`: Semantic search (future)

**AI Prompt Structure**:
```
System: You are a DevOps support assistant
User: Analyze this ticket: [title + description]
AI: {intent, entities, selfServiceAvailable, suggestion}
```

## Database Schema

### User Table
```sql
User {
  id: UUID (PK)
  email: String (unique)
  password: String (hashed)
  name: String
  role: Enum (USER, SUPPORT, ADMIN)
  avatar: String?
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Ticket Table
```sql
Ticket {
  id: UUID (PK)
  title: String
  description: Text
  status: Enum (OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED)
  priority: Enum (LOW, MEDIUM, HIGH, URGENT)
  toolchain: Enum? (AWS, AZURE, GITHUB, JIRA, HARNESS, SONARQUBE)
  requesterId: UUID (FK → User)
  assigneeId: UUID? (FK → User)
  aiSuggestion: Text?
  selfServiceAvailable: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Comment Table
```sql
Comment {
  id: UUID (PK)
  content: Text
  ticketId: UUID (FK → Ticket, cascade delete)
  authorId: UUID (FK → User)
  mentions: String[] (array of usernames)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Notification Table
```sql
Notification {
  id: UUID (PK)
  type: Enum (MENTION, ASSIGNMENT, STATUS_CHANGE, NEW_COMMENT)
  userId: UUID (FK → User, cascade delete)
  ticketId: UUID?
  commentId: UUID?
  message: String
  read: Boolean
  createdAt: DateTime
}
```

### KnowledgeBase Table
```sql
KnowledgeBase {
  id: UUID (PK)
  toolchain: String
  title: String
  content: Text
  embeddings: Text? (JSON vector embeddings)
  url: String?
  createdAt: DateTime
  updatedAt: DateTime
}
```

## API Design

### RESTful Principles
- Resource-based URLs
- HTTP verbs (GET, POST, PUT, DELETE)
- JSON request/response
- Stateless requests
- Bearer token authentication

### API Layers
```
Request → Middleware → Controller → Service → Repository → Database
                                        ↓
                                   AI Service (if needed)
```

### Error Handling
```typescript
try {
  // Business logic
} catch (error) {
  throw new HttpException({
    status: HttpStatus.BAD_REQUEST,
    error: error.message,
  }, HttpStatus.BAD_REQUEST);
}
```

## Security

### Authentication Flow
```
1. User submits credentials
2. Server validates against database
3. Generate JWT with user payload
4. Return JWT to client
5. Client stores JWT (localStorage)
6. Include JWT in Authorization header for requests
7. Server validates JWT on protected routes
```

### Security Measures
- **Password Hashing**: bcrypt with salt rounds
- **JWT Secrets**: Strong random secrets
- **CORS**: Configured for frontend URL only
- **Input Validation**: class-validator decorators
- **SQL Injection**: Prisma ORM parameterized queries
- **XSS Protection**: React escapes content by default
- **HTTPS**: Required in production
- **Rate Limiting**: To be implemented

## Real-time Communication

### WebSocket Architecture
```
Client ←→ Socket.IO Client ←→ Socket.IO Server ←→ Backend Services
   │                                                       │
   └───────────────── Rooms/Channels ────────────────────┘
```

### Room Strategy
- Each ticket has a room: `ticket:{ticketId}`
- Users join room when viewing ticket
- Updates broadcast to room members only
- User-specific rooms for personal notifications

### Connection Management
```typescript
// Connection
socket.on('connect', () => {
  // User joins with userId
  userSockets.set(userId, socket);
});

// Disconnection
socket.on('disconnect', () => {
  userSockets.delete(userId);
});
```

## AI Integration

### OpenAI Integration
```
Ticket Created → Extract text → Build prompt → OpenAI API
                                                    ↓
                                           JSON Response
                                                    ↓
                              Parse and store suggestions
```

### Future Enhancements
- **Vector Embeddings**: Store documentation as vectors
- **Semantic Search**: Find relevant docs using cosine similarity
- **RAG (Retrieval-Augmented Generation)**: Enhanced responses
- **Fine-tuning**: Custom model for organization

## Scalability Considerations

### Horizontal Scaling
- **Stateless Backend**: Multiple instances behind load balancer
- **WebSocket Scaling**: Redis adapter for Socket.IO
- **Database**: Read replicas for read-heavy operations
- **Caching**: Redis for frequently accessed data

### Performance Optimization
- **Database Indexes**: On frequently queried fields
- **Connection Pooling**: Prisma connection pool
- **Query Optimization**: Select only needed fields
- **Caching Strategy**: Cache user sessions, ticket lists
- **CDN**: Static assets delivery

## Monitoring & Observability

### Logging Strategy
```
Application Logs → Winston/Bunyan → Aggregation (ELK/CloudWatch)
```

### Metrics to Monitor
- API response times
- Database query performance
- WebSocket connection count
- AI API usage and costs
- Error rates
- User activity

### Health Checks
```typescript
@Get('/health')
healthCheck() {
  return {
    status: 'ok',
    database: await prisma.$queryRaw`SELECT 1`,
    redis: await redis.ping(),
    timestamp: new Date()
  };
}
```

## Development Workflow

### Local Development
```
1. Start PostgreSQL + Redis (Docker)
2. Run migrations: npx prisma migrate dev
3. Start backend: npm run dev
4. Start frontend: npm run dev
5. Access app at localhost:3000
```

### CI/CD Pipeline
```
Push → GitHub Actions → Run Tests → Build Docker Images
                                            ↓
                    Deploy to Environment (dev/staging/prod)
```

## Future Architecture Enhancements

1. **Microservices**: Split into smaller services
   - Auth Service
   - Ticket Service
   - AI Service
   - Notification Service

2. **Message Queue**: Add RabbitMQ/Kafka for async processing
   - AI analysis queue
   - Email notifications queue
   - Report generation queue

3. **API Gateway**: Add Kong/NGINX for:
   - Rate limiting
   - Request routing
   - Load balancing
   - Authentication

4. **Service Mesh**: Istio for microservices communication

5. **Event Sourcing**: Store all state changes as events

## Conclusion

This architecture provides:
- ✅ Scalable and maintainable codebase
- ✅ Real-time collaboration features
- ✅ AI-powered intelligence
- ✅ Production-ready infrastructure
- ✅ Security best practices
- ✅ Developer-friendly setup

For implementation details, refer to the respective module documentation.
