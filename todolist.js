const API_BASE = "https://todo-backend-dlui.onrender.com";
const API_TODOS = `${API_BASE}/todos`;
const API_LOGIN = `${API_BASE}/login`;
const API_SIGNUP = `${API_BASE}/signup`;

let todoList = [];

// ===============================
// DOM ELEMENTS
// ===============================
const authBox = document.getElementById("authBox");
const appBox = document.getElementById("appBox");

// ===============================
// TOKEN HELPERS
// ===============================
function saveToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

function isLoggedIn() {
  return !!getToken();
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": getToken()
  };
}

// ===============================
// UI SWITCH
// ===============================
function updateUI() {
  if (isLoggedIn()) {
    authBox.style.display = "none";
    appBox.style.display = "block";
    loadTodos();
  } else {
    authBox.style.display = "block";
    appBox.style.display = "none";
  }
}

updateUI();

// ===============================
// SIGNUP
// ===============================
async function signup() {
  const email = document.querySelector(".signup-email").value;
  const password = document.querySelector(".signup-password").value;

  const res = await fetch(API_SIGNUP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    saveToken(data.token);
    updateUI();
  } else {
    alert(data.error || "Signup failed");
  }
}

// ===============================
// LOGIN
// ===============================
async function login() {
  const email = document.querySelector(".login-email").value;
  const password = document.querySelector(".login-password").value;

  const res = await fetch(API_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    saveToken(data.token);
    updateUI();
  } else {
    alert(data.error || "Login failed");
  }
}

// ===============================
// LOAD TODOS
// ===============================
async function loadTodos() {
  try {
    const res = await fetch(API_TODOS, {
      headers: authHeaders()
    });

    if (res.status === 401) {
      logout();
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Backend error:", data);
      todoList = [];
      return;
    }

    todoList = data;
    renderTodoList();

  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// ===============================
// ADD TODO
// ===============================
async function addTodo() {
  const name = document.querySelector('.js-name-input').value.trim();
  const dueDate = document.querySelector('.js-due-date-input').value;
  const startTime = document.querySelector('.js-start-time-input').value;
  const endTime = document.querySelector('.js-end-time-input').value;

  if (!name || !dueDate || !startTime || !endTime) {
    alert("Fill all fields");
    return;
  }

  await fetch(API_TODOS, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, dueDate, startTime, endTime })
  });

  loadTodos();
}

// ===============================
// DELETE TODO (FIXED)
// ===============================
async function deleteTodo(id) {
  await fetch(`${API_TODOS}/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  loadTodos();
}

// ===============================
// FORMAT HELPERS
// ===============================
function formatTime(time24) {
  if (!time24) return "";

  const [hour, minute] = time24.split(':');
  const h = Number(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;

  return `${hour12}:${minute} ${ampm}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

// ===============================
// RENDER
// ===============================
function renderTodoList() {
  let html = "";

  todoList.sort((a, b) => {
    return new Date(`${a.dueDate}T${a.startTime}`) -
           new Date(`${b.dueDate}T${b.startTime}`);
  });

  for (const task of todoList) {
    html += `
      <div class="todo-row">
        <div><b>${task.name}</b></div>
        <div>${formatDate(task.dueDate)}</div>
        <div>${formatTime(task.startTime)} - ${formatTime(task.endTime)}</div>
        <button class="delete-button" data-id="${task.id}">
          Delete
        </button>
      </div>
    `;
  }

  document.querySelector(".js-todo-list").innerHTML = html;
}

// ===============================
// EVENT LISTENERS (MODERN WAY)
// ===============================
document.querySelector(".signup-btn").addEventListener("click", signup);
document.querySelector(".login-btn").addEventListener("click", login);
document.querySelector(".logout-btn").addEventListener("click", logout);
document.querySelector(".js-add-button").addEventListener("click", addTodo);

// DELETE via event delegation (IMPORTANT FIX)
document.querySelector(".js-todo-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-button")) {
    const id = e.target.dataset.id;
    deleteTodo(id);
  }
});