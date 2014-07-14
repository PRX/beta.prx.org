describe('prx.series', function () {

  beforeEach(module('prx.series'));
  beforeEach(module('angular-hal-mock'));


  describe ('SeriesCtrl', function () {
    it ('attaches the series injected to $scope', inject(function ($controller, ngHal) {
      var scope = {};
      var series = ngHal.mock('http://meta.prx.org/model/series', {id: 32832, stories: {href:"/api/v1/series/32832/stories"}});
      $controller('SeriesCtrl', {series: series, stories: [], $scope: scope});
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
    var state, $injector;
    beforeEach(inject(function ($state, _$injector_) {
      state = $state.get('series');
      $injector = _$injector_;
    }));

    it ('gets the series', inject(function(ngHal, $rootScope, $q) {
      var series = ngHal.mock({a: 1});
      var result;
      spyOn(ngHal, 'followOne').and.returnValue($q.when(series));
      $injector.invoke(state.resolve.series, null, {$stateParams: {seriesId: 32823}}).then(function(s) {
        result = s;
      });
      $rootScope.$digest();
      expect(result.a).toBe(1);
    }));

    it ('gets the stories based on the series', inject(function (ngHal, $rootScope) {
      var series = ngHal.mock();
      var stories = ngHal.mock();
      var items;
      stories.stubFollow('prx:items', {s:1});
      series.stubFollow('prx:stories', stories);

      $injector.invoke(state.resolve.stories, null, {series: series}).then(function (s) {
        items = s;
      });

      $rootScope.$digest();

      expect(items.s).toBe(1);
    }));

    it ('mixes in the imageUrl for the series image', inject(function(ngHal) {
      var result,
        url = 'example.png',
        series = ngHal.mock('http://meta.prx.org/model/series'),
        spy = ngHal.stubFollowOne('series', series);
      series.stubFollow('prx:image', ngHal.mockEnclosure(url));

      var promise = $injector.
      invoke(state.resolve.series, null, {$stateParams: {seriesId: 123}});

      expect(promise.get('imageUrl')).toResolveTo(url);
      expect(spy.calls.count()).toEqual(1);
      expect(spy.calls.mostRecent().args[0]).toEqual({id: 123});
    }));
  });

});
