const LOCAL = "127.0.0.1:3000";
const AWS_URL = "34.233.19.178:3000";
const DOMAIN = AWS_URL;

const listsContainer = document.querySelector("[data-lists]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");
const deleteListButton = document.querySelector("[data-delete-list-btn]");
const listDisplayContainer = document.querySelector(
  "[data-list-display-container]"
);
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const tasksContainer = document.querySelector("[data-tasks]");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const submitLoginForm = document.querySelector("[data-new-login-form]");
const newLoginEmail = document.querySelector("[data-new-login-email]");
const newLoginPassword = document.querySelector("[data-new-login-password]");
const submitRegistrationForm = document.querySelector(
  "[data-new-registration-form]"
);
const newRegistrationName = document.querySelector(
  "[data-new-registration-name"
);
const newRegistrationEmail = document.querySelector(
  "[data-new-registration-email]"
);
const newRegistrationPassword = document.querySelector(
  "[data-new-registration-password]"
);
const logoutElement = document.getElementById("logout");
const clearCompleteTasksButton = document.querySelector(
  "[data-clear-complete-tasks-button]"
);

const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId";
// let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
// let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

function getLists() {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
}

function setLists(lists) {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists || []));
}

function getSelectedListId() {
  return parseInt(localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY) || 0) || null;
}

function getSelectedList() {
  return getLists().find((list) => list.todo_list_id === getSelectedListId());
}

function setSelectedListId(selectedListId) {
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function getUserId() {
  return JSON.parse(localStorage.getItem('user') || {}).id;
}

listsContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "li") {
    const selectedListId = e.target.dataset.listId;
    console.log("selectedListId", selectedListId)
    setSelectedListId(selectedListId);
    console.log(e.target.dataset);
    saveAndRender();
  }
});

tasksContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "input") {
    const selectedList = getLists().find((list) => list.todo_list_id === getSelectedListId());
    const selectedTask = selectedList.items.find(
      (task) => `${task.id}` === `${e.target.id}`
    );
    if (selectedTask && selectedTask.complete !== e.target.checked) {
      // selectedTask.complete = e.target.checked;
      updateTaskById(selectedList.todo_list_id, selectedTask.id, {...selectedTask, complete: e.target.checked }).then(v => {
        fetchAndSetUserList().then(() => renderTaskCount());
      });
    }

  }
});

deleteListButton.addEventListener("click", (e) => {
  deleteList().then(() => {
    setSelectedListId(null);
    saveAndRender();
  });
});

clearCompleteTasksButton.addEventListener("click", (e) => {
  const selectedList = getLists().find((list) => list.todo_list_id === getSelectedListId());
  selectedList.items = selectedList.items.filter((task) => !task.complete);
  // TODO need to update selected list and call fetchAndSetUserList
  saveAndRender();
});

newListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const listName = newListInput.value;
  if (listName == null || listName === "") return;
  // const list = createList(listName);
  newListInput.value = null;
  // lists.push(list);
  createUserList(listName);
  saveAndRender();
});

newTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = newTaskInput.value;
  if (taskName == null || taskName === "") return;
  const task = createTask(taskName);
  newTaskInput.value = null;
  // selectedList.tasks.push(task);
  createTaskItem(taskName);
  saveAndRender();
});
//Registration submit Form event listener
submitRegistrationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = newRegistrationEmail.value;
  const password = newRegistrationPassword.value;
  const name = newRegistrationName.value;

  if (!email || !password) return;

  registration(name, email, password).then((result) => {
    if (!result) alert("login failed");
    console.log(result);
    localStorage.setItem("user", JSON.stringify(result));
    saveAndRender();
    checkIfLoggedIn();
  });
});
//Login Submit Form event Listener
submitLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = newLoginEmail.value;
  const password = newLoginPassword.value;

  if (!email || !password) return;

  login(email, password).then((result) => {
    if (!result) alert("login failed");
    console.log(result);
    localStorage.setItem("user", JSON.stringify(result));
  });
  saveAndRender();
  checkIfLoggedIn();
});
logoutElement.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.setItem("user", null);
  checkIfLoggedIn();
});

function createList(name) {
  return { id: Date.now().toString(), name: name, tasks: [] };
}

function createTask(name) {
  return { id: Date.now().toString(), name: name, complete: false };
}

function saveAndRender() {
  fetchAndSetUserList().then(() => {
    render();
  })
}

function render() {
  clearElement(listsContainer);
  renderLists();
  const selectedList = getLists().find((list) => list.todo_list_id === getSelectedListId());
  if (selectedList == null) {
    listDisplayContainer.style.display = "none";
  } else {
    listDisplayContainer.style.display = "";
    listTitleElement.innerText = selectedList.name;
    clearElement(tasksContainer);
    renderTasks(selectedList);
  }
}

function renderTasks(selectedList) {
  fetchAndSetUserList().then(() => {
    const desiredList = getLists().find((l) => l.todo_list_id === selectedList.todo_list_id);
    console.log(selectedList);
    console.log("we're here", desiredList);
    desiredList.items.forEach((task) => {
      const taskElement = document.importNode(taskTemplate.content, true);
      const checkbox = taskElement.querySelector("input");
      checkbox.id = task.id;
      checkbox.checked = task.complete;
      const label = taskElement.querySelector("label");
      label.htmlFor = task.id;
      label.append(task.task);
      tasksContainer.appendChild(taskElement);
    });
    renderTaskCount();
  });
}

