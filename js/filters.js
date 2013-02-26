'use strict';

angular
  .module('basecampExtension.filters', [])

  /**
  *	Returning the right class depending on due date
  *	- Not used -
  */
  .filter('date', function() {
  	return function(input) {
  		if (input != null) {
	  		var currentDate = new Date();
			  var yyyy = currentDate.getFullYear().toString();
			  var mm = (currentDate.getMonth()+1).toString();
			  var dd  = currentDate.getDate().toString();
				var currentDateYYYYMMDD = parseInt(yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]));
				var inputYYYYMMDD = parseInt(input.replace(/-/g, ""));

	    	if (inputYYYYMMDD < currentDateYYYYMMDD) 
	    		return 'important';
	    	else if (inputYYYYMMDD == currentDateYYYYMMDD) 
	    		return 'warning';
	    	else if (inputYYYYMMDD > currentDateYYYYMMDD) 
	    		return 'info';
	    	else 
	    		return 'default';
		  }
		  else return 'default';
	  }
	})

	/**
  *	Filtering Todos for one category
  *	'1' - Overdue
  *	'2' - Today
  *	'3' - Upcoming
  *	'4' - Undetermined
  */
	.filter('status', function() {
	  return function(input, status) {
	  	if(input) {
		  	var currentDate = new Date();
				var yyyy = currentDate.getFullYear().toString();
			  var mm = (currentDate.getMonth()+1).toString();
			  var dd  = currentDate.getDate().toString();
				var currentDateYYYYMMDD = parseInt(yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]));
				var inputYYYYMMDD = "";
		    var out = []; 

	      for (var i = 0; i < input.length; i++) {
	      		if (input[i].due_at != null && status != '4') {
	      			inputYYYYMMDD = parseInt(input[i].due_at.replace(/-/g, ""));
		          if ((status == '1') && (inputYYYYMMDD < currentDateYYYYMMDD)) out.push(input[i]);
		          else if ((status == '2') && (inputYYYYMMDD == currentDateYYYYMMDD)) out.push(input[i]);
		          else if ((status == '3') && (inputYYYYMMDD > currentDateYYYYMMDD)) out.push(input[i]);
		        }
		        else if (input[i].due_at == null && status == '4') out.push(input[i])
	      }      
		    return out;
	    } else return [];
	  };
	});
