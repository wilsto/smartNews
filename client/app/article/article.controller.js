'use strict';

angular.module('jarvisApp')
    .controller('ArticleCtrl', function($scope, $http) {
        $scope.articles = [];
        $scope.buttonFilter = 'starredunread';
        $scope.selectedAll = false;
        $scope.selectedArticles = {};
        var _after = 0;
        $scope.busy = false;
        var keys = [];
        $scope.search = {
            feed: null,
            text: null
        };

        $scope.refreshArticles = function() {
            $scope.busy = true;
            var dataFilter = {
                feed: $scope.search.feed,
                title: $scope.search.text,
                starred: ($scope.btnstarArr === 0) ? true : ($scope.btnstarArr === 1) ? false : undefined,
                read: ($scope.btnreadArr === 0) ? true : ($scope.btnreadArr === 1) ? false : undefined,
                analys: ($scope.btnanalysArr === 0) ? true : ($scope.btnanalysArr === 1) ? false : undefined,
                after: _after
            };

            console.log('dataFilter', dataFilter);

            $http({
                url: '/api/articles',
                method: 'GET',
                params: dataFilter
            }).success(function(data, status, headers, config) {
                $scope.articles = $scope.articles.concat(data);
                $scope.busy = false;
            }).
            error(function(data, status, headers, config) {
                $scope.articles = [];
                $scope.busy = false;
            });

        };


        $scope.loadMoreArticles = function() {
            if (!$scope.busy) {
                _after += 50;
                $scope.refreshArticles();
            }
        };

        $scope.changeSelected = function() {
            keys = _.compact(_.map($scope.selectedArticles, function(box, key) {
                if (box) {
                    return key;
                }
            }));;
        };

        $scope.changeSelectedAll = function() {
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
            $scope.busy = true;
            $scope.articles = [];
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
        $scope.btnstarArr = 0;
        $scope.btnreadArr = 1;
        $scope.btnanalysArr = 0;
        $scope.btntxt = ["included", "excluded", "off"];

        $scope.changeStarButton = function() {
            switch ($scope.btnstarArr) {
                case 0:
                    $scope.btnstarArr = 1;
                    break;
                case 1:
                    $scope.btnstarArr = 2
                    break;
                case 2:
                    $scope.btnstarArr = 0;
                    $scope.btnanalysArr = 0;
                    break;
            };
            $scope.articles = [];
            _after = 0;
            $scope.refreshArticles();
        }

        $scope.changeReadButton = function() {
            switch ($scope.btnreadArr) {
                case 0:
                    $scope.btnreadArr = 1;
                    break;
                case 1:
                    $scope.btnreadArr = 2
                    break;
                case 2:
                    $scope.btnreadArr = 0;
                    break;
            }
            $scope.articles = [];
            _after = 0;
            $scope.refreshArticles();
        }

        $scope.changeAnalysButton = function() {
            switch ($scope.btnanalysArr) {
                case 0:
                    $scope.btnanalysArr = 1;
                    $scope.btnstarArr = 2;
                    $scope.btnreadArr = 2;
                    break;
                case 1:
                    $scope.btnanalysArr = 2
                    $scope.btnanalysArr = 2
                    break;
                case 2:
                    $scope.btnanalysArr = 0;
                    break;
            }
            $scope.articles = [];
            _after = 0;
            $scope.refreshArticles();
        }

        $scope.searchText = function() {
            $scope.articles = [];
            _after = 0;
            $scope.refreshArticles();
        }
    });