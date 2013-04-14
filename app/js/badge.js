/**
 * Returns the date under the format "YYYY-MM-DD"
 * @param {date} a javascript date object
 */
function dateToYMD(date) {
    var d = date.getDate(),
        m = date.getMonth() + 1,
        y = date.getFullYear();
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

/**
 * Count Todos in one category
 * @param {string} status Count overdue, today, upcoming or undefined Todos
 * @param {string} input JSON string containing all myTodos
 */
function countTodos(input, status) {

  switch (status) {
    case "no_due_date":
      return _.where(input, {due_at: null}).length;
      break;
    case "today":
      return _.where(input, {due_at: dateToYMD(new Date())}).length;
      break;
    case "upcoming":
      return _.countBy(input, function(todo) {
        return (dateToYMD(new Date(todo.due_at)) > dateToYMD(new Date()));
      }).true;
      break;
    case "overdues":
      return _.countBy(input, function(todo) {
        return (dateToYMD(new Date(todo.due_at)) < dateToYMD(new Date()));
      }).true;
      break;
  }
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
