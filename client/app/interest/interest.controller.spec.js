'use strict';

describe('Controller: InterestCtrl', function () {

  // load the controller's module
  beforeEach(module('jarvisApp'));

  var InterestCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InterestCtrl = $controller('InterestCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
