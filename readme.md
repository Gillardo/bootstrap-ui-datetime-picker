# Bootstrap-UI/datetime-picker

AngularJs directive to use a date and/or time picker as a dropdown from an input. 

[Demo](http://plnkr.co/edit/S8UqwvXNGmDcPXV7a0N3)

## Installation
To use the directive you must have the following angular-ui bootstrap directives included already
* DatePicker
* TimePicker

You should already have the ui.bootstrap dependancy included in your app.js file like below, You then need to add ui.bootstrap.datetimepicker, as so
```sh
angular.module('app', ['ui.bootstrap', 'ui.bootstrap.datetimepicker']);
```
Download the source from dist/datetime-picker.min.js file and include it in your project.

Or use bower (thank you krico for setup)
```
bower install bootstrap-ui-datetime-picker -S
```
and link with `bower_components/bootstrap-ui-datetime-picker/dist/datetime-picker.min.js`

## Usage
You have the following properties available to use with the directive.  All are optional unless stated otherwise
* ngModel (required) - Your date object
* isOpen - (true/false)
* closeOnDateSelection (true/false)
* enableDate (true/false)
* enableTime (true/false)
* todayText  (string)
* nowText (string)
* dateText (string)
* timeText (string)
* clearText (string)
* closeText (string)
* dateDisabled
* datepickerOptions (object)
* timepickerOptions (object)
 
##### isOpen
Whether the popup/dropdown is visible or not. Defaults to false
##### closeOnDateSelection
Close popup once a date has been chosen. TimePicker will stay open until user closes.
##### enableDate
Whether you would like the user to be able to select a date. Defaults to true
##### enableTime
Whether you would like the user to be able to select a time. Defaults to true
##### todayText
The text for the button that allows the user to select today when the date picker is visible
##### nowText
The text for the button that allows the user to select the current time when the time picker is visible.  If the date is already populated this will only change the time of the existing date.
##### dateText
The text for the button that allows the user to change to the date picker while the time picker is visible.
##### timeText
The text for the button that allows the user to change to the time picker while the date picker is visible.
##### clearText
The text for the button that allows the user to clear the currently selected date / time
##### closeText
The text for the button that closes the date / time popup/dropdown
##### dateDisabled
From angularUI site -> An optional expression to disable visible options based on passing date and current mode (day|month|year).
##### datepickerOptions
Object to configure settings for the datepicker (can be found on angularUI site)
##### timepickerOptions
Object to configure settings for the timepicker (can be found on angularUI site)

## uiDatetimePickerConfig
Now datetimePicker options are globally set by default.  If you do not state the values within the declaration, the config options are used instead.  Here are the default options

```sh
.constant('uiDatetimePickerConfig', {
    dateFormat: 'yyyy-MM-dd HH:mm',
    enableDate: true,
    enableTime: true,
    todayText: 'Today',
    nowText: 'Now',
    clearText: 'Clear',
    closeText: 'Done',
    dateText: 'Date',
    timeText: 'Time',
    closeOnDateSelection: true,
    appendToBody: false,
    showButtonBar: true
})
```

## Css
Personally i dont like the look of the angular-ui calendar itself, this is because the buttons are configured to use the btn-default style.  To get round this two classes are used depending on the picker that is being shown.  These classes surroud the div element that contains the angular-ui datepicker and timepicker.  Using this you can change the style of the calendar.  For example, if i add this css code, you will see the difference to the calendar in the images below

```sh
.datetime-picker-dropdown > li.date-picker-menu div > table .btn-default {
    border: 0;
}
```
###### BEFORE
![alt tag](http://imageshack.com/a/img633/6894/9Dt0Le.gif)
###### AFTER
![alt tag](http://imageshack.com/a/img673/5236/to31hz.gif)

There is also a custom class called datetime-picker-dropdown that is inserted into the dropdown element, which is called datetime-picker-dropdown.  Using all these classes you should be able to configure the datetime picker as you want.  Here are how you would configure the classes

```sh
.datetime-picker-dropdown {

}

.datetime-picker-dropdown > li.date-picker-menu div > table .btn-default {

}

.datetime-picker-dropdown > li.time-picker-menu div > table {

}
```

## Example
Here is an example to use the directive with a bootstrap input, displaying a calendar button

####HTML
```sh
<p class="input-group">
    <input type="text" class="form-control" datetime-picker="dd MMM yyyy HH:mm" ng-model="myDate" is-open="isOpen"  />
    <span class="input-group-btn">
        <button type="button" class="btn btn-default" ng-click="openCalendar($event, prop)"><i class="fa fa-calendar"></i></button>
    </span>
</p>
```
####JAVASCRIPT
```sh
app.controller('MyController', ['$scope', function($scope) {
    $scope.isOpen = false;
    
    $scope.openCalendar = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        $scope.isOpen = true;
    }
}]);
```

## Support
This was developed using angular-ui bootstrap Version: 0.13.0 - 2015-05-02.  If you have a bug, please check what version of angular-ui you are using.  If you are using a version prior to this, then please upgrade if you can and try it. If the problem persists, please let me know.  I do have a day job but will try to get back to you asap.  If you can fix the bug, then let me know how, or even better, submit a pull request.