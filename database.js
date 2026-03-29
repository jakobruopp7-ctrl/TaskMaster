// database.js
// ---------------------------------------------------------
// This file is the data layer of the TaskMaster app.
// It handles everything to do with reading and writing task
// data. Instead of a full database engine, we store tasks in
// a local JSON file (tasks.json) on disk.
//
// Every other part of the app that needs to access tasks
// imports and calls the functions exported at the bottom.
// ---------------------------------------------------------

const fs   = require('fs');
const path = require('path');

// Build the full path to the data file.
// __dirname is the folder where this file lives, so this works
// regardless of where you run the server from.
const DB_FILE = path.join(__dirname, 'tasks.json');


// ---------------------------------------------------------
// PRIVATE HELPERS
//
// These two functions are the foundation of everything else.
// They aren't exported — they're only used inside this file.
// ---------------------------------------------------------

// Read and return all tasks from the JSON file.
// If the file doesn't exist yet, we create it with an empty
// array so the rest of the code never has to worry about it.
function readTasks() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Could not read tasks file:', err.message);
    return []; // Return an empty array so the app keeps working
  }
}

// Save the entire tasks array back to the JSON file.
// The (null, 2) arguments add indentation so the file is
// human-readable if you open it in a text editor.
function writeTasks(tasks) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error('Could not write tasks file:', err.message);
  }
}


// ---------------------------------------------------------
// PUBLIC FUNCTIONS
//
// These are the functions that taskRoutes.js calls.
// Each one maps to one of the REST API operations.
// ---------------------------------------------------------

// Return every task in the file, sorted newest first.
function getAllTasks() {
  const tasks = readTasks();
  return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Find and return a single task by its id.
// Returns null if no task with that id exists.
function getTaskById(id) {
  const tasks = readTasks();
  return tasks.find(task => task.id === id) || null;
}

// Return only the tasks that belong to a specific category.
// This is used by the sidebar filter on the frontend.
function getTasksByCategory(category) {
  const tasks = readTasks();
  return tasks.filter(task => task.category === category);
}

// Create a new task from the provided data, assign it a unique id,
// save it to the file, and return the finished task object.
function createTask(data) {
  if (!data.title || data.title.trim() === '') {
    throw new Error('Task title is required');
  }

  const tasks = readTasks();

  const newTask = {
    id:          Date.now().toString(),         // Timestamp makes a simple unique ID
    title:       data.title.trim(),
    description: data.description ? data.description.trim() : '',
    category:    data.category || 'General',
    dueDate:     data.dueDate   || null,
    completed:   false,
    createdAt:   new Date().toISOString()
  };

  tasks.push(newTask);
  writeTasks(tasks);
  return newTask;
}

// Find a task by id and merge the provided updates into it.
// Returns the updated task, or null if the id wasn't found.
function updateTask(id, updates) {
  const tasks = readTasks();
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) return null;

  // Spread operator merges the old task fields with the new ones.
  // Fields not included in 'updates' stay unchanged.
  tasks[index] = { ...tasks[index], ...updates };
  writeTasks(tasks);
  return tasks[index];
}

// Remove a task from the array and save the file.
// Returns true if a task was deleted, false if the id wasn't found.
function deleteTask(id) {
  const tasks = readTasks();
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) return false;

  tasks.splice(index, 1); // Remove exactly 1 element at this position
  writeTasks(tasks);
  return true;
}


// ---------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------

module.exports = {
  getAllTasks,
  getTaskById,
  getTasksByCategory,
  createTask,
  updateTask,
  deleteTask
};
