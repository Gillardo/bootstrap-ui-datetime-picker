// https://github.com/Gillardo/bootstrap-ui-datetime-picker
// Version: 2.0.5
// Released: 2015-12-30 
angular.module('ui.bootstrap.datetimepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.position'])
    .constant('uiDatetimePickerConfig', {
        dateFormat: 'yyyy-MM-dd HH:mm',
        defaultTime: '00:00 PM',
        html5Types: {
            date: 'yyyy-MM-dd',
            'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
            'month': 'yyyy-MM'
        },
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
        showButtonBar: true,
        altInputFormats: []
    })
    .directive('datetimePicker', ['$compile', '$parse', '$document', '$timeout', '$uibPosition', 'dateFilter', 'uibDateParser', 'uiDatetimePickerConfig', '$rootScope',
        function ($compile, $parse, $document, $timeout, $uibPosition, dateFilter, uibDateParser, uiDatetimePickerConfig, $rootScope) {
            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    isOpen: '=?',
                    enableDate: '=?',
                    enableTime: '=?',
                    todayText: '@',
                    nowText: '@',
                    dateText: '@',
                    timeText: '@',
                    clearText: '@',
                    closeText: '@',
                    dateDisabled: '&'
                },
                link: function (scope, element, attrs, ngModel) {
                    var dateFormat = uiDatetimePickerConfig.dateFormat,
                        closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : uiDatetimePickerConfig.closeOnDateSelection,
                        appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : uiDatetimePickerConfig.appendToBody,
                        altInputFormats = angular.isDefined(attrs.altInputFormats) ? scope.$parent.$eval(attrs.altInputFormats) : uiDatetimePickerConfig.altInputFormats;

                    scope.dpData = {};
                    scope.tpData = {};
                    scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : uiDatetimePickerConfig.showButtonBar;

                    // determine which pickers should be available. Defaults to date and time
                    scope.enableDate = angular.isDefined(scope.enableDate) ? scope.enableDate : uiDatetimePickerConfig.enableDate;
                    scope.enableTime = angular.isDefined(scope.enableTime) ? scope.enableTime : uiDatetimePickerConfig.enableTime;

                    // default picker view
                    scope.showPicker = scope.enableDate ? 'date' : 'time';

                    var isHtml5DateInput = false;

                    if (uiDatetimePickerConfig.html5Types[attrs.type]) {
                        dateFormat = uiDatetimePickerConfig.html5Types[attrs.type];
                        isHtml5DateInput = true;
                    } else {
                        dateFormat = attrs.datepickerPopup || uiDatetimePickerConfig.dateFormat;
                        attrs.$observe('datetimePicker', function(value) {
                            var newDateFormat = value || uiDatetimePickerConfig.dateFormat;

                            if (newDateFormat !== dateFormat) {
                                dateFormat = newDateFormat;
                                ngModel.$modelValue = null;

                                if (!dateFormat) {
                                    throw new Error('datetimePicker must have a date format specified.');
                                }
                            }
                        });
                    }

                    // popup element used to display calendar
                    var popupEl = angular.element('' +
                        '<div date-picker-wrap>' +
                        '<div uib-datepicker></div>' +
                        '</div>' +
                        '<div time-picker-wrap>' +
                        '<div uib-timepicker style="margin:0 auto"></div>' +
                        '</div>');

                    // get attributes from directive
                    popupEl.attr({
                        'ng-model': 'date',
                        'ng-change': 'dateSelection(date)'
                    });

                    // datepicker element
                    var datepickerEl = angular.element(popupEl.children()[0]);

                    if (isHtml5DateInput) {
                        if (attrs.type === 'month') {
                            datepickerEl.attr('datepicker-mode', '"month"');
                            datepickerEl.attr('min-mode', 'month');
                        }
                    }

                    if (attrs.datepickerOptions) {
                        var options = scope.$parent.$eval(attrs.datepickerOptions);

                        if (options && options.initDate) {
                            scope.initDate = options.initDate;
                            datepickerEl.attr('init-date', 'initDate');
                            delete options.initDate;
                        }

                        angular.forEach(options, function (value, option) {
                            datepickerEl.attr(cameltoDash(option), value);
                        });
                    }

                    // set datepickerMode to day by default as need to create watch
                    // else disabled cannot pass in mode
                    if (!angular.isDefined(attrs['datepickerMode'])) {
                        attrs['datepickerMode'] = 'day';
                    }

                    if (attrs.dateDisabled) {
                        datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
                    }

                    // timepicker element
                    var timepickerEl = angular.element(popupEl.children()[1]);

                    if (attrs.timepickerOptions) {
                        var options = scope.$parent.$eval(attrs.timepickerOptions);

                        angular.forEach(options, function (value, option) {
                            scope.tpData[option] = value;
                            timepickerEl.attr(cameltoDash(option), 'tpData.' + option);
                        });
                    }

                    // watch attrs - NOTE: minDate and maxDate are used with datePicker and timePicker.  By using the minDate and maxDate
                    // with the timePicker, you can dynamically set the min and max time values.  This cannot be done using the min and max values
                    // with the timePickerOptions
                    angular.forEach(['minMode', 'maxMode', 'minDate', 'maxDate', 'datepickerMode', 'initDate', 'shortcutPropagation'], function(key) {
                        if (attrs[key]) {
                            var getAttribute = $parse(attrs[key]);

                            scope.$parent.$watch(getAttribute, function(value) {
                                scope.dpData[key] = value;
                            });
                            datepickerEl.attr(cameltoDash(key), 'dpData.' + key);

                            if (key == 'minDate') {
                                timepickerEl.attr('min', 'dpData.minDate');
                            } else if (key == 'maxDate')
                                timepickerEl.attr('max', 'dpData.maxDate');

                            // Propagate changes from datepicker to outside
                            if (key === 'datepickerMode') {
                                var setAttribute = getAttribute.assign;
                                scope.$watch('dpData.' + key, function(value, oldvalue) {
                                    if (angular.isFunction(setAttribute) && value !== oldvalue) {
                                        setAttribute(scope.$parent, value);
                                    }
                                });
                            }
                        }
                    });

                    // do not check showWeeks attr, as should be used via datePickerOptions

                    if (!isHtml5DateInput) {
                        // Internal API to maintain the correct ng-invalid-[key] class
                        ngModel.$$parserName = 'datetime';
                        ngModel.$validators.datetime = validator;
                        ngModel.$parsers.unshift(parseDate);
                        ngModel.$formatters.push(function(value) {
                            scope.date = value;
                            return ngModel.$isEmpty(value) ? value : dateFilter(value, dateFormat, scope.tpData.timezone);
                        });
                    } else {
                        ngModel.$formatters.push(function(value) {
                            scope.date = value;
                            return value;
                        });
                    }

                    // Detect changes in the view from the text box
                    ngModel.$viewChangeListeners.push(function() {
                        scope.date = parseDateString(ngModel.$viewValue);
                    });

                    element.bind('keydown', inputKeydownBind);

                    var $popup = $compile(popupEl)(scope);
                    // Prevent jQuery cache memory leak (template is now redundant after linking)
                    popupEl.remove();

                    if (appendToBody) {
                        $document.find('body').append($popup);
                    } else {
                        element.after($popup);
                    }

                    // get text
                    scope.getText = function (key) {
                        return scope[key + 'Text'] || uiDatetimePickerConfig[key + 'Text'];
                    };

                    // Inner change
                    scope.dateSelection = function (dt) {

                        // check if timePicker is being shown and merge dates, so that the date
                        // part is never changed, only the time
                        if (scope.enableTime && scope.showPicker === 'time') {

                            // only proceed if dt is a date
                            if (dt || dt != null) {
                                // check if our scope.date is null, and if so, set to todays date
                                if (!angular.isDefined(scope.date) || scope.date == null) {
                                    scope.date = new Date();
                                }

                                // dt will not be undefined if the now or today button is pressed
                                if (dt && dt != null) {
                                    // get the existing date and update the time
                                    var date = new Date(scope.date);
                                    date.setHours(dt.getHours());
                                    date.setMinutes(dt.getMinutes());
                                    date.setSeconds(dt.getSeconds());
                                    date.setMilliseconds(dt.getMilliseconds());
                                    dt = date;
                                }
                            }
                        }

                        if (angular.isDefined(dt)) {
                            if (!scope.date) {
                                var defaultTime = angular.isDefined(attrs.defaultTime) ? attrs.defaultTime : uiDatetimePickerConfig.defaultTime;
                                var t = new Date('2001-01-01 ' + defaultTime);

                                if (!isNaN(t)) {
                                    dt.setHours(t.getHours());
                                    dt.setMinutes(t.getMinutes());
                                    dt.setSeconds(t.getSeconds());
                                    dt.setMilliseconds(t.getMilliseconds());
                                }
                            }
                            scope.date = dt;
                        }

                        var date = scope.date ? dateFilter(scope.date, dateFormat, scope.tpData.timezone) : null;

                        element.val(date);
                        ngModel.$setViewValue(date);

                        if (closeOnDateSelection) {
                            // do not close when using timePicker as make impossible to choose a time
                            if (scope.showPicker != 'time' && date != null) {
                                // if time is enabled, swap to timePicker
                                if (scope.enableTime) {
                                    // need to delay this, else timePicker never shown
                                    $timeout(function() {
                                        scope.showPicker = 'time';
                                    }, 0);
                                } else {
                                    scope.close();
                                }
                            }
                        }

                    };

                    scope.keydown = function(evt) {
                        if (evt.which === 27) {
                            scope.close();
                            element[0].focus();
                        }
                    };

                    scope.$watch('isOpen', function (value) {
                        scope.dropdownStyle = {
                            display: value ? 'block' : 'none'
                        };

                        if (value) {
                            var position = appendToBody ? $uibPosition.offset(element) : $uibPosition.position(element);

                            if (appendToBody) {
                                scope.dropdownStyle.top = (position.top + element.prop('offsetHeight')) +'px';
                            } else {
                                scope.dropdownStyle.top = undefined;
                            }

                            scope.dropdownStyle.left = position.left + 'px';

                            $timeout(function() {
                                scope.$broadcast('uib:datepicker.focus');
                                $document.bind('click', documentClickBind);
                            }, 0, false);
                        } else {
                            $document.unbind('click', documentClickBind);
                        }
                    });

                    scope.isDisabled = function(date) {
                        if (date === 'today' || date === 'now') {
                            date = new Date();
                        }

                        return scope.dpData.minDate && scope.compare(date, scope.dpData.minDate) < 0 ||
                            scope.dpData.maxDate && scope.compare(date, scope.dpData.maxDate) > 0;
                    };

                    scope.compare = function(date1, date2) {
                        return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
                    };

                    scope.select = function (opt) {

                        var date = null;
                        var isNow = opt === 'now';

                        if (opt === 'today' || opt == 'now') {
                            var now = new Date();
                            if (angular.isDate(scope.date)) {
                                date = new Date(scope.date);
                                date.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
                                date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
                            } else {
                                date = now;
                            }
                        }

                        scope.dateSelection(date);

                        if (opt == 'clear')
                            scope.close();
                    };

                    scope.close = function () {
                        scope.isOpen = false;

                        // if enableDate and enableTime are true, reopen the picker in date mode first
                        if (scope.enableDate && scope.enableTime)
                            scope.showPicker = 'date';

                        element[0].focus();
                    };

                    scope.changePicker = function (evt, picker) {
                        evt.preventDefault();
                        evt.stopPropagation();

                        scope.showPicker = picker;
                    };

                    scope.$on('$destroy', function () {
                        if (scope.isOpen === true) {
                            if (!$rootScope.$$phase) {
                                scope.$apply(function() {
                                    scope.close();
                                });
                            }
                        }

                        $popup.remove();
                        element.unbind('keydown', inputKeydownBind);
                        $document.unbind('click', documentClickBind);
                    });

                    function documentClickBind(evt) {
                        var popup = $popup[0];
                        var dpContainsTarget = element[0].contains(evt.target);

                        // The popup node may not be an element node
                        // In some browsers (IE only) element nodes have the 'contains' function
                        var popupContainsTarget = popup.contains !== undefined && popup.contains(evt.target);

                        if (scope.isOpen && !(dpContainsTarget || popupContainsTarget)) {
                            scope.$apply(function() {
                                scope.isOpen = false;
                            });
                        }
                    }

                    function inputKeydownBind (evt) {
                        if (evt.which === 27 && scope.isOpen) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            scope.$apply(function() {
                                scope.close();
                            });
                            element[0].focus();
                        } else if (evt.which === 40 && !scope.isOpen) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            scope.$apply(function() {
                                scope.isOpen = true;
                            });
                        }
                    }

                    function cameltoDash(string) {
                        return string.replace(/([A-Z])/g, function ($1) { return '-' + $1.toLowerCase(); });
                    }

                    function parseDateString(viewValue) {
                        var date = uibDateParser.parse(viewValue, dateFormat, scope.date);
                        if (isNaN(date)) {
                            for (var i = 0; i < altInputFormats.length; i++) {
                                date = uibDateParser.parse(viewValue, altInputFormats[i], scope.date);
                                if (!isNaN(date)) {
                                    return date;
                                }
                            }
                        }
                        return date;
                    }

                    function parseDate(viewValue) {
                        if (angular.isNumber(viewValue)) {
                            // presumably timestamp to date object
                            viewValue = new Date(viewValue);
                        }

                        if (!viewValue) {
                            return null;
                        } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                            return viewValue;
                        } else if (angular.isString(viewValue)) {
                            var date = parseDateString(viewValue);
                            if (isNaN(date)) {
                                return undefined;
                            }

                            return date;
                        } else {
                            return undefined;
                        }
                    }

                    function validator(modelValue, viewValue) {
                        var value = modelValue || viewValue;

                        if (!(attrs.ngRequired || attrs.required) && !value) {
                            return true;
                        }

                        if (angular.isNumber(value)) {
                            value = new Date(value);
                        }

                        if (!value) {
                            return true;
                        } else if (angular.isDate(value) && !isNaN(value)) {
                            return true;
                        } else if (angular.isDate(new Date(value)) && !isNaN(new Date(value).valueOf())) {
                            return true;
                        } else if (angular.isString(value)) {
                            return !isNaN(parseDateString(viewValue));
                        } else {
                            return false;
                        }
                    }
                }
            };
        }])

    .directive('datePickerWrap', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            templateUrl: 'template/date-picker.html'
        };
    })

    .directive('timePickerWrap', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            templateUrl: 'template/time-picker.html'
        };
    });

