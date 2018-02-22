'use strict';

angular.module('jarvisApp')
  .controller('TorrentsCtrl', function($scope, $http, $filter) {

    $scope.categories = [{
      value: 'All',
      text: 'All'
    }, {
      value: 'Movies',
      text: 'Movies'
    }, {
      value: 'TV',
      text: 'TV'
    }, {
      value: 'Music',
      text: 'Music'
    }, {
      value: 'Apps',
      text: 'Apps'
    }, {
      value: 'Games',
      text: 'Games'
    }, {
      value: 'Books',
      text: 'Books'
    }, {
      value: 'Top100',
      text: 'Top100'
    }];


    $scope.test = function() {
      $http({
        method: 'GET',
        url: '/api/torrents/listProviders'
      }).
      success(function(data) {
        console.log('listProviders', data);;
      }).
      error(function() {
        $scope.torrents = [];
      });

      $http({
        method: 'GET',
        url: '/api/torrents/search'
      }).
      success(function(data) {
        console.log('search', data);;
      }).
      error(function() {
        $scope.torrents = [];
      });
    };

    //$scope.test();


    $scope.loadTorrents = function() {
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
    $scope.loadTorrents();

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

    $scope.showCategory = function(index) {
      var selected = $filter('filter')($scope.categories, {
        value: $scope.torrents[index].category
      });
      return ($scope.torrents[index].category && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.refreshOneTorrent = function(feed) {
      $http({
        method: 'GET',
        url: '/api/torrents/refresh/' + feed._id
      }).
      success(function(data) {
        feed = data[0];
        $scope.$broadcast('torrentsRefreshed');
      });
    };

    $scope.delete = function(index) {
      var delTorrent = $scope.torrents[index];
      $http({
        method: 'DELETE',
        url: '/api/torrents/' + delTorrent._id
      }).
      success(function() {
        $scope.torrents.splice(index, 1);
      });
    };

    $scope.add = function() {
      $scope.addTorrent.category = 'All';

      $http({
        method: 'POST',
        data: $scope.addTorrent,
        url: '/api/torrents'
      }).
      success(function(data) {
        $scope.torrents.push(data);
        $scope.addTorrent = {};
      });
    };

    $scope.update = function(index) {
      $http({
        method: 'PUT',
        data: $scope.torrents[index],
        url: '/api/torrents/' + $scope.torrents[index]._id
      }).
      success(function() {
        $scope.loadTorrents();
      });
    };

    $scope.addTag = function() {
      if ($scope.editTorrent.tags === undefined) {
        $scope.editTorrent.tags = [];
      }
      if ($scope.editTorrent.tags.indexOf(editTorrentForm.editTag.value) === -1) {
        $scope.editTorrent.tags.push(editTorrentForm.editTag.value);
      }
    };

    $scope.deleteTag = function(id) {
      $scope.editTorrent.tags.splice(id, 1);
    };

    $scope.bpTorrentState = function(state) {
      if (!state || state.length === 0) {
        return 'label-default'
      }
      if (state === 'OK' || state === 'New') {
        return 'label-success';
      } else if (state === 'Incomplete') {
        return 'label-warning';
      } else {
        return 'label-error';
      }
    };

    $scope.bpTorrentType = function(status) {
      if (status === 'Pro') {
        return 'label-primary';
      } else if (status === 'Perso') {
        return 'label-success';
      } else {
        return 'label-default';
      }
    };
  });
