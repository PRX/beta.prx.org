describe('angular-evaporate', function () {

  describe ('configuration', function () {

    it ('can configure the awsKey', function () {
      module('angular-evaporate', function (evaporateProvider, $provide) {
        evaporateProvider.awsKey('AKIRAISAGREATMOVIE');

        $provide.decorator('$window', ['$delegate', function($delegate) {

          function mockEvaporate(options) {
          }

          mockEvaporate.prototype = {
            add: function (config) {
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

    beforeEach(module('angular-evaporate', function (evaporateProvider) {
      evaporateProvider.options({});
    }));

    beforeEach(inject(function (_evaporate_, _$q_) {
      $q = _$q_;
      evaporate = _evaporate_;
    }));

    it ('can get a promise when you add a file', function () {
      var p = evaporate.add({name: 'foo', testId: 123});
      expect(angular.isFunction(p.then)).toBeTruthy();
      expect(p.uploadId).toEqual(123);
    });

  });


});
