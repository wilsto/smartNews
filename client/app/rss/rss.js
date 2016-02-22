'use strict';

angular.module('jarvisApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('rss', {
        url: '/rss',
        templateUrl: 'app/rss/rss.html',
        controller: 'RssCtrl'
      });
  });