'use strict';

describe('Controller: RssCtrl', function () {

  // load the controller's module
  beforeEach(module('jarvisApp'));

  var RssCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RssCtrl = $controller('RssCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
