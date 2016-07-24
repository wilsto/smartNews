'use strict';

describe('Controller: TwitterCtrl', function() {

    // load the controller's module
    beforeEach(module('jarvisApp'));

    var TwitterCtrl, scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        TwitterCtrl = $controller('TwitterCtrl', {
            $scope: scope
        });
    }));

    it('should ...', function() {
        expect(1).toEqual(1);
    });
});
