// AUTH GUARD (Protect Pages)
(function () {
  const publicPages = ["login.html"];
  const currentPage = window.location.pathname.split("/").pop();

  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user && !publicPages.includes(currentPage)) {
    window.location.href = "login.html";
  }
})();

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
        window.location.href = "index.html";
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

// SETTINGS
function clearData() {
  localStorage.clear();
  showNotification("All data cleared!");
}
