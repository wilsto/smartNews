'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('tweet', {
                url: '/tweet',
                templateUrl: 'app/Viewer/tweet/tweet.html',
                controller: 'TweetCtrl'
            });
    });
