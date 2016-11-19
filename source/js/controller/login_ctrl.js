
controller_module.controller('login_ctrl',["$scope", 'authService',function($scope,authService) {
	var vm = this;
  	vm.authService = authService;
}]);
