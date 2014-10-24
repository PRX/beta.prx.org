describe('angular-evaporate', function () {

  describe ('configuration', function () {

    it ('can configure the awsKey', function () {
      module('angular-evaporate', function (evaporateProvider) {
        evaporateProvider.awsKey('AKIRAISAGREATMOVIE');
      });

      inject(function (evaporate) {
        expect(evaporate.options.awsKey).toResolveTo('AKIRAISAGREATMOVIE');
      });

    });

  });

});
