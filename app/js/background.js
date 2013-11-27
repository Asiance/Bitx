/*
 * Background script of the Chrome extension
 * Loaded by background.html
 */
(function() {
  'use strict';

  var backgroundTasks = {

    basecampToken: localStorage.basecampToken,
    basecampAccounts: [],
    userIDs: [],
    allTodos: [],
    allTodolists: [],
    myTodos: [],
    oldMyTodos: [],

    getBasecampAccounts: function() {
      var self = this,
          xhr  = new XMLHttpRequest();
      xhr.open('GET', 'https://launchpad.37signals.com/authorization.json', false);
      xhr.setRequestHeader('Authorization', 'Bearer ' + this.basecampToken);
      xhr.send();
      if (xhr.readyState === 4 && xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        self.basecampAccounts = data.accounts;
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
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
          var data = JSON.parse(xhr.responseText);
          self.userIDs.push(data.id);
        } else if (xhr.readyState === 4) {
          console.log('ERROR: getUserIDs XHR');
        }
      });
      console.log('LOG: getUserIDs XHR');
    },

    getTodolists: function() {
      var self = this;
      _.forEach(this.basecampAccounts, function(basecampAccount) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://basecamp.com/' + basecampAccount.id + '/api/v1/todolists.json', false);
        xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
        xhr.send();
        if (xhr.readyState === 4 && xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          self.allTodolists.push(data);
        } else if (xhr.readyState === 4  && xhr.status === 304) {
          return;
        } else if (xhr.readyState === 4) {
          console.log('ERROR: getTodolists XHR');
        }
      });
      console.log('LOG: getTodolists XHR');
      this.allTodolists = _.flatten(this.allTodolists, true);
    },

    getTodos: function() {
      var self = this;
      _.forEach(this.allTodolists, function(todolist) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', todolist.url, false);
        xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
        xhr.send();
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
          var data = JSON.parse(xhr.responseText);
          self.allTodos.push(data.todos.remaining);
        } else if (xhr.readyState === 4) {
          console.log('ERROR: getTodos XHR');
        }
      });
      console.log('LOG: getTodos XHR');
      self.allTodos = _.flatten(self.allTodos, true);
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
        if (_.contains(this.oldMyTodos, todo)) return;
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
      setTimeout(function() { notification.cancel(); }, 15000); // Hide notificiation after 15 seconds
    },

    init: function() {
      var userLang = navigator.language ? navigator.language : navigator.userLanguage,
          locale   = userLang.substring(0, 2),
          refresh_period,
          myTodos;
      if (!localStorage.language) {
        localStorage.language = locale;
      }
      if (!localStorage.counter_todos) {
        localStorage.counter_todos = 'default';
      }
      if (localStorage.refresh_period) {
        refresh_period = localStorage.refresh_period;
      } else {
        refresh_period = 5000;
        localStorage.refresh_period = refresh_period;
      }
      if (localStorage.myTodos) {
        myTodos = JSON.parse(localStorage.myTodos);
        badge.updateBadge(myTodos);
      }
    },

    start: function() {
      this.init();
      this.getBasecampAccounts();
      this.getUserIDs();
      this.getTodolists();
      this.getTodos();
      this.addTodosData();
      this.saveTodos();
      this.parseMyTodos();
    }
  };

  backgroundTasks.start();

})();
