var helper = require('./spec-helper');
var loader = require('./async-loader');

describe('async-loader', function () {

  describe ('$scriptjs', function () {

    beforeEach(helper.module(loader));

    beforeEach(inject(function (_$scriptjs_, _AsyncLoader_) {
      $scriptjs = _$scriptjs_;
      AsyncLoader = _AsyncLoader_;
    }));

    it ('provides the $scriptjs object', function () {
      expect($scriptjs).toBeDefined();
      expect($scriptjs.ready).toBeDefined();
    });

  });

  describe ('AsyncLoader', function() {
    var $scriptjs, AsyncLoader, $rootScope;

    beforeEach(function() {
      helper.module(loader, function ($provide) {

        $provide.value('$scriptjs', function (files, success, fail) {
          return success(files);
        });

      });
    });

    beforeEach(inject(function (_AsyncLoader_, _$scriptjs_, _$rootScope_) {
      AsyncLoader = _AsyncLoader_;
      $scriptjs = _$scriptjs_;
      $rootScope = _$rootScope_;
    }));

    it ("will load file", function() {
      expect(AsyncLoader).toBeDefined();
      var result;
      AsyncLoader.load('some/mockfile.js').then( function(res) { result = res; });
      $rootScope.$digest();
      expect(result).toEqual('some/mockfile.js');
    });

  });

});
