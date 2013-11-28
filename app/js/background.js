/*
 * Background script of the Chrome extension
 * Loaded by background.html
 */
(function() {
  'use strict';

  var backgroundTasks = {

    renewCache: true,
    basecampToken: localStorage.basecampToken,
    basecampAccounts: [],
    userIDs: [],
    allTodos: [],
    allTodolists: [],
    oldMyTodos: [],

    getBasecampAccounts: function() {
      var xhr  = new XMLHttpRequest();
      xhr.open('GET', 'https://launchpad.37signals.com/authorization.json', false);
      xhr.setRequestHeader('Authorization', 'Bearer ' + this.basecampToken);
      xhr.send();
      if (xhr.readyState === 4 && xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        this.basecampAccounts = data.accounts;
        console.log('LOG: getBasecampAccounts XHR');
      } else if (xhr.readyState === 4) {
        // Token expired
        console.log('ERROR: getBasecampAccounts XHR - Token expired');
        window.oauth2.renew();
      }
    },

    getUserIDs: function() {
      var self = this;
      _.forEach(this.basecampAccounts, function(basecampAccount) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://basecamp.com/' + basecampAccount.id + '/api/v1/people/me.json', false);
        xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
        xhr.send();
        if (xhr.readyState === 4 && xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          self.userIDs.push(data.id);
        } else if (xhr.readyState === 4) {
          console.log('ERROR: getUserIDs XHR');
        }
      });
      console.log('LOG: getUserIDs XHR');
    },

    getTodolists: function() {
      this.allTodolists = [];
      var self = this;
      _.forEach(this.basecampAccounts, function(basecampAccount) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://basecamp.com/' + basecampAccount.id + '/api/v1/todolists.json', false);
        xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
        xhr.send();
        if (xhr.readyState === 4 && xhr.status === 200) {
          if (xhr.getResponseHeader('Status') === '200 OK') self.renewCache = true;
          var data = JSON.parse(xhr.responseText);
          self.allTodolists.push(data);
        } else if (xhr.readyState === 4) {
          console.log('ERROR: getTodolists XHR');
        }
      });
      console.log('LOG: getTodolists XHR');
      this.allTodolists = _.flatten(this.allTodolists, true);
    },

    getTodos: function() {
      this.allTodos = [];
      var self = this;
      _.forEach(this.allTodolists, function(todolist) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', todolist.url, false);
        xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
        xhr.send();
        if (xhr.readyState === 4 && xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          self.allTodos.push(data.todos.remaining);
        } else if (xhr.readyState === 4) {
          console.log('ERROR: getTodos XHR');
        }
      });
      console.log('LOG: getTodos XHR');
      this.allTodos = _.flatten(this.allTodos, true);
    },

    addTodosData: function() {
      _.map(this.allTodos, function(todo) {
        var parentTodolist = _.findWhere(this.allTodolists, { id: todo.todolist_id });
        todo.todolist      = parentTodolist.name ;
        todo.project       = parentTodolist.bucket.name;
        todo.project_id    = parentTodolist.bucket.id;
      }, this);
    },

    saveTodos: function() {
      chrome.storage.local.set({ 'assignedTodos': JSON.stringify(this.allTodos) });
      console.log('LOG: saveTodos updates cache of allTodos');
    },

    parseMyTodos: function() {
      var newMyTodos = _.filter(this.allTodos, function(todo) {
        return todo.assignee && _.contains(this.userIDs, todo.assignee.id);
      }, this);
      this.oldMyTodos = localStorage.myTodos ? JSON.parse(localStorage.myTodos) : [];
      _.map(newMyTodos, function(todo) {
        if (_.findWhere(this.oldMyTodos, { id: todo.id })) return;
        else this.createNotification(todo);
      }, this);
      localStorage.myTodos = JSON.stringify(newMyTodos);
      badge.updateBadge(newMyTodos);
      console.log('LOG: parseMyTodos updates cache of myTodos');
    },

    createNotification: function(todo) {
      var notification = webkitNotifications.createNotification(
        todo.creator.avatar_url, // Icon
        todo.project, // Title
        todo.content // Body
      );
      notification.onclick = function () {
        // Example of what the replace-regex do:
        // https://basecamp.com/2457428/api/v1/projects/4324139-explore-basecamp/todos/70309999-click-the-invite.json
        // https://basecamp.com/2457428/projects/4324139-explore-basecamp/todos/70309999-click-the-invite
        window.open(todo.url.replace(/[\/]api[\/]v1|[\.]json/gi, ''));
        notification.close();
      };
      notification.show();
      setTimeout(function() { notification.cancel(); }, 15000); // Hide notification after 15 seconds
    },

    pollTodolists: function(period) {
      var self = this;
      setTimeout(function() {
        self.getTodolists();
        if (self.renewCache) {
          self.getTodos();
          self.addTodosData();
          self.saveTodos();
          self.parseMyTodos();
          self.renewCache = false;
        }
        self.pollTodolists(localStorage.refresh_period);
      }, period);
    },

    init: function() {
      if (!localStorage.language) {
        var userLang = navigator.language ? navigator.language : navigator.userLanguage,
            locale   = userLang.substring(0, 2);
        localStorage.language = locale;
      }
      if (!localStorage.counter_todos) {
        localStorage.counter_todos = 'default';
      }
      if (!localStorage.refresh_period) {
        localStorage.refresh_period = 5000;
      }
      if (localStorage.myTodos) {
        this.oldMyTodos = JSON.parse(localStorage.myTodos);
        badge.updateBadge(this.oldMyTodos);
      }
    },

    start: function() {
      this.init();
      this.getBasecampAccounts();
      this.getUserIDs();
      this.pollTodolists(0);
    }
  };

  backgroundTasks.start();

})();
