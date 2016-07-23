'use strict';

describe('Controller: SharerConfigCtrl', function() {

    // load the controller's module
    beforeEach(module('jarvisApp'));

    var sharerConfigCtrl, scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        sharerConfigCtrl = $controller('SharerConfigCtrl', {
            $scope: scope
        });
    }));

    it('should ...', function() {
        expect(1).toEqual(1);
    });
});
