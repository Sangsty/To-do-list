const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const dueDateInput = document.getElementById('due-date-input');
const itemList = document.getElementById('item-list');
const clearBtn = document.getElementById('clear');
const itemFilter = document.getElementById('filter');
const formBtn = itemForm.querySelector('button');
let timers = {};

// Function to display the current date and time in IST
function updateDateTime() {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const formattedDateTime = now.toLocaleString('en-US', options);
  document.getElementById('date-time').textContent = formattedDateTime;
}

// Function to update the task count
function updateTaskCount() {
  const itemsFromStorage = getItemsFromStorage();
  const taskCount = itemsFromStorage.length;
  document.getElementById('task-count').textContent = `${taskCount} tasks`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(2);
  return `${day}/${month}/${year}`;
}

function displayItems() {
  const itemsFromStorage = getItemsFromStorage();
  itemsFromStorage.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  itemsFromStorage.forEach((item) => addItemToDOM(item));
  checkUI();
  updateTaskCount(); // Update task count after displaying items
}

function onAddItemSubmit(e) {
  e.preventDefault();
  const newItem = itemInput.value.trim();
  const dueDate = dueDateInput.value;

  if (newItem === '') {
    alert('Please add an item');
    return;
  }
  const formattedDueDate = dueDate ? formatDate(dueDate) : "None set";

  const item = { task: newItem, dueDate: formattedDueDate, completed: false, elapsedTime: 0 };

  addItemToDOM(item);
  addItemToStorage(item);
  checkUI();
  updateTaskCount(); // Update task count after adding a new item

  itemInput.value = '';
  dueDateInput.value = '';
}

function addItemToDOM(item) {
  const li = document.createElement("li");
  li.appendChild(document.createTextNode(`${item.task} - Due: ${item.dueDate}`));

  // Create Start/Stop Timer clock icon
  const timerButton = createButton("start-timer timer-icon");
  timerButton.innerHTML = item.elapsedTime > 0 ? "&#x23F2;" : "&#x1F550;"; // Clock icon (start/resume)
  timerButton.addEventListener("click", () => toggleTimer(item, li));
  li.appendChild(timerButton);

  const timerSpan = document.createElement("span");
  timerSpan.className = "timer";
  const minutes = Math.floor(item.elapsedTime / 60);
  const seconds = item.elapsedTime % 60;
  timerSpan.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  li.appendChild(timerSpan);

  const removeButton = createButton("remove-item btn-link text-red");
  removeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  removeButton.addEventListener("click", () => removeItem(item, li));
  li.appendChild(removeButton);

  itemList.appendChild(li);
}

function createButton(classes) {
  const button = document.createElement("button");
  button.className = classes;
  return button;
}

function toggleTimer(item, li) {
  const timerSpan = li.querySelector(".timer");
  const timerButton = li.querySelector(".start-timer");

  if (!timers[item.task]) {
    // Start Timer
    let seconds = item.elapsedTime;
    timers[item.task] = setInterval(() => {
      seconds++;
      item.elapsedTime = seconds; // Update elapsed time for the task
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timerSpan.textContent = `${minutes}:${secs.toString().padStart(2, "0")}`;
      updateItemInStorage(item); // Store updated elapsed time in storage
    }, 1000);

    timerButton.innerHTML = "&#x23F3;"; // Pause (clock icon)
  } else {
    // Stop Timer
    clearInterval(timers[item.task]);
    delete timers[item.task];
    timerButton.innerHTML = "&#x1F550;"; // Start (clock icon)
  }
  updateItemInStorage(item); // Store updated elapsed time in storage
}

function removeItem(item, li) {
  if (confirm(`Are you sure you want to delete the task "${item.task}"?`)) {
    li.remove();
    removeItemFromStorage(item);
    checkUI();
    updateTaskCount(); // Update task count after removing an item
  }
}

function clearItems() {
  if (confirm('Are you sure you want to clear all tasks?')) {
    itemList.innerHTML = '';
    localStorage.removeItem("items");
    checkUI();
    updateTaskCount(); // Update task count after clearing all items
  }
}

function removeItemFromStorage(item) {
  const itemsFromStorage = getItemsFromStorage();
  const updatedItems = itemsFromStorage.filter(i => i.task !== item.task);
  localStorage.setItem("items", JSON.stringify(updatedItems));
}

function checkUI() {
  const itemsFromStorage = getItemsFromStorage();
  if (itemsFromStorage.length === 0) {
    clearBtn.style.display = 'none';
  } else {
    clearBtn.style.display = 'block';
  }
}

function getItemsFromStorage() {
  return localStorage.getItem("items")
    ? JSON.parse(localStorage.getItem("items"))
    : [];
}

function addItemToStorage(item) {
  const itemsFromStorage = getItemsFromStorage();
  itemsFromStorage.push(item);
  localStorage.setItem("items", JSON.stringify(itemsFromStorage));
}

function updateItemInStorage(item) {
  const itemsFromStorage = getItemsFromStorage();
  const index = itemsFromStorage.findIndex(i => i.task === item.task);
  if (index !== -1) {
    itemsFromStorage[index] = item;
    localStorage.setItem("items", JSON.stringify(itemsFromStorage));
  }
}

// Event Listeners
itemForm.addEventListener("submit", onAddItemSubmit);
clearBtn.addEventListener("click", clearItems);
document.addEventListener("DOMContentLoaded", displayItems);
document.addEventListener("DOMContentLoaded", updateDateTime);
setInterval(updateDateTime, 1000); // Update every second
