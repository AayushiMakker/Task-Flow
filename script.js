
let tasks         = [];   // Array<{ id, text, completed, createdAt }>
let currentFilter = 'all';

/*  DOM refs */
const taskInput    = document.getElementById('task-input');
const addBtn       = document.getElementById('add-btn');
const inputBar     = taskInput.closest('.input-bar');
const taskList     = document.getElementById('task-list');
const emptyState   = document.getElementById('empty-state');
const emptyTitle   = document.getElementById('empty-title');
const emptySub     = document.getElementById('empty-sub');
const errorMsg     = document.getElementById('error-msg');
const statTotal    = document.getElementById('stat-total');
const statDone     = document.getElementById('stat-done');
const progressBar  = document.getElementById('progress-bar');
const filterPills  = document.querySelectorAll('.filter-pill');
const clearBtn     = document.getElementById('clear-btn');

/*  LocalStorage helpers  */

/**
 * loadTasks — parse tasks from localStorage; return [] on failure.
 * @returns {Array}
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem('taskflow_v2');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/**
 * saveTasks — serialise current tasks array to localStorage.
 */
function saveTasks() {
  localStorage.setItem('taskflow_v2', JSON.stringify(tasks));
}

/*  Validation helpers  */

/**
 * showError — display error message + shake animation.
 * @param {string} msg
 */
function showError(msg) {
  errorMsg.textContent = msg;
  inputBar.classList.add('is-error');
  inputBar.addEventListener(
    'animationend',
    () => inputBar.classList.remove('is-error'),
    { once: true }
  );
}

/** clearError — hide error and reset input bar styling. */
function clearError() {
  errorMsg.textContent = '';
  inputBar.classList.remove('is-error');
}

/* Task CRUD */

/** generateId — unique task identifier. @returns {string} */
function generateId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * addTask — validate input, prepend new task object, save, re-render.
 */
function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    showError('Please enter a task before adding.');
    taskInput.focus();
    return;
  }
  if (text.length < 2) {
    showError('Task must be at least 2 characters.');
    return;
  }

  clearError();

  tasks.unshift({ id: generateId(), text, completed: false, createdAt: new Date().toISOString() });
  saveTasks();
  renderTasks();

  taskInput.value = '';
  taskInput.focus();
}

/**
 * toggleTask — flip completed flag for task with given id.
 * @param {string} id
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) { task.completed = !task.completed; saveTasks(); renderTasks(); }
}

/**
 * deleteTask — animate row out, then remove from state.
 * @param {string}      id
 * @param {HTMLElement} itemEl — the <li> to animate
 */
function deleteTask(id, itemEl) {
  itemEl.classList.add('removing');
  itemEl.addEventListener('animationend', () => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }, { once: true });
}

/**
 * clearCompleted — animate all completed rows out, then remove from state.
 */
function clearCompleted() {
  const completedEls = taskList.querySelectorAll('.task-item.completed');
  if (!completedEls.length) return;
  completedEls.forEach(el => el.classList.add('removing'));
  setTimeout(() => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
  }, 250);
}

/*  Rendering */

/** getFilteredTasks — subset based on currentFilter. @returns {Array} */
function getFilteredTasks() {
  if (currentFilter === 'active')    return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

/**
 * createTaskEl — build and return a single <li> DOM node.
 * @param {{ id:string, text:string, completed:boolean }} task
 * @returns {HTMLLIElement}
 */
function createTaskEl(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  // Checkbox
  const cbId  = `cb-${task.id}`;
  const cb    = document.createElement('input');
  cb.type     = 'checkbox';
  cb.id       = cbId;
  cb.className = 'task-checkbox';
  cb.checked  = task.completed;
  cb.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
  cb.addEventListener('change', () => toggleTask(task.id));

  const cbLabel   = document.createElement('label');
  cbLabel.htmlFor = cbId;
  cbLabel.className = 'task-checkbox-label';
  cbLabel.setAttribute('aria-hidden', 'true');

  // Text
  const span = document.createElement('span');
  span.className   = 'task-text';
  span.textContent = task.text;

  // Delete button (trash icon)
  const del = document.createElement('button');
  del.className = 'btn-delete';
  del.setAttribute('aria-label', `Delete "${task.text}"`);
  del.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4
               M6.5 7v5M9.5 7v5
               M3 4l.8 9.2A.8.8 0 0 0 3.8 14h8.4a.8.8 0 0 0 .8-.8L13 4"
            stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  del.addEventListener('click', e => { e.stopPropagation(); deleteTask(task.id, li); });

  li.appendChild(cb);
  li.appendChild(cbLabel);
  li.appendChild(span);
  li.appendChild(del);
  return li;
}

/**
 * updateStats — refresh nav counters + progress bar.
 * DOM Manipulation: directly sets textContent and style.width.
 */
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pct       = total > 0 ? (completed / total) * 100 : 0;

  statTotal.textContent = total;
  statDone.textContent  = completed;
  progressBar.style.width = `${pct}%`;
}

/**
 * renderTasks — master render function.
 * Clears the list and rebuilds it; manages empty state visibility.
 */
function renderTasks() {
  taskList.innerHTML = ''; // DOM Manipulation: wipe and rebuild

  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    emptyState.hidden = false;
    // Context-aware empty state copy
    if (currentFilter === 'completed') {
      emptyTitle.textContent = 'No completed tasks';
      emptySub.textContent   = 'Finish a task and it will show up here.';
    } else if (currentFilter === 'active') {
      emptyTitle.textContent = 'All caught up!';
      emptySub.textContent   = 'Every task is done. Add something new above.';
    } else {
      emptyTitle.textContent = 'Nothing here yet';
      emptySub.textContent   = 'Type a task above and press Enter to get started.';
    }
  } else {
    emptyState.hidden = true;
    const frag = document.createDocumentFragment();
    filtered.forEach(t => frag.appendChild(createTaskEl(t)));
    taskList.appendChild(frag);
  }

  updateStats();
}

/*  Event listeners  */

function initEvents() {
  // Add task — button click
  addBtn.addEventListener('click', addTask);

  // Add task — Enter key
  taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addTask(); }
  });

  // Live-clear error while typing
  taskInput.addEventListener('input', () => {
    if (taskInput.value.trim()) clearError();
  });

  // Filter pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderTasks();
    });
  });

  // Clear completed
  clearBtn.addEventListener('click', clearCompleted);
}

/* Init */

function init() {
  tasks = loadTasks();
  initEvents();
  renderTasks();
}

document.addEventListener('DOMContentLoaded', init);