'use strict';

describe('Controller: LikeCtrl', function () {

  // load the controller's module
  beforeEach(module('jarvisApp'));

  var LikeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LikeCtrl = $controller('LikeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
