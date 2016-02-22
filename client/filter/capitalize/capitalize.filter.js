'use strict';

angular.module('jarvisApp')
    .filter('capitalize', function() {
        return function(input) {
            if (typeof input !== 'undefined' && input != null) {
                input = input.toLowerCase();
                return input.substring(0, 1).toUpperCase() + input.substring(1);
            } else {
                return input;
            }
        };
    });