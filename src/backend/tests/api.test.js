const request = require('supertest');
const app = require('../server');

// Импортируем все тесты
require('./todos.test');

describe('Core API Endpoints', () => {
  test('GET /api/health should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('buildTime');
    expect(response.body).toHaveProperty('version');
    expect(response.body.message).toContain('Backend API is running');
  });

  test('GET /api/info should return app information', async () => {
    const response = await request(app)
      .get('/api/info')
      .expect(200);

    expect(response.body).toHaveProperty('app', 'DevOps CI/CD Playground');
    expect(response.body).toHaveProperty('backend', 'Node.js + Express');
    expect(response.body).toHaveProperty('frontend', 'React.js');
  });

  test('GET /healthz should return OK', async () => {
    const response = await request(app)
      .get('/healthz')
      .expect(200);

    expect(response.text).toBe('OK');
  });
});

describe('Static File Serving', () => {
  test('GET / should serve frontend index', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.text).toContain('DevOps CI/CD Playground');
  });
});