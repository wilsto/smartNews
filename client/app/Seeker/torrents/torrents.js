'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('torrents', {
                url: '/torrents',
                templateUrl: 'app/Seeker/torrents/torrents.html',
                controller: 'TorrentsCtrl'
            });
    });
