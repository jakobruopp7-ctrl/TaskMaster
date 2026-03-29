// server.js
// ---------------------------------------------------------
// This is the main entry point for the TaskMaster application.
// Its job is to create the Express server, set up all the
// middleware that processes incoming requests, register the
// API routes, and finally start listening on a port.
//
// Run the server with:  node server.js
// Then open:            http://localhost:3000
// ---------------------------------------------------------

const express = require('express');
const path    = require('path');
const taskRoutes = require('./taskRoutes');

const app = express();

// Pull the port from an environment variable if one is set,
// otherwise just use 3000. This makes it easy to deploy the
// app to hosting platforms without changing the code.
const PORT = process.env.PORT || 3000;


// ---------------------------------------------------------
// MIDDLEWARE
//
// Middleware are functions that run on every incoming request
// before it reaches a route handler. They are stacked in order,
// so the first one registered runs first.
// ---------------------------------------------------------

// Allow the server to read JSON data from request bodies.
// Without this, req.body would be undefined when the frontend
// sends task data as JSON.
app.use(express.json());

// Also handle URL-encoded data (the format standard HTML forms use).
// extended: true allows nested objects in the form data.
app.use(express.urlencoded({ extended: true }));

// Serve everything in the /public folder as static files.
// When someone visits http://localhost:3000, Express automatically
// sends them index.html from the public folder.
app.use(express.static(path.join(__dirname, 'public')));

// Custom logger — prints the HTTP method, URL, and time for
// every request that comes in. Really helpful for debugging.
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}]  ${req.method}  ${req.url}`);
  next(); // Pass control to the next middleware or route
});


// ---------------------------------------------------------
// ROUTES
// ---------------------------------------------------------

// Health check endpoint — a quick way to confirm the server
// is up and running without loading the full app.
// Try visiting http://localhost:3000/api/health in your browser.
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    uptime:    process.uptime().toFixed(2) + 's',
    timestamp: new Date().toISOString()
  });
});

// Mount all task-related routes at /api/tasks.
// Any request starting with /api/tasks gets forwarded to taskRoutes.js,
// which decides exactly what to do based on the method and sub-path.
app.use('/api/tasks', taskRoutes);


// ---------------------------------------------------------
// ERROR HANDLERS
//
// These must be registered AFTER all routes. Express works
// top-to-bottom, so requests fall through to these only if
// no route above matched them.
// ---------------------------------------------------------

// 404 handler — catches requests for URLs that don't exist.
// Sends a clean JSON response instead of Express's default HTML error page.
app.use((req, res) => {
  res.status(404).json({
    error:   'Not found',
    message: `No route matches ${req.method} ${req.url}`
  });
});

// Global error handler — catches any unexpected errors thrown inside
// a route. Express recognises error handlers by their four-parameter
// signature (err, req, res, next).
app.use((err, req, res, next) => {
  console.error(`[ERROR]  ${err.message}`);
  res.status(500).json({
    error:   'Internal server error',
    message: err.message
  });
});


// ---------------------------------------------------------
// START THE SERVER
// ---------------------------------------------------------

app.listen(PORT, () => {
  console.log('\n----------------------------------------------');
  console.log(`  TaskMaster is running`);
  console.log(`  App:    http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`  Stop:   Ctrl+C`);
  console.log('----------------------------------------------\n');
});
