// taskRoutes.js
// ---------------------------------------------------------
// This file defines all the API endpoints (routes) for tasks.
// It acts as the "traffic controller" between incoming HTTP
// requests and the database functions in database.js.
//
// REST API endpoints provided here:
//   GET    /api/tasks              -> return all tasks
//   GET    /api/tasks/filter       -> return tasks by category
//   GET    /api/tasks/:id          -> return one task
//   POST   /api/tasks              -> create a new task
//   PUT    /api/tasks/:id          -> update an existing task
//   DELETE /api/tasks/:id          -> delete a task
// ---------------------------------------------------------

const express = require('express');
const router  = express.Router();
const db      = require('./database');


// ---------------------------------------------------------
// HELPER: validate that required fields are present
// Returns an array of error strings. Empty array = all good.
// ---------------------------------------------------------
function validateTask(body) {
  const errors = [];

  if (!body.title || body.title.trim() === '') {
    errors.push('Title is required and cannot be blank');
  }

  const allowed = ['General', 'Work', 'Personal', 'School'];
  if (body.category && !allowed.includes(body.category)) {
    errors.push(`Category must be one of: ${allowed.join(', ')}`);
  }

  if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
    errors.push('Due date must be a valid date (e.g. 2025-12-31)');
  }

  return errors;
}


// ---------------------------------------------------------
// GET /api/tasks
// Returns every task, newest first.
// ---------------------------------------------------------
router.get('/', (req, res) => {
  try {
    const tasks = db.getAllTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Could not load tasks', detail: err.message });
  }
});


// ---------------------------------------------------------
// GET /api/tasks/filter?category=Work
// Returns only the tasks that belong to a given category.
// The category comes from the query string, e.g. ?category=Work
// Note: this route must be declared BEFORE /:id so Express
// doesn't try to treat "filter" as a task ID.
// ---------------------------------------------------------
router.get('/filter', (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Please provide a category query param, e.g. ?category=Work' });
  }

  try {
    const tasks = db.getTasksByCategory(category);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Filter failed', detail: err.message });
  }
});


// ---------------------------------------------------------
// GET /api/tasks/:id
// Returns a single task by its ID.
// Sends 404 if the ID doesn't match any stored task.
// ---------------------------------------------------------
router.get('/:id', (req, res) => {
  const task = db.getTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  res.json(task);
});


// ---------------------------------------------------------
// POST /api/tasks
// Creates a new task from the JSON body of the request.
// Returns 400 if validation fails, 201 with the new task on success.
// ---------------------------------------------------------
router.post('/', (req, res) => {
  const errors = validateTask(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  try {
    const { title, description, category, dueDate } = req.body;
    const newTask = db.createTask({ title, description, category, dueDate });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Could not create task', detail: err.message });
  }
});


// ---------------------------------------------------------
// PUT /api/tasks/:id
// Updates an existing task. Only the fields sent in the body
// are changed — everything else stays the same.
// ---------------------------------------------------------
router.put('/:id', (req, res) => {
  const updated = db.updateTask(req.params.id, req.body);

  if (!updated) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  res.json(updated);
});


// ---------------------------------------------------------
// DELETE /api/tasks/:id
// Permanently removes a task. Returns 404 if not found,
// or a success message if the deletion worked.
// ---------------------------------------------------------
router.delete('/:id', (req, res) => {
  const deleted = db.deleteTask(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }

  res.json({ message: 'Task deleted successfully', id: req.params.id });
});


// Export the router so server.js can mount it at /api/tasks
module.exports = router;
