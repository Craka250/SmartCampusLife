// AUTH GUARD (Protect Pages)
/*
(function () {
  const publicPages = ["login.html"];
  const currentPage = window.location.pathname.split("/").pop();

  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user && !publicPages.includes(currentPage)) {
    window.location.href = "login.html";
  }
})(); */

(function () {
  const publicPages = ["login.html"];

  let currentPage = window.location.pathname.split("/").pop();

  // FIX: handle root path
  if (currentPage === "") {
    currentPage = "index.html";
  }

  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user && !publicPages.includes(currentPage)) {
    window.location.href = "./index.html";
  }
})();

// Prevent logged-in user from seeing login page again
if (window.location.pathname.includes("login.html")) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user) {
    window.location.href = "./index.html";
  }
}

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

// LIBRARY SYSTEM
let books = JSON.parse(localStorage.getItem("books")) || [
  { id: 1, title: "Human Computer Interaction", author: "Alan Dix", borrowed: false },
  { id: 2, title: "Database Systems", author: "Elmasri", borrowed: false },
  { id: 3, title: "JavaScript Basics", author: "John Doe", borrowed: false },
  { id: 4, title: "Computer Networks", author: "Tanenbaum", borrowed: false }
];

let bookFilter = "all";

const booksContainer = document.getElementById("booksContainer");
const searchBook = document.getElementById("searchBook");

// RENDER BOOKS
function renderBooks() {
  if (!booksContainer) return;

  let filtered = books;

  // FILTER
  if (bookFilter === "available") {
    filtered = books.filter(b => !b.borrowed);
  } else if (bookFilter === "borrowed") {
    filtered = books.filter(b => b.borrowed);
  }

  // SEARCH
  const search = searchBook?.value.toLowerCase() || "";
  filtered = filtered.filter(b => b.title.toLowerCase().includes(search));

  booksContainer.innerHTML = "";

  if (filtered.length === 0) {
    booksContainer.innerHTML = "<p>No books found.</p>";
    return;
  }

  filtered.forEach(book => {
    const div = document.createElement("div");
    div.className = `book ${book.borrowed ? "borrowed" : ""}`;

    div.innerHTML = `
      <div class="book-info">
        <strong>${book.title}</strong>
        <small>${book.author}</small>
      </div>

      <div>
        ${
          book.borrowed
            ? `<button class="return-btn" onclick="returnBook(${book.id})">Return</button>`
            : `<button class="borrow-btn" onclick="borrowBook(${book.id})">Borrow</button>`
        }
      </div>
    `;

    booksContainer.appendChild(div);
  });

  updateBookStats();
}

// BORROW
function borrowBook(id) {
  books = books.map(b =>
    b.id === id ? { ...b, borrowed: true } : b
  );

  localStorage.setItem("books", JSON.stringify(books));
  renderBooks();
  showNotification("Book borrowed!");
}

// RETURN
function returnBook(id) {
  books = books.map(b =>
    b.id === id ? { ...b, borrowed: false } : b
  );

  localStorage.setItem("books", JSON.stringify(books));
  renderBooks();
  showNotification("Book returned!");
}

// FILTER
function filterBooks(type) {
  bookFilter = type;
  renderBooks();
}

// SEARCH
if (searchBook) {
  searchBook.addEventListener("input", renderBooks);
}

// STATS
function updateBookStats() {
  document.getElementById("totalBooks").innerText = books.length;
  document.getElementById("availableBooks").innerText =
    books.filter(b => !b.borrowed).length;
  document.getElementById("borrowedBooks").innerText =
    books.filter(b => b.borrowed).length;
}

// INIT
renderBooks();

// STORE SYSTEM

let products = [
  { id: 1, name: "Notebook", price: 100 },
  { id: 2, name: "Pen", price: 20 },
  { id: 3, name: "Backpack", price: 1500 },
  { id: 4, name: "Calculator", price: 800 }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const productsContainer = document.getElementById("productsContainer");
const cartContainer = document.getElementById("cartContainer");

// RENDER PRODUCTS
function renderProducts() {
  if (!productsContainer) return;

  productsContainer.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
      <h4>${p.name}</h4>
      <p>KES ${p.price}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;

    productsContainer.appendChild(div);
  });
}

