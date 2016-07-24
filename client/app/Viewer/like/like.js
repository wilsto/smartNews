'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('like', {
                url: '/like',
                templateUrl: 'app/Viewer/like/like.html',
                controller: 'LikeCtrl'
            });
    });
