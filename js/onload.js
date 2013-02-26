window.onload = function () {

  /**
  * Open signin page for Basecamp
  */
  if ((token = OAuth2.getToken()) === undefined ) OAuth2.begin();

  /**
  * Count Todos in one category
  * @param {string} status Count overdue, today, upcoming or undefined Todos
  * @param {string} input JSON string containing all assignedTodos
  */
  function countTodos(input, status) {
	  var currentDate = new Date();
		var yyyy = currentDate.getFullYear().toString();
		var mm = (currentDate.getMonth()+1).toString();
		var dd = currentDate.getDate().toString();
		var currentDateYYYYMMDD = parseInt(yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]));
		var inputYYYYMMDD = "";
	  var count = 0; 

    for (var i = 0; i < input.length; i++) {
    		if (input[i].due_at != null && status != '4') {
    			inputYYYYMMDD = parseInt(input[i].due_at.replace(/-/g, ""));
          if ((status == 'overdue') && (inputYYYYMMDD < currentDateYYYYMMDD)) count++;
          else if ((status == 'today') && (inputYYYYMMDD == currentDateYYYYMMDD)) count++;
          else if ((status == 'upcoming') && (inputYYYYMMDD > currentDateYYYYMMDD)) count++;
        } 
        else if (input[i].due_at == null && (status == 'undefined')) count++;
    }      
    return count;		
	}

  /**
  * Draw the extension badge in Chrome base on the Todos counter
  * localStorage['assignedTodos'] must to be set
  */
	function draw() {
    try {
      var jsonTodos = JSON.parse(localStorage.getItem('assignedTodos'));
      var canvas = document.getElementById('badgeIcon');
      if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  		  ctx.font = "bold 11px Helvetica";

        ctx.fillStyle = "red";
  		  ctx.fillText(countTodos(jsonTodos, 'overdue'), 0, 9);

        ctx.fillStyle = "green";
  		  ctx.fillText(countTodos(jsonTodos, 'today'), 12, 9);

        ctx.fillStyle = "blue";
  		  ctx.fillText(countTodos(jsonTodos, 'upcoming'), 0, 19);

        ctx.fillStyle = "black";
  		  ctx.fillText(countTodos(jsonTodos, 'undefined'), 12, 19);

        var imageData = ctx.getImageData(0, 0, 19, 19);
      }
  		chrome.browserAction.setIcon({imageData: imageData});
    } catch(e) {
      console.log(e);
    }
  }	setInterval(draw, 10000);

}