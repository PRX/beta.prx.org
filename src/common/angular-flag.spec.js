describe('ngFlag', function () {
  describe('provider', function () {
    var flagProvider;
    
    beforeEach(module('ngFlag', function (ngFlagProvider) {
      flagProvider = ngFlagProvider;
    }));

    it ('can chain after flag setting', function () {
      inject();
      expect(flagProvider.flags({feat: false})).toBe(flagProvider);
    });

    it ('can chain after default setting', function () {
      inject();
      expect(flagProvider.default(false)).toBe(flagProvider);
    });

    it ('can chain after strictness setting', function () {
      inject();
      expect(flagProvider.strict(false)).toBe(flagProvider);
    });

    it ('cant be injected actively', function () {
      inject(function (ngFlag) {
        expect(ngFlag).not.toBeDefined();
      });
    });
  });
});