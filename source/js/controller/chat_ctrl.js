
controller_module.controller('chatCtrl',["$scope", 'authService',function($scope,authService) {
  //Set the menu item to active
  jQuery(".item").removeClass('active');
  jQuery('[link=chat]').addClass('active');
  chat_stub.init();
  file_stub.init();

  var window_height = jQuery(window).height();
  jQuery(".main").height(window_height - 120);

  var vm = this;
  vm.authService = authService;

  if(!$scope.isAuthenticated) {
  		vm.authService.login();
  }
  //console.log($scope.isAuthenticated);
}]);
