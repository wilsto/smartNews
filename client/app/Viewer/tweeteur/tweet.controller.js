'use strict';

angular.module('jarvisApp')
    .controller('TweeteurCtrl', function($scope, $http) {
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
            console.log('after', _after)
            if (!$scope.busy) {
                _after += 50;
                if (_after <= $scope.nbTweets) {
                    $scope.loadTweets();
                }
            }
        };

        $scope.loadTweeteurs = function() {
            $http({
                method: 'GET',
                url: '/api/tweeteurs/groupByName'
            }).
            success(function(data) {
                $scope.tweeteurs = data;
            }).
            error(function() {
                $scope.tweeteurs = [];
            });
        };
        $scope.loadTweeteurs();

        $scope.refresh = function() {
            $http({
                method: 'GET',
                url: '/api/tweeteurs/groupByName'
            }).
            success(function(data) {
                $scope.tweeteurs = data;
                $scope.$broadcast('tweeteursRefreshed');
            });
        };


        $scope.refreshOneRule = function(rule) {
            $http({
                method: 'GET',
                url: '/api/twitterrules/refresh/' + rule._id
            }).
            success(function(data) {
                rule = data[0];
                $scope.$broadcast('twitterrulesRefreshed');
            });
        };

        $scope.delete = function(id) {
            var delRule = $scope.twitterrules[id];
            $http({
                method: 'DELETE',
                url: '/api/twitterrules/' + delRule._id
            }).
            success(function() {
                $scope.twitterrules.splice(id, 1);
            });
        };

        $scope.add = function() {
            console.log('$scope.addRule', $scope.addRule);
            $http({
                method: 'POST',
                data: $scope.addRule,
                url: '/api/twitterrules'
            }).
            success(function(data) {
                $scope.twitterrules.push(data);
                $scope.addRule = {};
            });
        };

        $scope.duplicate = function(id) {
            var dupRule = _.cloneDeep($scope.twitterrules[id]);
            delete dupRule._id;
            $http({
                method: 'POST',
                data: dupRule,
                url: '/api/twitterrules'
            }).
            success(function(data) {
                $scope.twitterrules.push(data);
                $scope.addRule = {};
            });
        };



        $scope.editTwitterRule = function(id) {
            var editRule = $scope.twitterrules[id];

            $scope.editRuleId = id;
            $http({
                method: 'GET',
                url: '/api/twitterrules/' + editRule._id
            }).
            success(function(data) {
                $scope.editRule = data;
                $scope.accountArr = $scope.editRule.account.split(',');
                $('#modRule').modal('show');
            }).
            error(function() {
                $scope.editRule = {};
            });
        };

        $scope.update = function() {
            console.log('$scope.editRule', $scope.editRule);
            $http({
                method: 'PUT',
                data: $scope.editRule,
                url: '/api/twitterrules/' + $scope.editRule._id
            }).
            success(function() {
                $scope.loadTweeteurs();
                $('#modRule').modal('hide');
            });
        };

        $scope.addTag = function() {
            if ($scope.editRule.tags === undefined) {
                $scope.editRule.tags = [];
            }
            if ($scope.editRule.tags.indexOf(editRuleForm.editTag.value) === -1) {
                $scope.editRule.tags.push(editRuleForm.editTag.value);
            }
        };

        $scope.deleteTag = function(id) {
            $scope.editRule.tags.splice(id, 1);
        };

        $scope.bpRuleStatus = function(status) {
            if (status === 'OK' || status === 'New') {
                return 'label-success';
            } else if (status === 'Incomplete') {
                return 'label-warning';
            } else {
                return 'label-error';
            }
        };

        $scope.bpRuleType = function(status) {
            if (status === 'Pro') {
                return 'label-primary';
            } else if (status === 'Perso') {
                return 'label-success';
            } else {
                return 'label-default';
            }
        };

        $scope.displayRelationship = function(status) {
            if (_.isEqual(status, ['followers', 'friends'])) {
                return 'Friend';
            } else if (_.isEqual(status, ['friends', 'followers'])) {
                return 'Friend';
            } else if (_.isEqual(status, ['followers'])) {
                return 'Fan';
            } else if (_.isEqual(status, ['friends'])) {
                return 'Star';
            } else {
                return '-';
            }
        };

    });
