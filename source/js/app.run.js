(function () {

  'use strict';

  angular
    .module('bloom')
    .run(run);

  run.$inject = ['$rootScope', 'authService', 'lock','authManager'];

  function run($rootScope, authService, lock,authManager) {
    // Put the authService on $rootScope so its methods
    // can be accessed from the nav bar
    $rootScope.authService = authService;

    // Register the authentication listener that is
    // set up in auth.service.js
    authService.registerAuthenticationListener();

    // Register the synchronous hash parser
    lock.interceptHash();

    authManager.checkAuthOnRefresh();
  }

})();
