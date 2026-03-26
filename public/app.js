// ============================================================
// PERSON 6 — public/app.js
// Role: Frontend JavaScript (Browser-Side Logic)
// ============================================================
// This file runs INSIDE the browser (not on the server).
// It fetches tasks from the API, builds the task cards in the
// HTML, handles all button clicks, form submissions, and
// category filtering.
// ============================================================

// ---- LINE 1: State variable — which category is currently selected ----
let activeCategory = 'All';

// ---- LINE 2: Grab references to important HTML elements ----
// These correspond to the id attributes set in index.html (Person 4)
const taskList      = document.getElementById('taskList');
const taskModal     = document.getElementById('taskModal');
const taskForm      = document.getElementById('taskForm');
const modalTitle    = document.getElementById('modalTitle');
const openModalBtn  = document.getElementById('openModalBtn');
const cancelBtn     = document.getElementById('cancelBtn');
const sectionTitle  = document.getElementById('sectionTitle');
const categoryItems = document.querySelectorAll('.category-item');

// ---- LINE 3: Form input fields ----
const taskIdInput          = document.getElementById('taskId');
const taskTitleInput       = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskCategoryInput    = document.getElementById('taskCategory');
const taskDueDateInput     = document.getElementById('taskDueDate');

// ============================================================
// SECTION A: FETCHING AND DISPLAYING TASKS
// ============================================================

// Line 4–18: loadTasks() — fetches all tasks from the API and renders them
// 'async' means this function can use 'await' to wait for the API response
async function loadTasks() {
  try {
    // Fetch all tasks from our Node.js API (Person 3's route)
    const response = await fetch('/api/tasks');
    const tasks = await response.json();  // Parse JSON response

    // Filter to only show tasks in the active category
    const filtered = activeCategory === 'All'
      ? tasks
      : tasks.filter(task => task.category === activeCategory);

    // Render the filtered tasks in the HTML
    renderTasks(filtered);
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

// Line 19–43: renderTasks() — builds and injects HTML task cards into the page
function renderTasks(tasks) {
  // If no tasks match the filter, show a friendly empty message
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p>No tasks here yet. Click "+ Add Task" to get started!</p>
      </div>
    `;
    return;
  }

  // Build an HTML string for all task cards and inject it at once
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

// ============================================================
// SECTION B: MODAL (POP-UP) CONTROL
// ============================================================

// Line 44–50: openAddModal() — opens the modal form for a NEW task
function openAddModal() {
  modalTitle.textContent = 'Add New Task';
  taskForm.reset();          // Clear any previous values
  taskIdInput.value = '';    // No existing ID — this is a new task
  taskModal.classList.remove('hidden');
}

// Line 51–61: openEditModal() — opens the modal pre-filled for editing
// 'task' is the task object from the card's onclick attribute
function openEditModal(task) {
  modalTitle.textContent = 'Edit Task';
  taskIdInput.value          = task.id;
  taskTitleInput.value       = task.title;
  taskDescriptionInput.value = task.description || '';
  taskCategoryInput.value    = task.category;
  taskDueDateInput.value     = task.dueDate || '';
  taskModal.classList.remove('hidden');
}

// Line 62–65: closeModal() — hides the modal and resets the form
function closeModal() {
  taskModal.classList.add('hidden');
  taskForm.reset();
}

// ============================================================
// SECTION C: CRUD OPERATIONS (API CALLS)
// ============================================================

// Line 66–90: Form submission — handles both CREATE and UPDATE
taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();  // Stop the browser from reloading the page

  // Build the task data object from form values
  const taskData = {
    title:       taskTitleInput.value,
    description: taskDescriptionInput.value,
    category:    taskCategoryInput.value,
    dueDate:     taskDueDateInput.value || null,
  };

  const id = taskIdInput.value;

  try {
    if (id) {
      // ID exists → UPDATE an existing task (PUT request)
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
    } else {
      // No ID → CREATE a new task (POST request)
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
    }
    closeModal();
    loadTasks();  // Refresh the list to show the change
  } catch (error) {
    console.error('Error saving task:', error);
  }
});

// Line 91–101: toggleComplete() — marks a task done or undone
async function toggleComplete(id, currentStatus) {
  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus }),
    });
    loadTasks();  // Refresh to reflect new status
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

// Line 102–113: deleteTask() — sends a DELETE request to remove a task
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  try {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

// ============================================================
// SECTION D: CATEGORY FILTERING
// ============================================================

// Line 114–126: Add click listener to each category item in the sidebar
categoryItems.forEach(item => {
  item.addEventListener('click', () => {
    // Remove 'active' class from all items
    categoryItems.forEach(i => i.classList.remove('active'));
    // Add 'active' class to the clicked item
    item.classList.add('active');
    // Update the active category and section title
    activeCategory = item.dataset.category;
    sectionTitle.textContent = activeCategory === 'All' ? 'All Tasks' : activeCategory + ' Tasks';
    loadTasks();  // Reload with new filter
  });
});

// ============================================================
// SECTION E: EVENT LISTENERS FOR MODAL BUTTONS
// ============================================================

// Line 127: Open modal when "+ Add Task" button is clicked
openModalBtn.addEventListener('click', openAddModal);

// Line 128: Close modal when "Cancel" button is clicked
cancelBtn.addEventListener('click', closeModal);

// Line 129: Close modal when clicking outside the white modal box
taskModal.addEventListener('click', (event) => {
  if (event.target === taskModal) closeModal();
});

// ============================================================
// SECTION F: INITIAL LOAD
// ============================================================

// Line 130: When the page first loads, fetch and display all tasks
loadTasks();
