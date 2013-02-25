'use strict';

angular
	.module("basecampExtension.controllers", ['ngResource'])

	.controller('TodosController', function($scope, $resource, $http, Projects, User, AssignedTodolists) {

        $scope.basecampId = localStorage['basecampId'] ? localStorage['basecampId'] : null;
        $scope.userId = localStorage['userId'] ? localStorage['userId'] : null;
        $scope.assignedTodos = localStorage['assignedTodos'] ? JSON.parse(localStorage['assignedTodos']) : null;

		/**
		*	After OAuth2 signin, retrieve a Basecamp Account
		*/
		$scope.getBasecampAccount = function() {
			Projects.query(function(data) {
                $scope.basecampId = data.accounts[0].id;    // Fetch only the 'first' Basecamp Account linked to the user
                localStorage['basecampId'] = $scope.basecampId;
            });
		};

		/**
		*	Retrieve ID of the authenticated user inside the Basecamp Account
		*/
		$scope.getUser = function() {
	 		User.query({basecampId: $scope.basecampId}, function(data) {
				$scope.userId = data.id;
                localStorage['userId'] = $scope.userId;
			});
		};		

		/**
		*	Fetch Todolists (including Todos) assigned to the user
		*/
		$scope.getAssignedTodolists = function() {
	 		AssignedTodolists.query({basecampId: $scope.basecampId, userId: $scope.userId}, function(data) {
	 			$scope.assignedTodolists = data;
	 		});
		};

        /**
        *   Fetch Todolists assigned to the user
        *   and remove the 'Todolist level' to keep only remaining Todos
        */
        $scope.getAssignedTodos = function() {
            AssignedTodolists.query({basecampId: $scope.basecampId, userId: $scope.userId}, function(data) {
                $scope.assignedTodos = new Array(); 
                for (var i = 0; i < data.length; i++) { 
                    for (var j = 0; j < data[i].assigned_todos.length; j++) { 
                        $scope.assignedTodos.push(data[i].assigned_todos[j]);
                    }
                }
               localStorage['assignedTodos'] = JSON.stringify($scope.assignedTodos);
            });
        };

		/**
		*	Custom sort function
		*/
		$scope.sortByDate = function(assignedTodo) {
          if (assignedTodo.due_at != null)
		    return assignedTodo.due_at.replace(/-/g, "");
          else return "99999999"; // Default value for undefined due date
		};


        /**
        *   Fetch upcoming Todos with one click
        */
        $scope.AIO = function() {
            $scope.getBasecampAccount($scope.getUser($scope.getAssignedTodos()));
        };

		/**
		*	Fetch Todolists (including Todos) assigned to the user
		*/
		$scope.getAssignedTodolistsHARD = function() {
	 			$scope.assignedTodolists = 
	 			[
    {
        "id": 5493917,
        "name": "1/ As a chrome user in Asiance I want to have a chrome extension so that I can check my TODOS within my browser. E: 13",
        "description": "",
        "created_at": "2013-02-20T15:41:47+09:00",
        "updated_at": "2013-02-21T16:12:26+09:00",
        "completed": false,
        "position": 1,
        "remaining_count": 2,
        "completed_count": 1,
        "creator": {
            "id": 2527441,
            "name": "Adrien Desbiaux",
            "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
        },
        "bucket": {
            "type": "Project",
            "id": 2155413,
            "name": "Basecamp Chrome extension",
            "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome.json"
        },
        "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todolists/5493917-1-as-a-chrome-user.json",
        "assigned_todos": [
            {
                "id": 31853607,
                "todolist_id": 5493917,
                "position": 1,
                "content": "Review AngularJS doc",
                "completed": false,
                "created_at": "2013-02-20T15:43:01+09:00",
                "updated_at": "2013-02-20T16:32:35+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "2010-03-06",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31853607-review-angularjs-doc.json"
            },
            {
                "id": 31853655,
                "todolist_id": 5493917,
                "position": 2,
                "content": "Review Chrome extensions",
                "completed": false,
                "created_at": "2013-02-20T15:43:56+09:00",
                "updated_at": "2016-02-20T16:32:45+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "2013-02-25",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31853655-review-chrome.json"
            }
        ]
    },
    {
        "id": 5493815,
        "name": "2/ As a lead developer I want to have a github private repository so that I can follow the development and access source code. E: 8",
        "description": "",
        "created_at": "2013-02-20T15:25:17+09:00",
        "updated_at": "2013-02-21T16:12:46+09:00",
        "completed": false,
        "position": 2,
        "remaining_count": 1,
        "completed_count": 4,
        "creator": {
            "id": 2527441,
            "name": "Adrien Desbiaux",
            "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
        },
        "bucket": {
            "type": "Project",
            "id": 2155413,
            "name": "Basecamp Chrome extension",
            "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome.json"
        },
        "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todolists/5493815-2-as-a-lead.json",
        "assigned_todos": [
            {
                "id": 31854890,
                "todolist_id": 5493815,
                "position": 1,
                "content": "Config repo on AsianceDev + gitignore + init project with README.md file",
                "completed": false,
                "created_at": "2013-02-20T16:07:13+09:00",
                "updated_at": "2013-02-20T16:33:28+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "2013-03-06",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31854890-config-repo-on.json"
            }
        ]
    },
    {
        "id": 5493808,
        "name": "3/ As a chrome user in Asiance I want to get how many todos are overdue, due today and ongoing so that I better organize my time. E: 100",
        "description": "",
        "created_at": "2013-02-20T15:24:41+09:00",
        "updated_at": "2013-02-20T16:33:58+09:00",
        "completed": false,
        "position": 3,
        "remaining_count": 7,
        "completed_count": 0,
        "creator": {
            "id": 2527441,
            "name": "Adrien Desbiaux",
            "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
        },
        "bucket": {
            "type": "Project",
            "id": 2155413,
            "name": "Basecamp Chrome extension",
            "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome.json"
        },
        "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todolists/5493808-3-as-a-chrome-user.json",
        "assigned_todos": [
            {
                "id": 31855101,
                "todolist_id": 5493808,
                "position": 1,
                "content": "User authentication",
                "completed": false,
                "created_at": "2013-02-20T16:12:46+09:00",
                "updated_at": "2013-02-20T16:33:33+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "2000-03-06",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31855101-user-authentication.json"
            },
            {
                "id": 31855114,
                "todolist_id": 5493808,
                "position": 2,
                "content": "User session storage",
                "completed": false,
                "created_at": "2013-02-20T16:13:10+09:00",
                "updated_at": "2013-02-20T16:33:37+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "2013-03-06",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31855114-user-session-storage.json"
            },
            {
                "id": 31855279,
                "todolist_id": 5493808,
                "position": 3,
                "content": "How to refresh data in real time (diff, polling ...) ",
                "completed": false,
                "created_at": "2013-02-20T16:17:37+09:00",
                "updated_at": "2013-02-20T16:33:43+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "2043-03-06",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31855279-how-to-refresh-data.json"
            },
            {
                "id": 31855308,
                "todolist_id": 5493808,
                "position": 4,
                "content": "Coding data refreshment",
                "completed": false,
                "created_at": "2013-02-20T16:18:44+09:00",
                "updated_at": "2023-02-20T16:33:47+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "2013-03-40",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31855308-coding-data.json"
            },
            {
                "id": 31853778,
                "todolist_id": 5493808,
                "position": 5,
                "content": "Print number of overdues todos",
                "completed": false,
                "created_at": "2013-02-20T15:46:22+09:00",
                "updated_at": "2013-02-20T16:33:51+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "2003-4-06",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31853778-print-number-of.json"
            },
            {
                "id": 31853793,
                "todolist_id": 5493808,
                "position": 6,
                "content": "Print number of todays todos",
                "completed": false,
                "created_at": "2013-02-20T15:46:48+09:00",
                "updated_at": "2013-02-20T16:33:54+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "0207-10-06",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31853793-print-number-of.json"
            },
            {
                "id": 31853800,
                "todolist_id": 5493808,
                "position": 7,
                "content": "Print number of upcoming todos",
                "completed": false,
                "created_at": "2013-02-20T15:47:03+09:00",
                "updated_at": "2013-02-20T16:33:58+09:00",
                "comments_count": 0,
                "due_on": "2013-03-06",
                "due_at": "2004-12-06",
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31853800-print-number-of.json"
            }
        ]
    },
    {
        "id": 5493811,
        "name": "4/ As a chrome user in Asiance I want to see these todos number directly on Chrome so that checking my status can be very short. E:40",
        "description": "",
        "created_at": "2013-02-20T15:25:01+09:00",
        "updated_at": "2013-02-20T16:08:49+09:00",
        "completed": false,
        "position": 4,
        "remaining_count": 2,
        "completed_count": 0,
        "creator": {
            "id": 2527441,
            "name": "Adrien Desbiaux",
            "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
        },
        "bucket": {
            "type": "Project",
            "id": 2155413,
            "name": "Basecamp Chrome extension",
            "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome.json"
        },
        "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todolists/5493811-4-as-a-chrome-user.json",
        "assigned_todos": [
            {
                "id": 31854115,
                "todolist_id": 5493811,
                "position": 2,
                "content": "Fit code with the design ",
                "completed": false,
                "created_at": "2013-02-20T15:51:35+09:00",
                "updated_at": "2013-02-20T15:51:35+09:00",
                "comments_count": 0,
                "due_on": null,
                "due_at": null,
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31854115-fit-code-with-the.json"
            }
        ]
    },
    {
        "id": 5493813,
        "name": "5/ As a chrome user in Asiance I want to see more detailed on the todos on Chrome so that I don't need to open basecamp. E: 40",
        "description": "",
        "created_at": "2013-02-20T15:25:09+09:00",
        "updated_at": "2013-02-20T16:10:55+09:00",
        "completed": false,
        "position": 5,
        "remaining_count": 4,
        "completed_count": 0,
        "creator": {
            "id": 2527441,
            "name": "Adrien Desbiaux",
            "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
        },
        "bucket": {
            "type": "Project",
            "id": 2155413,
            "name": "Basecamp Chrome extension",
            "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome.json"
        },
        "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todolists/5493813-5-as-a-chrome-user.json",
        "assigned_todos": [
            {
                "id": 31854365,
                "todolist_id": 5493813,
                "position": 2,
                "content": "Storyboard PPT",
                "completed": false,
                "created_at": "2013-02-20T15:56:32+09:00",
                "updated_at": "2013-02-20T16:00:04+09:00",
                "comments_count": 0,
                "due_on": null,
                "due_at": null,
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31854365-storyboard-ppt.json"
            },
            {
                "id": 31854628,
                "todolist_id": 5493813,
                "position": 3,
                "content": "Get todolists details",
                "completed": false,
                "created_at": "2013-02-20T16:00:56+09:00",
                "updated_at": "2013-02-20T16:00:56+09:00",
                "comments_count": 0,
                "due_on": null,
                "due_at": null,
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31854628-get-todolists.json"
            },
            {
                "id": 31854660,
                "todolist_id": 5493813,
                "position": 4,
                "content": "Integrate design using Compass",
                "completed": false,
                "created_at": "2013-02-20T16:01:37+09:00",
                "updated_at": "2013-02-20T16:02:09+09:00",
                "comments_count": 0,
                "due_on": null,
                "due_at": null,
                "creator": {
                    "id": 2527441,
                    "name": "Adrien Desbiaux",
                    "avatar_url": "http://dge9rmgqjs8m1.cloudfront.net/global/a0a3c428a38a81161a575b3d9e581c7cbca74e07a280166676e352471b046624b21f0060513a2d520c967361a92eb605117d1b1699258129fd6f1c3e0124c5947341d90041e5f48bf3a17af384d376b7/avatar.gif?r=3"
                },
                "assignee": {
                    "id": 3768284,
                    "type": "Person",
                    "name": "Gilles Piou"
                },
                "url": "https://basecamp.com/2004093/api/v1/projects/2155413-basecamp-chrome/todos/31854660-integrate-design.json"
            }
        ]
    }
]};
	});