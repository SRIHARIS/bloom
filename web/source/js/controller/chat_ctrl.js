
controller_module.controller('chatCtrl',["$scope", function($scope) {
  //Set the menu item to active
  jQuery(".item").removeClass('active');
  jQuery('[link=chat]').addClass('active');
  chat_stub.init();
}]);
