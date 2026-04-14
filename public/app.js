// app.js — TaskMaster Frontend-Logik
// ---------------------------------------------------------
// Läuft im Browser. Zuständig für:
//   - Tasks vom Server laden und als Cards anzeigen
//   - Modal-Formular für Erstellen und Bearbeiten
//   - HTTP-Anfragen an den Server senden (POST, PUT, DELETE)
//   - Tasks filtern wenn Kategorie geklickt wird
// ---------------------------------------------------------


// --- ZUSTAND & ELEMENT-REFERENZEN ---

// Aktuell ausgewählte Kategorie. "All" = alles anzeigen.
let activeCategory = 'All';

// DOM-Elemente einmalig cachen — schneller als wiederholtes getElementById
const taskList      = document.getElementById('taskList');
const taskModal     = document.getElementById('taskModal');
const taskForm      = document.getElementById('taskForm');
const modalTitle    = document.getElementById('modalTitle');
const openModalBtn  = document.getElementById('openModalBtn');
const cancelBtn     = document.getElementById('cancelBtn');
const sectionTitle  = document.getElementById('sectionTitle');
const categoryItems = document.querySelectorAll('.category-item');

// Formularfelder
const taskIdInput       = document.getElementById('taskId');
const taskTitleInput    = document.getElementById('taskTitle');
const taskDescInput     = document.getElementById('taskDescription'); // genutzt von Rike (Edit-Modal) und Melina (POST)
const taskCategoryInput = document.getElementById('taskCategory');
const taskDueDateInput  = document.getElementById('taskDueDate');
const searchInput       = document.getElementById('searchInput');
const clearSearchBtn    = document.getElementById('clearSearchBtn');


// ---------------------------------------------------------
// PERSON 3 (Melina) -- Search
// ---------------------------------------------------------

// Listen for typing in the search bar
searchInput.addEventListener('input', async () => {
  const q = searchInput.value.trim();

  if (q === '') {
    // Empty search — go back to normal task list
    clearSearchBtn.classList.add('hidden');
    loadTasks();
    return;
  }

  // Show the Clear button while searching
  clearSearchBtn.classList.remove('hidden');

  // Fetch search results from GET /api/tasks/search?q=...
  const response = await fetch(`/api/tasks/search?q=${encodeURIComponent(q)}`);
  const results  = await response.json();

  sectionTitle.textContent = `Search results for "${q}"`;
  renderTasks(results);
});

// Clear button resets the search
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  sectionTitle.textContent = activeCategory === 'All' ? 'All Tasks' : activeCategory + ' Tasks';
  loadTasks();
});

// ---------------------------------------------------------
// PERSON 4 (Claire) -- Stats laden & anzeigen
// ---------------------------------------------------------

// Fetch completion stats from GET /api/tasks/stats and update the stats bar
async function loadStats() {
  const response = await fetch('/api/tasks/stats');
  const stats    = await response.json();

  const statsBar  = document.getElementById('statsBar');
  const statsText = document.getElementById('statsText');

  statsText.textContent = `✅ ${stats.completed} of ${stats.total} tasks completed  |  ⏳ ${stats.pending} pending`;

  // Turn the bar green when everything is done
  if (stats.total > 0 && stats.completed === stats.total) {
    statsBar.classList.add('all-done');
  } else {
    statsBar.classList.remove('all-done');
  }
}

// ---------------------------------------------------------
// PERSON 4 (Claire) -- Tasks laden
// ---------------------------------------------------------

// Alle Tasks vom Server laden, filtern und als Cards rendern
async function loadTasks() {
  const response = await fetch('/api/tasks');       // GET /api/tasks
  const tasks    = await response.json();           // JSON → JavaScript-Array

  const filtered = activeCategory === 'All'
    ? tasks
    : tasks.filter(t => t.category === activeCategory);

  renderTasks(filtered);
  loadStats(); // Always refresh the stats bar after loading tasks
}

// ---------------------------------------------------------
// PERSON 6 (Nessi) -- Tasks rendern
// ---------------------------------------------------------

// HTML-Task-Cards bauen und in die Seite einfügen
function renderTasks(tasks) {
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <p>No tasks here yet. Click "+ Add Task" to get started!</p>
      </div>`;
    return;
  }

  // Jeden Task in einen HTML-String umwandeln und zusammenfügen
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


// ---------------------------------------------------------
// PERSON 1 (Jakob) -- Modal öffnen & schließen
// ---------------------------------------------------------

// Modal mit leerem Formular für einen neuen Task öffnen
function openAddModal() {
  modalTitle.textContent = 'Add New Task';
  taskForm.reset();
  taskIdInput.value = ''; // Leer = POST (Erstellen)
  taskModal.classList.remove('hidden');
}

// Modal schließen und Formular leeren
function closeModal() {
  taskModal.classList.add('hidden');
  taskForm.reset();
}


// ---------------------------------------------------------
// PERSON 5 (Rike) -- Task bearbeiten
// ---------------------------------------------------------

// Task per ID vom Server laden, dann Modal mit Daten befüllen
async function openEditModal_fetch(id) {
  const response = await fetch(`/api/tasks/${id}`); // GET /api/tasks/:id
  const task     = await response.json();
  openEditModal(task);
}

// Modal mit vorhandenen Task-Daten befüllen (Bearbeitungsmodus)
function openEditModal(task) {
  modalTitle.textContent      = 'Edit Task';
  taskIdInput.value           = task.id;           // ID speichern → signalisiert PUT
  taskTitleInput.value        = task.title;
  taskDescInput.value         = task.description || '';
  taskCategoryInput.value     = task.category;
  taskDueDateInput.value      = task.dueDate || '';
  taskModal.classList.remove('hidden');
}

// Formular absenden — ERSTELLEN (POST) oder AKTUALISIEREN (PUT)
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Verhindert Browser-Seitenneuladen

  const id = taskIdInput.value; // Leer = POST, gesetzt = PUT

  const taskData = {
    title:       taskTitleInput.value,
    description: taskDescInput.value,
    category:    taskCategoryInput.value,
    dueDate:     taskDueDateInput.value || null,
  };

  if (id) {
    // ID vorhanden → PUT (aktualisieren)
    await fetch(`/api/tasks/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(taskData),
    });
  } else {
    // Keine ID → POST (erstellen)
    await fetch('/api/tasks', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(taskData),
    });
  }

  closeModal();
  loadTasks(); // Liste neu laden damit Änderung sichtbar wird
});


// ---------------------------------------------------------
// PERSON 6 (Nessi) -- Task löschen, abschließen & Kategorie-Filter
// ---------------------------------------------------------

// Erledigungsstatus eines Tasks umschalten (PUT)
async function toggleComplete(id, currentStatus) {
  await fetch(`/api/tasks/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ completed: !currentStatus }),
  });
  loadTasks();
}

// Task nach Bestätigung löschen (DELETE)
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}


// Kategorie-Filter — Klick-Listener an jedes Kategorie-Element hängen
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


// ---------------------------------------------------------
// PERSON 1 (Jakob) -- Event Listener & App-Start
// ---------------------------------------------------------

openModalBtn.addEventListener('click', openAddModal);
cancelBtn.addEventListener('click', closeModal);

// Modal schließen wenn auf den dunklen Hintergrund geklickt wird
taskModal.addEventListener('click', (event) => {
  if (event.target === taskModal) closeModal();
});

// Tasks und Stats sofort laden wenn die Seite bereit ist
loadTasks();
loadStats();
