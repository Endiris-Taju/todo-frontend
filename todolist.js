const API_BASE = "https://todo-backend-dlui.onrender.com";
const API_TODOS = `${API_BASE}/todos`;
const API_LOGIN = `${API_BASE}/login`;
const API_SIGNUP = `${API_BASE}/signup`;

let todoList = [];

// DOM
const authBox = document.getElementById("authBox");
const appBox = document.getElementById("appBox");

// ================= AUTH =================
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

// ================= UI =================
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

// ================= AUTH =================
async function signup(e) {
  e.preventDefault();

  const email = signupEmail.value;
  const password = signupPassword.value;

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

async function login(e) {
  e.preventDefault();

  const email = loginEmail.value;
  const password = loginPassword.value;

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

// ================= TODOS =================
async function loadTodos() {
  const res = await fetch(API_TODOS, { headers: authHeaders() });
  const data = await res.json();
  if (!Array.isArray(data)) return;

  todoList = data;
  renderTodoList();
}

async function addTodo() {
  const name = document.querySelector(".js-name-input").value;
  const dueDate = document.querySelector(".js-due-date-input").value;
  const startTime = document.querySelector(".js-start-time-input").value;
  const endTime = document.querySelector(".js-end-time-input").value;

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

async function deleteTodo(id) {
  await fetch(`${API_TODOS}/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  loadTodos();
}

// ================= RENDER =================
function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = +h % 12 || 12;
  return `${hour}:${m}`;
}

function renderTodoList() {
  let html = "";

  todoList.sort((a, b) =>
    new Date(`${a.dueDate}T${a.startTime}`) -
    new Date(`${b.dueDate}T${b.startTime}`)
  );

  for (const task of todoList) {
    html += `
      <div class="todo-row">
        <div><b>${task.name}</b></div>
        <div>${task.dueDate}</div>
        <div>${formatTime(task.startTime)} - ${formatTime(task.endTime)}</div>
        <button class="delete-btn" data-id="${task.id}">Delete</button>
      </div>
    `;
  }

  document.querySelector(".js-todo-list").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  signupForm.addEventListener("submit", signup);
  loginForm.addEventListener("submit", login);
  document.querySelector(".logout-btn").addEventListener("click", logout);
  document.querySelector(".js-add-button").addEventListener("click", addTodo);

  // ⭐ switch forms
  const signupFormEl = document.getElementById("signupForm");
  const loginFormEl = document.getElementById("loginForm");

  document.getElementById("showLogin").onclick = (e) => {
    e.preventDefault();
    signupFormEl.style.display = "none";
    loginFormEl.style.display = "block";
  };

  document.getElementById("showSignup").onclick = (e) => {
    e.preventDefault();
    signupFormEl.style.display = "block";
    loginFormEl.style.display = "none";
  };

  // delete delegation
  document.querySelector(".js-todo-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      deleteTodo(e.target.dataset.id);
    }
  });

  updateUI();

  // 🌙 DARK MODE
const themeToggle = document.getElementById("themeToggle");

function setTheme(theme){
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
}

// load saved theme
setTheme(localStorage.getItem("theme") || "light");

themeToggle.onclick = () => {
  const current = document.body.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
};
});