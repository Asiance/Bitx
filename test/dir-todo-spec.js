"use strict";

describe('todo', function() {
  var element, scope, ctrl, timeout, httpBackend;
  beforeEach(module('basecampExtension.services'));
  beforeEach(module('basecampExtension.servicesCache'));
  beforeEach(module('basecampExtension.controllers'));
  beforeEach(module('basecampExtension.filters'));
  beforeEach(module('basecampExtension.directives'));
  beforeEach(module('ui.highlight'));
  beforeEach(module('ui.keypress'));
  beforeEach(inject(function($rootScope, $controller, $compile, $timeout) {
    element = angular.element('<todo search="search" category="overdues"></todo>');
    timeout = $timeout;
    scope = $rootScope;
    scope.assignedTodo =
      {
        "id": 41111117,
        "todolist_id": 7052000,
        "position": 1,
        "content": "Validate design with Antoine",
        "completed": false,
        "created_at": "2013-04-29T12:19:19.000+09:00",
        "updated_at": "2013-04-29T12:19:19.000+09:00",
        "comments_count": 1,
        "due_on": "2013-04-29",
        "due_at": "2013-04-29",
        "creator": {
          "id": 2527420,
          "name": "Laurent Le Graverend",
          "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/620f1b8420834019047d7fff49eeb79510a52cf3/avatar.gif?r=3"
        },
        "assignee": {
          "id": 3768284,
          "type": "Person",
          "name": "Gilles Piou"
        },
        "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/41111117-validate-design-with.json",
        "todolist": "Website",
        "project": "Basecamp Chrome Extension - Bitx",
        "project_id": 2155413
      };
    ctrl = $controller('todoCtrl', {
      $scope: scope,
      $element: element,
    });
    $compile(element)(scope);
    scope.$digest();
  }));

  it("should compile template", function() {
    expect(element.find(".todo").length).toBe(1);
    expect(element.find(".todo-text").length).toBe(1);
    expect(element.find(".comments").length).toBe(1);
  });

  it("should display todo content", function() {
    expect(element.find(".todo-text").text()).toBe("Validate design with Antoine");
    expect(element.find(".comments").text()).toBe("1");
  });
});
