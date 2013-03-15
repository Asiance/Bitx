// Save this script as `options.js`

// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("refresh_period");
  var refresh_period = select.children[select.selectedIndex].value;
  localStorage["refresh_period"] = refresh_period;

  select = document.getElementById("counter_todos");
  counter_todos = select.children[select.selectedIndex].value;
  localStorage["counter_todos"] = counter_todos;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var choice = localStorage["refresh_period"];
  if (!choice) {
    return;
  }
  var select = document.getElementById("refresh_period");
  for (var i = 0; i < select.children.length; i++) {
    if (select.children[i].value == choice) {
      child.selected = "true";
      break;
    }
  }
  
  choice = localStorage["counter_todos"];
  if (!choice) {
    return;
  }
  select = document.getElementById("counter_todos");
  for (var i = 0; i < select.children.length; i++) {
    if (select.children[i].value == choice) {
      child.selected = "true";
      break;
    }
  }
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);