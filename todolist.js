// ===============================
// CONFIG
// ===============================
const API_BASE = "https://todo-backend-dlui.onrender.com";
const API_TODOS = API_BASE + "/todos";
const API_LOGIN = API_BASE + "/login";
const API_SIGNUP = API_BASE + "/signup";

let todoList = [];

// ===============================
// AUTH HELPERS
// ===============================
function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": localStorage.getItem("token")
  };
}

function saveToken(token){
  localStorage.setItem("token", token);
}

function logout(){
  localStorage.removeItem("token");
  location.reload();
}

function isLoggedIn(){
  return !!localStorage.getItem("token");
}

// ===============================
// AUTH UI SWITCH
// ===============================
function updateAuthUI(){
  const authBox = document.querySelector(".auth-box");
  const appBox = document.querySelector(".app-box");

  if(isLoggedIn()){
    authBox.style.display = "none";
    appBox.style.display = "block";
    loadTodos();
  }else{
    authBox.style.display = "block";
    appBox.style.display = "none";
  }
}

updateAuthUI();

// ===============================
// SIGNUP
// ===============================
async function signup(){
  const email = document.querySelector(".signup-email").value;
  const password = document.querySelector(".signup-password").value;

  const res = await fetch(API_SIGNUP,{
    method:"POST",
    headers:{ "Content-Type":"application/json"},
    body: JSON.stringify({email,password})
  });

  const data = await res.json();

  if(data.token){
    saveToken(data.token);
    updateAuthUI();
  }else{
    alert(data.error || "Signup failed");
  }
}

// ===============================
// LOGIN
// ===============================
async function login(){
  const email = document.querySelector(".login-email").value;
  const password = document.querySelector(".login-password").value;

  const res = await fetch(API_LOGIN,{
    method:"POST",
    headers:{ "Content-Type":"application/json"},
    body: JSON.stringify({email,password})
  });

  const data = await res.json();

  if(data.token){
    saveToken(data.token);
    updateAuthUI();
  }else{
    alert(data.error || "Login failed");
  }
}

// ===============================
// LOAD TODOS
// ===============================
async function loadTodos(){
  try{
    const res = await fetch(API_TODOS,{ headers: authHeaders() });

    if(res.status === 401){
      logout();
      return;
    }

    todoList = await res.json();
    renderTodoList();
  }catch(err){
    console.error(err);
  }
}

// ===============================
// ADD TODO
// ===============================
async function addTodo(){
  const name = document.querySelector('.js-name-input').value.trim();
  const dueDate = document.querySelector('.js-due-date-input').value;
  const startTime = document.querySelector('.js-start-time-input').value;
  const endTime = document.querySelector('.js-end-time-input').value;

  if(!name || !dueDate || !startTime || !endTime){
    alert("Fill all fields");
    return;
  }

  await fetch(API_TODOS,{
    method:"POST",
    headers: authHeaders(),
    body: JSON.stringify({name,dueDate,startTime,endTime})
  });

  loadTodos();
}

// ===============================
// DELETE TODO
// ===============================
async function deleteTodo(id){
  await fetch(API_TODOS+"/"+id,{
    method:"DELETE",
    headers: authHeaders()
  });
  loadTodos();
}

// ===============================
// RENDER TODOS
// ===============================
function formatTime(time24){
  const [hour,minute] = time24.split(':');
  const h = Number(hour);
  const ampm = h>=12?'PM':'AM';
  const hour12 = h%12||12;
  return `${hour12}:${minute} ${ampm}`;
}

function formatDate(dateStr){
  return new Date(dateStr).toLocaleDateString();
}

function renderTodoList(){
  let html="";

  todoList.sort((a,b)=>{
    return new Date(`${a.dueDate}T${a.startTime}`) -
           new Date(`${b.dueDate}T${b.startTime}`);
  });

  for(const task of todoList){
    html += `
      <div class="todo-row">
        <b>${task.name}</b>
        ${formatDate(task.dueDate)}
        ${formatTime(task.startTime)} - ${formatTime(task.endTime)}
        <button onclick="deleteTodo(${task.id})">Delete</button>
      </div>
      <hr>
    `;
  }

  document.querySelector(".js-todo-list").innerHTML = html;
}

// ===============================
// BUTTON EVENTS
// ===============================
document.querySelector(".signup-btn").onclick = signup;
document.querySelector(".login-btn").onclick = login;
document.querySelector(".logout-btn").onclick = logout;
document.querySelector(".js-add-button").onclick = addTodo;