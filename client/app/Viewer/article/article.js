'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('article', {
                url: '/article/:area',
                templateUrl: 'app/Viewer/article/article.html',
                controller: 'ArticleCtrl'
            });
    });
