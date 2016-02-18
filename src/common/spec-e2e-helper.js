/**
 * Shared e2e test utilities
 */
module.exports = {

  // conditionally run a test based on feature flag
  featit: function(name, flag, test) {
    var inverse = (flag[0] === '!');
    flag = inverse ? flag.slice(1) : flag;
    if ((inverse && !FEAT[flag]) || (!inverse && FEAT[flag])) {
      it(name, test);
    }
    else {
      xit(name).pend('Skipped due to FEAT.' + flag + '=' + JSON.stringify(FEAT[flag]));
    }
  }

};

// load FEATs from the last built flags
global.window = {};
require('../../build/assets/flags.js');
var FEAT = global.window.FEAT;
delete global.window;

// disable animations
beforeEach(function () {
  browser.addMockModule('noAnimate', function () {
    angular.module('noAnimate', ['ngAnimate'])
    .run(['$animate', function ($animate) {
      $animate.enabled(false);
    }]);
  });
});
