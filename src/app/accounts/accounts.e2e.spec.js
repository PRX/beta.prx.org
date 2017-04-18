var helper = require('../../common/spec-e2e-helper');

describe('accounts', function () {

  var ADMINISTRATOR = '/accounts/8';
  var INDIVIDUAL    = '/accounts/89247';
  var GROUP         = '/accounts/101127';
  var STATION       = '/accounts/441';

  describe ('administrator', function () {
    beforeEach(function () {
      browser.get(ADMINISTRATOR);
    });

    it ('shows user information', function () {
      expect($('.hero h1').getText()).toEqual('PRX Administrator');
      expect($('.hero .details').getText()).toContain('admin');
      expect($('.hero .details').getText()).toContain('Cambridge, Massachusetts');
      expect($('.hero .bio').getText()).toContain('PRX Administrator account');
    });
  });

  // TODO: actual tests

});
