var app = angular.module('bloom',['labs.controllers','ngRoute','auth0.lock', 'angular-jwt']);

app.
  config(['$httpProvider','$locationProvider', '$routeProvider','lockProvider','jwtOptionsProvider',
    function config($httpProvider,$locationProvider, $routeProvider,lockProvider,jwtOptionsProvider) {
      var options = {
        allowSignUp: false,
        closable: false,
        theme: {
          logo: 'http://stealth007.herokuapp.com/asset/images/logo.png',
          primaryColor: '#673E8C'
        },
        allowForgotPassword: false

      };
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
          domain: AUTH0_DOMAIN,
          options : options
        });
        
        jwtOptionsProvider.config({
          tokenGetter: function () {
            return localStorage.getItem('id_token');
          }
        });

        $httpProvider.interceptors.push('jwtInterceptor');
    }
  ]);

var controller_module = angular.module('labs.controllers', []);
