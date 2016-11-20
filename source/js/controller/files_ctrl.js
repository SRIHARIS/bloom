
controller_module.controller('filesCtrl',["$scope",'authService', function($scope,authService) {
    //Set the menu item to active
    jQuery(".item").removeClass('active');
    jQuery('[link=files]').addClass('active');
    file_stub.init();
    var window_height = jQuery(window).height();
    jQuery(".main").height(window_height-60);

    var vm = this;
  	vm.authService = authService;

  	if(!$scope.isAuthenticated) {
  		vm.authService.login();
  	}
}]);
