'use strict';

angular
  .module('basecampExtension.filters', [])
  .filter('date', function() {
  	return function(input) {
  		if (input != null) {
	  		var currentDate= new Date();
			  var yyyy = currentDate.getFullYear().toString();
			  var mm = (currentDate.getMonth()+1).toString(); // getMonth() is zero-based
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
	});
