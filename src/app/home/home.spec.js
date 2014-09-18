describe('prx.home', function () {

  beforeEach(module('prx.home', 'angular-hal-mock'));

  if (!FEAT.HOME_PAGE) {
    it ('redirects from home to home.nxt', inject(function ($rootScope, $state) {
      spyOn($state, 'go');
      $rootScope.$broadcast('$stateChangeStart', {name: 'home'});
      expect($state.go).toHaveBeenCalled();
    }));
  }

  describe ('HomeCtrl', function () {
    it ('attaches the picks injected to $scope', inject(function ($controller) {
      var sigil = 'sigil';
      var scope = {};
      var controller = $controller('HomeCtrl', {picks: sigil, $scope: {$on: function () {}}});
      expect(controller.picks).toBe(sigil);
    }));
  });

  describe ('home state', function () {
    var state, $injector, ngHal;
    beforeEach(inject(function ($state, _$injector_, _ngHal_) {
      state = $state.get('home');
      $injector = _$injector_;
      ngHal = _ngHal_;
    }));

    it ('gets the picks', function () {
      var spy = ngHal.stubFollow('prx:picks', ngHal.mock());
      $injector.invoke(state.resolve.picks, null, {});
      expect(spy).toHaveBeenCalled();
    });
  });

});
