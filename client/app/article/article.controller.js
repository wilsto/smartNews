'use strict';

angular.module('jarvisApp')
    .controller('ArticleCtrl', function($scope, $http) {

        $scope.buttonFilter = 'starredunread';
        $scope.selectedAll = false;
        $scope.selectedArticles = {};
        var keys = [];

        $scope.refreshArticles = function() {
            var articlesUrl = '/api/articles/' + $scope.buttonFilter;
            $http({
                method: 'GET',
                url: articlesUrl
            }).
            success(function(data, status, headers, config) {
                $scope.articles = data;
            }).
            error(function(data, status, headers, config) {
                $scope.articles = []
            });

        };

        $scope.changeSelected = function() {
            keys = _.compact(_.map($scope.selectedArticles, function(box, key) {
                if (box) {
                    return key;
                }
            }));;
        };

        $scope.changeSelectedAll = function() {
            console.log('$scope.selectedAll', $scope.selectedAll);
            ($scope.selectedAll) ? $scope.checkAll() : $scope.uncheckAll();
        }

        $scope.checkAll = function() {
            _.each($scope.articles, function(article, key) {
                $scope.selectedArticles[article._id] = true;
            });;
            $scope.changeSelected();
        };
        $scope.uncheckAll = function() {
            $scope.selectedArticles = {};
            $scope.changeSelected();
        };


        $scope.$watch('buttonFilter', function() {
            $scope.refreshArticles();
        });

        $http({
            method: 'GET',
            url: '/api/feeds'
        }).
        success(function(data, status, headers, config) {
            $scope.feeds = data;
        }).
        error(function(data, status, headers, config) {
            $scope.feeds = []
        });

        $scope.refresh = function() {
            $http({
                method: 'GET',
                url: '/api/feeds/refresh'
            }).
            success(function(data, status, headers, config) {
                $scope.feeds = data;
                $scope.$broadcast('feedsRefreshed');
            }).
            error(function(error) {
                /* Act on the event */
                console.log('error', error);
            });
        }

        $scope.analyse = function() {
            $http({
                method: 'GET',
                url: '/api/articleAnalysiss'
            }).
            success(function(data, status, headers, config) {
                $scope.refreshArticles();
            }).
            error(function(error) {
                /* Act on the event */
                console.log('error', error);
            });
        }


        $scope.$on('feedsRefreshed', function() {
            var articlesUrl = '/api/articles';
            $http({
                method: 'GET',
                url: articlesUrl
            }).
            success(function(data, status, headers, config) {
                $scope.articles = data;
            }).
            error(function(data, status, headers, config) {
                $scope.articles = []
            });
        });


        $scope.read = function(id) {
            $scope.articles[id].read = !$scope.articles[id].read;
            $scope.update(id);
        }

        $scope.ensureRead = function(id) {
            if ($scope.articles[id].read == false)
                $scope.read(id);
        }

        $scope.ensureReadAll = function(id) {
            $scope.articles.forEach(function(article, id) {
                $scope.ensureRead(id);
            });
        }

        $scope.star = function(id) {
            $scope.articles[id].starred = !$scope.articles[id].starred;
            $scope.update(id);
        }

        $scope.update = function(id) {
            $http({
                method: 'POST',
                data: $scope.articles[id],
                url: '/api/articles/' + $scope.articles[id]._id
            });
        }
    });