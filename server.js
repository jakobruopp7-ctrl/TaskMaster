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

app.use('/api/tasks', taskRoutes); // Mount task routes at /api/tasks

// --- START SERVER ---

app.listen(PORT, () => {
  console.log(`TaskMaster is running at http://localhost:${PORT}`);
});
