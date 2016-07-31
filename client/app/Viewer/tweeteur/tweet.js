'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('tweeteur', {
                url: '/tweeteur',
                templateUrl: 'app/Viewer/tweeteur/tweeteur.html',
                controller: 'TweeteurCtrl'
            });
    });
