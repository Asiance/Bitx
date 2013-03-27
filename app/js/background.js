/*
 * Background script of the Chrome extension
 * Loaded by background.html
 */
window.onload = function () {
  var userLang = (navigator.language) ? navigator.language : navigator.userLanguage; 
  var locale = userLang.substring(0,2);
  localStorage['language'] = localStorage['language'] ? localStorage['language'] : locale;
  refresh_period = localStorage['refresh_period'] ? localStorage['refresh_period'] : 5000;
  getAssignedTodos();
  updateBadge();
  setInterval(getAssignedTodos, refresh_period);
  setInterval(updateBadge, refresh_period);  
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
        localStorage.assignedTodolists = "";
        localStorage.assignedTodos = "";
        localStorage.assignedTodosByProject = "";
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
function getAssignedTodos() {
  try {
    if (localStorage['basecampId'] && localStorage['userId']) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', "https://basecamp.com/" + localStorage['basecampId'] + "/api/v1/people/" + localStorage['userId'] + "/assigned_todos.json", true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage['basecampToken']);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
          data = JSON.parse(xhr.responseText);
          
          // Flatten Todolists to keep only Todos
          var assignedTodos = new Array(); 
          for (var i = 0; i < data.length; i++) { 
            for (var j = 0; j < data[i].assigned_todos.length; j++) { 
              var tmp = data[i].assigned_todos[j];
              tmp.project = data[i].bucket.name;
              tmp.project_id = data[i].bucket.id;
              tmp.todolist = data[i].name;
              assignedTodos.push(tmp);
            }
          }

          // Group assigned Todos by Project
          var projects = [];
          var projectName = 'NO_PROJECT';
          for (var i = 0; i < assignedTodos.length; i++) {
            var assignedTodo = assignedTodos[i];
            if (assignedTodo.project !== projectName) {
              var project = {name: assignedTodo.project, id: assignedTodo.project_id, assignedTodos: []};
              projectName = assignedTodo.project;
              projects.push(project);
            }
            project.assignedTodos.push(assignedTodo);
          }

          // Create notification
          if (localStorage['assignedTodos'] && !_.isEqual(assignedTodos, JSON.parse(localStorage['assignedTodos']))) {
            _.each(assignedTodos, function(item) {
              if (!_.findWhere(JSON.parse(localStorage['assignedTodos']), {id: item.id})) { // Check each todo whether it is new or not
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
                setTimeout(function(){ notification.cancel(); }, 15000); // Hide notificiation after 15 seconds
              }
            });            
          }

          // Update localStorage
          localStorage['assignedTodos'] = JSON.stringify(assignedTodos); 
          localStorage['assignedTodolists'] = JSON.stringify(data);
          localStorage['assignedTodosByProject'] = JSON.stringify(projects);          
          
          console.log('LOG: getAssignedTodos XHR');
        } else if (xhr.readyState === 4) {
          localStorage.clear();
          console.log('ERROR: getAssignedTodos XHR');
        }
      };
      xhr.send();
    } else if (!localStorage['basecampId'] && !localStorage['userId']) getAuthorization();
  } catch(e) {
    console.log(e);
  }
}