// ============================================================
// PERSON 1 — server.js
// Role: Project Setup & Express Server
// ============================================================
// This file is the ENTRY POINT of the entire application.
// It sets up the Express web server, loads middleware,
// connects the API routes, and starts listening on a port.
// ============================================================

// Line 1: Import the 'express' library (installed via npm)
const express = require('express');

// Line 2: Import Node.js built-in 'path' module (no install needed)
// Used to safely build file paths across different operating systems
const path = require('path');

// Line 3: Import our custom task routes file (Person 3's file)
const taskRoutes = require('./taskRoutes');

// Line 4: Create the Express application instance
const app = express();

// Line 5: Define which port the server will listen on
const PORT = 3000;

// ---- MIDDLEWARE SETUP ----
// Middleware runs on every request BEFORE it reaches the routes

// Line 6: Allow the server to read JSON data from request bodies
// (e.g. when the frontend sends a new task as JSON)
app.use(express.json());

// Line 7: Allow the server to read URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Line 8: Serve static files (HTML, CSS, JS) from the 'public' folder
// When a browser visits http://localhost:3000, it gets index.html from public/
app.use(express.static(path.join(__dirname, 'public')));

// ---- ROUTES ----

// Line 9: Mount the task routes at the /api/tasks path
// Any request to /api/tasks/... will be handled by taskRoutes.js
app.use('/api/tasks', taskRoutes);

// ---- START THE SERVER ----

// Line 10: Tell the server to start listening for incoming requests
// The callback function runs once the server is ready
app.listen(PORT, () => {
  console.log(`TaskMaster is running! Open your browser at: http://localhost:${PORT}`);
});
