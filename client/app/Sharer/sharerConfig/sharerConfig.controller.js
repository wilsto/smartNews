'use strict';

angular.module('jarvisApp')
    .controller('SharerConfigCtrl', function($scope, $http) {

        $scope.loadRules = function() {
            $http({
                method: 'GET',
                url: '/api/rules'
            }).
            success(function(data) {
                $scope.rules = data;
            }).
            error(function() {
                $scope.rules = [];
            });
        };
        $scope.loadRules();

        $scope.refresh = function() {
            $http({
                method: 'GET',
                url: '/api/rules/refresh'
            }).
            success(function(data) {
                $scope.rules = data;
                $scope.$broadcast('rulesRefreshed');
            });
        };


        $scope.refreshOneRule = function(rule) {
            $http({
                method: 'GET',
                url: '/api/rules/refresh/' + rule._id
            }).
            success(function(data) {
                rule = data[0];
                $scope.$broadcast('rulesRefreshed');
            });
        };

        $scope.delete = function(id) {
            var delRule = $scope.rules[id];
            $http({
                method: 'DELETE',
                url: '/api/rules/' + delRule._id
            }).
            success(function() {
                $scope.rules.splice(id, 1);
            });
        };

        $scope.add = function() {
            console.log('$scope.addRule', $scope.addRule);
            $http({
                method: 'POST',
                data: $scope.addRule,
                url: '/api/rules'
            }).
            success(function(data) {
                $scope.rules.push(data);
                $scope.addRule = {};
            });
        };

        $scope.dispUpdate = function(id) {
            var editRule = $scope.rules[id];
            $scope.editRuleId = id;
            $http({
                method: 'GET',
                url: '/api/rules/' + editRule._id
            }).
            success(function(data) {
                $scope.editRule = data;
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
                url: '/api/rules/' + $scope.editRule._id
            }).
            success(function() {
                $scope.loadRules();
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
    });
