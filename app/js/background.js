/*
 * Background script of the Chrome extension
 * Loaded by background.html
 */
window.onload = function() {
  var userLang = (navigator.language) ? navigator.language : navigator.userLanguage;
  var locale = userLang.substring(0,2);
  if (!localStorage['language']) {
    localStorage['language'] = locale;
  }
  if (!localStorage['counter_todos']) {
    localStorage['counter_todos'] = 'overdues';
  }
  if (localStorage['refresh_period']) {
    var refresh_period = localStorage['refresh_period'];
  } else {
    var refresh_period = 5000;
    localStorage['refresh_period'] = refresh_period;
  }
  setInterval(getMyTodos, refresh_period);
  setInterval(getTodos, refresh_period);
}

/*
 * Retrieve the Basecamp account that supports the last APIs
 * Store data in localStorage
 */
function getAuthorization() {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://launchpad.37signals.com/authorization.json', true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage['basecampToken']);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        data = JSON.parse(xhr.responseText);
        localStorage['basecampId'] = _.findWhere(data.accounts, {product: "bcx"}).id;
        getUser();
        console.log('LOG: getAuthorization XHR');
      } else if (xhr.readyState === 4) {
        localStorage['myTodos'] = "";
        updateBadge();
        console.log('ERROR: getAuthorization XHR');
      }
    };
    xhr.send();
  } catch(e) {
    console.log(e);
  }
}

/*
 * Retrieve the User ID within the Basecamp organization
 * Store data in localStorage
 */
function getUser() {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://basecamp.com/"+ localStorage['basecampId'] +"/api/v1/people/me.json", true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage['basecampToken']);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
        data = JSON.parse(xhr.responseText);
        localStorage['userId'] = data.id;
        console.log('LOG: getUser XHR');
      } else if (xhr.readyState === 4) {
        console.log('ERROR: getUser XHR');
      }
    };
    xhr.send();
  } catch(e) {
    console.log(e);
  }
}

/*
 * Retrieve the Assigned Todos et Todolists of the user
 * Store data in localStorage
 */
function getMyTodos() {
  try {
    if (localStorage['basecampId'] && localStorage['userId']) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', "https://basecamp.com/" + localStorage['basecampId'] + "/api/v1/people/" + localStorage['userId'] + "/assigned_todos.json", true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage['basecampToken']);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
          var data = JSON.parse(xhr.responseText);

          // Flatten Todolists to keep only Todos
          var myTodos = new Array();
          for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].assigned_todos.length; j++) {
              var tmp = data[i].assigned_todos[j];
              tmp.project = data[i].bucket.name;
              tmp.project_id = data[i].bucket.id;
              tmp.todolist = data[i].name;
              myTodos.push(tmp);
            }
          }

          // Create notification
          var localMyTodos = JSON.parse(localStorage['myTodos']);
          if (localStorage['myTodos'] && !_.isEqual(myTodos, localMyTodos)) {
            _.each(myTodos, function(item) {
              if (!_.findWhere(localMyTodos, {id: item.id})) { // Check each todo whether it is new or not
                var projectName = _.findWhere(data, {id: item.todolist_id}).bucket.name;
                var notification = webkitNotifications.createNotification(
                  item.creator.avatar_url, // Icon
                  projectName, // Title
                  item.content // Body
                );
                notification.onclick = function () {
                  window.open("https://basecamp.com/" + localStorage['basecampId'] + "/projects/" + item.project_id + "/todos/" + item.id);
                  notification.close();
                }
                notification.show();
                setTimeout(function() { notification.cancel(); }, 15000); // Hide notificiation after 15 seconds
              }
            });
          }

          // Update localStorage
          localStorage['myTodos'] = JSON.stringify(myTodos);
          updateBadge();
          console.log('LOG: getMyTodos XHR');
        } else if (xhr.readyState === 4) {
          localStorage['basecampId'] == null;
          localStorage['userId'] == null;
          console.log('ERROR: getMyTodos XHR');
        }
      };
      xhr.send();
    } else if (!localStorage['basecampId'] || !localStorage['userId']) getAuthorization();
  } catch(e) {
    console.log(e);
  }
}

function getTodos() {

  var allTodos = [];

  $.ajax({
    url: "https://basecamp.com/" + localStorage['basecampId'] + "/api/v1/todolists.json",
    headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}
  }).done(function(data) {

    $.when(asyncEvent(data)).done(function(allTodolists) {
      _.forEach(allTodolists, function (todolist) {
        _.forEach(todolist.todos.remaining, function(todo) {
          todo.todolist = todolist.name;
          todo.project = todolist.project;
          todo.project_id = todolist.project_id;
          allTodos.push(todo);
        })
      })

      allTodos = _.chain(allTodos).sortBy(function(todo) { return todo.id; })
                  .sortBy(function(todo) { return todo.project_id; })
                  .value();
      chrome.storage.local.set({'assignedTodos': JSON.stringify(allTodos)});

    });


  });
}

function asyncEvent(todolists) {

  function checkIfDone() {
    if (--done == 0) {
      return deferred.resolve(allTodolists);
    }
  }

  var deferred = new jQuery.Deferred();
  var done = todolists.length;
  var allTodolists = []

  _.each(todolists, function(todolist) {
    $.ajax({
      url: todolist.url,
      headers:  {'Authorization':'Bearer ' + localStorage['basecampToken']}
    }).done(function(data) {
      data.project_id = todolist.bucket.id;
      data.project = todolist.bucket.name;
      allTodolists.push(data);
      checkIfDone();
    });
  });

  return deferred.promise()

}