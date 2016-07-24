'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('sharerConfig', {
                url: '/sharerConfig',
                templateUrl: 'app/Sharer/sharerConfig/sharerConfig.html',
                controller: 'SharerConfigCtrl'
            });
    });
