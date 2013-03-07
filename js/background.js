/*
 * Background script of the Chrome extension
 * Loaded by background.html
 */
window.onload = function () {
  initOAuth2();	
  refresh_period = localStorage['refresh_period'] ? localStorage['refresh_period'] : 5000;
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
      } else if (xhr.readyState === 4) {
        console.log('ERROR: getAuthorization XHR');
        localStorage.clear();
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
      } else if (xhr.readyState === 4) {
        console.log('ERROR: getUser XHR');
        localStorage.clear();        
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
              assignedTodos.push(data[i].assigned_todos[j]);
            }
          }

          // Create notification
          if (localStorage['assignedTodos'] && !_.isEqual(assignedTodos, JSON.parse(localStorage['assignedTodos']))) {
            _.each(assignedTodos, function(item) {
              if (!_.findWhere(JSON.parse(localStorage['assignedTodos']), {id: item.id})) { // Check each todo whether it is new or not
                var projectName = _.findWhere(data, {id: item.todolist_id}).bucket.name;
                var todolistName = _.findWhere(data, {id: item.todolist_id}).name;
                var notification = webkitNotifications.createNotification(
                  item.creator.avatar_url, // Icon
                  projectName, // Title
                  todolistName + ': **' + item.content + '**' // Body
                );
                notification.show();
                setTimeout(function(){ notification.cancel(); }, 15000); // Hide notificiation after 15 seconds
              }
            });
          }

          // Update localStorage
          localStorage['assignedTodos'] = JSON.stringify(assignedTodos); 
          localStorage['assignedTodolists'] = JSON.stringify(data);
        } else if (xhr.readyState === 4) {
          console.log('ERROR: getAssignedTodos XHR');
        }
      };
      xhr.send();
    } else if (!localStorage['basecampId'] && !localStorage['userId']) getAuthorization();
  } catch(e) {
    console.log(e);
  }
}