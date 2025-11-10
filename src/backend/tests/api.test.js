const request = require('supertest');
const app = require('../server');

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
  test('GET / should serve frontend index or API info', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    // Can be either HTML (if build exists) or JSON (if no build)
    if (response.type === 'application/json') {
      // When frontend build doesn't exist in test, expect JSON response
      expect(response.body).toHaveProperty('message');
    } else {
      // When frontend build exists, expect HTML
      expect(response.text).toContain('<!doctype html>');
    }
  });
});