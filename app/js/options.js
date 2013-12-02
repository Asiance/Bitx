var options = {

  save_options: function () {
    var select = document.getElementById('refresh_period');
    localStorage.refresh_period = select.children[select.selectedIndex].value;

    select = document.getElementById('counter_todos');
    localStorage.counter_todos = select.children[select.selectedIndex].value;

    select = document.getElementById('language');
    localStorage.language = select.children[select.selectedIndex].value;

    chrome.storage.local.get('myTodos', function(data) {
      if (chrome.runtime.lastError) return;
      badge.updateBadge(data.myTodos);
    });
    var elm = document.getElementById('alert');
    var newOne = elm.cloneNode(true);
    newOne.className = 'show';
    elm.parentNode.replaceChild(newOne, elm);

    alert('Your preferences has been saved.');
  },

  logout: function () {
    localStorage.clear();
    chrome.storage.local.clear();
    alert('You have been successfully logged out.');
  },

  restore_options: function () {
    this.selectOption('refresh_period');
    this.selectOption('counter_todos');
    this.selectOption('language');
  },

  selectOption: function (variableString) {
    var child;
    var choice = localStorage[variableString];
    if (!choice) {
      return;
    }
    var select = document.getElementById(variableString);
    for (var i = 0; i < select.children.length; i++) {
      child = select.children[i];
      if (select.children[i].value === choice) {
        child.selected = 'true';
        break;
      }
    }
  }
}

window.onload = function () {
  options.restore_options();
  document.getElementById('refresh_period').addEventListener('change', options.save_options);
  document.getElementById('counter_todos').addEventListener('change', options.save_options);
  document.getElementById('language').addEventListener('change', options.save_options);
  document.getElementById('logout').addEventListener('click', options.logout);
};