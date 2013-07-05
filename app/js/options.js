// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("refresh_period");
  localStorage.refresh_period = select.children[select.selectedIndex].value;

  select = document.getElementById("counter_todos");
  localStorage.counter_todos = select.children[select.selectedIndex].value;

  select = document.getElementById("language");
  localStorage.language = select.children[select.selectedIndex].value;

  if (localStorage.myTodos) {
    var myTodos = JSON.parse(localStorage.myTodos);
    updateBadge(myTodos);
  }
  var elm = document.getElementById("alert");
  var newOne = elm.cloneNode(true);
  newOne.className = "show";
  elm.parentNode.replaceChild(newOne, elm);
}

function logout() {
  localStorage.removeItem("basecampId");
  localStorage.removeItem("basecampToken");
  localStorage.removeItem("lastSearch");
  localStorage.removeItem("myTodos");
  localStorage.removeItem("people");
  localStorage.removeItem("userId");
  chrome.storage.local.set({"assignedTodos": null});
  chrome.storage.local.set({"assignedTodosByProject": null});
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  selectOption("refresh_period");
  selectOption("counter_todos");
  selectOption("language");
}

function selectOption(variableString) {
  var child;
  var choice = localStorage[variableString];
  if (!choice) {
    return;
  }
  var select = document.getElementById(variableString);
  for (var i = 0; i < select.children.length; i++) {
    child = select.children[i];
    if (select.children[i].value === choice) {
      child.selected = "true";
      break;
    }
  }
}

document.addEventListener("DOMContentLoaded", restore_options);
document.querySelector("#refresh_period").addEventListener("change", save_options);
document.querySelector("#counter_todos").addEventListener("change", save_options);
document.querySelector("#language").addEventListener("change", save_options);
document.querySelector("#logout").addEventListener("click", logout);
