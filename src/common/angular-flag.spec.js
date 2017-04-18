var helper = require('./spec-helper');
var ngflag = require('./angular-flag');

describe('ngFlag', function () {
  describe('provider', function () {
    var flagProvider;

    beforeEach(helper.module(ngflag, function (ngFlagProvider) {
      flagProvider = ngFlagProvider;
    }));

    beforeEach(inject);

    it ('can chain after flag setting', function () {
      expect(flagProvider.flags({feat: false})).toBe(flagProvider);
    });

    it ('can chain after default setting', function () {
      expect(flagProvider.default(false)).toBe(flagProvider);
    });

    it ('can chain after strictness setting', function () {
      expect(flagProvider.strict(false)).toBe(flagProvider);
    });

    it ('throws an error when a flag is re-set in strict mode', function () {
      flagProvider.strict(true).flags({name: true});
      expect(function () {
        flagProvider.flags({name: false});
      }).toThrow();
    });

    it ('doesnt throw an error if overwriting with the same value', function () {
      flagProvider.strict(true).flags({name: true});
      expect(function () {
        flagProvider.flags({name: true});
      }).not.toThrow();
    });

    it ('doesnt throw an error when overwriting in unstrict mode', function () {
      flagProvider.strict(false).flags({name: false});
      expect(function () {
        flagProvider.flags({name: true});
      }).not.toThrow();
    });

    it ('throws an error when redefining strict', function () {
      flagProvider.strict(false);
      expect(function () {
        flagProvider.strict(true);
      }).toThrow();
    });

    it ('throws an error when redefining strict', function () {
      flagProvider.strict(true);
      expect(function () {
        flagProvider.strict(false);
      }).toThrow();
    });

    it ('does not throw an error when setting strict again', function () {
      flagProvider.strict(true);
      expect(function () {
        flagProvider.strict(true);
      }).not.toThrow();
    });

    it ('does not throw an error when setting strict again', function () {
      flagProvider.strict(false);
      expect(function () {
        flagProvider.strict(false);
      }).not.toThrow();
    });

    it ('cannot be injected', function () {
      inject(function (ngFlag) {
        expect(ngFlag).not.toBeDefined();
      });
    });
  });

  describe('directive', function () {
    var flagProvider, $compile, $scope, holder;
    beforeEach(helper.module(ngflag, function (ngFlagProvider) {
      flagProvider = ngFlagProvider;
    }));

    function isRemoved(flagName) {
      var numChildren = holder.children().length;
      holder.append('<div ng-flag="'+flagName+'"></div>');
      return (numChildren - $compile(holder)($scope).children().length) === 0;
    }

    beforeEach(inject(function (_$compile_, $rootScope) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      holder = $compile("<div></div>")($scope);
    }));

    it ('pulls from flag-name attr if used as el', function () {
      flagProvider.flags({defined: true});
      expect(function () {
        $compile('<ng-flag flag-name="defined"></ng-flag>');
      }).not.toThrow();
    });

    describe ('strict mode', function () {
      it ('throws an error when passed an undefined flag', function () {
        expect(function () {
          $compile('<div ng-flag="notDefined"></div>');
        }).toThrow();
      });
    });

    describe ('unstrict mode', function () {
      beforeEach(function () {
        flagProvider.strict(false);
      });

      it ('does not throw an error', function () {
        expect(function () {
          $compile('<div ng-flag="notDefined"></div>');
        }).not.toThrow();
      });

      describe ('with no default', function () {
        it ('replaces itself with ng-if' , function () {
          var el = $compile('<div ng-flag="notDefined"></div>')($scope);
          expect(el.attr('ng-if')).toEqual('notDefined');
        });
      });

      describe ('with a default', function () {
        it ('uses the default if it is true', function () {
          flagProvider.default(true);
          expect(isRemoved('notDefined')).toBe(false);
        });

        it ('uses the default if it is false', function () {
          flagProvider.default(false);
          expect(isRemoved('notDefined')).toBe(true);
        });
      });
    });

    it ('interprets true as literal true', function () {
      expect(isRemoved('true')).toBe(false);
    });

    it ('interprets false as literal false', function () {
      expect(isRemoved('false')).toBe(true);
    });

    it ('pulls from the flags set', function () {
      flagProvider.flags({enabled: true, disabled: false});
      expect(isRemoved('enabled')).toBe(false);
      expect(isRemoved('disabled')).toBe(true);
    });
  });
});
