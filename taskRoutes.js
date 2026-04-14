// taskRoutes.js
// ---------------------------------------------------------
// API-Routen für Tasks. Diese Datei ist der Verkehrskontrolleur
// zwischen HTTP-Anfragen und den Datenbankfunktionen.
//
// REST API Endpunkte:
//   GET    /api/tasks        → alle Tasks zurückgeben      (Person 4 - Claire)
//   GET    /api/tasks/:id    → einen Task zurückgeben      (Person 4 - Claire)
//   POST   /api/tasks        → neuen Task erstellen        (Person 3 - Melina)
//   PUT    /api/tasks/:id    → Task aktualisieren          (Person 5 - Rike)
//   DELETE /api/tasks/:id    → Task löschen               (Person 6 - Nessi)
// ---------------------------------------------------------

const express = require('express');
const router  = express.Router();
const db      = require('./database');

// -------------------------------------------------------
// PERSON 4 (Claire) -- GET-Routen
// -------------------------------------------------------

// GET alle Tasks
router.get('/', (req, res) => {
  res.json(db.getAllTasks());
});

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
