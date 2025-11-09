# 🚀 Настройка DevOps CI/CD Playground

Это руководство поможет вам настроить и запустить полноценный CI/CD пайплайн с GitHub Actions, Terraform и Docker на Google Cloud Platform.

## 📋 Требования

- Аккаунт **Google Cloud Platform** с биллингом
- Аккаунт **Docker Hub**
- Аккаунт **GitHub**
- **SSH ключ** для доступа к VM

## 🏗️ Архитектура

```
GitHub Push → CI/CD Pipeline → Docker Build → Terraform Apply → VM Deploy
```

## 🛠️ Настройка шаг за шагом

### 1. Подготовка Google Cloud Platform

#### 1.1 Создайте новый проект
1. Перейдите в [GCP Console](https://console.cloud.google.com/)
2. Создайте новый проект (например: `devops-cicd-playground`)
3. Скопируйте **Project ID**

#### 1.2 Включите необходимые API
```bash
gcloud services enable compute.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable iam.googleapis.com
```

#### 1.3 Создайте Service Account
```bash
# Создайте Service Account
gcloud iam service-accounts create github-actions-sa \
  --description="GitHub Actions CI/CD" \
  --display-name="GitHub Actions"

# Назначьте необходимые роли
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

#### 1.4 Создайте JSON ключ
```bash
gcloud iam service-accounts keys create ~/key.json \
  --iam-account=github-actions-sa@PROJECT_ID.iam.gserviceaccount.com
```

#### 1.5 Создайте Storage Bucket для Terraform State
```bash
gsutil mb -p PROJECT_ID gs://PROJECT_ID-terraform-state
```

### 2. Подготовка Docker Hub

1. Зарегистрируйтесь на [Docker Hub](https://hub.docker.com/)
2. Создайте Access Token:
   - Settings → Security → New Access Token
   - Сохраните токен в безопасном месте

### 3. Настройка GitHub Secrets

Перейдите в ваш репозиторий → Settings → Secrets and Variables → Actions

Добавьте следующие секреты:

| Имя секрета | Значение | Описание |
|-------------|----------|----------|
| `GCP_PROJECT_ID` | `your-gcp-project-id` | ID вашего GCP проекта |
| `GCP_REGION` | `europe-west3` | Регион для развертывания |
| `GCP_SA_KEY` | *(содержимое key.json)* | JSON ключ Service Account |
| `GCP_TERRAFORM_BUCKET` | `project-id-terraform-state` | Имя Storage Bucket |
| `DOCKER_USERNAME` | `your-docker-username` | Ваш Docker Hub логин |
| `DOCKER_PASSWORD` | `your-docker-token` | Docker Hub Access Token |

### 4. Настройка Terraform

Отредактируйте файл `terraform/terraform.tfvars`:

```hcl
# GCP Project Configuration
project_id = "your-gcp-project-id"

# SSH Key для VM доступа
public_key_path = "~/.ssh/id_ed25519.pub"

# Region и Zone
region = "europe-west3"
zone   = "europe-west3-a"
```

### 5. Локальная разработка

Для запуска локальной разработки:

```bash
# Скопируйте .env файл
cp .env.example .env

# Запустите dev скрипт
./scripts/dev.sh
```

Приложение будет доступно по адресу:
- Frontend: http://localhost
- Backend API: http://localhost:5000

## 🚀 Запуск CI/CD пайплайна

1. Сделайте коммит и push в ветку `main`:
```bash
git add .
git commit -m "feat: initial CI/CD setup"
git push origin main
```

2. Перейдите во вкладку **Actions** в GitHub
3. Наблюдайте за выполнением пайплайна

## 📊 Мониторинг

После успешного деплоя вы можете проверить:

- **Статус приложения**: http://<VM-IP>/
- **Health Check**: http://<VM-IP>/healthz
- **API Health**: http://<VM-IP>/api/health
- **Логи на VM**:
  ```bash
  ssh ubuntu@<VM-IP>
  cd /opt/agentic-cicd
  docker-compose logs -f
  ```

## 🔧 Ручной деплой

Если нужно вручную задеплоить на VM:

```bash
./scripts/deploy.sh <VM-IP>
```

## 🧪 Тестирование

Запуск тестов локально:
```bash
# Frontend тесты
cd src/frontend && npm test

# Backend тесты
cd src/backend && npm test
```

## 🐛 Отладка

### Просмотр логов CI/CD
1. GitHub → Actions → Выберите запуск
2. Разверните нужный шаг для детализации

### Просмотр логов на VM
```bash
ssh ubuntu@<VM-IP>
cd /opt/agentic-cicd
docker-compose logs -f          # Все сервисы
docker-compose logs -f frontend # Только frontend
docker-compose logs -f backend  # Только backend
```

### Перезапуск сервисов
```bash
ssh ubuntu@<VM-IP>
cd /opt/agentic-cicd
docker-compose restart
```

## 🔒 Безопасность

- SSH ключи уже настроены на автоматическое создание
- Docker Hub credentials хранятся в GitHub Secrets
- GCP Service Account имеет минимально необходимые права
- Все контейнеры работают под непривилегированными пользователями

## 💰 Очистка ресурсов

Чтобы удалить все созданные ресурсы:

```bash
cd terraform
terraform destroy
```

Или вручную через GCP Console:
1. Удалите VM instance
2. Удалите Storage bucket
3. Удалите Service Account

---

🎉 **Поздравляем!** Теперь у вас есть полноценный CI/CD пайплайн!