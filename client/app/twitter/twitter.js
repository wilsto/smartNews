'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('twitter', {
                url: '/twitter',
                templateUrl: 'app/twitter/twitter.html',
                controller: 'TwitterCtrl'
            });
    });
