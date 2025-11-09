# 🚀 DevOps CI/CD Playground

Полноценный CI/CD проект с использованием GitHub Actions, Terraform, Docker на Google Cloud Platform.

## 🏗️ Архитектура проекта

```
devops-cicd-playground/
├── .github/workflows/          # GitHub Actions CI/CD пайплайны
├── src/
│   ├── frontend/              # React/Vue.js frontend приложение
│   └── backend/               # Node.js/Python backend API
├── terraform/                 # Terraform конфигурация GCP инфраструктуры
├── docker/                    # Docker конфигурации
├── scripts/                   # Скрипты деплоя и настройки
└── docker-compose.yml         # Локальная разработка
```

## 🔧 Технологический стек

- **CI/CD**: GitHub Actions
- **Infrastructure as Code**: Terraform
- **Containerization**: Docker & Docker Compose
- **Cloud Provider**: Google Cloud Platform (GCP)
- **Compute Engine**: Ubuntu VM
- **Registry**: Docker Hub
- **Frontend**: React.js
- **Backend**: Node.js + Express

## 🚀 CI/CD Pipeline

1. **Push** в ветку `main`
2. **Тестирование** кода
3. **Сборка** Docker-образов
4. **Публикация** в Docker Hub
5. **Применение** Terraform конфигурации
6. **Деплой** на GCP VM

## 📋 Требования

- Аккаунт Google Cloud Platform
- Docker Hub аккаунт
- GitHub аккаунт
- Настроенные GitHub Secrets

## 🛠️ Быстрый старт

1. Клонируйте репозиторий
2. Настройте GitHub Secrets
3. Сделайте push в `main` ветку
4. Следите за выполнением CI/CD в Actions

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)