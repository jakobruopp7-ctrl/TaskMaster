// server.js
// ---------------------------------------------------------
// Einstiegspunkt der TaskMaster-Anwendung.
// Startet den Express-Server, richtet Middleware ein und
// verbindet die API-Routen.
//
// Server starten mit:  node server.js
// Dann öffnen:         http://localhost:3000
// ---------------------------------------------------------

// PERSON 1 (Jakob) -- server.js

const express = require('express'); // Express-Framework importieren
const path    = require('path');    // Pfad-Hilfsprogramm (eingebaut)
const taskRoutes = require('./taskRoutes'); // Routen importieren

const app  = express(); // Express-App erstellen
const PORT = 3000;      // Port-Nummer zum Abhören

// --- MIDDLEWARE ---
// Middleware läuft bei jeder Anfrage, bevor sie eine Route erreicht

app.use(express.json());                                        // JSON-Anfrage-Bodies lesen
app.use(express.urlencoded({ extended: true }));                // Formulardaten lesen
app.use(express.static(path.join(__dirname, 'public')));        // HTML/CSS/JS bereitstellen

// --- ROUTEN ---

app.use('/api/tasks', taskRoutes); // Task-Routen unter /api/tasks einbinden

// --- SERVER STARTEN ---

app.listen(PORT, () => {
  console.log(`TaskMaster läuft unter http://localhost:${PORT}`);
});
