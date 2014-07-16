describe('prx.series', function () {
  beforeEach(module('prx.series', 'angular-hal-mock'));

  describe ('Series mixin', function () {
    var  ngHal, mock;
    beforeEach(inject(function (_ngHal_) {
      ngHal = _ngHal_;
      mock = ngHal.mock('http://meta.prx.org/model/series');
    }));

    it('gets the image', function () {
      mock.stubFollow('prx:image', ngHal.mockEnclosure('http://meta.prx.org/model/image', 'foo.png'));
      mock.transform();
      expect(mock.imageUrl).toEqual('foo.png');
    });
  });

  describe ('SeriesCtrl', function () {
    it ('attaches the series, stories, and accounts injected to $scope', inject(function ($controller) {
      var sigil = 'sigil';
      var scope = {};
      var controller = $controller('SeriesCtrl', {series: sigil, stories: sigil, account: sigil, $scope: scope});
      expect(controller.current).toBe(sigil);
      expect(controller.stories).toBe(sigil);
      expect(controller.account).toBe(sigil);
    }));
  });

  describe ('StoryDetailCtrl', function () {
    it ('attaches the story injected to $scope', inject(function ($controller) {
      var foo = 'asd', scope = {};
      var ctrl = $controller('StoryDetailCtrl', {story: foo, $scope: scope});
      expect(ctrl.current).toBe(foo);
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
  });
});
