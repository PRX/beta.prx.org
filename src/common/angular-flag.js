var angular = require('angular');

// angular flagging
var app = angular.module('ngFlag', []);
module.exports = app.name;

var flags, def, strict;

app.provider('ngFlag', function () {
  flags = {};
  def = undefined;
  strict = true;
  var strictSet = false;
  return {
    flags: function (f) {
      if (strict) {
        angular.forEach(f, function (val, key) {
          if (typeof flags[key] !== 'undefined' && flags[key] !== val) {
            throw new Error("Attempting to redefine flag '" + key + "'");
          }
        });
      }
      angular.extend(flags, f);
      return this;
    },
    default: function (d) {
      def = d;
      return this;
    },
    strict: function (s) {
      if (strictSet && strict != s) {
        throw new Error("Attempting to redefine strictness");
      }
      strictSet = true;
      strict = s;
      return this;
    },
    '$get' : function () {
      return undefined;
    }
  };
})
.directive('ngFlag', function () {
  return {
    priority: Infinity,
    restrict: 'EA',
    compile: function (tElem, tAttrs, transclude) {
      var flag = tAttrs.ngFlag, flagVal;
      if (flag === undefined) {
        flag = tAttrs.flagName;
      }

      if (flag === 'true' || flag === 'false') {
        flagVal = flag === 'true';
      } else {
        flagVal = flags[flag];
      }

      if (flagVal === undefined && strict) {
        throw new Error('unknown flag ' + flag);
      } else if (flagVal === undefined && def !== undefined) {
        flagVal = def;
      } else if (flagVal === undefined) {
        tAttrs.$set('ngIf', flag);
        return angular.noop();
      }

      if (!flagVal) {
        tElem.replaceWith('');
        return function (s, e) {
          e.remove();
        };
      }

      return angular.noop();
    }
  };
});
