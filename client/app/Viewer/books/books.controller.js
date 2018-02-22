'use strict';

angular.module('jarvisApp')
    .controller('BooksCtrl', function($scope, $http, $stateParams) {

        $scope.area = $stateParams.area;

        $scope.books = [];
        $scope.buttonFilter = 'starredunread';
        $scope.selectedAll = false;
        $scope.selectedBooks = {};
        var _after = 0;
        $scope.busy = false;
        var keys = [];
        $scope.search = {
            feed: null,
            text: null
        };
        $scope.filterSubarea = '';

        $scope.btnstarArr = 0;
        $scope.btnreadArr = 1;
        $scope.btnanalysArr = 0;
        $scope.btntxt = ['included', 'excluded', 'off'];

        $scope.refreshBooks = function() {
            $scope.busy = true;
            var dataFilter = {
                feed: $scope.search.feed,
                area: $scope.area,
                title: $scope.search.text,
                starred: ($scope.btnstarArr === 0) ? true : ($scope.btnstarArr === 1) ? false : undefined,
                read: ($scope.btnreadArr === 0) ? true : ($scope.btnreadArr === 1) ? false : undefined,
                analys: ($scope.btnanalysArr === 0) ? true : ($scope.btnanalysArr === 1) ? false : undefined,
                after: _after
            };

            // count
            $http({
                url: '/api/books/count',
                method: 'GET',
                params: dataFilter
            }).success(function(data) {
                $scope.nbbooks = data.nbBooks;
                //list by 50
                $http({
                    url: '/api/books',
                    method: 'GET',
                    params: dataFilter
                }).success(function(data) {
                    $scope.books = $scope.books.concat(data);
                    $scope.subareas = _.uniq(_.map($scope.books, 'subarea'));
                    console.log('$scope.books ', $scope.books);
                    $scope.busy = false;
                }).error(function() {
                    $scope.books = [];
                    $scope.busy = false;
                });
            }).error(function(data, err) {
                console.log('data', err);
                $scope.nbbooks = 0;
                $scope.busy = false;
            });
        };

        $scope.loadMoreBooks = function() {
            if (!$scope.busy) {
                _after += 50;
                if (_after <= $scope.nbbooks) {
                    $scope.refreshBooks();
                }
            }
        };

        $scope.changeSelected = function() {
            keys = _.compact(_.map($scope.selectedBooks, function(box, key) {
                if (box) {
                    return key;
                }
            }));
        };

        $scope.changeSelectedAll = function() {
            ($scope.selectedAll) ? $scope.checkAll(): $scope.uncheckAll();
        };

        $scope.checkAll = function() {
            _.each($scope.books, function(book) {
                $scope.selectedBooks[book._id] = true;
            });
            $scope.changeSelected();
        };

        $scope.uncheckAll = function() {
            $scope.selectedBooks = {};
            $scope.changeSelected();
        };

        $scope.$watch('buttonFilter', function() {
            $scope.refreshBooks();
        });
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

        $scope.refresh = function() {
            $http({
                method: 'GET',
                url: '/api/torrents/refresh'
            }).
            success(function(data) {
                $scope.feeds = data;
                $scope.$broadcast('feedsRefreshed');
            }).
            error(function(error) {
                /* Act on the event */
                console.log('error', error);
            });
        };

        $scope.analyse = function() {
            $scope.busy = true;
            $scope.books = [];
            $http({
                method: 'GET',
                url: '/api/bookAnalysiss'
            }).success(function() {
                $scope.busy = false;
            }).error(function(error) {
                /* Act on the event */
                $scope.busy = false;
                console.log('error', error);
            });
        };

        $scope.$on('feedsRefreshed', function() {
            var booksUrl = '/api/books';
            $http({
                method: 'GET',
                url: booksUrl
            }).success(function(data) {
                $scope.books = data;
            }).error(function() {
                $scope.books = [];
            });
        });

        $scope.readOne = function(id) {
            console.log('id', id);
            $scope.books[id].read = !$scope.books[id].read;
            $scope.update(id);
        };

        $scope.ensureRead = function(id) {
            if ($scope.books[id].read === false) {
                $scope.readOne(id);
            }
        };

        $scope.ensureReadAll = function() {
            $scope.books.forEach(function(book, id) {
                $scope.ensureRead(id);
            });
        };

        $scope.star = function(id) {
            $scope.books[id].starred = !$scope.books[id].starred;
            $scope.update(id);
        };

        $scope.like = function(book, like, index) {
            book.like = like;
            $scope.update(index);
        };

        $scope.update = function(id) {
            console.log('$scope.books[id]', $scope.books[id]);
            $http({
                method: 'POST',
                data: $scope.books[id],
                url: '/api/books/' + $scope.books[id]._id
            });
        };

        $scope.changeStarButton = function() {
            switch ($scope.btnstarArr) {
                case 0:
                    $scope.btnstarArr = 1;
                    break;
                case 1:
                    $scope.btnstarArr = 2;
                    break;
                case 2:
                    $scope.btnstarArr = 0;
                    $scope.btnanalysArr = 0;
                    break;
            }
            $scope.books = [];
            _after = 0;
            $scope.refreshBooks();
        };

        $scope.changeReadButton = function() {
            switch ($scope.btnreadArr) {
                case 0:
                    $scope.btnreadArr = 1;
                    break;
                case 1:
                    $scope.btnreadArr = 2;
                    break;
                case 2:
                    $scope.btnreadArr = 0;
                    break;
            }
            $scope.books = [];
            _after = 0;
            $scope.refreshBooks();
        };

        $scope.changeAnalysButton = function() {
            switch ($scope.btnanalysArr) {
                case 0:
                    $scope.btnanalysArr = 1;
                    $scope.btnstarArr = 2;
                    $scope.btnreadArr = 2;
                    break;
                case 1:
                    $scope.btnanalysArr = 2;
                    $scope.btnanalysArr = 2;
                    break;
                case 2:
                    $scope.btnanalysArr = 0;
                    break;
            }
            $scope.books = [];
            _after = 0;
            $scope.refreshBooks();
        };

        $scope.searchText = function() {
            $scope.books = [];
            _after = 0;
            $scope.refreshBooks();
        };
    });
