
controller_module.controller('filesCtrl',["$scope", function($scope) {
    //Set the menu item to active
    jQuery(".item").removeClass('active');
    jQuery('[link=files]').addClass('active');
    file_stub.init();
}]);
