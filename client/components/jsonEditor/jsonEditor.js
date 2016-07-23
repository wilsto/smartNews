'use strict';

angular.module('jarvisApp')
    .directive('jsonEditor', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {

                function isValidJson(model) {
                    var flag = true;
                    try {
                        angular.fromJson(model);
                    } catch (err) {
                        flag = false;
                    }
                    return flag;
                }

                function string2JSON(text) {
                    try {
                        var j = angular.fromJson(text);
                        ngModelCtrl.$setValidity('json', true);
                        return j;
                    } catch (err) {
                        //returning undefined results in a parser error as of angular-1.3-rc.0, and will not go through $validators
                        //return undefined
                        ngModelCtrl.$setValidity('json', false);
                        return text;
                    }
                }

                function JSON2String(object) {
                    var test = JSON.stringify(object, null, 2);
                    console.log(test);
                    //TODO angular.toJson will remove all $$-prefixed values
                    // alternatively, use JSON.stringify(object, null, 2);
                    return test;
                }

                //$validators is an object, where key is the error
                //ngModelCtrl.$validators.json = isValidJson;

                //array pipelines
                ngModelCtrl.$parsers.push(string2JSON);
                ngModelCtrl.$formatters.push(JSON2String);
            }
        };
    });
