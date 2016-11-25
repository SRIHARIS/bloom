
controller_module.controller('chatCtrl',["$scope", 'authService',function($scope,authService) {
  //Set the menu item to active
  jQuery(".item").removeClass('active');
  jQuery('[link=chat]').addClass('active');

  var window_height = jQuery(window).height();
  jQuery(".main").height(window_height - 120);

  var vm = this;
  vm.authService = authService;

  if(!$scope.isAuthenticated) {
  		vm.authService.login();
  }

  authService.getProfileDeferred().then(function (profile) {
        vm.profile = profile;
        chat_stub.init(profile);
        file_stub.init(profile);
  });
  //console.log($scope.isAuthenticated);
}]);
