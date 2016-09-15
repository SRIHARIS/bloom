var app = angular.module('bloom',['labs.controllers','ngRoute']);

app.
  config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {

      $routeProvider.
        when('/chat', {
          templateUrl : 'asset/templates/chat.html',
          controller : 'chatCtrl'
        }).
        when('/files', {
          templateUrl : 'asset/templates/files.html',
          controller : 'filesCtrl'
        }).
        otherwise('/chat');
    }
  ]);

var controller_module = angular.module('labs.controllers', []);