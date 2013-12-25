var badge = {

  COLOR_WARNING: "#F54E4A",
  COLOR_OK: "#5E9AC9",

  /**
   * Returns the date under the format "YYYY-MM-DD"
   * @param {date} a javascript date object
   */
  dateToYMD: function(date) {
    var d = date.getDate(),
        m = date.getMonth() + 1,
        y = date.getFullYear();
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  },

  /**
   * Count Todos in one category
   * @param {string} status Count overdue, today, upcoming or undefined Todos
   * @param {string} input JSON string containing all myTodos
   */
  countTodos: function(input, status) {
    var today = this.dateToYMD(new Date());
    switch (status) {
      case 'no_due_date':
        return _.where(input, { due_at: null }).length;
      case 'today':
        return _.where(input, { due_at: today }).length;
      case 'upcoming':
        return _.countBy(input, function(todo) {
          return todo.due_at > today;
        }).true;
      case 'overdues':
        return _.countBy(input, function(todo) {
          return todo.due_at ? todo.due_at < today : false;
        }).true;
    }
  },

  /**
   * Draw the extension badge in Chrome based on the Todos counter
   * localStorage['myTodos'] must be set
   */
  updateBadge: function(myTodos) {
    try {
      if (myTodos) {
        var counter_todos = localStorage.counter_todos,
            color,
            counter;
        if (counter_todos === 'default') {
          color   = { color: this.COLOR_WARNING };
          counter = this.countTodos(myTodos, 'overdues');
          if (!counter) {
            color   = { color: this.COLOR_OK };
            counter = this.countTodos(myTodos, 'today')       ||
                      this.countTodos(myTodos, 'upcoming')    ||
                      this.countTodos(myTodos, 'no_due_date') || '';
          }
        } else {
          color   = counter_todos === 'overdues' ?
                    { color: this.COLOR_WARNING } : { color: this.COLOR_OK };
          counter = this.countTodos(myTodos, counter_todos) || '';
        }
        chrome.browserAction.setBadgeBackgroundColor(color);
        chrome.browserAction.setIcon({
          path: './img/icon-active.png'
        });
        chrome.browserAction.setBadgeText({
          text: counter.toString()
        });
      } else {
        chrome.browserAction.setIcon({
          path: './img/icon-inactive.png'
        });
        chrome.browserAction.setBadgeText({
          text: ''
        });
      }
      console.log('LOG: updateBadge');
    } catch (e) {
      console.log('ERROR: updateBadge ' + e);
      chrome.browserAction.setIcon({
        path: './img/icon-inactive.png'
      });
      chrome.browserAction.setBadgeText({
        text: '!'
      });
    }
  }
};
