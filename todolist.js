
let todoList = [];
const API_URL = "https://todo-backend-dlui.onrender.com/todos";
async function loadTodos(){
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // safety check
    if (!Array.isArray(data)) {
      console.error("Backend error:", data);
      todoList = [];
      return;
    }

    todoList = data;
    renderTodoList();

  } catch (err) {
    console.error("Fetch failed:", err);
    todoList = [];
  }
}
loadTodos();

function formatTime(time24) {
  if (!time24) return "";   // prevents crash

  const [hour, minute] = time24.split(':');
  const h = Number(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
}

function formatDate(dateStr) {
  const options = { year:'numeric', month:'short', day:'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

function renderTodoList(){
  let todoListHTML = '';

  todoList.sort((a,b)=>{
    return new Date(`${a.dueDate}T${a.startTime}`) -
           new Date(`${b.dueDate}T${b.startTime}`);
  });

  for (let task of todoList){

  const todayTag = isToday(task.dueDate)
    ? '<span class="today-task">TODAY</span>'
    : "";
    todoListHTML += `
      <div class="todo-row">

        <div class="task-name">
          <b>${task.name}</b> ${todayTag}
        </div>

        <div class="task-date">
          ${formatDate(task.dueDate)}
        </div>

        <div class="start-time">
          ${formatTime(task.startTime)}
        </div>

        <div class="end-time">
          ${formatTime(task.endTime)}
        </div>

        <button class="delete-button" data-id="${task.id}">
          Delete
        </button>

      </div>
      <hr>
    `;
  }
  document.querySelector('.js-todo-list').innerHTML = todoListHTML;
}

document.querySelector('.js-todo-list').addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-button')) {
    const id = e.target.dataset.id;

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    loadTodos();
  }
});

   document.querySelector('.js-add-button').addEventListener('click',()=>{
    addTodo();
   }) 
function timeToMinutes(time){
  const [h,m] = time.split(':').map(Number);
  return h * 60 + m;
}

function hasTimeConflict(newTask){
  const newStart = timeToMinutes(newTask.startTime);
  const newEnd   = timeToMinutes(newTask.endTime);

  for (let task of todoList){
    if (task.dueDate !== newTask.dueDate) continue; // only same day

    const existingStart = timeToMinutes(task.startTime);
    const existingEnd   = timeToMinutes(task.endTime);

    const overlap = newStart < existingEnd && newEnd > existingStart;
    if (overlap) return true;
  }

  return false;
}

async function addTodo(){
  const nameInput = document.querySelector('.js-name-input');
  const dateInput = document.querySelector('.js-due-date-input');
  const startInput = document.querySelector('.js-start-time-input');
  const endInput = document.querySelector('.js-end-time-input');

  const name = nameInput.value.trim();
  const dueDate = dateInput.value;
  const startTime = startInput.value;
  const endTime = endInput.value;

  if (!name || !dueDate || !startTime || !endTime) {
    alert("Please fill all fields");
    return;
  }

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    alert("End time must be after start time");
    return;
  }

 const newTask = {
    name,
    dueDate,
    startTime,
    endTime
  };
  if (hasTimeConflict(newTask)) {
  alert("Time overlaps with another task ❌");
  return;
 }
  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask)
  });

  loadTodos();
  nameInput.value = '';
  dateInput.value = '';
  startInput.value = '';
  endInput.value = '';
}

function isToday(dateStr){
  const today = new Date();
  const localDate = today.getFullYear() + "-" +
    String(today.getMonth()+1).padStart(2,'0') + "-" +
    String(today.getDate()).padStart(2,'0');

  return localDate === dateStr;
}
setInterval(loadTodos, 60000);