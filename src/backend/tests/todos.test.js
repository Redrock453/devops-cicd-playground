const request = require('supertest');
const app = require('../server');

describe('Todos API Endpoints', () => {
  let todoId;

  test('GET /api/todos should return all todos', async () => {
    const response = await request(app)
      .get('/api/todos')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('POST /api/todos should create a new todo', async () => {
    const newTodo = {
      title: 'Test todo from jest',
      priority: 'high'
    };

    const response = await request(app)
      .post('/api/todos')
      .send(newTodo)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(newTodo.title);
    expect(response.body.data.priority).toBe(newTodo.priority);
    expect(response.body.data.completed).toBe(false);

    todoId = response.body.data.id;
  });

  test('GET /api/todos/:id should return specific todo', async () => {
    const response = await request(app)
      .get(`/api/todos/${todoId}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(todoId);
    expect(response.body.data.title).toBe('Test todo from jest');
  });

  test('PUT /api/todos/:id should update todo', async () => {
    const updateData = {
      title: 'Updated test todo',
      completed: true
    };

    const response = await request(app)
      .put(`/api/todos/${todoId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(updateData.title);
    expect(response.body.data.completed).toBe(true);
    expect(response.body.data.completedAt).toBeTruthy();
  });

  test('GET /api/todos/stats should return statistics', async () => {
    const response = await request(app)
      .get('/api/todos/stats')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('total');
    expect(response.body.data).toHaveProperty('completed');
    expect(response.body.data).toHaveProperty('pending');
    expect(response.body.data).toHaveProperty('completionRate');
    expect(response.body.data).toHaveProperty('priorityBreakdown');
  });

  test('DELETE /api/todos/:id should delete todo', async () => {
    const response = await request(app)
      .delete(`/api/todos/${todoId}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(todoId);

    // Проверяем, что задача удалена
    await request(app)
      .get(`/api/todos/${todoId}`)
      .expect(404);
  });

  test('POST /api/todos should validate required fields', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('обязательно');
  });

  test('GET /api/todos?status=pending should filter todos', async () => {
    const response = await request(app)
      .get('/api/todos?status=pending')
      .expect(200);

    expect(response.body.success).toBe(true);
    response.body.data.forEach(todo => {
      expect(todo.completed).toBe(false);
    });
  });

  test('GET /api/todos?priority=high should filter by priority', async () => {
    const response = await request(app)
      .get('/api/todos?priority=high')
      .expect(200);

    expect(response.body.success).toBe(true);
    response.body.data.forEach(todo => {
      expect(todo.priority).toBe('high');
    });
  });
});