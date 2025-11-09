const express = require('express');
const router = express.Router();

// In-memory storage для демо
let todos = [
  {
    id: 1,
    title: "Изучить CI/CD с GitHub Actions",
    completed: true,
    priority: "high",
    createdAt: new Date('2025-11-01').toISOString(),
    completedAt: new Date('2025-11-05').toISOString()
  },
  {
    id: 2,
    title: "Настроить Terraform для GCP",
    completed: true,
    priority: "high",
    createdAt: new Date('2025-11-02').toISOString(),
    completedAt: new Date('2025-11-08').toISOString()
  },
  {
    id: 3,
    title: "Создать Docker контейнеры",
    completed: true,
    priority: "medium",
    createdAt: new Date('2025-11-03').toISOString(),
    completedAt: new Date('2025-11-09').toISOString()
  },
  {
    id: 4,
    title: "Задеплоить в продакшен",
    completed: false,
    priority: "high",
    createdAt: new Date('2025-11-09').toISOString(),
    completedAt: null
  }
];

let nextId = 5;

// GET /api/todos - получить все задачи
router.get('/', (req, res) => {
  const { status, priority } = req.query;

  let filteredTodos = todos;

  if (status === 'completed') {
    filteredTodos = todos.filter(todo => todo.completed);
  } else if (status === 'pending') {
    filteredTodos = todos.filter(todo => !todo.completed);
  }

  if (priority) {
    filteredTodos = filteredTodos.filter(todo => todo.priority === priority);
  }

  res.json({
    success: true,
    count: filteredTodos.length,
    data: filteredTodos
  });
});

// GET /api/todos/stats - статистика
router.get('/stats', (req, res) => {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;

  const priorityStats = {
    high: todos.filter(t => t.priority === 'high').length,
    medium: todos.filter(t => t.priority === 'medium').length,
    low: todos.filter(t => t.priority === 'low').length
  };

  res.json({
    success: true,
    data: {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      priorityBreakdown: priorityStats
    }
  });
});

// GET /api/todos/:id - получить задачу по ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({
      success: false,
      error: 'Задача не найдена'
    });
  }

  res.json({
    success: true,
    data: todo
  });
});

// POST /api/todos - создать новую задачу
router.post('/', (req, res) => {
  const { title, priority = 'medium' } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Название задачи обязательно'
    });
  }

  const newTodo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
    priority,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  todos.unshift(newTodo);

  res.status(201).json({
    success: true,
    data: newTodo
  });
});

// PUT /api/todos/:id - обновить задачу
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Задача не найдена'
    });
  }

  const { title, completed, priority } = req.body;
  const todo = todos[todoIndex];

  if (title !== undefined) {
    todo.title = title.trim();
  }

  if (completed !== undefined) {
    const wasCompleted = todo.completed;
    todo.completed = completed;

    if (completed && !wasCompleted) {
      todo.completedAt = new Date().toISOString();
    } else if (!completed && wasCompleted) {
      todo.completedAt = null;
    }
  }

  if (priority !== undefined) {
    todo.priority = priority;
  }

  res.json({
    success: true,
    data: todo
  });
});

// DELETE /api/todos/:id - удалить задачу
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Задача не найдена'
    });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];

  res.json({
    success: true,
    data: deletedTodo
  });
});

module.exports = router;