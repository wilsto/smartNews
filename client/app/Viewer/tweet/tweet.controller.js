'use strict';

angular.module('jarvisApp')
    .controller('TweetCtrl', function($scope, $http) {
        $scope.tweets = [];

        $scope.showDetails = true;
        $scope.busy = false;
        var _after = 0;

        $scope.optionsList = [
            'willSTOPHE',
            'leadbywill',
            'geekbywill',
            'jarvisbywill'
        ];

        $scope.loadTweets = function() {
            $scope.busy = true;

            var dataFilter = {
                after: _after
            };

            $http({
                url: '/api/tweets/count',
                method: 'GET'
            }).success(function(data) {
                $scope.nbTweets = data.nbTweets;

                $http({
                    method: 'GET',
                    url: '/api/tweets',
                    params: dataFilter
                }).
                success(function(data) {
                    $scope.tweets = $scope.tweets.concat(data);
                    $scope.busy = false;

                }).
                error(function() {
                    $scope.tweets = [];
                    $scope.busy = false;

                });

            });
        };
        $scope.loadTweets();

        $scope.loadMoreTweets = function() {
            if (!$scope.busy) {
                _after += 50;
                if (_after <= $scope.nbTweets) {
                    $scope.loadTweets();
                }
            }
        };

        $scope.updTweetInterest = function(tweet, interest) {
            console.log('tweet', tweet);
            console.log('interest', interest);
            tweet.interest = interest;
            $http({
                method: 'PUT',
                data: tweet,
                url: '/api/tweets/' + tweet._id
            });

        };

    });
