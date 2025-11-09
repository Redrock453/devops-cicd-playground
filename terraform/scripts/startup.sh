#!/bin/bash

# Startup script for DevOps CI/CD Playground VM

# Обновление системы
echo "🔄 Updating system packages..."
apt-get update && apt-get upgrade -y

# Установка Docker
echo "🐳 Installing Docker..."
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Установка Docker Compose
echo "🔧 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Добавление ubuntu пользователя в docker group
echo "👤 Adding ubuntu user to docker group..."
usermod -aG docker ubuntu

# Создание директории для приложения
echo "📁 Creating application directory..."
mkdir -p /opt/agentic-cicd
chown ubuntu:ubuntu /opt/agentic-cicd

# Клонирование репозитория
echo "📥 Cloning repository..."
cd /opt/agentic-cicd
sudo -u ubuntu git clone https://github.com/Redrock453/devops-cicd-playground.git .

# Создание .env файла
echo "📝 Creating environment file..."
sudo -u ubuntu tee /opt/agentic-cicd/.env > /dev/null <<EOF
NODE_ENV=production
PORT=80
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
APP_VERSION=$(git rev-parse --short HEAD)
EOF

# Установка зависимостей
echo "📦 Installing dependencies..."
cd /opt/agentic-cicd/src/frontend
sudo -u ubuntu npm install
cd ../backend
sudo -u ubuntu npm install

# Запуск приложения через Docker Compose
echo "🚀 Starting application with Docker Compose..."
cd /opt/agentic-cicd
sudo -u ubuntu docker-compose up -d

# Настройка автоматического запуска при загрузке
echo "⚙️ Setting up auto-start..."
sudo -u ubuntu tee /etc/systemd/system/agentic-cicd.service > /dev/null <<EOF
[Unit]
Description=DevOps CI/CD Playground
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/agentic-cicd
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable agentic-cicd.service
systemctl start agentic-cicd.service

# Вывод информации о статусе
echo "✅ Setup completed!"
echo "🌐 Application should be available at: http://$(curl -s ifconfig.me)"
echo "📊 Check logs with: docker-compose logs -f"
echo "🔧 Manage with: docker-compose {up|down|restart|logs}"