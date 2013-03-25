// Save this script as `options.js`

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