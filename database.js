// database.js
// ---------------------------------------------------------
// Data layer of the TaskMaster app.
// Reads and writes all task data to tasks.json.
// Only this file accesses tasks.json directly.
// All other files call the functions exported here.
// ---------------------------------------------------------

// PERSON 2 (Leon) -- database.js

const fs   = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'tasks.json');

// --- PRIVATE HELPER FUNCTIONS ---

// Read all tasks from the JSON file
function readTasks() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([])); // Create the file if it does not exist
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Write the tasks array back to the JSON file
function writeTasks(tasks) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

// --- PUBLIC FUNCTIONS (exported) ---

// Return all tasks
function getAllTasks() {
  return readTasks();
}

// Return a single task by its ID
function getTaskById(id) {
  return readTasks().find(t => t.id === id) || null;
}

// Create a new task and save it
function createTask(data) {
  const tasks = readTasks();

  const task = {
    id:          Date.now().toString(),   // Unique ID from current timestamp
    title:       data.title,
    description: data.description || '',
    category:    data.category || 'General',
    dueDate:     data.dueDate || null,
    completed:   false,                   // New tasks start as not completed
    createdAt:   new Date().toISOString()
  };

  tasks.push(task);
  writeTasks(tasks);
  return task;
}

// Update an existing task by merging in the new values
function updateTask(id, updates) {
  const tasks = readTasks();
  const i = tasks.findIndex(t => t.id === id);

  if (i === -1) return null; // Task not found

  tasks[i] = { ...tasks[i], ...updates }; // Merge old and new values
  writeTasks(tasks);
  return tasks[i];
}

// Delete a task by its ID
function deleteTask(id) {
  const tasks = readTasks();
  const i = tasks.findIndex(t => t.id === id);

  if (i === -1) return false; // Task not found

  tasks.splice(i, 1); // Remove 1 element at this position
  writeTasks(tasks);
  return true;
}

// --- EXPORTS ---
// Only these functions are accessible from outside this file

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
