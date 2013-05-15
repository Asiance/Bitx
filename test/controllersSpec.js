"use strict";

/* jasmine specs for directives go here */

describe('searchSuggestions', function() {
  var element, scope, ctrl;
  beforeEach(module('basecampExtension.services'));
  beforeEach(module('basecampExtension.servicesCache'));
  beforeEach(module('basecampExtension.controllers'));
  beforeEach(module('basecampExtension.filters'));
  beforeEach(module('basecampExtension.directives'));
  beforeEach(module('ui.highlight'));
  beforeEach(module('ui.keypress'));
  beforeEach(inject(function($rootScope, $controller, $compile) {
    element = angular.element('<search-suggestions data="people" search="search"></search-suggestions>');
    scope = $rootScope;
    scope.people =
      [{
          "id": 2527441,
          "name": "Adrien Desbiaux",
          "email_address": "adrien@asiance.com",
          "admin": true,
          "created_at": "2012-06-04T10:49:47.000+09:00",
          "updated_at": "2013-04-29T08:08:15.000+09:00",
          "identity_id": 5004767,
          "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3",
          "url": "https://basecamp.com/2004093/api/v1/people/2527441-adrien-desbiaux.json"
      },
      {
          "id": 2527422,
          "name": "Antoine Blancher",
          "email_address": "antoine@asiance.com",
          "admin": true,
          "created_at": "2011-05-02T10:35:11.000+09:00",
          "updated_at": "2013-04-29T09:42:02.000+09:00",
          "identity_id": 2952920,
          "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/d8852ea40151b7672308e64d48513831deba577a04f16f12d8cb57689faf7402ef4eff4bcd0431e09f9e92f6de97c3ae228188f255ba2bea3408befe7f3ec31f283909fe99915c1277393873c6927a31/avatar.gif?r=3",
          "url": "https://basecamp.com/2004093/api/v1/people/2527422-antoine-blancher.json"
      },
      {
          "id": 3768284,
          "name": "Gilles Piou",
          "email_address": "gilles@asiance.com",
          "admin": false,
          "created_at": "2013-02-18T12:13:19.000+09:00",
          "updated_at": "2013-04-26T17:03:04.000+09:00",
          "identity_id": 6398280,
          "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/e32a5c25c36ecdfd8c9a51340e400351e8679d8e081218891aba5e654443eb68427966876abf2ce68c928c7faa51286abea6deaf627f786162294cb4a5801da6379356d7078157fbfac76f160bde6694/avatar.gif?r=3",
          "url": "https://basecamp.com/2004093/api/v1/people/3768284-gilles-piou.json"
      },
      {
          "id": 2527420,
          "name": "Laurent Le Graverend",
          "email_address": "laurent@asiance.com",
          "admin": true,
          "created_at": "2010-04-06T14:03:43.000+09:00",
          "updated_at": "2013-04-27T11:37:37.000+09:00",
          "identity_id": 1009363,
          "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/620f1b8420834019047d7fff49eeb79510a52cf3/avatar.gif?r=3",
          "url": "https://basecamp.com/2004093/api/v1/people/2527420-laurent-le-graverend.json"
      },
      {
          "name": "Search by creator",
          "email_address": "from:",
          "avatar_url": "/img/icon-search.png",
          "id": -1
      },
      {
          "name": "Search by assignee",
          "email_address": "to:",
          "avatar_url": "/img/icon-search.png",
          "id": -1
      }];

    ctrl = $controller('searchSuggestionsCtrl', {
      $scope: scope
    });
    $compile(element)(scope);
    scope.$digest();
  }));

  it("should compile template", function() {
    expect(element.find("input").length).toBe(1);
    expect(element.find("ul").length).toBe(1);
  });

  it("should display suggestions", function() {
    scope.search = "f";
    scope.$digest();
    expect(element.find(".ui-match").text()).toBe("f");
    expect(element.find("li").eq(0).text()).toBe("from:Search by creator");
    scope.search = "from:";
    scope.$digest();
    expect(element.find(".ui-match").text()).toBe("");
    expect(element.find("li").length).toBe(4);
    expect(element.find("li").eq(0).text()).toBe("adrienAdrien Desbiaux");
    expect(element.find("li").eq(1).text()).toBe("antoineAntoine Blancher");
    expect(element.find("li").eq(2).text()).toBe("gillesGilles Piou");
    expect(element.find("li").eq(3).text()).toBe("laurentLaurent Le Graverend");

    scope.search = "t";
    scope.$digest();
    expect(element.find("li").eq(0).text()).toBe("to:Search by assignee");
    scope.search = "to:";
    scope.$digest();
    expect(element.find("li").length).toBe(4);
    expect(element.find("li").eq(0).text()).toBe("adrienAdrien Desbiaux");
    expect(element.find("li").eq(1).text()).toBe("antoineAntoine Blancher");
    expect(element.find("li").eq(2).text()).toBe("gillesGilles Piou");
    expect(element.find("li").eq(3).text()).toBe("laurentLaurent Le Graverend");

    scope.search = "from:me t";
    scope.$digest();
    expect(element.find("li").eq(0).text()).toBe("to:Search by assignee");
    expect(element.find("li span").hasClass("ui-match")).toBe(true);
    expect(element.find(".ui-match").text()).toBe("t");

    scope.search = "to:";
    scope.$digest();
    expect(element.find(".ui-match").text()).toBe("");
    expect(element.find("li").length).toBe(4);
    expect(element.find("li").eq(0).text()).toBe("adrienAdrien Desbiaux");
    expect(element.find("li").eq(1).text()).toBe("antoineAntoine Blancher");
    expect(element.find("li").eq(2).text()).toBe("gillesGilles Piou");
    expect(element.find("li").eq(3).text()).toBe("laurentLaurent Le Graverend");

    scope.search = "to:me f";
    scope.$digest();
    expect(element.find("li").eq(0).text()).toBe("from:Search by creator");
    scope.search = "to:me from:";
    scope.$digest();
    expect(element.find(".ui-match").text()).toBe("");
    expect(element.find("li").length).toBe(4);
    expect(element.find("li").eq(0).text()).toBe("adrienAdrien Desbiaux");
    expect(element.find("li").eq(1).text()).toBe("antoineAntoine Blancher");
    expect(element.find("li").eq(2).text()).toBe("gillesGilles Piou");
    expect(element.find("li").eq(3).text()).toBe("laurentLaurent Le Graverend");

    scope.search = "to:me from:a";
    scope.$digest();
    expect(element.find(".ui-match").text()).toBe("aa");
    expect(element.find("li").length).toBe(2);
    expect(element.find("li").eq(0).text()).toBe("adrienAdrien Desbiaux");
    expect(element.find("li").eq(1).text()).toBe("antoineAntoine Blancher");
  });

  it("should complete input on click", function() {
    scope.search = "f";
    scope.$digest();
    element.find("li").eq(0).click();
    expect(scope.search).toBe("from:");

    scope.search = "from:a";
    scope.$digest();
    element.find("li").eq(1).click();
    expect(scope.search).toBe("from:antoine");

    scope.search = "t";
    scope.$digest();
    element.find("li").eq(0).click();
    expect(scope.search).toBe("to:");

    scope.search = "from:me t";
    scope.$digest();
    element.find("li").eq(0).click();
    expect(scope.search).toBe("from:me to:");

    scope.search = "to:g";
    scope.$digest();
    element.find("li").eq(0).click();
    expect(scope.search).toBe("to:gilles");

    scope.search = "to:me f";
    scope.$digest();
    element.find("li").eq(0).click();
    expect(scope.search).toBe("to:me from:");

    scope.search = "to:me from:l";
    scope.$digest();
    element.find("li").eq(0).click();
    expect(scope.search).toBe("to:me from:laurent");
  });

  it("should complete input on click", function() {
    scope.search = "abcde";
    scope.$digest();
    expect(element.find("#search-input").val()).toBe("abcde");
    element.find(".icon-clear").eq(0).click();
    scope.$digest();
    expect(element.find("#search-input").val()).toBe("");
  });
});

