# Multi-stage build for Node.js backend
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Создаем пользователя с ограниченными правами
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Копируем зависимости из builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Копируем исходный код
COPY --chown=nodejs:nodejs . .

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=5000

# Экспортируем порт
EXPOSE 5000

# Переключаемся на непривилегированного пользователя
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Запускаем приложение
CMD ["node", "server.js"]