var app = angular.module('bloom',['labs.controllers','ngRoute','auth0.lock', 'angular-jwt']);

app.
  config(['$locationProvider', '$routeProvider','lockProvider',
    function config($locationProvider, $routeProvider,lockProvider) {

      $routeProvider.
        when('/chat', {
          templateUrl : 'asset/templates/chat.html',
          controller : 'chatCtrl',
          controllerAs: 'vm' 
        }).
        when('/files', {
          templateUrl : 'asset/templates/files.html',
          controller : 'filesCtrl',
          controllerAs: 'vm'
        }).
        when('/login', {
          templateUrl : 'asset/templates/login.html',
          controller : 'login_ctrl',
          controllerAs: 'vm'
        }).
        otherwise('/chat');

        lockProvider.init({
          clientID: AUTH0_CLIENT_ID,
          domain: AUTH0_DOMAIN
        });
    }
  ]);

var controller_module = angular.module('labs.controllers', []);