// ADD TO CART
function addToCart(id) {
  const item = cart.find(i => i.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  showNotification("Added to cart!");
}

// RENDER CART
function renderCart() {
  if (!cartContainer) return;

  cartContainer.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    total += product.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <span>${product.name} (x${item.qty})</span>
      <div class="cart-actions">
        <button onclick="changeQty(${item.id}, 1)">➕</button>
        <button onclick="changeQty(${item.id}, -1)">➖</button>
        <button onclick="removeItem(${item.id})">❌</button>
      </div>
    `;

    cartContainer.appendChild(div);
  });

  document.getElementById("cartTotal").innerText = total;
}

// CHANGE QTY
function changeQty(id, change) {
  cart = cart.map(item => {
    if (item.id === id) {
      item.qty += change;
      if (item.qty < 1) item.qty = 1;
    }
    return item;
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// REMOVE
function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  showNotification("Item removed!");
}

// CHECKOUT
function checkout() {
  if (cart.length === 0) {
    showNotification("Cart is empty!");
    return;
  }

  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();

  showNotification("Payment successful! 🎉");
}

// INIT
renderProducts();
renderCart();

// LOGIN SYSTEM
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      document.getElementById("loginError").innerText = "All fields required!";
      return;
    }

    // SIMPLE AUTH (can be upgraded later)
    if (email === "student@gmail.com" && password === "1234") {

      const user = {
        email,
        name: "Student"
      };

      localStorage.setItem("loggedInUser", JSON.stringify(user));

      showNotification("Login successful!");

      setTimeout(() => {
        window.location.href = "./index.html";
      }, 1000);

    } else {
      document.getElementById("loginError").innerText = "Invalid credentials!";
    }
  });
}

// PROFILE
const profileForm = document.getElementById("profileForm");

if (profileForm) {
  const saved = JSON.parse(localStorage.getItem("profile")) || {};

  document.getElementById("name").value = saved.name || "";
  document.getElementById("emailProfile").value = saved.email || "";
  document.getElementById("course").value = saved.course || "";

  profileForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("emailProfile").value,
      course: document.getElementById("course").value
    };

    localStorage.setItem("profile", JSON.stringify(data));
    showNotification("Profile saved!");
  });
}

// SHOW USER NAME
const userName = document.getElementById("userName");
const userData = JSON.parse(localStorage.getItem("loggedInUser"));

if (userName && userData) {
  userName.innerText = "👋 " + userData.name;
}

// SETTINGS
function clearData() {
  localStorage.clear();
  showNotification("All data cleared!");
}

function logout() {
  localStorage.removeItem("loggedInUser");
  showNotification("Logged out!");
  setTimeout(() => {
    window.location.href = "./index.html";
  }, 1000);
}

// DASHBOARD REAL DATA
function loadDashboard() {

  // TASKS
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const pendingTasks = tasks.filter(t => !t.completed).length;

  // BOOKS
  const books = JSON.parse(localStorage.getItem("books")) || [];
  const borrowedBooks = books.filter(b => b.borrowed).length;

  // CART
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  let total = 0;
  let totalItems = 0;

  const products = [
    { id: 1, name: "Notebook", price: 100 },
    { id: 2, name: "Pen", price: 20 },
    { id: 3, name: "Backpack", price: 1500 },
    { id: 4, name: "Calculator", price: 800 }
  ];

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    total += product.price * item.qty;
    totalItems += item.qty;
  });

  // UPDATE UI
  const booksEl = document.getElementById("dashboardBooks");
  const tasksEl = document.getElementById("dashboardTasks");
  const cartEl = document.getElementById("dashboardCart");
  const totalEl = document.getElementById("dashboardTotal");

  if (booksEl) booksEl.innerText = borrowedBooks;
  if (tasksEl) tasksEl.innerText = pendingTasks;
  if (cartEl) cartEl.innerText = totalItems;
  if (totalEl) totalEl.innerText = total;
}

// AUTO REFRESH DASHBOARD
window.addEventListener("storage", loadDashboard);

// ALSO RUN ON LOAD
loadDashboard();
/*
function loadActivity() {
  const list = document.getElementById("activityList");
  if (!list) return;

  list.innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const books = JSON.parse(localStorage.getItem("books")) || [];
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  tasks.slice(-2).forEach(t => {
    list.innerHTML += `<li><i class="fas fa-tasks"></i> ${t.title}</li>`;
  });

  books.filter(b => b.borrowed).slice(-2).forEach(b => {
    list.innerHTML += `<li><i class="fas fa-book"></i> Borrowed ${b.title}</li>`;
  });

  if (cart.length > 0) {
    list.innerHTML += `<li><i class="fas fa-shopping-cart"></i> Cart updated</li>`;
  }
} */

  function loadActivity() {
  const list = document.getElementById("activityList");
  if (!list) return;

  list.innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const books = JSON.parse(localStorage.getItem("books")) || [];
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  tasks.slice(-3).forEach(t => {
    list.innerHTML += `
      <li>
        <i class="fas fa-tasks"></i>
        ${t.completed ? "Completed" : "Added"} task: ${t.title}
      </li>
    `;
  });

  books.slice(-2).forEach(b => {
    if (b.borrowed) {
      list.innerHTML += `
        <li>
          <i class="fas fa-book"></i>
          Borrowed: ${b.title}
        </li>
      `;
    }
  });

  if (cart.length > 0) {
    list.innerHTML += `
      <li>
        <i class="fas fa-shopping-cart"></i>
        Cart updated (${cart.length} items)
      </li>
    `;
  }
}

// RUN
setInterval(loadActivity, 2000);
loadActivity();

function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "Welcome";

  if (hour < 12) greeting = "Good Morning ☀️";
  else if (hour < 18) greeting = "Good Afternoon 🌤";
  else greeting = "Good Evening 🌙";

  const el = document.getElementById("userName");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (el && user) {
    el.innerText = `${greeting}, ${user.name}`;
  }
}

setGreeting();

function loadSchedule() {
  const list = document.getElementById("scheduleList");
  if (!list) return;

  const schedule = JSON.parse(localStorage.getItem("schedule")) || [
    { time: "8:00 AM", title: "Database Class", icon: "fa-database" },
    { time: "11:00 AM", title: "Programming Lab", icon: "fa-code" },
    { time: "2:00 PM", title: "MIS Lecture", icon: "fa-chart-line" }
  ];

  list.innerHTML = "";

  schedule.forEach(item => {
    list.innerHTML += `
      <li>
        <i class="fas ${item.icon}"></i>
        <strong>${item.time}</strong> - ${item.title}
      </li>
    `;
  });
}

loadSchedule();
/*
function loadProfileStats() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const books = JSON.parse(localStorage.getItem("books")) || [];
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  document.getElementById("profileTasks").innerText = tasks.length + " Tasks";
  document.getElementById("profileBooks").innerText =
    books.filter(b => b.borrowed).length + " Books";
  document.getElementById("profileCart").innerText =
    cart.length + " Items";
} */

function loadProfileStats() {
  const tasksEl = document.getElementById("profileTasks");
  const booksEl = document.getElementById("profileBooks");
  const cartEl = document.getElementById("profileCart");

  // STOP if not on profile page
  if (!tasksEl || !booksEl || !cartEl) return;

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const books = JSON.parse(localStorage.getItem("books")) || [];
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  tasksEl.innerText = tasks.length + " Tasks";
  booksEl.innerText = books.filter(b => b.borrowed).length + " Books";
  cartEl.innerText = cart.length + " Items";
}
/*
function loadProfileInfo() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const profile = JSON.parse(localStorage.getItem("profile")) || {};

  if (user) {
    document.getElementById("profileName").innerText = profile.name || user.name;
    document.getElementById("profileEmail").innerText = profile.email || user.email;
  }
} */

function loadProfileInfo() {
  const nameEl = document.getElementById("profileName");
  const emailEl = document.getElementById("profileEmail");

  if (!nameEl || !emailEl) return;

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const profile = JSON.parse(localStorage.getItem("profile")) || {};

  if (user) {
    nameEl.innerText = profile.name || user.name;
    emailEl.innerText = profile.email || user.email;
  }
}

loadProfileStats();
loadProfileInfo();

function toggleMenu() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("overlay");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}
