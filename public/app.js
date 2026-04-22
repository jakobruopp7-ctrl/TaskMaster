// app.js — TaskMaster Frontend
// ---------------------------------------------------------
// Runs in the browser. Handles task display, forms, search,
// category filtering, and all HTTP requests to the server.
// ---------------------------------------------------------


// ============================================================
// SHARED — State & DOM References
// Used by all persons below
// ============================================================

let activeCategory = 'All';

const taskList      = document.getElementById('taskList');
const taskModal     = document.getElementById('taskModal');
const taskForm      = document.getElementById('taskForm');
const modalTitle    = document.getElementById('modalTitle');
const openModalBtn  = document.getElementById('openModalBtn');
const cancelBtn     = document.getElementById('cancelBtn');
const sectionTitle  = document.getElementById('sectionTitle');
const categoryItems = document.querySelectorAll('.category-item');

const taskIdInput       = document.getElementById('taskId');
const taskTitleInput    = document.getElementById('taskTitle');
const taskDescInput     = document.getElementById('taskDescription');
const taskCategoryInput = document.getElementById('taskCategory');
const taskDueDateInput  = document.getElementById('taskDueDate');
const searchInput       = document.getElementById('searchInput');
const clearSearchBtn    = document.getElementById('clearSearchBtn');
const completeAllBtn    = document.getElementById('completeAllBtn');
const exportBtn         = document.getElementById('exportBtn');


// ============================================================
// PERSON 1 — Jakob
// Files: server.js (full file) + Modal logic + App startup
// ============================================================

// Round trip: Export button → GET /api/export → server.js builds CSV and writes
//             export-log.json → CSV downloads to browser.
exportBtn.addEventListener('click', async () => {
  const response = await fetch('/api/export');
  const csv      = await response.text();

  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'tasks.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// Open the modal with an empty form to create a new task
function openAddModal() {
  modalTitle.textContent = 'Add New Task';
  taskForm.reset();
  taskIdInput.value = ''; // empty = POST (create)
  taskModal.classList.remove('hidden');
}

// Close the modal and clear the form
function closeModal() {
  taskModal.classList.add('hidden');
  taskForm.reset();
}

// Wire up the open/close buttons
openModalBtn.addEventListener('click', openAddModal);
cancelBtn.addEventListener('click', closeModal);

// Also close when clicking the dark backdrop behind the modal
taskModal.addEventListener('click', (event) => {
  if (event.target === taskModal) closeModal();
});

// Start the app: load tasks and stats as soon as the page is ready
loadTasks();
loadStats();


// ============================================================
// PERSON 2 — Leon
// Files: completeAll() in database.js + PATCH /complete-all route in taskRoutes.js
// Round trip: "Mark All Done" click → PATCH /api/tasks/complete-all →
//             taskRoutes.js → database.js completeAll() → every task in
//             tasks.json gets completed: true → task list re-renders.
// ============================================================

completeAllBtn.addEventListener('click', async () => {
  if (!confirm('Mark all tasks as done?')) return;
  await fetch('/api/tasks/complete-all', { method: 'PATCH' });
  loadTasks();
});


// ============================================================
// PERSON 3 — Melina
// Files: GET /search route + POST route (taskRoutes.js) + Search bar
// ============================================================

// Live search — runs on every keystroke in the search field
searchInput.addEventListener('input', async () => {
  const q = searchInput.value.trim();

  if (q === '') {
    // Search cleared — go back to normal task list
    clearSearchBtn.classList.add('hidden');
    loadTasks();
    return;
  }

  clearSearchBtn.classList.remove('hidden');

  // Send search query to GET /api/tasks/search?q=...
  const response = await fetch(`/api/tasks/search?q=${encodeURIComponent(q)}`);
  const results  = await response.json();

  sectionTitle.textContent = `Search results for "${q}"`;
  renderTasks(results);
});

// Clear button — resets the search and shows all tasks again
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  sectionTitle.textContent = activeCategory === 'All' ? 'All Tasks' : activeCategory + ' Tasks';
  loadTasks();
});


// ============================================================
// PERSON 4 — Claire
// Files: GET /, GET /stats, GET /:id routes (taskRoutes.js) + loadStats + loadTasks
// ============================================================

