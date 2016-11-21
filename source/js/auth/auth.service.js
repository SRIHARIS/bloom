(function () {

  'use strict';

  angular
    .module('bloom')
    .service('authService', authService);

  authService.$inject = ['$q','lock', 'authManager'];

  function authService($q,lock, authManager) {

    function login() {
      lock.show();
    }

    // Logging out just requires removing the user's
    // id_token and profile
    function logout() {
      localStorage.removeItem('id_token');
      authManager.unauthenticate();
    }

    // Set up the logic for when a user authenticates
    // This method is called from app.run.js
    var deferredProfile = $q.defer();
    var userProfile = JSON.parse(localStorage.getItem('profile')) || null;

    if (userProfile) {
      deferredProfile.resolve(userProfile);
    }

    function registerAuthenticationListener() {
      lock.on('authenticated', function (authResult) {

        lock.getProfile(authResult.idToken, function(error, profile) {
            if (error) {
              // Handle error
              return;
            }

            localStorage.setItem("profile", JSON.stringify(profile));
            deferredProfile.resolve(profile);
          });
        localStorage.setItem('id_token', authResult.idToken);
        authManager.authenticate();
      });
    }

    function getProfileDeferred() {
      return deferredProfile.promise;
    }
    
    return {
      login: login,
      logout: logout,
      registerAuthenticationListener: registerAuthenticationListener,
      getProfileDeferred: getProfileDeferred
    }
  }
})();
