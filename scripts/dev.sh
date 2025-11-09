#!/bin/bash

# Development script for DevOps CI/CD Playground

set -e

echo "🚀 Starting DevOps CI/CD Playground - Development Mode"

# Проверяем, установлен ли Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Проверяем, установлен ли Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Создаем .env файл если его нет
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
fi

# Устанавливаем зависимости для frontend
echo "📦 Installing frontend dependencies..."
cd src/frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Устанавливаем зависимости для backend
echo "📦 Installing backend dependencies..."
cd ../backend
if [ ! -d "node_modules" ]; then
    npm install
fi

cd ../..

# Собираем и запускаем контейнеры
echo "🐳 Building and starting Docker containers..."
docker-compose down
docker-compose build
docker-compose up -d

# Ждем запуск сервисов
echo "⏳ Waiting for services to start..."
sleep 10

# Проверяем здоровье сервисов
echo "🔍 Checking service health..."
echo "Frontend health:"
curl -s http://localhost/healthz || echo "❌ Frontend not ready yet"

echo ""
echo "Backend health:"
curl -s http://localhost:5000/api/health || echo "❌ Backend not ready yet"

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "🌐 Available services:"
echo "  - Frontend: http://localhost"
echo "  - Backend API: http://localhost:5000"
echo "  - Redis: localhost:6379"
echo ""
echo "📊 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Run tests: npm run test (in src/frontend or src/backend)"
echo ""
echo "🔧 Development mode activated. Happy coding!"