// Fetch completion stats and update the stats bar
async function loadStats() {
  const response = await fetch('/api/tasks/stats');
  const stats    = await response.json();

  const statsBar  = document.getElementById('statsBar');
  const statsText = document.getElementById('statsText');

  statsText.textContent = `✅ ${stats.completed} of ${stats.total} tasks completed  |  ⏳ ${stats.pending} pending`;

  // Turn the bar green when all tasks are done
  if (stats.total > 0 && stats.completed === stats.total) {
    statsBar.classList.add('all-done');
  } else {
    statsBar.classList.remove('all-done');
  }
}

// Fetch all tasks, apply category filter, then render them
async function loadTasks() {
  const response = await fetch('/api/tasks');
  const tasks    = await response.json();

  const filtered = activeCategory === 'All'
    ? tasks
    : tasks.filter(t => t.category === activeCategory);

  renderTasks(filtered);
  loadStats(); // always refresh stats after loading tasks
}


// ============================================================
// PERSON 5 — Rike
// Files: PUT route (taskRoutes.js) + Edit modal + Form submit (POST & PUT)
// ============================================================

// Fetch one task by ID from the server, then open the edit modal
async function openEditModal_fetch(id) {
  const response = await fetch(`/api/tasks/${id}`);
  const task     = await response.json();
  openEditModal(task);
}

// Fill the modal form with the task's existing data for editing
function openEditModal(task) {
  modalTitle.textContent      = 'Edit Task';
  taskIdInput.value           = task.id;        // ID set = PUT (update)
  taskTitleInput.value        = task.title;
  taskDescInput.value         = task.description || '';
  taskCategoryInput.value     = task.category;
  taskDueDateInput.value      = task.dueDate || '';
  taskModal.classList.remove('hidden');
}

// Form submit — creates a new task (POST) or updates an existing one (PUT)
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // stop the browser from reloading the page

  const id = taskIdInput.value; // empty = POST, set = PUT

  const taskData = {
    title:       taskTitleInput.value,
    description: taskDescInput.value,
    category:    taskCategoryInput.value,
    dueDate:     taskDueDateInput.value || null,
  };

  if (id) {
    // Task ID exists → update with PUT
    await fetch(`/api/tasks/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(taskData),
    });
  } else {
    // No ID → create with POST
    await fetch('/api/tasks', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(taskData),
    });
  }

  closeModal();
  loadTasks(); // refresh the list so the change is visible
});


// ============================================================
// PERSON 6 — Nessi
// Files: DELETE route (taskRoutes.js) + renderTasks + toggleComplete + deleteTask + Category filter
// ============================================================

// Build HTML task cards and inject them into the page
function renderTasks(tasks) {
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p>No tasks here yet. Click "+ Add Task" to get started!</p>
      </div>`;
    return;
  }

  taskList.innerHTML = tasks.map(task => `
    <div class="task-card ${task.completed ? 'completed' : ''}" data-category="${task.category}">
      <div class="task-title">${task.title}</div>
      <div class="task-description">${task.description || ''}</div>
      <div class="task-meta">
        <span class="task-category-badge">${task.category}</span>
        <span>${task.dueDate ? 'Due: ' + task.dueDate : ''}</span>
      </div>
      <div class="task-actions">
        <button class="btn btn-success" onclick="toggleComplete('${task.id}', ${task.completed})">
          ${task.completed ? 'Undo' : 'Done'}
        </button>
        <button class="btn btn-edit" onclick="openEditModal_fetch('${task.id}')">
          Edit
        </button>
        <button class="btn btn-danger" onclick="deleteTask('${task.id}')">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Toggle a single task's completed status using PUT (Rike's route)
async function toggleComplete(id, currentStatus) {
  await fetch(`/api/tasks/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ completed: !currentStatus }),
  });
  loadTasks();
}

// Delete a task after the user confirms
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}

// Category filter — attach a click listener to each sidebar category
categoryItems.forEach(item => {
  item.addEventListener('click', () => {
    categoryItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    activeCategory = item.dataset.category;
    sectionTitle.textContent = activeCategory === 'All'
      ? 'All Tasks'
      : item.textContent + ' Tasks';

    loadTasks();
  });
});
