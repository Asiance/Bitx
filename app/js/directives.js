'use strict';

angular.module('basecampExtension.directives', [])
  .directive('nicescroll', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var params = scope.$eval(attrs.nicescroll);
        $(element).niceScroll({
          cursorcolor:      '#a7a7a7',
          cursoropacitymax: 0.8,
          mousescrollstep : params.scrollstep,
          cursorborder:     '0px',
          cursorwidth:      '8px',
        });
      }
    };
  })

  .directive('searchSuggestions', function($filter) {
    return {
      restrict: 'E',
      replace:  true,
      scope: {
        data:   '=',
        search: '='
      },
      templateUrl: 'views/templates/search-suggestions.html',
      link: function(scope, element, attrs) {
        scope.navPosition = -1;

        scope.$watch('search', function() {
          localStorage.lastSearch = scope.search;
          if (scope.search) {
            scope.realSearch = scope.search.match(/[^ ||^:]*$/);
          }
          $('#suggestions').getNiceScroll().resize();
          $('#suggestions').getNiceScroll().show();
          scope.navPosition = -1;
        });

        scope.keypressHandler = function($event) {
          console.log($event);
        }

        scope.completeSearch = function($event) {
          if (scope.navPosition === -1) {
            scope.setSearch(scope.filteredData[0]);
          } else {
            scope.setSearch(scope.filteredData[scope.navPosition]);
          }
          $event.preventDefault();
        };

        scope.navigateUp = function($event) {
          var frameOffset = document.getElementById('suggestions').scrollTop;
          if (scope.navPosition > -1) {
            scope.navPosition--;
            var framePosition = (scope.navPosition + 1) - (frameOffset-50)/50;
            var objDiv = document.getElementById(scope.navPosition);
            if (Math.round(framePosition) === 1) {
              objDiv.scrollIntoView(true);
            }
          }
          $event.preventDefault();
        };

        scope.navigateDown = function($event) {
          var frameOffset = document.getElementById('suggestions').scrollTop;
          if (scope.navPosition < scope.filteredData.length - 1) {
            scope.navPosition += 1;
            var framePosition = (scope.navPosition+1) - (frameOffset+50)/50;
            var objDiv = document.getElementById(scope.navPosition);
            if (Math.round(framePosition) === 4) {
              objDiv.scrollIntoView(false);
            }
          }
          $event.preventDefault();
        };

        scope.setNavPosition = function($index) {
          scope.navPosition = $index;
        };

        /**
         * When press ENTER or click on a suggestion, set the new value to the search input
         * We use the email address to extract a username
         * @param  {object}  person  Person selected among the suggestions.
         */
        scope.setSearch = function(person) {
          if (person) {
            scope.search = scope.search.replace(/(\w+)$/gi, '');
            scope.search += $filter('removeDomain')(person.email_address);
            $('#suggestions').getNiceScroll().hide();
          }
        };

        /**
         * Clear search input when click on 'x'
         */
        scope.clearSearch = function(person) {
          scope.search = '';
          $('#suggestions').getNiceScroll().hide();
        };
      }
    };
  })

  .directive('toggleContent', function($filter) {
    return {
      restrict: 'E',
      replace:  true,
      scope: {
        category:     '@',
        todosCounter: '@'
      },
      templateUrl: 'views/templates/toggle-content.html',
      link: function(scope, element, attrs) {
        var uppercase = $filter('uppercase');
        var i18n = $filter('i18n');
        scope.header = uppercase(i18n("header-" + attrs.category));
        scope.tooltip = i18n("count-" + attrs.category);

        element.bind('click', function() {
          if (attrs.todosCounter !== "0") {
            $("dd").getNiceScroll().hide();
            if ($(element).hasClass('active')) {
              $(element).next().slideUp(300, 'easeOutQuad');
              $(element).removeClass('active');
            }
            else {
              $('#todos').find('dt').removeClass('active');
              $(element).addClass('active');
              $('#todos').find('dd').slideUp(300, 'easeOutQuad');
              $(element).next().slideDown({
                duration: 300,
                easing: 'easeOutQuad',
                complete: function() {
                  $(element).next().getNiceScroll().show();
                  $(element).next().getNiceScroll().resize();
                }
              });
            }
          }
        });
      }
    };
  })

  .directive('todos', function($filter) {
    return {
      restrict: 'E',
      replace:  true,
      scope: {
        category: '@',
        projects: '=',
        search:   '=',
        userIDs:  '=userids',
        people:   '='
      },
      templateUrl: 'views/templates/todos.html'
    };
  })

  .directive('todo', function($filter, $http) {
    return {
      restrict: 'E',
      replace:  true,
      templateUrl: 'views/templates/todo.html',
      controller: 'todoCtrl'
    };
  });
