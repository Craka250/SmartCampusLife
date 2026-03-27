// Toast
function showNotification(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

// Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// DATA
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filter = "all";

// ELEMENTS
const form = document.getElementById("taskForm");
const container = document.getElementById("tasksContainer");
const searchInput = document.getElementById("searchTask");

// ADD / EDIT TASK
if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("taskId").value;
    const title = document.getElementById("taskTitle").value.trim();
    const date = document.getElementById("taskDate").value;
    const priority = document.getElementById("taskPriority").value;

    if (!title || !date) {
      showNotification("Fill all fields!");
      return;
    }

    if (id) {
      // EDIT
      tasks = tasks.map(task =>
        task.id == id ? { ...task, title, date, priority } : task
      );
      showNotification("Task updated!");
    } else {
      // ADD
      tasks.push({
        id: Date.now(),
        title,
        date,
        priority,
        completed: false
      });
      showNotification("Task added!");
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    form.reset();
    document.getElementById("taskId").value = "";
    renderTasks();
  });
}

// RENDER
function renderTasks() {
  if (!container) return;

  container.innerHTML = "";

  let filtered = tasks;

  // FILTER
  if (filter === "completed") {
    filtered = tasks.filter(t => t.completed);
  } else if (filter === "pending") {
    filtered = tasks.filter(t => !t.completed);
  }

  // SEARCH
  const search = searchInput?.value.toLowerCase() || "";
  filtered = filtered.filter(t => t.title.toLowerCase().includes(search));

  if (filtered.length === 0) {
    container.innerHTML = "<p>No tasks found.</p>";
    return;
  }

  filtered.forEach(task => {
    const div = document.createElement("div");
    div.className = `task ${task.priority}`;

    div.innerHTML = `
      <div class="task-info ${task.completed ? "completed" : ""}">
        <label>
          <input type="checkbox" ${task.completed ? "checked" : ""} 
          onchange="toggleComplete(${task.id})">
          <strong>${task.title}</strong>
        </label>
        <small>Due: ${task.date}</small>
      </div>

      <div class="task-actions">
        <button onclick="editTask(${task.id})">✏️</button>
        <button onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;

    container.appendChild(div);
  });

  updateStats();
}

// COMPLETE
function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

// DELETE
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  showNotification("Deleted!");
}

// EDIT
function editTask(id) {
  const task = tasks.find(t => t.id === id);

  document.getElementById("taskId").value = task.id;
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDate").value = task.date;
  document.getElementById("taskPriority").value = task.priority;

  showNotification("Editing task...");
}

// FILTER
function filterTasks(type) {
  filter = type;
  renderTasks();
}

// SEARCH
if (searchInput) {
  searchInput.addEventListener("input", renderTasks);
}

// STATS
function updateStats() {
  document.getElementById("totalTasks").innerText = tasks.length;
  document.getElementById("completedTasks").innerText =
    tasks.filter(t => t.completed).length;
  document.getElementById("pendingTasks").innerText =
    tasks.filter(t => !t.completed).length;
}

// INIT
renderTasks();
