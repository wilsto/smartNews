'use strict';

angular.module('jarvisApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('like', {
        url: '/like',
        templateUrl: 'app/like/like.html',
        controller: 'LikeCtrl'
      });
  });