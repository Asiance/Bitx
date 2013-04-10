/**
 * Count Todos in one category
 * @param {string} status Count overdue, today, upcoming or undefined Todos
 * @param {string} input JSON string containing all myTodos
 */
function countTodos(input, status) {

  var todayDate = new Date();
  todayDate.setHours(0,0,0,0);
  var inputDate = null;
  var count = 0;

  for (var i = 0; i < input.length; i++) {
      if (input[i].due_at != null && status != 'no_due_date') {
        inputDate = new Date(input[i].due_at);
        inputDate.setHours(0,0,0,0);
        if ((status == 'overdues') && (inputDate.getTime() < todayDate.getTime())) count++;
        else if ((status == 'today') && (inputDate.getTime() == todayDate.getTime())) count++;
        else if ((status == 'upcoming') && (inputDate.getTime() > todayDate.getTime())) count++;
      }
      else if (input[i].due_at == null && (status == 'no_due_date')) count++;
  }
  return count;
}

/**
 * Draw the extension badge in Chrome based on the Todos counter
 * localStorage['myTodos'] must to be set
 */
function updateBadge() {
  try {
    var counter_todos = localStorage['counter_todos'] ? localStorage['counter_todos'] : "default";
    var jsonTodos = JSON.parse(localStorage['myTodos']);
    var counter = countTodos(jsonTodos, 'overdue');
    var color;

    if ((counter_todos == 'overdues') ||
      (counter_todos == 'default' && countTodos(jsonTodos, 'overdues'))) {
        counter = countTodos(jsonTodos, 'overdues');
        color = {color: '#f54e4a'};
    }
    else if ((counter_todos == 'today') ||
      (counter_todos == 'default' && countTodos(jsonTodos, 'today'))) {
        counter = countTodos(jsonTodos, 'today');
        color = {color: '#5e9ac9'};
    }
    else if ((counter_todos == 'upcoming') ||
      (counter_todos == 'default' && countTodos(jsonTodos, 'upcoming'))) {
        counter = countTodos(jsonTodos, 'upcoming');
        color = {color: '#5e9ac9'};
    }
    else if ((counter_todos == 'no_due_date') ||
      (counter_todos == 'default' && countTodos(jsonTodos, 'no_due_date'))) {
        counter = countTodos(jsonTodos, 'no_due_date');
        color = {color: '#5e9ac9'};
    }
    else {
      counter = '';
      color = {color: '#000000'};
    }

    chrome.browserAction.setBadgeBackgroundColor(color);
    chrome.browserAction.setBadgeText({text: counter.toString()});
    console.log('LOG: updateBadge');
  } catch(e) {
    console.log('ERROR: updateBadge ' + e);
    chrome.browserAction.setBadgeText({text: ''});
    chrome.browserAction.setIcon({path : '../icon.png'});
  }
}