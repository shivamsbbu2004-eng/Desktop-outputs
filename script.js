(() => {
  'use strict';

  const STORAGE_KEY = 'daylight-planner-tasks-v1';
  const THEME_KEY = 'daylight-planner-theme-v1';
  const form = document.querySelector('#task-form');
  const input = document.querySelector('#task-input');
  const categoryInput = document.querySelector('#task-category');
  const list = document.querySelector('#task-list');
  const emptyState = document.querySelector('#empty-state');
  const message = document.querySelector('#form-message');
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  let tasks = loadTasks();
  let filter = 'all';
  let messageTimer;

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(task => task && typeof task.id === 'string' && typeof task.title === 'string' && typeof task.completed === 'boolean' && ['Personal', 'Work', 'Wellbeing'].includes(task.category)) : [];
    } catch { return []; }
  }

  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch { announce('Your browser could not save this change.'); }
  }

  function announce(text) {
    message.textContent = text;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => { message.textContent = ''; }, 2800);
  }

  function render() {
    const completed = tasks.filter(task => task.completed).length;
    const remaining = tasks.length - completed;
    const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    document.querySelector('#task-count').textContent = tasks.length;
    document.querySelector('#all-count').textContent = tasks.length;
    document.querySelector('#completed-count').textContent = completed;
    document.querySelector('#remaining-count').textContent = remaining;
    document.querySelector('#progress-percent').textContent = `${percent}%`;
    document.querySelector('#progress-ring').style.setProperty('--progress', `${percent * 3.6}deg`);
    document.querySelector('#progress-ring').setAttribute('aria-label', `${percent} percent of tasks completed`);
    document.querySelector('#progress-caption').textContent = !tasks.length ? 'Every task is a fresh chance.' : percent === 100 ? 'You made space for it all. Well done.' : `${remaining} small ${remaining === 1 ? 'step' : 'steps'} still ahead.`;

    const visible = tasks.filter(task => filter === 'all' || (filter === 'active' && !task.completed) || (filter === 'completed' && task.completed));
    list.replaceChildren(...visible.map(task => {
      const item = document.createElement('li');
      item.className = `task-item${task.completed ? ' completed' : ''}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; checkbox.className = 'task-check'; checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `${task.completed ? 'Mark incomplete' : 'Complete'}: ${task.title}`);
      checkbox.addEventListener('change', () => { task.completed = checkbox.checked; saveTasks(); render(); });
      const copy = document.createElement('div'); copy.className = 'task-copy';
      const title = document.createElement('div'); title.className = 'task-title'; title.textContent = task.title;
      const tag = document.createElement('span'); tag.className = `task-category ${task.category.toLowerCase()}`; tag.textContent = task.category;
      copy.append(title, tag);
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Delete: ${task.title}`);
      remove.addEventListener('click', () => { tasks = tasks.filter(entry => entry.id !== task.id); saveTasks(); render(); announce('Task removed.'); });
      item.append(checkbox, copy, remove);
      return item;
    }));
    emptyState.classList.toggle('hidden', visible.length > 0);
    emptyState.querySelector('strong').textContent = tasks.length && !visible.length ? 'Nothing here yet.' : 'A fresh page.';
    emptyState.lastElementChild.textContent = tasks.length && !visible.length ? 'Try a different filter.' : 'Add one small task to get started.';
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) { announce('Add a task name first.'); input.focus(); return; }
    tasks.unshift({ id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`, title, category: categoryInput.value, completed: false });
    input.value = '';
    filter = 'all';
    filterButtons.forEach(button => { const active = button.dataset.filter === filter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    saveTasks(); render(); announce('Task added. One step at a time.'); input.focus();
  });

  filterButtons.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    filterButtons.forEach(option => { const active = option === button; option.classList.toggle('active', active); option.setAttribute('aria-pressed', String(active)); });
    render();
  }));

  document.querySelector('#clear-completed').addEventListener('click', () => {
    const before = tasks.length;
    tasks = tasks.filter(task => !task.completed);
    if (tasks.length === before) { announce('There are no completed tasks to clear.'); return; }
    saveTasks(); render(); announce('Completed tasks cleared.');
  });

  const themeButton = document.querySelector('#theme-toggle');
  function setTheme(theme) {
    const dark = theme === 'dark';
    document.body.classList.toggle('dark', dark);
    document.querySelector('#theme-icon').textContent = dark ? '☀' : '☾';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch { /* Theme still works for this visit. */ }
  }
  let initialTheme = 'light';
  try { initialTheme = localStorage.getItem(THEME_KEY) || 'light'; } catch { /* Use the default theme. */ }
  setTheme(initialTheme);
  themeButton.addEventListener('click', () => setTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));

  document.querySelector('#today-label').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase();
  render();
})();
