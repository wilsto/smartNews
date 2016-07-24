'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('feed', {
                url: '/feed',
                templateUrl: 'app/Seeker/feed/feed.html',
                controller: 'FeedCtrl'
            });
    });
