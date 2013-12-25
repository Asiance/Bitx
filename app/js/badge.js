var badge = {

  color_warning: "#F54E4A",
  color_ok: "#5E9AC9",

  /**
   * Returns the date under the format "YYYY-MM-DD"
   * @param {date} a javascript date object
   */
  dateToYMD: function (date) {
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
  countTodos: function (input, status) {
    var self = this;
    switch (status) {
    case 'no_due_date':
      return _.where(input, {
        due_at: null
      }).length;
    case 'today':
      return _.where(input, {
        due_at: self.dateToYMD(new Date())
      }).length;
    case 'upcoming':
      return _.countBy(input, function (todo) {
        return (self.dateToYMD(new Date(todo.due_at)) > self.dateToYMD(new Date()));
      }).true;
    case 'overdues':
      return _.countBy(input, function (todo) {
        if (todo.due_at !== null)
          return (self.dateToYMD(new Date(todo.due_at)) < self.dateToYMD(new Date()));
      }).true;
    }
  },

  /**
   * Draw the extension badge in Chrome based on the Todos counter
   * localStorage['myTodos'] must be set
   */
  updateBadge: function (myTodos) {
    try {
      if (myTodos) {
        var counter_todos = localStorage.counter_todos;
        var color;
        var counter;
        if (counter_todos === 'overdues') {
          color = {
            color: this.color_warning
          };
        } else {
          color = {
            color: this.color_ok
          };
        }
        if (counter_todos === 'default') {
          counter = this.countTodos(myTodos, 'overdues');
          color = {
            color: this.color_warning
          };
          if (!counter) {
            counter = this.countTodos(myTodos, 'today');
            color = {
              color: this.color_ok
            };
            if (!counter) {
              counter = this.countTodos(myTodos, 'upcoming');
              if (!counter) {
                counter = this.countTodos(myTodos, 'no_due_date');
              }
            }
          }
        } else {
          counter = this.countTodos(myTodos, counter_todos);
        }
        if (!counter) {
          counter = '';
        }
        chrome.browserAction.setBadgeBackgroundColor(color);
        chrome.browserAction.setBadgeText({
          text: counter.toString()
        });
        chrome.browserAction.setIcon({
          path: './img/icon-active.png'
        });
        console.log('LOG: updateBadge');
      } else {
        chrome.browserAction.setIcon({
          path: './img/icon-inactive.png'
        });
        chrome.browserAction.setBadgeText({
          text: ""
        });
      }
    } catch (e) {
      console.log('ERROR: updateBadge ' + e);
      chrome.browserAction.setBadgeText({
        text: ''
      });
      chrome.browserAction.setIcon({
        path: './img/icon-inactive.png'
      });
    }
  }
};