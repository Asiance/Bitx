'use strict';

angular
  .module('basecampExtension.filters', [])

  /**
   * Filtering Todos by category
   */
  .filter('status', function($filter, Utils) {
    return function(input, status) {
      switch (status) {
        case 'overdues':
          var out = _.filter(input, function(todo) {
            if (todo.due_at != null)
              return (Utils.dateToYMD(new Date(todo.due_at)) < Utils.dateToYMD(new Date()));
          });
          _.each(out, function(todo) {
            todo.days_late =  $filter('daysLate')(todo.due_at);
          })
          return out;
          break;
        case 'today':
          return _.where(input, {due_at: Utils.dateToYMD(new Date())});
          break;
        case 'upcoming':
          var out =  _.filter(input, function(todo) {
            return (Utils.dateToYMD(new Date(todo.due_at)) > Utils.dateToYMD(new Date()));
          });
          _.each(out, function(todo) {
            todo.remaining_days =  $filter('daysRemaining')(todo.due_at);
          })
          return out;
          break;
        case 'no-due-date':
          return _.where(input, {due_at: null});
          break;
      }
    }
  })

  /**
   * Determine elapsed time
   */
  .filter('elapsedTime', function() {
    var today = new Date();
    var lang = localStorage['language'];
    return function(input) {
      if(input) {
        var diff = today - new Date(input);
        if (diff/(1000*60*60*24) < 1) // If last update is less than one day ago
          if (diff/(1000*60*60) < 1) // If last update is less than one hour ago
            return Math.round(diff/(1000*60)) + " " + window[lang]['minutesAgo'];
          else return Math.round(diff/(1000*60*60)) + " " + window[lang]['hoursAgo'];
        else return Math.round(diff/(1000*60*60*24)) + " " + window[lang]['daysAgo'];
      } else return "";
    };
  })

  /**
   * Determine number of days remaining
   */
  .filter('daysRemaining', function() {
    var today = new Date();
    return function(input) {
      if(input) return Math.round((new Date(input) - today)/(1000*60*60*24));
    };
  })

  /**
   * Determine number of days late
   */
  .filter('daysLate', function() {
    var today = new Date();
    return function(input) {
      if(input) return Math.round((today - new Date(input))/(1000*60*60*24));
    };
  })

  /**
   * Print tooltip if filter 'createdby:' is on
   */
  .filter('filterOn', function() {
    var lang = localStorage['language'];
    return function(input, isFilter) {
      if (isFilter) return window[lang]['assignedTo'].replace(/\{x\}/g, input);
      else return null;
    };
  })

  /**
   * Remove domain name of email address
   * (Just for display)
   */
  .filter('removeDomain', function() {
    return function(input) {
      if(input) return input.split("@")[0];
    };
  })

  /**
   * Advanced search that look through todos
   */
  .filter('keywordSearch', function($filter) {
    return function(input, search, people) {
      console.log(people);
       if(search && input) {
          var out = input;
          var fromUser = search.match(/\bfrom:(\w*)\b/g);
          if (fromUser) fromUser = fromUser[0].substr('from:'.length);
          var toUser = search.match(/\bto:(\w*)\b/g);
          if (toUser) toUser = toUser[0].substr('to:'.length);

          // If the keyword 'from:' has been typed
          if (fromUser != null) {
            if (fromUser == 'me') {
              var user = {'id': localStorage['userId']};
            } else {
              var user = _.find(people, function(user) {
                if ( $filter('removeDomain')(user['email_address']) == fromUser )
                  return true;
              });
            }
            // If 'someone' has been found, look for his todos'
            if (user) {
              out = _.filter(out, function(item) {
                if ( item['assignee'] && item['creator']['id'] == user.id ) return true;
              });
            } else return [];
          }

          // If 'to:' has been type
          if (toUser != null) {
            if (toUser == 'me') {
              var user = {'id': localStorage['userId']};
            } else {
              var user = _.find(people, function(user) {
              if ($filter('removeDomain')(user['email_address']) == toUser)
                return true;
              });
            }
            // If 'someone has been found, look for his todos'
            if (user) {
              out = _.filter(out, function(item) {
                if ( item['assignee'] && item['assignee']['id'] == user.id ) return true;
              });
            } else return [];
          }

          if ( new RegExp("from:", "gi").test(search) ||  new RegExp("to:", "gi").test(search) )  {
            // If something follows 'from:someone or to:someone'
            // Look in the todo description or in the project name or in the todolist title
            var indexOfFrom = fromUser ? search.indexOf(fromUser) : -1;
            var indexOfTo = toUser ? search.indexOf(toUser) : -1;
            if (indexOfFrom > indexOfTo) var realSearch = fromUser ? search.substr(indexOfFrom + fromUser.length +1) : "";
            else var realSearch = toUser ? search.substr(indexOfTo + toUser.length + 1) : "";

            if(realSearch.length > 0) {
              out = _.filter(out, function(item) {
              if ( item['content'].match(new RegExp(realSearch, "gi"))
                  || item['project'].match(new RegExp(realSearch, "gi"))
                  || item['todolist'].match(new RegExp(realSearch, "gi")) ) return true;
              });
            }
            return out;
          }

          // If no keyword has been typed, load the regular search filter
          out = _.filter(input, function(item) {
            if ( item['assignee'] && item['assignee']['id'] == localStorage['userId'] ) return true;
          });
          return $filter('filter')(out, search);

      // If search input is empty, show your own todos
      } else {
        out = _.filter(input, function(item) {
          if ( item['assignee'] && item['assignee']['id'] == localStorage['userId'] ) return true;
        });
        return out;
      };
    };
  })


  /**
   * Advanced search that look through people of Basecamp account
   */
  .filter('suggestionSearch', function($filter) {
    var realSearch = "";
    var out = []
    return function(input, search) {
      if(search && input) {

        // User suggestions
        if (search.lastIndexOf(":") > search.lastIndexOf(" ")) {
          realSearch = search.substring(search.lastIndexOf(":") + 1);
          out = _.filter(input, function(item) {
            if ( item['id'] != -1
                && (item['name'].match(new RegExp("^" + realSearch, "gi"))
                  || item['email_address'].match(new RegExp("^" + realSearch, "gi"))) ) return true;
          });
        }

        // Keyword suggestions
        else {
          out = _.filter(input, function(item) {
            if (item['id'] == -1
                && item['email_address'].match(new RegExp("^" + (search.substr(search.lastIndexOf(" ") + 1)), "gi"))) return true;
          });
        }

        return out;
      };
    }
  });