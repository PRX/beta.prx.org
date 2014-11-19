describe('angular-evaporate', function () {

  describe ('configuration', function () {

    it ('can configure the awsKey', function () {
      module('angular-evaporate', function (evaporateProvider, $provide) {
        evaporateProvider.awsKey('AKIRAISAGREATMOVIE');

        $provide.decorator('$window', ['$delegate', function($delegate) {

          function mockEvaporate(options) {
            this.options = options;
            this.config = null;
          }

          mockEvaporate.prototype = {
            add: function (config) {
              this.config = config;
              return config['testId'];
            }
          };

          $delegate.Evaporate = mockEvaporate;

          return $delegate;
        }]);

      });

      inject(function (evaporate) {
        expect(evaporate.options.awsKey).toResolveTo('AKIRAISAGREATMOVIE');
      });

    });

  });

  describe ('when configured', function () {
    var evaporate, $q, $rs;

    beforeEach(module('async-loader', function ($provide) {
      mf = [];
      MockAsyncLoader = {};
      MockAsyncLoader._a_mock     = true;
      MockAsyncLoader.load        = function(files) { mf = files; return MockAsyncLoader; };
      MockAsyncLoader.then        = function(f) { var r = f(mf) || MockAsyncLoader; return r;};
      $provide.value('AsyncLoader', MockAsyncLoader);
    }));

    beforeEach(module('angular-evaporate', function (evaporateProvider) {
      evaporateProvider.options({});
    }));

    beforeEach(inject(function (_evaporate_, _$q_, _$rootScope_) {
      $q = _$q_;
      $rs = _$rootScope_;
      evaporate = _evaporate_;
    }));

    it ('can get a promise when you add a file', function () {
      var p = evaporate.add({name: 'foo', testId: 123});
      expect(angular.isFunction(p.then)).toBeTruthy();
    });

    it ('can get uploadid when you add a file', function () {
      var p = evaporate.add({name: 'foo', testId: 123});
      expect(p.uploadId).toEqual(123);
    });

    it ('can call complete when done', function () {
      var testComplete = false;
      evaporate.add({name: 'foo', testId: 123}).then( function() { testComplete = true; } );
      var completeFn = evaporate._evaporate.config.complete;
      expect(angular.isFunction(completeFn)).toBeTruthy();
      expect(testComplete).toBeFalsy();
      $rs.$apply( completeFn );
      expect(testComplete).toBeTruthy();
    });

  });

});
