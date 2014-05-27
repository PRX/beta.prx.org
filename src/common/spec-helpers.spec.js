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
          var result = {pass: false};
          inject(function ($q, $rootScope) {
            $rootScope.$apply(function () {
              $q.when(actual).then(function () {
                result.pass = true;
              });
            });
          });
          return result;
        }
      };
    }
  });
});
