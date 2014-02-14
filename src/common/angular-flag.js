(function (undefined) {
  var flags = {}, def;
  var strict = true;

  function noop () { }

  angular.module('ngFlag', [])
  .provider('ngFlag', function () {
    return {
      flags: function (f) {
        angular.extend(flags, f);
        return this;
      },
      default: function (d) {
        def = d;
        return this;
      },
      strict: function (s) {
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
          flagVal = !!flag;
        } else {
          flagVal = flags[flag];
        }

        if (flagVal === undefined && strict) {
          throw new Error('unknown flag ' + flag);
        } else if (flagVal === undefined && def !== undefined) {
          flagVal = def;
        } else if (flagVal === undefined) {
          tAttrs.$set('ngIf', flag);
          return noop();
        } 

        if (!flagVal) {
          return function (s, e) {
            e.remove();
          };
        }

        return noop();
      }
    };
  });
})();