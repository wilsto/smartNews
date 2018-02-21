'use strict';

describe('Controller: TorrentsCtrl', function () {

  // load the controller's module
  beforeEach(module('jarvisApp'));

  var FeedCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FeedCtrl = $controller('TorrentsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
