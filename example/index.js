var app = angular.module('app', ['ui.bootstrap', 'ui.bootstrap.datetimepicker']);

app.controller('MyController', ['$scope', function($scope) {

    $scope.myDate1 = new Date('01 Mar 2015 00:00:00.000');
    $scope.myDate2 = new Date();
    $scope.myDate3 = new Date();

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        return (mode === 'day' && (new Date().toDateString() == date.toDateString()));
    };

    $scope.dateOptions = {
        showWeeks: false,
        startingDay: 1
    };

    $scope.openDateCalendar = function(e) {
        e.preventDefault();
        e.stopPropagation();

        $scope.dateCalendarOpen = true;
    };

    $scope.openTimeCalendar = function(e) {
        e.preventDefault();
        e.stopPropagation();

        $scope.timeCalendarOpen = true;
    };

    $scope.openDateTimeCalendar = function(e) {
        e.preventDefault();
        e.stopPropagation();

        $scope.dateTimeCalendarOpen = true;
    };
}]);