describe('toggleContent', function() {
  var element, scope, ctrl;
  beforeEach(module('basecampExtension.services'));
  beforeEach(module('basecampExtension.servicesCache'));
  beforeEach(module('basecampExtension.controllers'));
  beforeEach(module('basecampExtension.filters'));
  beforeEach(module('basecampExtension.directives'));
  beforeEach(module('ui.highlight'));
  beforeEach(module('ui.keypress'));
  beforeEach(inject(function($rootScope, $controller, $compile) {
    element = angular.element('<toggle-content category="{{category}}" todos-counter="{{todosCounter}}"></toggle-content>');
    scope = $rootScope;
    $compile(element)(scope);
    scope.$digest();
  }));

  it("should compile template", function() {
    expect(element.find("h1").length).toBe(1);
  });
});

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
      "assignedTodos": [
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
      "assignedTodos": [
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

describe('TodosController', function() {
  var scope, ctrl, httpBackend;
  beforeEach(module('basecampExtension.services'));
  beforeEach(module('basecampExtension.servicesCache'));
  beforeEach(module('basecampExtension.controllers'));
  beforeEach(module('basecampExtension.filters'));
  beforeEach(module('basecampExtension.directives'));
  beforeEach(module('ui.highlight'));
  beforeEach(module('ui.keypress'));
  beforeEach(inject(function($rootScope, $controller, $httpBackend) {
    scope = $rootScope;
    httpBackend = $httpBackend;
    ctrl = $controller('TodosController', {
      $scope: scope
    });
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it("should GET Basecamp account ID of the organization", function() {
    var getRequest = 'https://launchpad.37signals.com/authorization.json';
    var fakeGetResponse = {
      "expires_at": "2013-05-29T08:24:33Z",
      "accounts": [
        {
          "name": "Asiance",
          "href": "https://basecamp.com/2004093/api/v1",
          "id": 2004093,
          "product": "bcx"
        }
      ],
      "identity": {
        "id": 6398280,
        "last_name": "Piou",
        "email_address": "gilles@asiance.com",
        "first_name": "Gilles"
      }
    };
    httpBackend.when('GET', getRequest).respond(fakeGetResponse);
    scope.getBasecampAccount();
    httpBackend.flush();
    expect(scope.basecampId).toBe(2004093);
  });

  it("should GET User account ID", function() {
    var getRequest = 'https://basecamp.com/2004093/api/v1/people/me.json';
    var fakeGetResponse = {
      "id": 3768284,
      "name": "Gilles Piou",
      "email_address": "gilles@asiance.com",
      "admin": false,
      "created_at": "2013-02-18T12:13:19.000+09:00",
      "updated_at": "2013-05-14T14:29:38.000+09:00",
      "identity_id": 6398280,
      "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/e32a5c25c36ecdfd8c9a51340e400351e8679d8e081218891aba5e654443eb68427966876abf2ce68c928c7faa51286abea6deaf627f786162294cb4a5801da6379356d7078157fbfac76f160bde6694/avatar.gif?r=3",
      "events": {
        "count": 635,
        "updated_at": "2013-05-14T14:29:38.000+09:00",
        "url": "https://basecamp.com/2004093/api/v1/people/3768284-gilles-piou/events.json"
      },
      "assigned_todos": {
        "count": 88,
        "updated_at": "2013-05-14T14:29:38.000+09:00",
        "url": "https://basecamp.com/2004093/api/v1/people/3768284-gilles-piou/assigned_todos.json"
      }
    };
    httpBackend.when('GET', getRequest).respond(fakeGetResponse);
    scope.basecampId = 2004093;
    scope.getUser();
    httpBackend.flush();
    expect(scope.userId).toBe(3768284);
  });

  it("should GET People of the organization", function() {
    var getRequest = 'https://basecamp.com/2004093/api/v1/people.json';
    var fakeGetResponse = [{
      "id": 2527441,
      "name": "Adrien Desbiaux",
      "email_address": "adrien@asiance.com",
      "admin": true,
      "created_at": "2012-06-04T10:49:47.000+09:00",
      "updated_at": "2013-04-29T08:08:15.000+09:00",
      "identity_id": 5004767,
      "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3",
      "url": "https://basecamp.com/2004093/api/v1/people/2527441-adrien-desbiaux.json"
    },
    {
      "id": 2527422,
      "name": "Antoine Blancher",
      "email_address": "antoine@asiance.com",
      "admin": true,
      "created_at": "2011-05-02T10:35:11.000+09:00",
      "updated_at": "2013-04-29T09:42:02.000+09:00",
      "identity_id": 2952920,
      "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/d8852ea40151b7672308e64d48513831deba577a04f16f12d8cb57689faf7402ef4eff4bcd0431e09f9e92f6de97c3ae228188f255ba2bea3408befe7f3ec31f283909fe99915c1277393873c6927a31/avatar.gif?r=3",
      "url": "https://basecamp.com/2004093/api/v1/people/2527422-antoine-blancher.json"
    },
    {
      "id": 3768284,
      "name": "Gilles Piou",
      "email_address": "gilles@asiance.com",
      "admin": false,
      "created_at": "2013-02-18T12:13:19.000+09:00",
      "updated_at": "2013-04-26T17:03:04.000+09:00",
      "identity_id": 6398280,
      "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/e32a5c25c36ecdfd8c9a51340e400351e8679d8e081218891aba5e654443eb68427966876abf2ce68c928c7faa51286abea6deaf627f786162294cb4a5801da6379356d7078157fbfac76f160bde6694/avatar.gif?r=3",
      "url": "https://basecamp.com/2004093/api/v1/people/3768284-gilles-piou.json"
    },
    {
      "id": 2527420,
      "name": "Laurent Le Graverend",
      "email_address": "laurent@asiance.com",
      "admin": true,
      "created_at": "2010-04-06T14:03:43.000+09:00",
      "updated_at": "2013-04-27T11:37:37.000+09:00",
      "identity_id": 1009363,
      "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/620f1b8420834019047d7fff49eeb79510a52cf3/avatar.gif?r=3",
      "url": "https://basecamp.com/2004093/api/v1/people/2527420-laurent-le-graverend.json"
    }];
    httpBackend.when('GET', getRequest).respond(fakeGetResponse);
    scope.basecampId = 2004093;
    scope.getPeople();
    httpBackend.flush();
    expect(scope.people.length).toBe(7);
  });
});