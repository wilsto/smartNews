'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('rss', {
                url: '/rss',
                templateUrl: 'app/Seeker/rss/rss.html',
                controller: 'RssCtrl'
            });
    });
