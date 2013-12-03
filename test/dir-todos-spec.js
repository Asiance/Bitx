"use strict";

describe('todos', function() {
  var element, scope, ctrl;
  beforeEach(module('basecampExtension.services'));
  beforeEach(module('basecampExtension.servicesCache'));
  beforeEach(module('basecampExtension.controllers'));
  beforeEach(module('basecampExtension.filters'));
  beforeEach(module('basecampExtension.directives'));
  beforeEach(module('ui.highlight'));
  beforeEach(module('ui.keypress'));
  beforeEach(inject(function($rootScope, $controller, $compile) {
    element = angular.element('<todos category="overdues" projects="projects" search="search"></todos>');
    scope = $rootScope;
    scope.projects =
    [{
      "name": "Asiance website, blogs and facebook",
      "id": 2120902,
      "allTodos": [
      {
        "id": 39189314,
        "todolist_id": 5600913,
        "position": 1,
        "content": "Correct fonts for differents languages",
        "completed": false,
        "created_at": "2013-04-14T11:36:28.000+09:00",
        "updated_at": "2013-04-27T11:37:37.000+09:00",
        "comments_count": 0,
        "due_on": null,
        "due_at": null,
        "creator": {
          "id": 2527420,
          "name": "Laurent Le Graverend",
          "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/620f1b8420834019047d7fff49eeb79510a52cf3/avatar.gif?r=3"
        },
        "assignee": {
          "id": 2527420,
          "type": "Person",
          "name": "Laurent Le Graverend"
        },
        "url": "https://basecamp.com/2004093/api/v1/projects/2120902-asiance-website/todos/39189314-correct-fonts-for.json",
        "todolist": "Updates",
        "project": "Asiance website, blogs and facebook",
        "project_id": 2120902
      }
      ]
    },
    {
      "name": "Basecamp Chrome Extension - Bitx",
      "id": 2155413,
      "allTodos": [
      {
        "id": 38487794,
        "todolist_id": 6611252,
        "position": 1,
        "content": "filter based on Firstname and replace space by dash",
        "completed": false,
        "created_at": "2013-04-09T10:23:19.000+09:00",
        "updated_at": "2013-04-09T10:30:30.000+09:00",
        "comments_count": 0,
        "due_on": "2013-04-09",
        "due_at": "2013-04-09",
        "creator": {
          "id": 2527441,
          "name": "Adrien Desbiaux",
          "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7c…b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
        },
        "assignee": {
          "id": 3768284,
          "type": "Person",
          "name": "Gilles Piou"
        },
        "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/38487794-filter-based-on.json",
        "todolist": "Misc",
        "project": "Basecamp Chrome Extension - Bitx",
        "project_id": 2155413
      },
      {
        "id": 38715271,
        "todolist_id": 6611252,
        "position": 2,
        "content": "visit this todo is not localized",
        "completed": false,
        "created_at": "2013-04-10T18:57:01.000+09:00",
        "updated_at": "2013-04-10T18:57:01.000+09:00",
        "comments_count": 0,
        "due_on": "2013-04-10",
        "due_at": "2013-04-10",
        "creator": {
          "id": 2527441,
          "name": "Adrien Desbiaux",
          "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7c…b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
        },
        "assignee": {
          "id": 3768284,
          "type": "Person",
          "name": "Gilles Piou"
        },
        "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/38715271-visit-this-todo-is.json",
        "todolist": "Misc",
        "project": "Basecamp Chrome Extension - Bitx",
        "project_id": 2155413
      },
      {
        "id": 41111117,
        "todolist_id": 7052000,
        "position": 1,
        "content": "Validate design with Antoine",
        "completed": false,
        "created_at": "2013-04-29T12:19:19.000+09:00",
        "updated_at": "2013-04-29T12:19:19.000+09:00",
        "comments_count": 0,
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
      }
      ]
    }];
    $compile(element)(scope);
    scope.$digest();
  }));

  it("should compile template", function() {
    expect(element.find("h2").length).toBe(2);
    expect(element.find("ul").length).toBe(2);
  });

  it("should display project name", function() {
    expect(element.find("h2").eq(0).text()).toBe("ASIANCE WEBSITE, BLOGS AND FACEBOOK");
    expect(element.find("h2").eq(1).text()).toBe("BASECAMP CHROME EXTENSION - BITX");
  });
});
