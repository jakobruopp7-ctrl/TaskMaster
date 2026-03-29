// app.js — TaskMaster Frontend Logic
// ---------------------------------------------------------
// Runs inside the browser. Handles:
//   - Fetching tasks from the API and displaying them as cards
//   - Opening/closing the modal form for adding and editing
//   - Sending create, update, and delete requests to the API
//   - Filtering tasks when the user clicks a sidebar category
// ---------------------------------------------------------


// --- STATE & ELEMENT REFERENCES ---

// Tracks which category is active. "All" means show everything.
let activeCategory = 'All';

// Cache DOM references — avoids searching the page repeatedly.
const taskList      = document.getElementById('taskList');
const taskModal     = document.getElementById('taskModal');
const taskForm      = document.getElementById('taskForm');
const modalTitle    = document.getElementById('modalTitle');
const openModalBtn  = document.getElementById('openModalBtn');
const cancelBtn     = document.getElementById('cancelBtn');
const sectionTitle  = document.getElementById('sectionTitle');
const categoryItems = document.querySelectorAll('.category-item');

// Form input fields
const taskIdInput          = document.getElementById('taskId');
const taskTitleInput       = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskCategoryInput    = document.getElementById('taskCategory');
const taskDueDateInput     = document.getElementById('taskDueDate');


// --- SECTION A: LOADING & RENDERING TASKS ---

// Fetch all tasks from the API, apply the active category filter,
// and pass the result to renderTasks() to build the card HTML.
async function loadTasks() {
  try {
    const response = await fetch('/api/tasks');
    const tasks    = await response.json();
    const filtered = activeCategory === 'All'
      ? tasks
      : tasks.filter(task => task.category === activeCategory);
    renderTasks(filtered);
  } catch (err) {
    console.error('Failed to load tasks:', err);
  }
}

// Build and inject HTML task cards into the page.
// Shows a friendly message if there are no tasks to display.
function renderTasks(tasks) {
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p>No tasks here yet. Click "+ Add Task" to get started!</p>
      </div>`;
    return;
  }

  // Map each task to an HTML string and join them into one block.
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
        <button class="btn btn-edit" onclick="openEditModal(${JSON.stringify(task).replace(/"/g, '&quot;')})">
          Edit
        </button>
        <button class="btn btn-danger" onclick="deleteTask('${task.id}')">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}


// --- SECTION B: MODAL CONTROL ---

// Open the modal with a blank form for creating a new task.
function openAddModal() {
  modalTitle.textContent = 'Add New Task';
  taskForm.reset();
  taskIdInput.value = ''; // Empty ID signals a POST (create) request
  taskModal.classList.remove('hidden');
}

// Open the modal pre-filled with an existing task's data.
// 'task' is the full object, passed via the card's onclick attribute.
function openEditModal(task) {
  modalTitle.textContent     = 'Edit Task';
  taskIdInput.value          = task.id;
  taskTitleInput.value       = task.title;
  taskDescriptionInput.value = task.description || '';
  taskCategoryInput.value    = task.category;
  taskDueDateInput.value     = task.dueDate || '';
  taskModal.classList.remove('hidden');
}

// Hide the modal and clear all form fields.
function closeModal() {
  taskModal.classList.add('hidden');
  taskForm.reset();
}


// --- SECTION C: API OPERATIONS ---

// Handles both CREATE and UPDATE on form submit.
// If taskIdInput has a value, we're editing — otherwise creating.
taskForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default browser page reload

  const taskData = {
    title:       taskTitleInput.value,
    description: taskDescriptionInput.value,
    category:    taskCategoryInput.value,
    dueDate:     taskDueDateInput.value || null,
  };
  const id = taskIdInput.value;

  try {
    if (id) {
      // ID present → update existing task via PUT
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
    } else {
      // No ID → create new task via POST
      await fetch('/api/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
    }
    closeModal();
    loadTasks(); // Refresh cards so the change shows immediately
  } catch (err) {
    console.error('Failed to save task:', err);
  }
});

// Flip a task's completed status and reload the list.
async function toggleComplete(id, currentStatus) {
  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus }),
    });
    loadTasks();
  } catch (err) {
    console.error('Failed to update task:', err);
  }
}

// Ask for confirmation, then send a DELETE request to remove the task.
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  try {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  } catch (err) {
    console.error('Failed to delete task:', err);
  }
}


// --- SECTION D: CATEGORY FILTER ---

// Each sidebar item gets a click listener.
// Clicking one updates activeCategory and reloads the task list.
categoryItems.forEach(item => {
  item.addEventListener('click', () => {
    categoryItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    activeCategory = item.dataset.category;
    sectionTitle.textContent = activeCategory === 'All'
      ? 'All Tasks'
      : activeCategory + ' Tasks';
    loadTasks();
  });
});


// --- SECTION E: EVENT LISTENERS ---

openModalBtn.addEventListener('click', openAddModal);
cancelBtn.addEventListener('click', closeModal);

// Close the modal when clicking the dark overlay (not the form itself)
taskModal.addEventListener('click', (event) => {
  if (event.target === taskModal) closeModal();
});


// --- INITIAL LOAD ---

// Fetch and display all tasks as soon as the page is ready.
loadTasks();
