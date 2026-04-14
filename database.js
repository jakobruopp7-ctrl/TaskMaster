// database.js
// ---------------------------------------------------------
// Datenschicht der TaskMaster-App.
// Liest und schreibt alle Task-Daten in tasks.json.
// Nur diese Datei greift direkt auf tasks.json zu.
// Alle anderen Dateien rufen die hier exportierten
// Funktionen auf.
// ---------------------------------------------------------

// PERSON 2 (Leon) -- database.js

const fs   = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'tasks.json');

// --- HILFSFUNKTIONEN (privat) ---

// Alle Tasks aus der JSON-Datei lesen
function readTasks() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([])); // Erstellen, falls nicht vorhanden
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Tasks-Array in die JSON-Datei schreiben
function writeTasks(tasks) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

// --- ÖFFENTLICHE FUNKTIONEN (exportiert) ---

// Alle Tasks zurückgeben
function getAllTasks() {
  return readTasks();
}

// Einen Task anhand seiner ID zurückgeben
function getTaskById(id) {
  return readTasks().find(t => t.id === id) || null;
}

// Neuen Task erstellen und speichern
function createTask(data) {
  const tasks = readTasks();

  const task = {
    id:          Date.now().toString(),       // Eindeutige ID aus aktuellem Zeitstempel
    title:       data.title,
    description: data.description || '',
    category:    data.category || 'General',
    dueDate:     data.dueDate || null,
    completed:   false,                       // Neue Tasks starten als nicht erledigt
    createdAt:   new Date().toISOString()
  };

  tasks.push(task);
  writeTasks(tasks);
  return task;
}

// Bestehenden Task aktualisieren (Änderungen zusammenführen)
function updateTask(id, updates) {
  const tasks = readTasks();
  const i = tasks.findIndex(t => t.id === id);

  if (i === -1) return null; // Task nicht gefunden

  tasks[i] = { ...tasks[i], ...updates }; // Änderungen zusammenführen
  writeTasks(tasks);
  return tasks[i];
}

// Task löschen
function deleteTask(id) {
  const tasks = readTasks();
  const i = tasks.findIndex(t => t.id === id);

  if (i === -1) return false; // Task nicht gefunden

  tasks.splice(i, 1); // 1 Element an dieser Position entfernen
  writeTasks(tasks);
  return true;
}

// --- EXPORTS ---
// Nur diese Funktionen sind von außen zugänglich

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
