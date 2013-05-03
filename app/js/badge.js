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
        if (todo.due_at != null)
          return (dateToYMD(new Date(todo.due_at)) < dateToYMD(new Date()));
      }).true;
      break;
  }
}

/**
 * Draw the extension badge in Chrome based on the Todos counter
 * localStorage['myTodos'] must be set
 */
function updateBadge(myTodos) {
  try {
    if (myTodos) {
      var counter_todos = localStorage['counter_todos'];
      var color;
      counter = countTodos(myTodos, counter_todos);
      if (!counter) counter = '';
      if (counter_todos == 'overdues') color = {color: '#F54E4A'};
      else color = {color: '#5e9ac9'};
      chrome.browserAction.setBadgeBackgroundColor(color);
      chrome.browserAction.setBadgeText({text: counter.toString()});
      chrome.browserAction.setIcon({path: "./icon.png"});
      console.log('LOG: updateBadge');
      localStorage['updateBadge'] = false;
    } else {
      chrome.browserAction.setIcon({path: "./img/icon-inactive.png"});
    }
  } catch(e) {
    console.log('ERROR: updateBadge ' + e);
    chrome.browserAction.setBadgeText({text: ''});
    chrome.browserAction.setIcon({path : '../icon.png'});
  }
}