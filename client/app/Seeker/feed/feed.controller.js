'use strict';

angular.module('jarvisApp')
    .controller('FeedCtrl', function($scope, $http) {

        $scope.loadFeeds = function() {
            $http({
                method: 'GET',
                url: '/api/feeds'
            }).
            success(function(data) {
                $scope.feeds = data;
            }).
            error(function() {
                $scope.feeds = [];
            });
        };
        $scope.loadFeeds();

        $scope.refresh = function() {
            $http({
                method: 'GET',
                url: '/api/feeds/refresh'
            }).
            success(function(data) {
                $scope.feeds = data;
                $scope.$broadcast('feedsRefreshed');
            });
        };


        $scope.refreshOneFeed = function(feed) {
            $http({
                method: 'GET',
                url: '/api/feeds/refresh/' + feed._id
            }).
            success(function(data) {
                feed = data[0];
                $scope.$broadcast('feedsRefreshed');
            });
        };

        $scope.delete = function(id) {
            var delFeed = $scope.feeds[id];
            $http({
                method: 'DELETE',
                url: '/api/feeds/' + delFeed._id
            }).
            success(function() {
                $scope.feeds.splice(id, 1);
            });
        };

        $scope.add = function() {
            $http({
                method: 'POST',
                data: $scope.addFeed,
                url: '/api/feeds'
            }).
            success(function(data) {
                $scope.feeds.push(data);
                $scope.addFeed = {};
            });
        };

        $scope.dispUpdate = function(id) {
            var editFeed = $scope.feeds[id];
            $scope.editFeedId = id;
            $http({
                method: 'GET',
                url: '/api/feeds/' + editFeed._id
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
                url: '/api/feeds/' + $scope.editFeed._id
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
