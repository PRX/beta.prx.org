describe('prx.series', function () {

  beforeEach(module('prx.series'));
  beforeEach(module('angular-hal-mock'));


  describe ('SeriesCtrl', function () {
    it ('attaches the series injected to $scope', inject(function ($controller, ngHal) {
      var scope = {};
      var series = ngHal.mock('http://meta.prx.org/model/series', {id: 32832, stories: {href:"/api/v1/series/32832/stories"}});
      $controller('SeriesCtrl', {series: series, stories: null, $scope: scope});
      expect(scope.series).toBe(series);
    }));

    it ('attaches the stories injected to $scope', inject(function ($controller, ngHal) {
      var scope = {};
      var stories = ngHal.mock('http://meta.prx.org/model/stories');
      $controller('SeriesCtrl', {series: null, stories: stories, $scope: scope});
      expect(scope.stories).toBe(stories);
    }));
  });

  describe ('series state', function () {
    var state;
    beforeEach(inject(function ($state) {
      state = $state.get('series');
    }));
  });

});
