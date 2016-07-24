'use strict';

describe('Controller: TweetCtrl', function() {

    // load the controller's module
    beforeEach(module('jarvisApp'));

    var TweetCtrl, scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        TweetCtrl = $controller('TweetCtrl', {
            $scope: scope
        });
    }));

    it('should ...', function() {
        expect(1).toEqual(1);
    });
});
