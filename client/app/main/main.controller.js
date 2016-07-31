'use strict';

angular.module('jarvisApp')
    .controller('MainCtrl', function($scope, $http, socket) {
        $scope.awesomeThings = [];

        $http.get('/api/things').success(function(awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            socket.syncUpdates('thing', $scope.awesomeThings);
        });

        $http.get('/api/logs/top100/Event').success(function(logs) {
            $scope.events = logs;
            socket.syncUpdates('log', $scope.logs);
        });

        $http.get('/api/logs/top100/Error').success(function(logs) {
            $scope.errors = logs;
            socket.syncUpdates('log', $scope.logs);
        });

        $scope.addThing = function() {
            if ($scope.newThing === '') {
                return;
            }
            $http.post('/api/things', { name: $scope.newThing });
            $scope.newThing = '';
        };

        $scope.deleteThing = function(thing) {
            $http.delete('/api/things/' + thing._id);
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('thing');
        });

    });
