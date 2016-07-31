'use strict';

angular.module('jarvisApp')
    .controller('MainCtrl', function($scope, $http, socket) {
        $scope.things = [];
        $scope.events = [];
        $scope.errors = [];

        var refreshPage = function() {
            $http.get('/api/things').success(function(things) {
                $scope.things = things;
                socket.syncUpdates('thing', $scope.things);
            });

            $http.get('/api/logs/top100/Event').success(function(logs) {
                $scope.events = logs;
                socket.syncUpdates('logEvent', $scope.events);
            });

            $http.get('/api/logs/top100/Error').success(function(logs) {
                $scope.errors = logs;
                socket.syncUpdates('logError', $scope.errors);
            });
        };
        refreshPage();

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
