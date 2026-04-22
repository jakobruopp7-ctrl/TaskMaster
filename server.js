// server.js
// ---------------------------------------------------------
// Entry point of the TaskMaster application.
// Starts the Express server, sets up middleware, and
// connects the API routes.
//
// Start the server with:  node server.js
// Then open:              http://localhost:3000
// ---------------------------------------------------------

// PERSON 1 (Jakob) -- server.js

const express    = require('express');          // Express framework
const path       = require('path');             // Built-in path utility
const taskRoutes = require('./taskRoutes');      // Import task routes

const app  = express();   // Create the Express app
const PORT = 3000;        // Port the server listens on

// --- MIDDLEWARE ---
// Middleware runs on every request before it reaches a route

app.use(express.json());                                      // Read JSON request bodies
app.use(express.urlencoded({ extended: true }));              // Read form data
app.use(express.static(path.join(__dirname, 'public')));      // Serve HTML/CSS/JS files

// --- ROUTES ---

// PERSON 1 (Jakob) — GET /api/export
// Exports all tasks as a CSV file and logs each export to export-log.json.
// Round trip: Export button clicked → GET /api/export → server builds CSV →
//             export is recorded in export-log.json → CSV downloads to browser.
const fs  = require('fs');
const db  = require('./database');
const EXPORT_LOG = path.join(__dirname, 'export-log.json');

app.get('/api/export', (req, res) => {
  const tasks = db.getAllTasks();

  // Build CSV rows from the task list
  const header = 'Title,Description,Category,Due Date,Completed';
  const rows   = tasks.map(t =>
    [`"${t.title}"`, `"${t.description || ''}"`, `"${t.category}"`,
     `"${t.dueDate || ''}"`, t.completed ? 'Yes' : 'No'].join(',')
  );
  const csv = [header, ...rows].join('\n');

  // Write a new entry to export-log.json so the export is visibly recorded
  const log = fs.existsSync(EXPORT_LOG)
    ? JSON.parse(fs.readFileSync(EXPORT_LOG, 'utf8'))
    : [];
  log.push({
    exportedAt: new Date().toISOString(),
    taskCount:  tasks.length,
    tasks:      tasks.map(t => ({
      title:     t.title,
      category:  t.category,
      dueDate:   t.dueDate || 'none',
      completed: t.completed ? 'Yes' : 'No'
    }))
  });
  fs.writeFileSync(EXPORT_LOG, JSON.stringify(log, null, 2));

  res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

app.use('/api/tasks', taskRoutes); // Mount task routes at /api/tasks

// --- START SERVER ---

app.listen(PORT, () => {
  console.log(`TaskMaster is running at http://localhost:${PORT}`);
});
