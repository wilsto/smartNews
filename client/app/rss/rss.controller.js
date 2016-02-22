'use strict';

angular.module('jarvisApp')
    .controller('RssCtrl', function($scope, $http, socket) {
        $scope.message = 'Toto';

        $scope.rssFeed = [];

        $http.get('/api/rssparsers').success(function(rssFeed) {
            $scope.rssFeed = rssFeed;
            socket.syncUpdates('rss', $scope.rssFeed);
        });

    });