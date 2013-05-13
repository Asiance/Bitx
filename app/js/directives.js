"'use strict";

angular.module('basecampExtension.directives', [])
  .directive('nicescroll', function($document, $location, $parse) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        var params = scope.$eval(attrs.nicescroll);
        $(element).niceScroll({
          cursorcolor: '#a7a7a7',
          cursoropacitymax: 0.8,
          mousescrollstep : params.scrollstep,
          cursorborder: '0px',
          cursorwidth: '8px',
        });
      }
    };
  })

  .directive('unselectable', function($document, $parse) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        $(element).on('selectstart', false);
      }
    };
  })

  .directive('searchSuggestions', function($document, $parse) {
    return {
      restrict: "E",
      replace: true,
      scope: {
        data: "=",
        search: "="
      },
      template: '<span>' +
                  '<input id="search-input" type="text" placeholder="{{\'searchTodo\' | i18n}}" ng-model="search" ui-keypress="{\'enter\': \'completeSearch($event)\'}" ui-keydown="{\'up\': \'navigateUp($event)\', \'down\': \'navigateDown($event)\'}" autofocus>' +
                  '<div ng-show="search" class="icon-clear" ng-click="clearSearch()"></div>' +
                  '<ul id="suggestions" nicescroll="{scrollstep: 20}">' +
                    '<li class="person" ng-class="{active: navPosition == $index}" id="{{$index}}" ng-repeat="person in filteredData = (data | suggestionSearch:search)" ng-click="setSearch(person)" ng-mouseenter="setNavPosition($index)">' +
                      '<img class="username" ng-src="{{person.avatar_url}}">' +
                      '<span ng-switch="person.id" class="username">' +
                        '<span ng-switch-when="-1" ng-bind-html-unsafe="person.email_address | highlight:realSearch"></span>' +
                        '<span ng-switch-default ng-bind-html-unsafe="person.email_address | removeDomain | lowercase | highlight:realSearch"></span>' +
                      '</span><br>' +
                      '<span class="fullname">{{person.name}}</span>' +
                    '</li>' +
                  '</ul>' +
                '</span>',
      controller: 'searchSuggestionsCtrl'
    };
  })

  .directive('toggleContent', function($document, $location, $parse, $filter) {
    return {
      restrict: "E",
      replace: true,
      scope: {
        category: "@",
        todosCounter: "@"
      },
      template: '<dt id="{{category}}" ng-class="{true:\'disabled\', false:\'enabled\'} [todosCounter == 0]" unselectable>' +
                  '<span ng-switch=todosCounter class="toggle-content">' +
                    '<span ng-switch-when="0"></span>' +
                    '<span ng-switch-default class="toggle"></span>' +
                  '</span>' +
                  '<h1>{{header}}</h1>' +
                  '<span class="count-todos" title="{{todosCounter}} {{tooltip}}" ng-show=todosCounter>{{todosCounter}}</span>' +
                '</dt>',
      link: function(scope, element, attrs) {
        var uppercase = $filter('uppercase');
        var i18n = $filter('i18n');
        scope.header = uppercase(i18n("header-" + attrs.category));
        scope.tooltip = i18n("count-" + attrs.category);

        element.bind('click', function() {
          var status = $filter('status');
          var keywordSearch = $filter('keywordSearch');
          if (attrs.todosCounter !== "0") {
            $("#overdues_content, #today_content, #upcoming_content, #noduedate_content").getNiceScroll().hide();
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
                  $('#' + attrs.category + '_content').getNiceScroll().show();
                  $('#' + attrs.category + '_content').getNiceScroll().resize();
                }
              });
            }
          }
        });
      }
    };
  })

  .directive('todos', function($document, $location, $parse, $filter) {
    return {
      restrict: "E",
      replace: true,
      scope: {
        category: '@',
        projects: '=',
        search: '='
      },
      template: '<dd id="{{category}}_content" nicescroll="{scrollstep: 50}">' +
                  '<div class="content" ng-repeat="project in projects">' +
                    '<h2 ng-show="(project.assignedTodos | keywordSearch:search | status: category).length != 0">{{project.name | uppercase}}</h2>' +
                    '<ul><todo search="search" category={{category}} ng-repeat="assignedTodo in (project.assignedTodos | keywordSearch:search | status: category)"></todo></ul>' +
                  '</div>' +
                '</dd>'
    };
  })

  .directive('todo', function($document, $location, $parse, $filter, $http) {
    return {
      restrict: "E",
      replace: true,
      template: '<li>' +
                  '<span class="achievement"><p><img src="/img/icon-check.png">{{congratulation}}</p></span>' +
                  '<span class="date" ng-class="{\'overdues\':category == \'overdues\', \'icon-today\':category == \'today\', \'icon-coffee\':category == \'noduedate\'}" title="{{\'createdDate\' | i18n}} {{assignedTodo.created_at | elapsedTime}}">' +
                    '<span ng-show="category ==\'overdues\'">' +
                      '<span class="day-number">{{assignedTodo.due_at | daysLate}}</span><br>' +
                      '<p ng-switch="assignedTodo.days_late" class="username">' +
                        '<span ng-switch-when="1">{{\'dayLate\' | i18n}}</span>' +
                        '<span ng-switch-default>{{\'daysLate\' | i18n}}</span>' +
                      '</p>' +
                    '</span>' +
                    '<span ng-show="category ==\'upcoming\'">' +
                      '<span class="day-number">{{assignedTodo.due_at | daysRemaining}}</span><br>' +
                      '<p ng-switch="assignedTodo.remaining_days" class="username">' +
                        '<span ng-switch-when="1">{{\'dayLeft\' | i18n}}</span>' +
                        '<span ng-switch-default>{{\'daysLeft\' | i18n}}</span>' +
                      '</p>' +
                    '</span>' +
                  '</span>' +
                  '<div class="todo">' +
                    '<div>'+
                      '<span class="checkbox" ng-click="completeTodo(assignedTodo.project_id, assignedTodo.id)"></span>' +
                      '<span class="todo-text" title="{{assignedTodo.assignee.name | filterOn: isFiltered()}}" ng-bind-html-unsafe="assignedTodo.content | highlight:realSearch"></span>' +
                    '</div>'+
                    '</div>' +
                    '<span class="comments" ng-click="openTodo(assignedTodo.project_id, assignedTodo.id)" ng-show="assignedTodo.comments_count" title="{{\'lastUpdate\' | i18n}} {{assignedTodo.updated_at | elapsedTime}}">' +
                      '<p>{{assignedTodo.comments_count}}</p>' +
                    '</span>' +
                    '<span class="void" ng-hide="assignedTodo.comments_count"></span>' +
                    '<span class="icon-link" ng-click="openTodo(assignedTodo.project_id, assignedTodo.id)" title="{{\'visitTodo\' | i18n}}"></span>' +
                '</li>',
      controller: 'todoCtrl'
    }
  });