function renderTaskCount() {
  const selectedList = getSelectedList();
  if (selectedList) {
    const incompleteTaskCount = selectedList.items.filter(
      (task) => !task.complete
    ).length;
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} 
      remaining`;
  }
}

function renderLists() {
  fetchAndSetUserList().then(() => {
    getLists().forEach((list) => {
      const listElement = document.createElement("li");
      listElement.dataset.listId = list.todo_list_id;
      listElement.classList.add("list-name");
      listElement.innerText = list.name;
      if (list.todo_list_id === getSelectedListId()) {
        listElement.classList.add("active-list");
      }
      listsContainer.appendChild(listElement);
    });
  });
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
function test() {
  let xhr = new XMLHttpRequest();
  var params = "orem=ipsum&name=binny";
  xhr.open("POST", "localhost:3000/login");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(params);
  xhr.onload = function () {
    if (xhr.status != 200) {
      // analyze HTTP status of the response
      // alert(Error ${xhr.status}: ${xhr.statusText}); // e.g. 404: Not Found
    } else {
      // show the result
      // alert(Done, got ${xhr.response.length} bytes); // response is the server response
    }
  };

  xhr.onprogress = function (event) {
    //if (event.lengthComputable) {
    // alert(Received ${event.loaded} of ${event.total} bytes);
    //} else {
    //alert(Received ${event.loaded} bytes); // no Content-Length
    //}
  };

  xhr.onerror = function () {
    alert("Request failed");
  };
}

function fetchAndSetUserList() {
  return fetchUserList().then(lists => {
    setLists(lists);
    return lists;
  })
}

function fetchUserList() {
  var xhttp = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhttp.onerror = function (e) {
      console.log("error", e);
    };

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == XMLHttpRequest.DONE) {
        return resolve(JSON.parse(xhttp.responseText));
      }
    };
    xhttp.open("GET", `http://${DOMAIN}/users/${getUserId()}/lists`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
  });
}

function createUserList(listName) {
  //create form to be able to enter list name
  var xhttp = new XMLHttpRequest();
  xhttp.onerror = function (e) {
    console.log("error", e);
  };

  xhttp.open("POST", `http://${DOMAIN}/users/${getUserId()}/lists`, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ listName, userId: getUserId() }));
}

function createTaskItem(taskName) {
  var xhttp = new XMLHttpRequest();
  xhttp.onerror = function (e) {
    console.log("error", e);
  };
  const listId = getSelectedListId();
  xhttp.open(
    "POST",
    `http://${DOMAIN}/users/${getUserId()}/lists/${listId}/item`,
    true
  );
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ itemName: taskName, userId: getUserId() }));
}

function updateTaskById(listId, taskId, task) {
  var xhttp = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhttp.onerror = function (e) {
      console.log("error", e);
    };

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == XMLHttpRequest.DONE) {
        return resolve(JSON.parse(xhttp.responseText));
      }
    }
    xhttp.open("PUT", `http://${DOMAIN}/users/${getUserId()}/lists/${listId}/item/${taskId}`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(task));
  });
}

function deleteList() {
  var xhttp = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhttp.onerror = function (e) {
      console.log("error", e);
    };

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == XMLHttpRequest.DONE) {
        return resolve(JSON.parse(xhttp.responseText));
      }
    }
    xhttp.open("DELETE", `http://${DOMAIN}/users/${getUserId()}/lists/${getSelectedListId()}`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send();
  });
}

//Registration
function registration(name, email, password) {
  return new Promise((resolve, reject) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onerror = function (e) {
      console.log("error", e);
    };
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == XMLHttpRequest.DONE) {
        return resolve(
          xhttp.responseText === "false" ? null : JSON.parse(xhttp.responseText)
        );
      }
    };
    xhttp.open("POST", `http://${DOMAIN}/registration`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ name, email, password }));
  });
}
//login page
function login(email, password) {
  return new Promise((resolve, reject) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onerror = function (e) {
      console.log("error", e);
    };
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == XMLHttpRequest.DONE) {
        return resolve(
          xhttp.responseText === "false" ? null : JSON.parse(xhttp.responseText)
        );
      }
    };
    xhttp.open("POST", `http://${DOMAIN}/login`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ email, password }));
  });
}

function checkIfLoggedIn() {
  var user = localStorage.getItem("user");
  console.log(user);
  if (user && user != "null") {
    console.log("User Exists");
    document.getElementById("main").style.display = "block";
    document.getElementById("logout").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("registration").style.display = "none";
  } else {
    document.getElementById("main").style.display = "none";
    document.getElementById("logout").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("registration").style.display = "block";
  }
}

//get user ID

function getUserId() {
  const user = localStorage.getItem("user");
  if (!user || user === "null") return null;
  return JSON.parse(user).id;
}

//make sure you have FE capable of fetching user lists, creating user lists, creating user list items.

//focus on defining functions to call from HTML

//when loading page should fetch list of todo lists, add new todo lists, add new items to the todo lists,
// register("test@test.com", "secret");

// next task (stop hard coding list items)
// after that create function for deleting list item

//create endpoint
//fetching data, need to fetch user lists and render that
checkIfLoggedIn();
render();