angular.module('ui.bootstrap.datetimepicker').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('template/date-picker.html',
    "<ul ng-if=\"isOpen && showPicker == 'date'\" class=\"dropdown-menu dropdown-menu-left datetime-picker-dropdown\" ng-style=dropdownStyle style=left:inherit ng-keydown=keydown($event) ng-click=$event.stopPropagation()><li style=\"padding:0 5px 5px 5px\" class=date-picker-menu><div ng-transclude></div></li><li ng-if=showButtonBar style=padding:5px><span class=\"btn-group pull-left\" style=margin-right:10px><button type=button class=\"btn btn-sm btn-info\" ng-click=\"select('today')\" ng-disabled=\"isDisabled('today')\">{{ getText('today') }}</button> <button type=button class=\"btn btn-sm btn-danger\" ng-click=\"select('clear')\">{{ getText('clear') }}</button></span> <span class=\"btn-group pull-right\"><button ng-if=enableTime type=button class=\"btn btn-sm btn-default\" ng-click=\"changePicker($event, 'time')\">{{ getText('time')}}</button> <button type=button class=\"btn btn-sm btn-success\" ng-click=close()>{{ getText('close') }}</button></span></li></ul>"
  );


  $templateCache.put('template/time-picker.html',
    "<ul ng-if=\"isOpen && showPicker == 'time'\" class=\"dropdown-menu dropdown-menu-left datetime-picker-dropdown\" ng-style=dropdownStyle style=left:inherit ng-keydown=keydown($event) ng-click=$event.stopPropagation()><li style=\"padding:0 5px 5px 5px\" class=time-picker-menu><div ng-transclude></div></li><li ng-if=showButtonBar style=padding:5px><span class=\"btn-group pull-left\" style=margin-right:10px><button type=button class=\"btn btn-sm btn-info\" ng-click=\"select('now')\" ng-disabled=\"isDisabled('now')\">{{ getText('now') }}</button> <button type=button class=\"btn btn-sm btn-danger\" ng-click=\"select('clear')\">{{ getText('clear') }}</button></span> <span class=\"btn-group pull-right\"><button ng-if=enableDate type=button class=\"btn btn-sm btn-default\" ng-click=\"changePicker($event, 'date')\">{{ getText('date')}}</button> <button type=button class=\"btn btn-sm btn-success\" ng-click=close()>{{ getText('close') }}</button></span></li></ul>"
  );

}]);
