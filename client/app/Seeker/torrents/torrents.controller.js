'use strict';

angular.module('jarvisApp')
    .controller('TorrentsCtrl', function($scope, $http) {

        $scope.loadFeeds = function() {
            $http({
                method: 'GET',
                url: '/api/torrents'
            }).
            success(function(data) {
                $scope.torrents = data;
            }).
            error(function() {
                $scope.torrents = [];
            });
        };
        $scope.loadFeeds();

        $scope.refresh = function() {
            $http({
                method: 'GET',
                url: '/api/torrents/refresh'
            }).
            success(function(data) {
                $scope.torrents = data;
                $scope.$broadcast('torrentsRefreshed');
            });
        };


        $scope.refreshOneFeed = function(feed) {
            $http({
                method: 'GET',
                url: '/api/torrents/refresh/' + feed._id
            }).
            success(function(data) {
                feed = data[0];
                $scope.$broadcast('torrentsRefreshed');
            });
        };

        $scope.delete = function(id) {
            var delFeed = $scope.torrents[id];
            $http({
                method: 'DELETE',
                url: '/api/torrents/' + delFeed._id
            }).
            success(function() {
                $scope.torrents.splice(id, 1);
            });
        };

        $scope.add = function() {
            $http({
                method: 'POST',
                data: $scope.addFeed,
                url: '/api/torrents'
            }).
            success(function(data) {
                $scope.torrents.push(data);
                $scope.addFeed = {};
            });
        };

        $scope.dispUpdate = function(id) {
            var editFeed = $scope.torrents[id];
            $scope.editFeedId = id;
            $http({
                method: 'GET',
                url: '/api/torrents/' + editFeed._id
            }).
            success(function(data) {
                $scope.editFeed = data;
                $('#modFeed').modal('show');
            }).
            error(function() {
                $scope.editFeed = {};
            });
        };

        $scope.update = function() {
            $http({
                method: 'POST',
                data: $scope.editFeed,
                url: '/api/torrents/' + $scope.editFeed._id
            }).
            success(function() {
                $scope.loadFeeds();
                $('#modFeed').modal('hide');
            });
        };

        $scope.addTag = function() {
            if ($scope.editFeed.tags === undefined) {
                $scope.editFeed.tags = [];
            }
            if ($scope.editFeed.tags.indexOf(editFeedForm.editTag.value) === -1) {
                $scope.editFeed.tags.push(editFeedForm.editTag.value);
            }
        };

        $scope.deleteTag = function(id) {
            $scope.editFeed.tags.splice(id, 1);
        };

        $scope.bpFeedStatus = function(status) {
            if (status === 'OK' || status === 'New') {
                return 'label-success';
            } else if (status === 'Incomplete') {
                return 'label-warning';
            } else {
                return 'label-error';
            }
        };

        $scope.bpFeedType = function(status) {
            if (status === 'Pro') {
                return 'label-primary';
            } else if (status === 'Perso') {
                return 'label-success';
            } else {
                return 'label-default';
            }
        };
    });
