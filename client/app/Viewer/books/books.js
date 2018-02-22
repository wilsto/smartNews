'use strict';

angular.module('jarvisApp')
    .config(function($stateProvider) {
        $stateProvider
            .state('books', {
                url: '/books/:area',
                templateUrl: 'app/Viewer/books/books.html',
                controller: 'BooksCtrl'
            });
    });
