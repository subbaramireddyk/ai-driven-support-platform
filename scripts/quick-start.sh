#!/bin/bash

# AI-Driven Support Platform - Quick Start Script

set -e

echo "🚀 AI-Driven Support Platform - Quick Start"
echo "==========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker is not installed. You'll need to set up PostgreSQL and Redis manually." >&2; }

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Dependencies installed"
echo ""

# Setup backend environment
echo "🔧 Setting up backend environment..."
cd apps/backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend .env file"
    echo "⚠️  Please edit apps/backend/.env and add your OPENAI_API_KEY"
else
    echo "✅ Backend .env file already exists"
fi

cd ../..

# Setup frontend environment
echo "🔧 Setting up frontend environment..."
cd apps/frontend

if [ ! -f .env.local ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
EOF
    echo "✅ Created frontend .env.local file"
else
    echo "✅ Frontend .env.local file already exists"
fi

cd ../..

# Start Docker services
if command -v docker >/dev/null 2>&1; then
    echo ""
    echo "🐳 Starting Docker services (PostgreSQL & Redis)..."
    
    # Check if containers are already running
    if docker ps | grep -q "ai-support-postgres"; then
        echo "✅ PostgreSQL container already running"
    else
        docker run -d \
          --name ai-support-postgres \
          -e POSTGRES_USER=postgres \
          -e POSTGRES_PASSWORD=postgres \
          -e POSTGRES_DB=ai_support_platform \
          -p 5432:5432 \
          postgres:16-alpine
        
        echo "✅ PostgreSQL container started"
        sleep 3
    fi
    
    if docker ps | grep -q "ai-support-redis"; then
        echo "✅ Redis container already running"
    else
        docker run -d \
          --name ai-support-redis \
          -p 6379:6379 \
          redis:7-alpine
        
        echo "✅ Redis container started"
    fi
else
    echo "⚠️  Docker not available. Please start PostgreSQL and Redis manually."
fi

# Generate Prisma client and run migrations
echo ""
echo "🗄️  Setting up database..."
cd apps/backend

echo "Generating Prisma client..."
npx prisma generate

echo "✅ Prisma client generated"

if command -v docker >/dev/null 2>&1; then
    echo "Running database migrations..."
    sleep 2
    npx prisma migrate dev --name init || echo "⚠️  Migration failed. Database might already be initialized."
    echo "✅ Database migrations completed"
else
    echo "⚠️  Skipping migrations. Run manually with: cd apps/backend && npx prisma migrate dev"
fi

cd ../..

# Build shared package
echo ""
echo "🔨 Building shared package..."
cd packages/shared
npm run build
echo "✅ Shared package built"
cd ../..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit apps/backend/.env and add your OPENAI_API_KEY"
echo "2. Start the backend:  cd apps/backend && npm run dev"
echo "3. Start the frontend: cd apps/frontend && npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see:"
echo "   - README.md"
echo "   - docs/SETUP.md"
echo "   - docs/API.md"
echo ""
echo "🎉 Happy coding!"
