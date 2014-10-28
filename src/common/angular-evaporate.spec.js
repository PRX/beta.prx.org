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
    var evaporate;
    var $q;
    var $rs;

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
