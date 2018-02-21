'use strict';

angular.module('jarvisApp')
    .controller('TorrentsCtrl', function($scope, $http) {


        $scope.test = function() {
          $http({
              method: 'GET',
              url: '/api/torrents/listProviders'
          }).
          success(function(data) {
              console.log('listProviders',data);;
          }).
          error(function() {
              $scope.torrents = [];
          });

            $http({
                method: 'GET',
                url: '/api/torrents/search'
            }).
            success(function(data) {
                console.log('search',data);;
            }).
            error(function() {
                $scope.torrents = [];
            });
        };

      $scope.test();


        $scope.loadTorrentFeeds = function() {
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
        $scope.loadTorrentFeeds();

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


        $scope.refreshOneTorrentFeed = function(feed) {
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
            var delTorrentFeed = $scope.torrents[id];
            $http({
                method: 'DELETE',
                url: '/api/torrents/' + delTorrentFeed._id
            }).
            success(function() {
                $scope.torrents.splice(id, 1);
            });
        };

        $scope.add = function() {
            $http({
                method: 'POST',
                data: $scope.addTorrentFeed,
                url: '/api/torrents'
            }).
            success(function(data) {
                $scope.torrents.push(data);
                $scope.addTorrentFeed = {};
            });
        };

        $scope.dispUpdate = function(id) {
            var editTorrentFeed = $scope.torrents[id];
            $scope.editTorrentFeedId = id;
            $http({
                method: 'GET',
                url: '/api/torrents/' + editTorrentFeed._id
            }).
            success(function(data) {
                $scope.editTorrentFeed = data;
                $('#modTorrentFeed').modal('show');
            }).
            error(function() {
                $scope.editTorrentFeed = {};
            });
        };

        $scope.update = function() {
            $http({
                method: 'POST',
                data: $scope.editTorrentFeed,
                url: '/api/torrents/' + $scope.editTorrentFeed._id
            }).
            success(function() {
                $scope.loadTorrentFeeds();
                $('#modTorrentFeed').modal('hide');
            });
        };

        $scope.addTag = function() {
            if ($scope.editTorrentFeed.tags === undefined) {
                $scope.editTorrentFeed.tags = [];
            }
            if ($scope.editTorrentFeed.tags.indexOf(editTorrentFeedForm.editTag.value) === -1) {
                $scope.editTorrentFeed.tags.push(editTorrentFeedForm.editTag.value);
            }
        };

        $scope.deleteTag = function(id) {
            $scope.editTorrentFeed.tags.splice(id, 1);
        };

        $scope.bpTorrentFeedStatus = function(status) {
            if (status === 'OK' || status === 'New') {
                return 'label-success';
            } else if (status === 'Incomplete') {
                return 'label-warning';
            } else {
                return 'label-error';
            }
        };

        $scope.bpTorrentFeedType = function(status) {
            if (status === 'Pro') {
                return 'label-primary';
            } else if (status === 'Perso') {
                return 'label-success';
            } else {
                return 'label-default';
            }
        };
    });
