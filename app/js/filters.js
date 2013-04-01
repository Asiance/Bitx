'use strict';

angular
  .module('basecampExtension.filters', [])

  /**
   * Filtering Todos by category
   * '1' - Overdue
   * '2' - Today
   * '3' - Upcoming
   * '4' - Undetermined
   */
  .filter('status', function($filter) {
    return function(input, status) {
      if(input) {
        var todayDate = new Date();
        todayDate.setHours(0,0,0,0);
        var inputDate = null;
        var out = []; 
        for (var i = 0; i < input.length; i++) {
            if (input[i].due_at != null && status != '4') {
              inputDate = new Date(input[i].due_at);
              inputDate.setHours(0,0,0,0);
              if ((status == '1') && (inputDate < todayDate)) {
                input[i].days_late =  $filter('daysLate')(input[i].due_at);
                out.push(input[i]);
              }
              else if ((status == '2') && (inputDate == todayDate)) out.push(input[i]);
              else if ((status == '3') && (inputDate > todayDate)) {
                input[i].remaining_days =  $filter('daysRemaining')(input[i].due_at);
                out.push(input[i]);
              }
            }
            else if (input[i].due_at == null && status == '4') out.push(input[i])
        }
        return out;
      } else return [];
    };
  })

  /**
   * Determine elapsed time
   */
  .filter('elapsedTime', function() {
    var today = new Date();
    return function(input) {
      if(input) {
        var diff = today - new Date(input);
        if (diff/(1000*60*60*24) < 1) // If last update is less than one day ago
          if (diff/(1000*60*60) < 1) // If last update is less than one hour ago
            return Math.round(diff/(1000*60)) + " " + "minute(s) ago";
          else return Math.round(diff/(1000*60*60)) + " " + "hour(s) ago";
        else return Math.round(diff/(1000*60*60*24)) + " " + "day(s) ago";
      } else return "";
    };
  })

  /**
   * Determine number of days remaining 
   */
  .filter('daysRemaining', function() {
    var today = new Date();
    return function(input) {
      if(input) {
        return Math.round((new Date(input) - today)/(1000*60*60*24));
      }
    };
  })

  /**
   * Determine number of days late
   */
  .filter('daysLate', function() {
    var today = new Date();
    return function(input) {
      if(input) {
        return Math.round((today - new Date(input))/(1000*60*60*24));
      }
    };
  })

  /**
   * Remove domain name of email address
   * (Just for display)
   */
  .filter('removeDomain', function() {
    return function(input) {
      if(input) {
        return input.split("@")[0];
      }
    };
  })
 
  /**
   * Advanced search
   */
  .filter('keywordSearch', function($filter) {
    var out = [];
    var realSearch = "";
    return function(input, search) {
       if(search && input) {
        switch(true) {
          // If '@someone' has been type
          case (new RegExp("^@.+", "gi")).test(search):
            // If nothing follows '@someone'
            if(search.indexOf(" ") === -1) return $filter('filter')(input, "");
            // If something follows '@someone'
            // Look in the todo description or in the project name
            else {
              realSearch = search.substring(search.indexOf(" ") + 1);
              out = _.filter(input, function(item) { 
                if ( item['content'].match(new RegExp(realSearch, "gi")) ||
                      item['project'].match(new RegExp(realSearch, "gi")) ) return true;
              });
              return out; 
            }
            break;
          // If any word has been typed, load the regular search filter
          default:
            return $filter('filter')(input, search);
        }
      // If nothing has been type
      } else return input;
    };
  });