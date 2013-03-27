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

var userLang = (navigator.language) ? navigator.language : navigator.userLanguage; 
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

document.getElementById("eng").innerHTML = window[lang]["eng"];
document.getElementById("fra").innerHTML = window[lang]["fra"];
document.getElementById("kor").innerHTML = window[lang]["kor"];
document.getElementById("jap").innerHTML = window[lang]["jap"];
document.getElementById("ita").innerHTML = window[lang]["ita"];
document.getElementById("por").innerHTML = window[lang]["por"];
