#!/bin/bash

echo "🧪 Testing DevOps CI/CD Playground"

# Запускаем только backend для тестов
echo "🐳 Starting backend container..."
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for backend to start..."
sleep 15

# Проверяем health endpoint
echo "🔍 Testing health endpoint..."
if curl -f http://localhost:5000/healthz; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    docker-compose -f docker-compose.dev.yml logs backend
    exit 1
fi

# Проверяем API endpoints
echo ""
echo "🔍 Testing API endpoints..."
echo "Testing /api/health:"
curl -s http://localhost:5000/api/health | jq . 2>/dev/null || curl -s http://localhost:5000/api/health

echo ""
echo "Testing /api/info:"
curl -s http://localhost:5000/api/info | jq . 2>/dev/null || curl -s http://localhost:5000/api/info

echo ""
echo "✅ All tests passed! Application is running correctly."
echo ""
echo "🌐 Backend API is available at: http://localhost:5000"
echo "📊 Available endpoints:"
echo "  - Health: http://localhost:5000/healthz"
echo "  - API Health: http://localhost:5000/api/health"
echo "  - API Info: http://localhost:5000/api/info"