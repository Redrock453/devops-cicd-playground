#!/bin/bash

# Production deployment script for DevOps CI/CD Playground

set -e

# Configuration
VM_USER="ubuntu"
VM_IP="${1:-$INSTANCE_IP}"
DOCKER_USERNAME="${DOCKER_USERNAME}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

if [ -z "$VM_IP" ]; then
    echo "❌ Please provide VM IP as first argument or set INSTANCE_IP environment variable"
    echo "Usage: $0 <vm-ip>"
    exit 1
fi

echo "🚀 Deploying to production VM: $VM_IP"
echo "📦 Image tag: $IMAGE_TAG"
echo "👤 Docker user: $DOCKER_USERNAME"

# Проверяем SSH доступность
echo "🔍 Checking SSH connectivity..."
ssh -o ConnectTimeout=10 -o BatchMode=yes $VM_USER@$VM_IP "echo '✅ SSH connection successful'" || {
    echo "❌ SSH connection failed. Please check your SSH keys and VM accessibility."
    exit 1
}

# Обновляем docker-compose.yml с правильными тегами
echo "📝 Updating docker-compose.yml..."
sed -i.bak "s|\${DOCKER_USERNAME}|$DOCKER_USERNAME|g" docker-compose.yml
sed -i "s|:latest|:$IMAGE_TAG|g" docker-compose.yml

# Копируем файлы на VM
echo "📤 Copying files to VM..."
scp docker-compose.yml $VM_USER@$VM_IP:/tmp/
scp .env $VM_USER@$VM_IP:/tmp/ 2>/dev/null || echo "⚠️ .env file not found, using existing on VM"

# Деплой через SSH
echo "🔧 Deploying application on VM..."
ssh $VM_USER@$VM_IP << EOF
set -e

echo "🐳 Logging into Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

echo "📁 Setting up application directory..."
cd /opt/agentic-cicd
cp /tmp/docker-compose.yml .
[ -f /tmp/.env ] && cp /tmp/.env .

echo "🔄 Pulling new images..."
docker-compose pull

echo "🛑 Stopping old containers..."
docker-compose down

echo "🚀 Starting new containers..."
docker-compose up -d

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "📊 Showing running containers..."
docker-compose ps

echo "⏳ Waiting for services to start..."
sleep 15

echo "🔍 Running health checks..."
if curl -f http://localhost/healthz; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

if curl -f http://localhost:5000/api/health; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

echo "✅ Deployment completed successfully!"
EOF

# Восстанавливаем оригинальный docker-compose.yml
echo "🔄 Restoring original docker-compose.yml..."
mv docker-compose.yml.bak docker-compose.yml

# Локальная проверка
echo "🔍 Running remote health checks..."
sleep 5

if curl -f http://$VM_IP/healthz; then
    echo "✅ Remote frontend is healthy"
else
    echo "❌ Remote frontend health check failed"
fi

if curl -f http://$VM_IP/api/health; then
    echo "✅ Remote backend is healthy"
else
    echo "❌ Remote backend health check failed"
fi

echo ""
echo "🎉 Production deployment completed!"
echo "🌐 Application available at: http://$VM_IP"
echo "📊 API available at: http://$VM_IP/api/health"