'use strict';

describe('Filter: feeselected', function () {

  // load the filter's module
  beforeEach(module('jarvisApp'));

  // initialize a new instance of the filter before each test
  var feeselected;
  beforeEach(inject(function ($filter) {
    feeselected = $filter('feeselected');
  }));

  it('should return the input prefixed with "feeselected filter:"', function () {
    var text = 'angularjs';
    expect(feeselected(text)).toBe('feeselected filter: ' + text);
  });

});
