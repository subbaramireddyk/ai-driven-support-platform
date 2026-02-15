# Setup Guide

This guide will walk you through setting up the AI-Driven Support Platform from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Setup](#docker-setup)
4. [Database Setup](#database-setup)
5. [Configuration](#configuration)
6. [First Run](#first-run)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **npm**: Version 10 or higher
- **Docker** (Optional but recommended)
- **PostgreSQL** (if not using Docker) - Version 14+
- **Redis** (if not using Docker) - Version 7+
- **OpenAI API Key** - Sign up at https://platform.openai.com/

## Local Development Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd ai-driven-support-platform
npm install
```

### 2. Configure Environment Variables

Backend (.env):
```bash
cd apps/backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### 3. Start Database Services

Using Docker:
```bash
docker run -d --name ai-support-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
docker run -d --name ai-support-redis -p 6379:6379 redis:7-alpine
```

### 4. Set Up Database
```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start Development Servers
```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

Visit http://localhost:3000

## Docker Setup

```bash
# Configure environment
cd apps/backend
cp .env.example .env
# Add your OPENAI_API_KEY

# Start all services
npm run docker:up

# Run migrations
docker exec -it ai-support-backend npx prisma migrate dev
```

## Troubleshooting

See the full setup guide for detailed troubleshooting steps.
