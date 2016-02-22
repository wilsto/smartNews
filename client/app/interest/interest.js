'use strict';

angular.module('jarvisApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('interest', {
        url: '/interest',
        templateUrl: 'app/interest/interest.html',
        controller: 'InterestCtrl'
      });
  });