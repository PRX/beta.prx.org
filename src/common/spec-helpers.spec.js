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
