# Multi-stage build for React frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Production stage
FROM nginx:alpine

# Копируем билд в nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем nginx конфигурацию
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Экспортируем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]