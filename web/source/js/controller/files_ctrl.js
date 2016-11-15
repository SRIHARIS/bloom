
controller_module.controller('filesCtrl',["$scope", function($scope) {
    //Set the menu item to active
    jQuery(".item").removeClass('active');
    jQuery('[link=files]').addClass('active');
    file_stub.init();
    var window_height = jQuery(window).height();
    jQuery(".main").height(window_height-60);
}]);
