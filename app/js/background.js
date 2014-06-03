/*
 * Background script of the Chrome extension
 * Loaded by background.html
 */
(function() {
  'use strict';

  window.backgroundTasks = {

    renewCache: false,
    jobDone: true,

    getBasecampAccounts: function(callback) {
      var self = this;
      var xhr  = new XMLHttpRequest();
      xhr.open('GET', 'https://launchpad.37signals.com/authorization.json', false);
      xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
      xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          console.log('LOG: getBasecampAccounts XHR');
          var data = JSON.parse(xhr.responseText);
          self.basecampAccounts = _.where(data.accounts, { product: 'bcx' });
          self.saveCache('basecampAccounts');
          callback();
        } else if (xhr.readyState === 4) {
          // Token expired
          console.log('ERROR: getBasecampAccounts XHR - Token expired');
          if (xhr.status === 401) window.oauth2.renew();
        }
      }
      try {
        xhr.send();
      } catch ( e ) {
        self.handleXHRErrors('getBasecampAccounts', e);
      }
    },

    getUserIDs: function() {
      this.userIDs = [];
      var self = this;
      _.forEach(this.basecampAccounts, function(basecampAccount) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://basecamp.com/' + basecampAccount.id + '/api/v1/people/me.json', false);
        xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
        xhr.onload = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            self.userIDs.push(data.id);
          } else if (xhr.readyState === 4) {
            if (xhr.getResponseHeader('Reason') === 'Account Inactive') {
              basecampAccount.inactive = true;
              console.log('WARNING: getUserIDs XHR - Basecamp account ' + basecampAccount.name + ' inactive')
            }
            else console.log('ERROR: getUserIDs XHR');
          }
        }
        try {
          xhr.send();
        } catch ( e ) {
          self.handleXHRErrors('getUserIDs', e);
        }
      });
      console.log('LOG: getUserIDs XHR');
      this.saveCache('userIDs');
    },

    getPeople: function() {
      this.people = [];
      var self = this,
      metaElements = [{
        id:            this.userIDs,
        name:          'Alias',
        email_address: 'me',
        avatar_url:    '/img/icon-search.png'
      }, {
        id:            -1,
        name:          'Search by creator',
        email_address: 'from:',
        avatar_url:    '/img/icon-search.png'
      }, {
        id:            -1,
        name:          'Search by assignee',
        email_address: 'to:',
        avatar_url:    '/img/icon-search.png'
      }];

      _.forEach(this.basecampAccounts, function(basecampAccount) {
        if (basecampAccount.inactive) return;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://basecamp.com/' + basecampAccount.id + '/api/v1/people.json', false);
        xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
        xhr.onload = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            self.people = self.people.concat(data);
          } else if (xhr.readyState === 4) {
            console.log('ERROR: getUserIDs XHR');
          }
        }
        try {
          xhr.send();
        } catch ( e ) {
          self.handleXHRErrors('getPeople', e);
        }
      });
      console.log('LOG: getPeople XHR');
      this.saveCache('people', self.people.concat(metaElements));
    },

    getTodoLists: function(callback) {
      if (_.isEmpty(this.basecampAccounts)) {
        backgroundTasks.stop();
        return;
      }
      this.allTodoLists = [];
      var self = this;
      var nbBasecampAccountFetched = 0;
      _.forEach(this.basecampAccounts, function(basecampAccount) {
        if (basecampAccount.inactive) return nbBasecampAccountFetched++;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://basecamp.com/' + basecampAccount.id + '/api/v1/todolists.json', false);
        xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
        xhr.onload = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            // The answer is not "304 Not Modified", renew the cache
            if (xhr.getResponseHeader('Status') === '200 OK') self.renewCache = true;
            console.log('LOG: getTodoLists XHR, Basecamp account: ' + basecampAccount.id + ", status: " + xhr.getResponseHeader('Status'));
            var data = JSON.parse(xhr.responseText);
            self.allTodoLists = self.allTodoLists.concat(data);
            nbBasecampAccountFetched++;
            if (nbBasecampAccountFetched === self.basecampAccounts.length) {
              callback();
            }
          } else if (xhr.readyState === 4) {
            console.log('ERROR: getTodoLists XHR');
            backgroundTasks.stop();
            if (xhr.status === 401) window.oauth2.renew();
          }
        }
        try {
          xhr.send();
        } catch ( e ) {
          self.handleXHRErrors('getTodoLists', e);
        }
      });
    },

    getTodos: function(callback) {
      this.allTodos = [];
      var self = this;
      var nbTodosFetched = 0;
      _.forEach(this.allTodoLists, function(todolist) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', todolist.url, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + self.basecampToken);
        xhr.onload = function(e) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var data = JSON.parse(xhr.responseText);
              self.allTodos = self.allTodos.concat(data.todos.remaining);
              nbTodosFetched++;
              if (nbTodosFetched === self.allTodoLists.length) {
                console.log('LOG: finished getting all todos');
                callback();
              }
            } else {
              console.log('ERROR: getTodos XHR');
            }
          }
        };
        try {
          xhr.send();
        } catch ( e ) {
          self.handleXHRErrors('getTodos', e);
        }
      });
      console.log('LOG: getTodos XHR');
    },

    addTodosData: function() {
      _.map(this.allTodos, function(todo) {
        var parentTodoList = _.findWhere(this.allTodoLists, { id: todo.todolist_id });
        todo.todolist      = parentTodoList.name ;
        todo.project       = parentTodoList.bucket.name;
        todo.project_id    = parentTodoList.bucket.id;
      }, this);
      this.saveCache('allTodos');
    },

    saveCache: function(key, value) {
      var object = {};
      if (!value) value = this[key];
      object[key] = value;
      chrome.storage.local.set(object);
      console.log('LOG: save ' + key + ' in cache');
    },

    loadCache: function(key, callback) {
      var self = this;
      chrome.storage.local.get(key, function(data) {
        if (chrome.runtime.lastError) return;
        self[key] = data[key] ? data[key] : null;
        console.log('LOG: load ' + key + ' from cache');
        if (callback) callback();
      });
    },

    parseMyTodos: function() {
      var self = this,
          newMyTodos = _.filter(this.allTodos, function(todo) {
            return todo.assignee && _.contains(this.userIDs, todo.assignee.id);
          }, this);
      this.loadCache('myTodos', function() {
        if (self.myTodos !== null) {
          _.map(newMyTodos, function(todo) {
            if (_.findWhere(this.myTodos, { id: todo.id })) return;
            else this.createNotification(todo);
          }, self);
        }
        self.saveCache('myTodos', newMyTodos);
        console.log('LOG: parseMyTodos updates cache of myTodos');
        badge.updateBadge(newMyTodos);
      });
    },

    createNotification: function(todo) {
      var options = {
        type: "basic",
        title: todo.project,
        message: todo.content,
        iconUrl: todo.creator.avatar_url
      };
      var d = new Date();
      d = d.getTime().toString();
      var notification = chrome.notifications.create(d, options, function() { });
      chrome.notifications.onClicked.addListener(function (id) {
        if (id === d) {
          window.open(todo.url.replace(/[\/]api[\/]v1|[\.]json/gi, ''));
        }
      });
    },

    pollTodolists: function(period) {
      var self = this;
      this.pollingTask = setInterval(function() {
        // Make sure that the previous job is done
        if (self.jobDone == true) {
          self.jobDone = false;
          self.checkNewVersion();
          if (self.renewCache) {
            self.getTodoLists(function() {
              self.getTodos(function() {
                self.addTodosData();
                self.parseMyTodos();
                self.getPeople();
                self.renewCache = false;
                self.jobDone = true;
              });
            });
          } else {
            self.getTodoLists(function() {
              self.jobDone = true;
            });
          }
        }
      }, period);
    },

    hasAccessToken: function() {
      if (!localStorage.basecampToken) {
        return false;
      } else {
        return true;
      }
    },

    handleXHRErrors: function(fn_name, e) {
      var self = this;
      console.log("Exception: " + fn_name + "getUserIDs XHR: " + e);
      if (e == "NetworkError: A network error occurred.") {
        self.stop();
        console.log("Stopping Bitx, Internet connection lost");
        // Let's restart after 30 seconds
        setTimeout(function() {
          backgroundTasks.start();
        }, 30000);
      } else {
        self.stop();
        console.log("Unsupported error, let's try again later...");
        setTimeout(function() {
          backgroundTasks.start();
        }, 30000);
      }
    },

    initConfig: function() {
      if (!localStorage.language) {
        var userLang = navigator.language ? navigator.language : navigator.userLanguage,
            locale   = userLang.substring(0, 2);
        localStorage.language = locale;
      }
      if (!localStorage.counter_todos) {
        localStorage.counter_todos = 'default';
      }
      if (!localStorage.refresh_period) {
        localStorage.refresh_period = 30000;
      }
      this.basecampToken = localStorage.basecampToken;
      console.log('LOG: initConfig');
    },

    checkNewVersion: function() {
      if (chrome.app.getDetails().version != localStorage.app_version && localStorage.app_version != undefined) {
        console.log('LOG: New version! Let\'s notify and restart!');
        var options = {
          type: "basic",
          title: "Bitx just got better! (v" + chrome.app.getDetails().version + ")",
          message: "Help us to improve it; click here to submit your feedback!",
          iconUrl: "./img/icon_250x250.png"
        };
        var d = new Date();
        d = d.getTime().toString();
        var notification = chrome.notifications.create(d, options, function() { });
        chrome.notifications.onClicked.addListener(function (id) {
          if (id === d) {
            window.open('http://goo.gl/fUXs2M');
          }
        });
        this.restart()
        return true;
      } else {
        return false;
      }
    },

    start: function() {
      var self = this;
      if (self.hasAccessToken()) {
        console.log('LOG: start backgroundTasks');
        self.initConfig()
        self.getBasecampAccounts(function () {
          self.getUserIDs();
          self.getTodoLists(function() {
            self.getTodos(function() {
              self.addTodosData();
              self.parseMyTodos();
              self.getPeople();
              self.pollTodolists(localStorage.refresh_period);
            });
          });
        });
      } else {
        console.log('LOG: Access token missing, cannot start yet.');
        self.stop();
      }
    },

    stop: function() {
      console.log('LOG: stop backgroundTasks');
      clearInterval(this.pollingTask);
      badge.updateBadge(null);
    },

    restart: function() {
      console.log('LOG: restart backgroundTasks');
      localStorage.app_version = chrome.app.getDetails().version;
      clearInterval(this.pollingTask);
      this.jobDone = true;
      this.pollTodolists(localStorage.refresh_period);
    }
  };

  backgroundTasks.start();

  window.addEventListener('storage', eventStorage, false);

  function eventStorage(e) {
    if (e.key === '' && e.newValue === null) {
      backgroundTasks.stop();
    }
    else if (e.key === 'basecampToken' && e.newValue !== null) {
      backgroundTasks.stop();
      backgroundTasks.start();
    }
    else if (e.key === 'refresh_period' && !isNaN(e.newValue)) {
      backgroundTasks.restart();
    }
    else if (e.key === 'lastTodoCompleted' && e.newValue !== null) {
      //TODO: should find a way to refresh the badge without waiting the refresh
    }
  }

})();
