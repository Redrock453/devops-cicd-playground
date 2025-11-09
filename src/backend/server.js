const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы из билда фронтенда (только если есть)
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// API Routes
const todosRouter = require('./routes/todos');
app.use('/api/todos', todosRouter);

app.get('/api/health', (req, res) => {
  const buildTime = process.env.BUILD_TIME || new Date().toISOString();
  res.json({
    message: '✅ Backend API is running successfully!',
    buildTime: buildTime,
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    app: 'DevOps CI/CD Playground',
    backend: 'Node.js + Express',
    frontend: 'React.js',
    deployment: 'Docker + GitHub Actions',
    infrastructure: 'Terraform + GCP',
    timestamp: new Date().toISOString()
  });
});

// Обработка всех остальных GET запросов - отдаем фронтенд
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend/build/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: '🚀 Backend API is running!',
      frontend: 'Frontend not built yet - this is API only mode',
      endpoints: ['/api/health', '/api/info', '/healthz']
    });
  }
});

// Health check для Kubernetes/liveness probes
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;