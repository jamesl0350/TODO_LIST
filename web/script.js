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
const logoutElement = document.getElementById("logout");
const clearCompleteTasksButton = document.querySelector(
  "[data-clear-complete-tasks-button]"
);

const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId";
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

listsContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "li") {
    selectedListId = e.target.dataset.listId;
    console.log(e.target.dataset);
    saveAndRender();
  }
});

tasksContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "input") {
    const selectedList = lists.find((list) => list.name === selectedListId);
    const selectedTask = selectedList.tasks.find(
      (task) => task.id === e.target.id
    );
    selectedTask.complete = e.target.checked;
    save();
    // renderTaskCount(selectedList);
  }
});

deleteListButton.addEventListener("click", (e) => {
  lists = lists.filter((list) => list.id !== selectedListId);
  selectedListId = null;
  saveAndRender();
});

clearCompleteTasksButton.addEventListener("click", (e) => {
  const selectedList = lists.find((list) => list.name === selectedListId);
  selectedList.tasks = selectedList.tasks.filter((task) => !task.complete);
  saveAndRender();
});

newListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const listName = newListInput.value;
  if (listName == null || listName === "") return;
  const list = createList(listName);
  newListInput.value = null;
  lists.push(list);
  createUserList(listName);
  saveAndRender();
});

newTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = newTaskInput.value;
  if (taskName == null || taskName === "") return;
  const task = createTask(taskName);
  newTaskInput.value = null;
  const selectedList = lists.find((list) => list.name === selectedListId);
  // selectedList.tasks.push(task);
  console.log("blahblahblah");
  createTaskItem(taskName);
  saveAndRender();
});

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
});
logoutElement.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.setItem("user", null);
});

function createList(name) {
  return { id: Date.now().toString(), name: name, tasks: [] };
}

function createTask(name) {
  return { id: Date.now().toString(), name: name, complete: false };
}

function saveAndRender() {
  save();
  render();
}

function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function render() {
  clearElement(listsContainer);
  renderLists();
  const selectedList = lists.find((list) => list.name === selectedListId);
  console.log(selectedListId);

  if (selectedListId == null) {
    listDisplayContainer.style.display = "none";
  } else {
    listDisplayContainer.style.display = "";
    // listTitleElement.innerText = selectedList.name;
    // renderTaskCount(selectedList);
    clearElement(tasksContainer);
    renderTasks(selectedList);
  }
}

function renderTasks(selectedList) {
  fetchUserList().then((newList) => {
    lists = newList;
    console.log(lists);
    const desiredList = newList.find((l) => l.name === selectedList);
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
  });
}

function renderTaskCount(selectedList) {
  const incompleteTaskCount = selectedList.tasks.filter(
    (task) => !task.complete
  ).length;
  const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
  listCountElement.innerText = `${incompleteTaskCount} ${taskString} 
    remaining`;
}

function renderLists() {
  fetchUserList().then((newList) => {
    lists = newList;
    lists.forEach((list) => {
      const listElement = document.createElement("li");
      listElement.dataset.listId = list.name;
      listElement.classList.add("list-name");
      listElement.innerText = list.name;
      if (list.name === selectedListId) {
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
function register(email, password) {
  var xhttp = new XMLHttpRequest();
  xhttp.onerror = function (e) {
    console.log("error", e);
  };

  xhttp.open("POST", "http://127.0.0.1:3000/registration", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ email, password }));
}

function fetchUserList(email) {
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
    xhttp.open("GET", "http://127.0.0.1:3000/users/1/lists", true);
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

  xhttp.open("POST", "http://127.0.0.1:3000/users/1/lists", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ listName, userId: 1 }));
}

function createTaskItem(taskName) {
  var xhttp = new XMLHttpRequest();
  xhttp.onerror = function (e) {
    console.log("error", e);
  };
  const listId = 1; //TODO get this from form
  xhttp.open(
    "POST",
    `http://127.0.0.1:3000/users/1/lists/${listId}/item`,
    true
  );
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ itemName: taskName, userId: 1 }));
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
    xhttp.open("POST", `http://127.0.0.1:3000/login`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ email, password }));
  });
}

function checkIfLoggedIn() {
  var user = localStorage.getItem("user");
  console.log(user);
  if (user && user != "null") {
    console.log("User Exists");
    document.getElementById("login").style.display = "none";
  } else {
    document.getElementById("main").style.display = "none";
    document.getElementById("logout").style.display = "none";
  }
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
