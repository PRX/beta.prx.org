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
    it ('attaches the series, stories, and accounts injected to controller', inject(function ($controller) {
      var sigil = 'sigil';
      var scope = {};
      var controller = $controller('SeriesCtrl', {series: sigil, stories: sigil, account: sigil, $scope: scope});
      expect(controller.current).toBe(sigil);
      expect(controller.stories).toBe(sigil);
      expect(controller.account).toBe(sigil);
    }));
  });

  describe ('SeriesDetailCtrl', function () {
    it ('attaches the series injected to $scope', inject(function ($controller) {
      var foo = 'asd', scope = {};
      var ctrl = $controller('SeriesDetailCtrl', {series: foo, $scope: scope});
      expect(ctrl.current).toBe(foo);
    }));
  });

  describe ('SeriesDetailCtrl', function () {
    it ('attaches the series injected to $scope', inject(function ($controller) {
      var foo = 'asd', scope = {};
      var ctrl = $controller('SeriesDetailCtrl', {series: foo, $scope: scope});
      expect(ctrl.current).toBe(foo);
    }));
  });

  describe ('StoryDetailCtrl', function () {
    it ('attaches the story injected to controller', inject(function ($controller) {
      var foo = 'asd', scope = {};
      var ctrl = $controller('StoryDetailCtrl', {story: foo, $scope: scope});
      expect(ctrl.current).toBe(foo);
    }));
  });

  describe ('series state', function () {
    var state, $injector;
    beforeEach(inject(function ($state, _$injector_, _ngHal_) {
      state = $state.get('series.show');
      $injector = _$injector_;
      ngHal = _ngHal_;
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

    it ('resolves recent stories', function () {
      var mock = ngHal.mock();
      var spy = mock.stubFollow('prx:items');
      $injector.invoke(state.resolve.recentStories, null, {
        storiesList: mock
      });
      expect(spy).toHaveBeenCalled();
    });

    it ('gets the stories based on the series', inject(function (ngHal, $rootScope) {
      var storiesList = ngHal.mock();
      storiesList.stubFollow('prx:items', "foo");

      expect($injector.invoke(state.resolve.stories, null, {storiesList: storiesList})).toResolveTo("foo");
    }));

    it ('gets the stories list based on the series', inject(function (ngHal, $rootScope) {
      var series = ngHal.mock();
      series.stubFollow('prx:stories', "foo");

      expect($injector.invoke(state.resolve.storiesList, null, {series: series})).toResolveTo("foo");
    }));
  });
});
