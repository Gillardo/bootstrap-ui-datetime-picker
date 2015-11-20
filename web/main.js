angular.module('myapp', ['ui.bootstrap', 'ui.bootstrap.datetimepicker'])
.controller('MainCtrl', function($scope){
  $scope.date = {
    value: new Date(),
    show: false
  };
  
})
