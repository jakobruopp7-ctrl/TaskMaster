// taskRoutes.js
// ---------------------------------------------------------
// API routes for tasks. Connects HTTP requests to the
// database functions in database.js.
//
// REST API endpoints:
//   GET    /api/tasks/search    → search tasks by keyword  (Person 3 - Melina)
//   POST   /api/tasks           → create a new task        (Person 3 - Melina)
//   GET    /api/tasks           → get all tasks            (Person 4 - Claire)
//   GET    /api/tasks/stats     → get completion stats     (Person 4 - Claire)
//   GET    /api/tasks/:id       → get one task by ID       (Person 4 - Claire)
//   PUT    /api/tasks/:id       → update a task            (Person 5 - Rike)
//   DELETE /api/tasks/:id       → delete a task            (Person 6 - Nessi)
// ---------------------------------------------------------

const express = require('express');
const router  = express.Router();
const db      = require('./database');
const fs      = require('fs');
const path    = require('path');

const OVERDUE_FILE = path.join(__dirname, 'overdue-tasks.json');


// ============================================================
// PERSON 2 — Leon
// PATCH /complete-all — mark every task as completed at once
// Round trip: user clicks "Mark All Done" → app.js fetches PATCH /complete-all →
//             taskRoutes calls db.completeAll() → database.js sets every task's
//             completed flag to true and writes tasks.json → updated list returned.
// ============================================================

// PATCH /api/tasks/complete-all — set completed: true on all tasks
router.patch('/complete-all', (req, res) => {
  const tasks = db.completeAll();
  res.json(tasks);
});


// ============================================================
// PERSON 3 — Melina
// GET /search + POST /
// Note: /search is declared before /:id so Express does not
// treat the word "search" as a task ID.
// ============================================================

// GET /api/tasks/search?q=homework
// Returns all tasks where title or description matches the query
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Please provide a search term, e.g. ?q=homework' });
  }
  try {
    const tasks   = db.getAllTasks();
    const results = tasks.filter(task =>
      task.title.toLowerCase().includes(q.toLowerCase()) ||
      task.description.toLowerCase().includes(q.toLowerCase())
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed', detail: err.message });
  }
});

// POST /api/tasks — create a new task
router.post('/', (req, res) => {
  const { title, description, category, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  res.status(201).json(db.createTask({ title, description, category, dueDate }));
});


// ============================================================
// PERSON 4 — Claire
// GET / + GET /stats + GET /:id
// Note: /stats is declared before /:id so Express does not
// treat the word "stats" as a task ID.
// ============================================================

// GET /api/tasks — return all tasks
router.get('/', (req, res) => {
  res.json(db.getAllTasks());
});

// GET /api/tasks/stats — return total, completed, and pending counts
// Also writes overdue-tasks.json with any tasks past their due date.
// Round trip: page loads → GET /api/tasks/stats → stats calculated →
//             overdue-tasks.json updated → stats returned to browser.
router.get('/stats', (req, res) => {
  const tasks     = db.getAllTasks();
  const completed = tasks.filter(t => t.completed);
  const pending   = tasks.filter(t => !t.completed);

  // Count completed tasks per category
  const byCategory = {};
  tasks.forEach(task => {
    if (!byCategory[task.category]) {
      byCategory[task.category] = { total: 0, completed: 0 };
    }
    byCategory[task.category].total++;
    if (task.completed) byCategory[task.category].completed++;
  });

  // Write overdue-tasks.json — tasks with a due date in the past that are not completed
  const today   = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < today && !t.completed);
  fs.writeFileSync(OVERDUE_FILE, JSON.stringify(overdue, null, 2));

  res.json({
    total:     tasks.length,
    completed: completed.length,
    pending:   pending.length,
    byCategory
  });
});

// GET /api/tasks/:id — return one task by its ID
router.get('/:id', (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});


// ============================================================
// PERSON 5 — Rike
// PUT /:id — update a task (used for editing and marking done)
// ============================================================

// PUT /api/tasks/:id — update fields on an existing task
router.put('/:id', (req, res) => {
  const updated = db.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});


// ============================================================
// PERSON 6 — Nessi
// DELETE /:id — remove a task permanently
// ============================================================

// DELETE /api/tasks/:id — delete one task by its ID
router.delete('/:id', (req, res) => {
  const ok = db.deleteTask(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Task not found' });
  res.json({ message: 'Task deleted successfully' });
});


module.exports = router;
