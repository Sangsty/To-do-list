const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const dueDateInput = document.getElementById('due-date-input');
const itemList = document.getElementById('item-list');
const clearBtn = document.getElementById('clear');
let timers = {};

// Display current date and time
function updateDateTime() {
  const now = new Date();
  document.getElementById('date-time').textContent = now.toLocaleString();
}

// Display task count
function updateTaskCount() {
  const tasks = getItemsFromStorage();
  document.getElementById('task-count').textContent = `${tasks.length} tasks`;
}

// Add new task
function onAddItemSubmit(e) {
  e.preventDefault();
  const task = itemInput.value.trim();
  const dueDate = dueDateInput.value;
  if (!task) {
    alert('Please enter a task');
    return;
  }

  const newTask = {
    task,
    dueDate: dueDate || 'No deadline',
    completed: 0,
    elapsedTime: 0,
  };

  addItemToDOM(newTask);
  saveToStorage(newTask);

  itemInput.value = '';
  dueDateInput.value = '';
  updateTaskCount();
}

// Add task to DOM
function addItemToDOM(task) {
  const li = document.createElement('li');

  // Task details
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'task-details';
  detailsDiv.innerHTML = `
    <span>${task.task} - Due: ${task.dueDate}</span>
    <span class="timer">0:00</span>
  `;

  // Start/Stop timer button
  const timerBtn = document.createElement('button');
  timerBtn.textContent = 'Start Timer';
  timerBtn.className = 'btn';
  timerBtn.addEventListener('click', () => toggleTimer(task, detailsDiv));
  detailsDiv.appendChild(timerBtn);

  li.appendChild(detailsDiv);

  // Completion slider
  const completionDiv = document.createElement('div');
  completionDiv.className = 'completion';
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 100;
  slider.value = task.completed;
  slider.className = 'slider';
  const percentage = document.createElement('span');
  percentage.textContent = `${task.completed}%`;

  slider.addEventListener('input', (e) => {
    task.completed = e.target.value;
    percentage.textContent = `${task.completed}%`;
    updateTaskInStorage(task);
  });

  completionDiv.appendChild(slider);
  completionDiv.appendChild(percentage);

  li.appendChild(completionDiv);

  // Append task to the list
  itemList.appendChild(li);
}

// Toggle timer functionality
function toggleTimer(task, detailsDiv) {
  const timerSpan = detailsDiv.querySelector('.timer');
  const timerBtn = detailsDiv.querySelector('button');

  if (!timers[task.task]) {
    // Start Timer
    let seconds = task.elapsedTime;
    timers[task.task] = setInterval(() => {
      seconds++;
      task.elapsedTime = seconds; // Update elapsed time for the task
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timerSpan.textContent = `${minutes}:${secs.toString().padStart(2, "0")}`;
      updateTaskInStorage(task);
    }, 1000);

    timerBtn.textContent = 'Stop Timer';
  } else {
    // Stop Timer
    clearInterval(timers[task.task]);
    delete timers[task.task];
    timerBtn.textContent = 'Start Timer';
  }
}

// Save task to local storage
function saveToStorage(task) {
  const tasks = getItemsFromStorage();
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Get tasks from local storage
function getItemsFromStorage() {
  return localStorage.getItem('tasks')
    ? JSON.parse(localStorage.getItem('tasks'))
    : [];
}

// Update task in local storage
function updateTaskInStorage(task) {
  const tasks = getItemsFromStorage();
  const index = tasks.findIndex(t => t.task === task.task);
  if (index !== -1) {
    tasks[index] = task;
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}

// Display all tasks on page load
function displayItems() {
  const tasks = getItemsFromStorage();
  tasks.forEach(addItemToDOM);
  updateTaskCount();
}

// Clear all tasks
function clearItems() {
  if (confirm('Are you sure you want to clear all tasks?')) {
    localStorage.removeItem('tasks');
    itemList.innerHTML = '';
    updateTaskCount();
  }
}

// Event Listeners
itemForm.addEventListener('submit', onAddItemSubmit);
clearBtn.addEventListener('click', clearItems);
document.addEventListener('DOMContentLoaded', displayItems);
document.addEventListener('DOMContentLoaded', updateDateTime);
setInterval(updateDateTime, 1000); // Update every second

