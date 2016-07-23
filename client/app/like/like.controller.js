'use strict';

angular.module('jarvisApp')
    .controller('LikeCtrl', function($scope, $http) {

        $scope.buttonFilter = 'Not Reviewed';
        $scope.typeFilter = 'Pro';
        $scope.listOrder = 'term';

        $scope.refresh = function() {
            $http.get('/api/words').
            success(function(data) {
                $scope.words = data;
                angular.forEach($scope.words, function(word) {
                    word.words = word.words.toString();
                });
                console.log('$scope.words', $scope.words);
            });
        };
        $scope.refresh();

        $scope.like = function(word, like, index) {
            word.like = like;
            $http.put('/api/words/' + word._id, {
                like: like
            }).
            success(function(data) {
                console.log(data);
            });
        };

        $scope.myFilterWord = function(item) {
            switch ($scope.buttonFilter) {
                case 'Not Reviewed':
                    return item.like === undefined;
                case 'Reviewed':
                    return item.like !== undefined;
                case 'Interested':
                    return item.like === 1;
                case 'Neutral':
                    return item.like === 0;
                case 'Not Interested':
                    return item.like === -1;
                default:
                    return item;
            }
        };
    });
