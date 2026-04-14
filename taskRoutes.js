// taskRoutes.js
// ---------------------------------------------------------
// API-Routen für Tasks. Diese Datei ist der Verkehrskontrolleur
// zwischen HTTP-Anfragen und den Datenbankfunktionen.
//
// REST API Endpunkte:
//   GET    /api/tasks           → alle Tasks zurückgeben      (Person 4 - Claire)
//   GET    /api/tasks/stats     → Erledigungsstatistik        (Person 4 - Claire)
//   GET    /api/tasks/search    → Tasks nach Begriff suchen   (Person 3 - Melina)
//   GET    /api/tasks/:id       → einen Task zurückgeben      (Person 4 - Claire)
//   POST   /api/tasks           → neuen Task erstellen        (Person 3 - Melina)
//   PUT    /api/tasks/:id       → Task aktualisieren          (Person 5 - Rike)
//   DELETE /api/tasks/:id       → Task löschen                (Person 6 - Nessi)
// ---------------------------------------------------------

const express = require('express');
const router  = express.Router();
const db      = require('./database');

// -------------------------------------------------------
// PERSON 4 (Claire) -- GET-Routen (alle Tasks, stats, nach ID)
// NOTE: /stats and /search must be declared BEFORE /:id —
// otherwise Express treats them as task IDs and the routes
// never work.
// -------------------------------------------------------

// GET alle Tasks
router.get('/', (req, res) => {
  res.json(db.getAllTasks());
});

// -------------------------------------------------------
// PERSON 4 (Claire) -- GET /stats (continued)

// GET /api/tasks/stats
// Returns total, completed, and pending task counts
// Also breaks down completed count per category
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

  res.json({
    total:     tasks.length,
    completed: completed.length,
    pending:   pending.length,
    byCategory
  });
});

// -------------------------------------------------------
// PERSON 3 (Melina) -- GET /search
// NOTE: declared BEFORE /:id — otherwise Express treats
// "search" as a task ID and this route never works.
// -------------------------------------------------------

// GET /api/tasks/search?q=homework
// Returns tasks where title or description matches the query
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

// -------------------------------------------------------
// PERSON 4 (Claire) -- GET /:id (continued)
// NOTE: must be declared AFTER /stats and /search
// -------------------------------------------------------

// GET einen Task nach ID
router.get('/:id', (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task nicht gefunden' });
  res.json(task);
});

// -------------------------------------------------------
// PERSON 3 (Melina) -- POST-Route
// -------------------------------------------------------

// POST -- neuen Task erstellen
router.post('/', (req, res) => {
  const { title, description, category, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Titel ist erforderlich' });
  res.status(201).json(db.createTask({ title, description, category, dueDate }));
});

// -------------------------------------------------------
// PERSON 5 (Rike) -- PUT-Route
// -------------------------------------------------------

// PUT -- Task aktualisieren
router.put('/:id', (req, res) => {
  const updated = db.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task nicht gefunden' });
  res.json(updated);
});

// -------------------------------------------------------
// PERSON 6 (Nessi) -- DELETE-Route
// -------------------------------------------------------

// DELETE -- Task löschen
router.delete('/:id', (req, res) => {
  const ok = db.deleteTask(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Task nicht gefunden' });
  res.json({ message: 'Task erfolgreich gelöscht' });
});

module.exports = router;
