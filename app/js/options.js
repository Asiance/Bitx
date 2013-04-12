// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("refresh_period");
  localStorage["refresh_period"] = select.children[select.selectedIndex].value;

  select = document.getElementById("counter_todos");
  localStorage["counter_todos"] = select.children[select.selectedIndex].value;

  select = document.getElementById("language");
  localStorage["language"] = select.children[select.selectedIndex].value;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
}

function logout() {
  localStorage.removeItem('basecampId');
  localStorage.removeItem('basecampToken');
  localStorage.removeItem('myTodos');
  localStorage.removeItem('people');
  localStorage.removeItem('userId');
  chrome.storage.local.set({'assignedTodos': null});
  chrome.storage.local.set({'assignedTodosByProject': null});
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
    if (select.children[i].value == choice) {
      child.selected = "true";
      break;
    }
  }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#logout').addEventListener('click', logout);

var userLang = navigator.language ? navigator.language : navigator.userLanguage;
var locale = userLang.substring(0,2);
lang = localStorage['language'] ? localStorage['language'] : locale;

document.getElementById("onesecond").innerHTML += window[lang]["second"];
document.getElementById("fiveseconds").innerHTML += window[lang]["seconds"];
document.getElementById("tenseconds").innerHTML += window[lang]["seconds"];

document.getElementById("default").innerHTML = window[lang]["default"];
document.getElementById("overdues").innerHTML = window[lang]["header_overdues"];
document.getElementById("today").innerHTML = window[lang]["header_today"];
document.getElementById("upcoming").innerHTML = window[lang]["header_upcoming"];
document.getElementById("noduedate").innerHTML = window[lang]["header_noduedate"];