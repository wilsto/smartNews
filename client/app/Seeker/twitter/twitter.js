'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('twitter', {
                url: '/twitter',
                templateUrl: 'app/Seeker/twitter/twitter.html',
                controller: 'TwitterCtrl'
            });
    });
