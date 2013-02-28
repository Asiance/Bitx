window.onload = function () {
  initOAuth2();	
  setInterval(getAssignedTodolists, 5000);
  setInterval(updateBadge, 5000);  
}

function getAuthorization() {
	try {
	  $.ajax({
	    url: "https://launchpad.37signals.com/authorization.json",
	    type: "GET",
	    beforeSend: function(xhr){
	    	xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage['basecampToken']);
	    },
	    success: function(data) {
	      localStorage['basecampId'] = _.findWhere(data.accounts, {product: "bcx"}).id;
				getUser();	      
	    },
	    error: function() { console.log('ERROR: getAuthorization XHR') },
	  });
	} catch(e) {
		console.log(e);
	}
}

function getUser() {
	try {
	  $.ajax({
	    url: "https://basecamp.com/"+ localStorage['basecampId'] +"/api/v1/people/me.json",
	    type: "GET",
	    beforeSend: function(xhr){
	    	xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage['basecampToken']);
	    },
	    success: function(data) {
	      localStorage['userId'] = data.id;
	    },
	    error: function() { console.log('ERROR: getUser XHR') },
	  });
	} catch(e) {
		console.log(e);
	}
}

function getAssignedTodolists() {
	try {
		if (localStorage['basecampId'] && localStorage['userId'])
		  $.ajax({
		    url: "https://basecamp.com/" + localStorage['basecampId'] + "/api/v1/people/" + localStorage['userId'] + "/assigned_todos.json",
		    type: "GET",
		    beforeSend: function(xhr){
		    	xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage['basecampToken']);
		    },
		    success: function(data) {
			    assignedTodos = new Array(); 
			    for (var i = 0; i < data.length; i++) { 
		        for (var j = 0; j < data[i].assigned_todos.length; j++) { 
		          assignedTodos.push(data[i].assigned_todos[j]);
		        }
			    }                        
			    localStorage['assignedTodos'] = JSON.stringify(assignedTodos);
		    },
		    error: function() { console.log('ERROR: getAssignedTodolists XHR') },
		  });
		else if (!localStorage['basecampId'] && !localStorage['userId']) getAuthorization();
	} catch(e) {
		console.log(e);
	}
}