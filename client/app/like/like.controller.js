'use strict';

angular.module('jarvisApp')
    .controller('LikeCtrl', function($scope, $http) {

        $scope.buttonFilter = 'All';

        var articlesUrl = '/api/articles';

        $http({
            method: 'GET',
            url: articlesUrl
        }).
        success(function(data, status, headers, config) {
            var words = [];
            angular.forEach(data, function(item, key) {
                angular.forEach(item.terms, function(bigWord, key2) {
                    words.push({
                        term: bigWord.term,
                        word: bigWord.word,
                        score: bigWord.count
                    });

                });
            });

            $http.get('/api/words').
            success(function(data, status, headers, config) {
                angular.forEach(data, function(item, key) {
                    words.push(item);
                });
                // on regroupe par mot clé
                var groups = _(words).groupBy('term');
                var groupWords = _(groups).map(function(g, key) {
                        return {
                            term: key,
                            word: _(g).reduce(function(m, x) {
                                console.log(' x.word', x.word);
                                console.log(' m', m);
                                return (x.word !== m.term) ? x.word : '';
                            }, ''),
                            score: _(g).reduce(function(m, x) {
                                return (x.score) ? m + x.score : m;
                            }, 0),
                            like: _(g).reduce(function(m, x) {
                                return (typeof x.like !== undefined) ? x.like : m;
                            }, 0),
                        };
                    })
                    .value();
                groupWords = _.sortBy(groupWords, function(o) {
                    return -o.score;
                })
                console.log('groupWords', groupWords);
                $scope.words = groupWords;
            });
        }).
        error(function(data, status, headers, config) {
            $scope.articles = []
        });

        $scope.like = function(word, like, index) {
            $scope.words[index].like = like;
            $http.post('/api/words', {
                term: word.term,
                like: like
            }).
            success(function(data, status, headers, config) {
                console.log(data);
            });
        }

        $scope.myFilterWord = function(item) {
            switch ($scope.buttonFilter) {
                case 'Not Reviewed':
                    return item.like === undefined;
                    break;
                case 'Reviewed':
                    return item.like !== undefined;
                    break;
                case 'Interested':
                    return item.like === 1;
                    break;
                case 'Not Interested':
                    return item.like === 0;
                    break;
                default:
                    return item;
            };
        };
    });