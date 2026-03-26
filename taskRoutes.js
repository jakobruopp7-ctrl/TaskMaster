// ============================================================
// PERSON 3 — taskRoutes.js
// Role: API Routes (Back-End Endpoints)
// ============================================================
// This file defines all the API endpoints that the frontend
// can call to interact with tasks. It acts as the "traffic
// controller" — it receives HTTP requests, calls the correct
// database function, and sends back a response.
//
// REST API design:
//   GET    /api/tasks        → get all tasks
//   GET    /api/tasks/:id    → get one task
//   POST   /api/tasks        → create a new task
//   PUT    /api/tasks/:id    → update a task
//   DELETE /api/tasks/:id    → delete a task
// ============================================================

// Line 1: Import express and create a Router instance
// A Router is a mini Express app — handles its own routes
const express = require('express');
const router = express.Router();

// Line 2: Import the database module (Person 2's file)
const db = require('./database');

// ---- ROUTE 1: GET all tasks ----
// Line 3–7: Handles GET /api/tasks
// Fetches all tasks from the database and returns them as JSON
router.get('/', (req, res) => {
  const tasks = db.getAllTasks();
  res.json(tasks);
});

// ---- ROUTE 2: GET a single task ----
// Line 8–13: Handles GET /api/tasks/:id
// :id is a URL parameter — e.g. /api/tasks/1234567890
// Returns 404 if the task doesn't exist
router.get('/:id', (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// ---- ROUTE 3: POST create a new task ----
// Line 14–22: Handles POST /api/tasks
// Reads task data from req.body (the JSON body of the request)
// Title is required — returns 400 Bad Request if missing
// Returns 201 Created with the new task on success
router.post('/', (req, res) => {
  const { title, description, category, dueDate } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newTask = db.createTask({ title, description, category, dueDate });
  res.status(201).json(newTask);
});

// ---- ROUTE 4: PUT update an existing task ----
// Line 23–29: Handles PUT /api/tasks/:id
// Accepts any updated fields in req.body (e.g. completed: true)
// Returns the updated task, or 404 if not found
router.put('/:id', (req, res) => {
  const updated = db.updateTask(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(updated);
});

// ---- ROUTE 5: DELETE a task ----
// Line 30–37: Handles DELETE /api/tasks/:id
// Returns a success message, or 404 if not found
router.delete('/:id', (req, res) => {
  const deleted = db.deleteTask(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ message: 'Task deleted successfully' });
});

// Line 38: Export the router so server.js can mount it
module.exports = router;
