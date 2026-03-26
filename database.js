// ============================================================
// PERSON 2 — database.js
// Role: Data Layer / Storage
// ============================================================
// This file handles ALL reading and writing of task data.
// Instead of a full database (like MySQL), we use a simple
// JSON file (tasks.json) to store tasks on disk.
// Every other file that needs data will import from here.
// ============================================================

// Line 1: Import Node.js 'fs' module — allows reading and writing files
const fs = require('fs');

// Line 2: Import Node.js 'path' module — builds safe file paths
const path = require('path');

// Line 3: Define the path to our data file (tasks.json)
// __dirname means "the folder where this file lives"
const DB_FILE = path.join(__dirname, 'tasks.json');

// ---- INTERNAL HELPER FUNCTIONS ----
// These are private — not exported, only used inside this file

// Line 4–9: readTasks() — reads all tasks from the JSON file
// If the file does not exist yet, it creates it with an empty array
function readTasks() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

// Line 10–12: writeTasks() — saves the tasks array to the JSON file
// JSON.stringify with (null, 2) makes the file human-readable with indentation
function writeTasks(tasks) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

// ---- PUBLIC FUNCTIONS ----
// These are exported and used by taskRoutes.js

// Line 13–15: getAllTasks() — returns every task in the file
function getAllTasks() {
  return readTasks();
}

// Line 16–19: getTaskById() — finds and returns one task by its id
// Returns null if no task with that id exists
function getTaskById(id) {
  const tasks = readTasks();
  return tasks.find(task => task.id === id) || null;
}

// Line 20–33: createTask() — builds a new task object and saves it
// Assigns a unique id using the current timestamp (Date.now())
function createTask(taskData) {
  const tasks = readTasks();
  const newTask = {
    id: Date.now().toString(),           // Unique ID based on timestamp
    title: taskData.title,               // Required: task name
    description: taskData.description || '',  // Optional: extra detail
    category: taskData.category || 'General', // Optional: e.g. Work, Personal
    dueDate: taskData.dueDate || null,   // Optional: deadline date
    completed: false,                    // New tasks start as not completed
    createdAt: new Date().toISOString()  // Record when the task was created
  };
  tasks.push(newTask);    // Add new task to the array
  writeTasks(tasks);       // Save updated array to file
  return newTask;          // Return the created task to the caller
}

// Line 34–43: updateTask() — finds a task by id and updates its fields
// Uses spread operator (...) to merge old and new values
function updateTask(id, updates) {
  const tasks = readTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return null;              // Task not found
  tasks[index] = { ...tasks[index], ...updates }; // Merge updates
  writeTasks(tasks);
  return tasks[index];
}

// Line 44–52: deleteTask() — removes a task from the array by id
// splice() removes 1 element at the found index
function deleteTask(id) {
  const tasks = readTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return false;   // Task not found
  tasks.splice(index, 1);           // Remove 1 item at this position
  writeTasks(tasks);
  return true;
}

// Line 53: Export all public functions so other files can use them
module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
