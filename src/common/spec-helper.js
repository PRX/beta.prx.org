var angular = require('angular');
var mocks   = require('angular-mocks');
var ngmock  = require('angular-mocks/ngMock');
var nganim  = require('angular-mocks/ngAnimateMock');

/**
 * Shared test utilities
 */
module.exports = {
  module: angular.mock.module,
  inject: angular.mock.inject,
  setflag: function (name, val) {
    return function() { window.FEAT[name] = val; };
  }
};

// reset feature flags between tests
var originalFlags = require('../../config/flags.test.json');
function resetFlags() {
  window.FEAT = JSON.parse(JSON.stringify(originalFlags));
}
beforeEach(resetFlags);
resetFlags();

// custom jasmine promise-matchers
beforeEach(function () {
  jasmine.addMatchers({
    toResolveTo: function (util, customEquality) {
      return {
        compare: function (actual, expected) {
          var complete = false;
          inject(function ($q, $rootScope) {
            $rootScope.$apply(function () {
              $q.when(actual).then(function (result) {
                complete = true;
                actual = result;
              });
            });
          });
          if (!complete) {
            return { pass: false, message: "Expected promise to resolve."};
          }
          var result = {pass: util.equals(actual, expected, customEquality)};
          if (result.pass) {
            result.message = "Expected promise not to resolve to " + actual;
          } else {
            result.message = "Expected promised " + actual + " to resolve to " + expected;
          }
          return result;
        }
      };
    },
    toResolve: function () {
      return {
        compare: function (actual) {
          var result = {pass: false, message: "Expected promise to resolve."};
          inject(function ($q, $rootScope) {
            $rootScope.$apply(function () {
              $q.when(actual).then(function (data) {
                result.pass = true;
                result.message = "Expected promised " + JSON.stringify(data) + " not to resolve.";
              }, function (data) {
                result.message = "Expected rejection " + JSON.stringify(data) + " to resolve.";
              });
            });
          });
          return result;
        }
      };
    },
    toReject: function () {
      return {
        compare: function (actual) {
          var result = {pass: false};
          inject(function ($q, $rootScope) {
            $rootScope.$apply(function () {
              $q.when(actual).then(function (data) {
                result.pass = false;
                result.message = "Expected promised " + JSON.stringify(data) + " to reject.";
              }, function (data) {
                result.pass = true;
                result.message = "Expected rejcted promise " + JSON.stringify(data) + " not to reject.";
              });
            });
          });
          return result;
        }
      };
    }
  });
});
